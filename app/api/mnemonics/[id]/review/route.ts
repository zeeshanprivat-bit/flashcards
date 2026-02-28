import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateNextReview } from '@/lib/sm2';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rating } = await request.json();
  if (![1, 2, 3, 4].includes(rating)) {
    return NextResponse.json({ error: 'Rating must be 1-4' }, { status: 400 });
  }

  const { data: mnemonic, error } = await supabase
    .from('mnemonics')
    .select('ease_factor, interval, repetitions, lapses, due_date')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !mnemonic) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 });

  const current = {
    easeFactor: mnemonic.ease_factor,
    interval: mnemonic.interval,
    repetitions: mnemonic.repetitions,
    lapses: mnemonic.lapses,
    dueDate: mnemonic.due_date,
  };

  const next = calculateNextReview(current, rating as 1 | 2 | 3 | 4);

  // Log review
  await supabase.from('mnemonic_review_logs').insert({
    mnemonic_id: id,
    user_id: user.id,
    rating,
    ease_before: current.easeFactor,
    ease_after: next.easeFactor,
    interval_before: current.interval,
    interval_after: next.interval,
  });

  // Update mnemonic with new SR data + increment review count
  const { data: updated } = await supabase
    .from('mnemonics')
    .update({
      ease_factor: next.easeFactor,
      interval: next.interval,
      repetitions: next.repetitions,
      lapses: next.lapses,
      due_date: next.dueDate,
      review_count: (mnemonic as any).review_count ? (mnemonic as any).review_count + 1 : 1,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  return NextResponse.json({ mnemonic: updated });
}
