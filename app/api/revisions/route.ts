import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/revisions — all revisions for the authenticated user, joined with topic name
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('revisions')
    .select('id, topic_id, revised_at, topics(name)')
    .eq('user_id', user.id)
    .order('revised_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten: { id, topic_id, topic_name, revised_at }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flat = (data ?? []).map((r: any) => ({
    id: r.id as string,
    topic_id: r.topic_id as string,
    topic_name: (Array.isArray(r.topics) ? r.topics[0]?.name : r.topics?.name) ?? 'Ukjent emne',
    revised_at: r.revised_at as string,
  }));

  return NextResponse.json(flat);
}
