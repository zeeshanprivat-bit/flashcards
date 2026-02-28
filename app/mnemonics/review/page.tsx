import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import MnemonicReviewClient from './MnemonicReviewClient';

export default async function MnemonicReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  return (
    <>
      <Navbar email={user.email} />
      <MnemonicReviewClient />
    </>
  );
}
