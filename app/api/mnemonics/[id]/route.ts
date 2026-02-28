import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Get single mnemonic with linked cards
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: mnemonic, error } = await supabase
    .from('mnemonics')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 });

  // Get linked cards
  const { data: links } = await supabase
    .from('mnemonic_cards')
    .select('card_id, cards(id, front, back, type)')
    .eq('mnemonic_id', id);

  return NextResponse.json({ mnemonic, linked_cards: links?.map(l => (l as any).cards) || [] });
}

// PUT: Update mnemonic
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, mnemonic_text, explanation, topic, subject, tags, image_url, linked_card_ids } = body;

  const update: Record<string, any> = { updated_at: new Date().toISOString() };
  if (title !== undefined) update.title = title.trim();
  if (mnemonic_text !== undefined) update.mnemonic_text = mnemonic_text.trim();
  if (explanation !== undefined) update.explanation = explanation?.trim() || null;
  if (topic !== undefined) update.topic = topic.trim();
  if (subject !== undefined) update.subject = subject.trim().toLowerCase();
  if (tags !== undefined) update.tags = tags;
  if (image_url !== undefined) update.image_url = image_url;

  const { data, error } = await supabase
    .from('mnemonics')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'En huskeregel med denne tittelen finnes allerede' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update card links if provided
  if (linked_card_ids !== undefined) {
    await supabase.from('mnemonic_cards').delete().eq('mnemonic_id', id);
    if (linked_card_ids.length > 0) {
      const links = linked_card_ids.map((card_id: string) => ({
        mnemonic_id: id,
        card_id,
        user_id: user.id,
      }));
      await supabase.from('mnemonic_cards').insert(links);
    }
  }

  return NextResponse.json({ mnemonic: data });
}

// DELETE: Delete mnemonic
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('mnemonics')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
