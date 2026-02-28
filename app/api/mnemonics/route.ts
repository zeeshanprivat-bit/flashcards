import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: List mnemonics with optional filters
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject');
  const topic = searchParams.get('topic');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  const due = searchParams.get('due'); // 'today' to get due mnemonics

  let query = supabase
    .from('mnemonics')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (subject) query = query.eq('subject', subject);
  if (topic) query = query.ilike('topic', `%${topic}%`);
  if (tag) query = query.contains('tags', [tag]);
  if (search) query = query.or(`title.ilike.%${search}%,mnemonic_text.ilike.%${search}%,topic.ilike.%${search}%`);
  if (due === 'today') {
    const today = new Date().toISOString().split('T')[0];
    query = query.lte('due_date', today);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ mnemonics: data });
}

// POST: Create a new mnemonic
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, mnemonic_text, explanation, topic, subject, tags, image_url, linked_card_ids } = body;

  if (!title?.trim() || !mnemonic_text?.trim()) {
    return NextResponse.json({ error: 'Tittel og tekst er påkrevd' }, { status: 400 });
  }

  const { data, error } = await supabase.from('mnemonics').insert({
    user_id: user.id,
    title: title.trim(),
    mnemonic_text: mnemonic_text.trim(),
    explanation: explanation?.trim() || null,
    topic: (topic || 'Generelt').trim(),
    subject: (subject || 'general').trim().toLowerCase(),
    tags: tags || [],
    image_url: image_url || null,
  }).select().single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'En huskeregel med denne tittelen finnes allerede' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Link to cards if provided
  if (linked_card_ids?.length > 0) {
    const links = linked_card_ids.map((card_id: string) => ({
      mnemonic_id: data.id,
      card_id,
      user_id: user.id,
    }));
    await supabase.from('mnemonic_cards').insert(links);
  }

  return NextResponse.json({ mnemonic: data }, { status: 201 });
}
