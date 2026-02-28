export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StatsClient from './StatsClient';

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // Fetch review logs for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: reviewLogs } = await supabase
    .from('review_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('reviewed_at', thirtyDaysAgo.toISOString())
    .order('reviewed_at', { ascending: true });

  // Fetch all reviews for ease distribution
  const { data: reviews } = await supabase
    .from('reviews')
    .select('card_id, ease_factor, interval, lapses, repetitions, due_date')
    .eq('user_id', user.id);

  // Total card count and topic data
  const { data: cards } = await supabase
    .from('cards')
    .select('id, front, tags, deck_id, decks(title)')
    .eq('user_id', user.id);

  return (
    <StatsClient
      reviewLogs={reviewLogs ?? []}
      reviews={reviews ?? []}
      totalCards={cards?.length ?? 0}
      cards={cards ?? []}
      email={user.email}
    />
  );
}
