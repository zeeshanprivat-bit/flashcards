export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DeckDetailClient from './DeckDetailClient';

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: cards } = await supabase
    .from('cards')
    .select('*, review:reviews(*)')
    .eq('deck_id', id)
    .order('created_at', { ascending: true });

  return <DeckDetailClient deck={deck} cards={cards ?? []} email={user.email} />;
}
