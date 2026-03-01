import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calcNextRevision } from '@/lib/revision';
import type { Topic } from '@/lib/types';

// POST /api/topics/[id]/revise — log a revision and advance SM-2 state
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch current topic state
  const { data: topic, error: fetchError } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const notes = (body.notes ?? '').trim() || null;

  // Calculate next SM-2 state
  const next = calcNextRevision(topic as Topic);
  const now = new Date().toISOString();

  // Update topic with new SM-2 state
  const { data: updated, error: updateError } = await supabase
    .from('topics')
    .update({
      ease_factor: next.easeFactor,
      interval: next.interval,
      repetitions: next.repetitions,
      lapses: next.lapses,
      due_date: next.dueDate,
      last_revised_at: now,
      updated_at: now,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // Log the revision event
  await supabase.from('revisions').insert({
    topic_id: id,
    user_id: user.id,
    revised_at: now,
    notes,
    ease_before: topic.ease_factor,
    ease_after: next.easeFactor,
    interval_before: topic.interval,
    interval_after: next.interval,
    due_date_after: next.dueDate,
  });

  return NextResponse.json(updated);
}
