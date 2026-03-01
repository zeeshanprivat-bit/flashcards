export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTopicWithStatus } from '@/lib/revision';
import TopicDetailClient from './TopicDetailClient';
import type { Topic, Revision } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TopicDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!topic) notFound();

  const { data: revisions } = await supabase
    .from('revisions')
    .select('*')
    .eq('topic_id', id)
    .order('revised_at', { ascending: false });

  const topicWithStatus = getTopicWithStatus(topic as Topic);

  return (
    <TopicDetailClient
      topic={topicWithStatus}
      revisions={(revisions ?? []) as Revision[]}
    />
  );
}
