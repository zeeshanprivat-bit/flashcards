export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: decks } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Get card counts and due counts per deck
  const deckIds = (decks ?? []).map((d) => d.id);
  let cardCounts: Record<string, number> = {};
  let dueCounts: Record<string, number> = {};

  if (deckIds.length > 0) {
    const today = new Date().toISOString().split('T')[0];

    const { data: cards } = await supabase
      .from('cards')
      .select('id, deck_id')
      .in('deck_id', deckIds);

    (cards ?? []).forEach((c) => {
      cardCounts[c.deck_id] = (cardCounts[c.deck_id] ?? 0) + 1;
    });

    const cardIds = (cards ?? []).map((c) => c.id);
    if (cardIds.length > 0) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('card_id, due_date')
        .in('card_id', cardIds)
        .lte('due_date', today);

      (reviews ?? []).forEach((r) => {
        const card = (cards ?? []).find((c) => c.id === r.card_id);
        if (card) dueCounts[card.deck_id] = (dueCounts[card.deck_id] ?? 0) + 1;
      });

      // Cards with no review record are also due
      const reviewedCardIds = new Set((reviews ?? []).map((r) => r.card_id));
      (cards ?? []).forEach((c) => {
        if (!reviewedCardIds.has(c.id)) {
          dueCounts[c.deck_id] = (dueCounts[c.deck_id] ?? 0) + 1;
        }
      });
    }
  }

  const decksWithCounts = (decks ?? []).map((d) => ({
    ...d,
    card_count: cardCounts[d.id] ?? 0,
    due_count: dueCounts[d.id] ?? 0,
  }));

  return <DashboardClient decks={decksWithCounts} email={user.email} />;
}
