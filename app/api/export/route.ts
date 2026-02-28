import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const format = request.nextUrl.searchParams.get('format') ?? 'csv';
  const deckId = request.nextUrl.searchParams.get('deck_id');

  let query = supabase
    .from('cards')
    .select('id, deck_id, type, front, back, cloze_text, tags, created_at, decks!inner(title)')
    .eq('user_id', user.id);

  if (deckId) query = query.eq('deck_id', deckId);

  const { data: cards, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (format === 'json') {
    const json = (cards ?? []).map((c: any) => ({
      deck: c.decks?.title ?? '',
      type: c.type,
      front: c.front,
      back: c.back,
      cloze_text: c.cloze_text,
      tags: c.tags,
    }));
    return new NextResponse(JSON.stringify(json, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="flashcards-export.json"',
      },
    });
  }

  // CSV format
  const header = 'deck,type,front,back,cloze_text,tags';
  const rows = (cards ?? []).map((c: any) => {
    const esc = (s: string) => `"${(s ?? '').replace(/"/g, '""')}"`;
    return [
      esc(c.decks?.title ?? ''),
      esc(c.type),
      esc(c.front),
      esc(c.back),
      esc(c.cloze_text ?? ''),
      esc((c.tags ?? []).join(', ')),
    ].join(',');
  });

  const csv = [header, ...rows].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="flashcards-export.csv"',
    },
  });
}
