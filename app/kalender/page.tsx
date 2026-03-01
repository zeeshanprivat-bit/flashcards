import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import KalenderClient from './KalenderClient';

interface RevisionRow {
  id: string;
  topic_id: string;
  topic_name: string;
  revised_at: string;
}

export default async function KalenderPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data, error } = await supabase
    .from('revisions')
    .select('id, topic_id, revised_at, topics(name)')
    .eq('user_id', user.id)
    .order('revised_at', { ascending: false });

  if (error) {
    console.error('Kalender fetch error:', error.message);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const revisions: RevisionRow[] = (data ?? []).map((r: any) => ({
    id: r.id as string,
    topic_id: r.topic_id as string,
    topic_name: (Array.isArray(r.topics) ? r.topics[0]?.name : r.topics?.name) ?? 'Ukjent emne',
    revised_at: r.revised_at as string,
  }));

  return <KalenderClient revisions={revisions} />;
}
