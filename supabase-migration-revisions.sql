-- ============================================
-- ReviNord: Topics & Revisions Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Topics table
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  -- SM-2 spaced repetition state
  ease_factor float default 2.5,
  interval int default 0,
  repetitions int default 0,
  lapses int default 0,
  due_date date default current_date,
  last_revised_at timestamptz,
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table topics enable row level security;
create policy "Users own their topics" on topics for all using (auth.uid() = user_id);

-- 2. Revisions log table (one row per revision event)
create table if not exists revisions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  revised_at timestamptz default now(),
  notes text,
  -- SM-2 snapshot for this revision
  ease_before float,
  ease_after float,
  interval_before int,
  interval_after int,
  due_date_after date
);

alter table revisions enable row level security;
create policy "Users own their revisions" on revisions for all using (auth.uid() = user_id);

-- 3. Indexes
create index if not exists idx_topics_user on topics(user_id);
create index if not exists idx_topics_due on topics(user_id, due_date);
create index if not exists idx_topics_name on topics(user_id, lower(name));
create index if not exists idx_revisions_topic on revisions(topic_id, revised_at desc);
create index if not exists idx_revisions_user on revisions(user_id, revised_at desc);
