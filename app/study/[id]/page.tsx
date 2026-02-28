export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StudyClient from './StudyClient';

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: deck } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!deck) notFound();

  const today = new Date().toISOString().split('T')[0];

  // Get all cards in deck with their reviews
  const { data: cards } = await supabase
    .from('cards')
    .select('*, review:reviews(*)')
    .eq('deck_id', id)
    .eq('user_id', user.id);

  // Filter to only cards due today (no review = new card = due now)
  const dueCards = (cards ?? []).filter((c) => {
    const r = Array.isArray(c.review) ? c.review[0] : c.review;
    return !r || r.due_date <= today;
  });

  return <StudyClient deck={deck} dueCards={dueCards} email={user.email} />;
}
