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
    .select('ease_factor, interval, lapses, repetitions')
    .eq('user_id', user.id);

  // Total card count
  const { count: totalCards } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <StatsClient
      reviewLogs={reviewLogs ?? []}
      reviews={reviews ?? []}
      totalCards={totalCards ?? 0}
      email={user.email}
    />
  );
}
