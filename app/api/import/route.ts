import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getInitialReviewData } from '@/lib/sm2';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { csv, deckId, deckTitle } = await request.json();
  if (!csv || typeof csv !== 'string') {
    return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });
  }

  const lines = csv.split('\n').filter((l: string) => l.trim());
  if (lines.length < 2) {
    return NextResponse.json({ error: 'CSV must have a header row and at least one data row' }, { status: 400 });
  }

  // Parse CSV (simple parser — handles quoted fields)
  function parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current); current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result.map((s) => s.trim());
  }

  const header = parseLine(lines[0]).map((h) => h.toLowerCase());
  const frontIdx = header.indexOf('front');
  const backIdx = header.indexOf('back');

  if (frontIdx === -1 || backIdx === -1) {
    return NextResponse.json({ error: 'CSV must have "front" and "back" columns' }, { status: 400 });
  }

  const typeIdx = header.indexOf('type');
  const clozeIdx = header.indexOf('cloze_text');
  const tagsIdx = header.indexOf('tags');

  // Get or create target deck
  let targetDeckId = deckId;
  if (!targetDeckId) {
    const title = deckTitle || 'Imported Deck';
    const { data: deck, error: deckErr } = await supabase
      .from('decks')
      .insert({ title, user_id: user.id })
      .select()
      .single();
    if (deckErr) return NextResponse.json({ error: deckErr.message }, { status: 500 });
    targetDeckId = deck.id;
  }

  // Parse rows
  const cards = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseLine(lines[i]);
    const front = fields[frontIdx] ?? '';
    const back = fields[backIdx] ?? '';
    if (!front && !back) continue;

    const type = typeIdx >= 0 ? (fields[typeIdx] || 'basic') : 'basic';
    const clozeText = clozeIdx >= 0 ? (fields[clozeIdx] || null) : null;
    const tags = tagsIdx >= 0 ? (fields[tagsIdx] || '').split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [];

    cards.push({
      deck_id: targetDeckId,
      user_id: user.id,
      type,
      front: front || (clozeText ?? '').replace(/\{\{c\d+::(.*?)\}\}/g, '$1'),
      back,
      cloze_text: type === 'cloze' ? clozeText : null,
      tags,
    });
  }

  if (cards.length === 0) {
    return NextResponse.json({ error: 'No valid cards found in CSV' }, { status: 400 });
  }

  const { data: insertedCards, error: cardsErr } = await supabase
    .from('cards')
    .insert(cards)
    .select();
  if (cardsErr) return NextResponse.json({ error: cardsErr.message }, { status: 500 });

  // Create review records
  const rv = getInitialReviewData();
  await supabase.from('reviews').insert(
    (insertedCards ?? []).map((card) => ({
      card_id: card.id,
      user_id: user.id,
      ease_factor: rv.easeFactor,
      interval: rv.interval,
      repetitions: rv.repetitions,
      lapses: rv.lapses,
      due_date: rv.dueDate,
      last_reviewed: null,
    }))
  );

  return NextResponse.json({ imported: cards.length, deckId: targetDeckId });
}
