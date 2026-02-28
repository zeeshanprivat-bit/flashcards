import { NextRequest, NextResponse } from 'next/server';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const cardSchema = z.object({
  type: z.enum(['basic', 'cloze']),
  front: z.string(),
  back: z.string(),
  cloze_text: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  source_snippet: z.string().nullable().optional(),
});

const flashcardsSchema = z.object({ cards: z.array(cardSchema).min(1).max(20) });

type Style = 'balanced' | 'high-yield' | 'exam-focus' | 'clinical-case';

const STYLE_INSTRUCTIONS: Record<Style, string> = {
  'balanced': 'Create a balanced mix of basic and cloze cards. Aim for clear, atomic facts.',
  'high-yield': 'Focus on high-yield facts: definitions, mechanisms, key numbers, differentials, side effects. Prefer cloze format for memorizable facts.',
  'exam-focus': 'Create exam-style questions. Use specific, testable prompts. Avoid vague questions like "Explain...". Focus on what examiners would ask.',
  'clinical-case': 'Frame cards as mini clinical scenarios when possible. E.g. "A 55yo male presents with X. What is the most likely diagnosis?" Use basic card type.',
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, deckTitle, style = 'balanced' } = await request.json();
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

  const styleGuide = STYLE_INSTRUCTIONS[style as Style] ?? STYLE_INSTRUCTIONS.balanced;

  try {
    const gateway = createOpenAICompatible({
      name: 'vercel-gateway',
      apiKey: process.env.AI_GATEWAY_API_KEY!,
      baseURL: 'https://ai-gateway.vercel.sh/v1',
    });

    const { text: aiResponse } = await generateText({
      model: gateway('openai/gpt-4o-mini'),
      system: `You are a flashcard generator for medical students (and general learners). Extract key concepts from the given text and create flashcards.
You MUST respond with ONLY valid JSON, no markdown, no code fences, no extra text.

Style: ${styleGuide}

Response format (strict JSON):
{
  "cards": [
    {
      "type": "basic" or "cloze",
      "front": "question text",
      "back": "answer text",
      "cloze_text": "sentence with {{c1::blank}} format" or null,
      "tags": ["tag1", "tag2"],
      "source_snippet": "relevant text from input" or null
    }
  ]
}

Rules:
- Create 5-20 cards depending on text length
- Max 1 fact per card (atomic cards)
- For basic cards: questions should be specific and concrete, answers concise (1-3 sentences)
- For cloze cards: use {{c1::answer}} format for blanks in the cloze_text field
- Avoid vague questions like "Explain..." — use concrete triggers
- Include 1-3 lowercase topic tags per card
- Include source_snippet showing which part of the input text the card comes from
- No hallucinations: only create cards from the provided text
- Prioritize high-yield content: definitions, mechanisms, differentials, side effects, key numbers
- Merge duplicates, skip trivial facts`,
      prompt: `Create flashcards from this text:\n\n${text}`,
      temperature: 0.3,
    });

    // Parse and validate JSON response
    const cleaned = aiResponse.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = flashcardsSchema.parse(JSON.parse(cleaned));

    // Log usage
    await supabase.from('ai_usage').insert({ user_id: user.id });

    // Log generation job
    await supabase.from('ai_generation_jobs').insert({
      user_id: user.id,
      input_text: text.substring(0, 2000),
      output_cards: parsed.cards,
      style: style,
      status: 'completed',
    });

    return NextResponse.json({ cards: parsed.cards });
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: error.message || 'AI generation failed' }, { status: 500 });
  }
}
