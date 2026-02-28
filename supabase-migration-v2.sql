-- ============================================
-- Flashcards App v2 Migration
-- Run this in Supabase SQL Editor AFTER the v1 schema
-- ============================================

-- 1. Add card type, cloze_text, tags to cards
alter table cards add column if not exists type text not null default 'basic';
alter table cards add column if not exists cloze_text text;
alter table cards add column if not exists tags text[] default '{}';

-- 2. Add parent_id to decks for subdeck hierarchy
alter table decks add column if not exists parent_id uuid references decks(id) on delete cascade;

-- 3. Add lapses to reviews
alter table reviews add column if not exists lapses int default 0;

-- 4. Review log (history of every single review action)
create table if not exists review_logs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating int not null,
  ease_before float,
  ease_after float,
  interval_before int,
  interval_after int,
  reviewed_at timestamptz default now()
);

alter table review_logs enable row level security;
create policy "Users own their review_logs" on review_logs for all using (auth.uid() = user_id);

-- 5. AI generation jobs (track input, output, token usage)
create table if not exists ai_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  input_text text not null,
  output_cards jsonb,
  style text default 'balanced',
  status text default 'completed',
  token_usage int,
  created_at timestamptz default now()
);

alter table ai_generation_jobs enable row level security;
create policy "Users own their ai_generation_jobs" on ai_generation_jobs for all using (auth.uid() = user_id);

-- 6. User settings (daily goal, new card limit)
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_goal int default 30,
  new_cards_per_day int default 20,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_settings enable row level security;
create policy "Users own their settings" on user_settings for all using (auth.uid() = user_id);

-- 7. Additional indexes
create index if not exists idx_cards_tags on cards using gin(tags);
create index if not exists idx_cards_type on cards(type);
create index if not exists idx_review_logs_card_id on review_logs(card_id);
create index if not exists idx_review_logs_user_date on review_logs(user_id, reviewed_at);
create index if not exists idx_decks_parent_id on decks(parent_id);
create index if not exists idx_ai_jobs_user on ai_generation_jobs(user_id, created_at);
