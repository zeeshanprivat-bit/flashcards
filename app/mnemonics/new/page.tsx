import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import MnemonicForm from '../MnemonicForm';

export default async function NewMnemonicPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // Fetch user's cards for linking
  const { data: cards } = await supabase
    .from('cards')
    .select('id, front, deck_id, decks(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200);

  const userCards = (cards || []).map((c: any) => ({
    id: c.id,
    front: c.front,
    deck_title: c.decks?.title,
  }));

  return (
    <>
      <Navbar email={user.email} />
      <MnemonicForm mode="create" userCards={userCards} />
    </>
  );
}
