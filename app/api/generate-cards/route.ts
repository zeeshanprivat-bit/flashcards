import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const flashcardsSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe('The question or prompt'),
      back: z.string().describe('The answer (1-3 sentences)'),
    })
  ).min(1).max(20),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, deckTitle } = await request.json();
  if (!text || text.trim().length < 20) {
    return NextResponse.json({ error: 'Text too short' }, { status: 400 });
  }
  if (text.length > 8000) {
    return NextResponse.json({ error: 'Text too long (max 8000 chars)' }, { status: 400 });
  }

  // Rate limit: max 20 generations per user per day
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', `${today}T00:00:00`);

  if ((count ?? 0) >= 20) {
    return NextResponse.json({ error: 'Daily AI limit reached (20 generations/day)' }, { status: 429 });
  }

  try {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: flashcardsSchema,
      system: `You are a flashcard generator. Given text, extract key concepts and create question-answer flashcard pairs.
Rules:
- Create 5-20 cards depending on text length
- Questions should be specific and clear
- Answers should be concise (1-3 sentences max)
- Focus on the most important facts, definitions, and concepts`,
      prompt: `Create flashcards from this text:\n\n${text}`,
      temperature: 0.3,
    });

    // Log usage
    await supabase.from('ai_usage').insert({ user_id: user.id });

    return NextResponse.json({ cards: object.cards });
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: error.message || 'AI generation failed' }, { status: 500 });
  }
}
