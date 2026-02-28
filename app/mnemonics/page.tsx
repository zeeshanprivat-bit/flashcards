import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import MnemonicsClient from './MnemonicsClient';

export default async function MnemonicsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  return (
    <>
      <Navbar email={user.email} />
      <MnemonicsClient />
    </>
  );
}
