import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import MnemonicForm from '../../MnemonicForm';

export default async function EditMnemonicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: mnemonic } = await supabase
    .from('mnemonics')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!mnemonic) redirect('/mnemonics');

  // Get linked card IDs
  const { data: links } = await supabase
    .from('mnemonic_cards')
    .select('card_id')
    .eq('mnemonic_id', id);

  const linkedCardIds = (links || []).map((l: any) => l.card_id);

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
      <MnemonicForm
        mode="edit"
        initial={{
          id: mnemonic.id,
          title: mnemonic.title,
          mnemonic_text: mnemonic.mnemonic_text,
          explanation: mnemonic.explanation || '',
          topic: mnemonic.topic,
          subject: mnemonic.subject,
          tags: mnemonic.tags || [],
          image_url: mnemonic.image_url,
        }}
        linkedCardIds={linkedCardIds}
        userCards={userCards}
      />
    </>
  );
}
