import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import MnemonicDetailClient from './MnemonicDetailClient';

export default async function MnemonicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  return (
    <>
      <Navbar email={user.email} />
      <MnemonicDetailClient id={id} />
    </>
  );
}
