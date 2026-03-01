import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/topics — list all topics for the authenticated user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/topics — create a new topic
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const name = (body.name ?? '').trim();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('topics')
    .insert({
      user_id: user.id,
      name,
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      lapses: 0,
      due_date: today,
      last_revised_at: null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
