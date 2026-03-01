export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTopicWithStatus } from '@/lib/revision';
import DashboardClient from './DashboardClient';
import type { Topic } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  const topicsWithStatus = (topics ?? [] as Topic[]).map(getTopicWithStatus);

  return <DashboardClient topics={topicsWithStatus} email={user.email ?? ''} />;
}
