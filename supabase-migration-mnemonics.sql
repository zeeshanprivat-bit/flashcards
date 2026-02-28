-- ============================================
-- Flashcards App: Mnemonics System Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Mnemonics table
create table if not exists mnemonics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  mnemonic_text text not null,
  explanation text,
  topic text not null,
  subject text not null default 'general',
  tags text[] default '{}',
  image_url text,
  -- Spaced repetition fields
  ease_factor float default 2.5,
  interval int default 0,
  repetitions int default 0,
  lapses int default 0,
  due_date date default current_date,
  -- Usage tracking
  review_count int default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table mnemonics enable row level security;
create policy "Users own their mnemonics" on mnemonics for all using (auth.uid() = user_id);

-- 2. Mnemonic-to-card link table (many-to-many)
create table if not exists mnemonic_cards (
  id uuid primary key default gen_random_uuid(),
  mnemonic_id uuid references mnemonics(id) on delete cascade not null,
  card_id uuid references cards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(mnemonic_id, card_id)
);

alter table mnemonic_cards enable row level security;
create policy "Users own their mnemonic_cards" on mnemonic_cards for all using (auth.uid() = user_id);

-- 3. Mnemonic review log
create table if not exists mnemonic_review_logs (
  id uuid primary key default gen_random_uuid(),
  mnemonic_id uuid references mnemonics(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating int not null,
  ease_before float,
  ease_after float,
  interval_before int,
  interval_after int,
  reviewed_at timestamptz default now()
);

alter table mnemonic_review_logs enable row level security;
create policy "Users own their mnemonic_review_logs" on mnemonic_review_logs for all using (auth.uid() = user_id);

-- 4. Prevent duplicate mnemonics (same title + user)
create unique index if not exists idx_mnemonics_unique_title on mnemonics(user_id, lower(title));

-- 5. Indexes for search and filtering
create index if not exists idx_mnemonics_user on mnemonics(user_id);
create index if not exists idx_mnemonics_subject on mnemonics(user_id, subject);
create index if not exists idx_mnemonics_topic on mnemonics(user_id, topic);
create index if not exists idx_mnemonics_tags on mnemonics using gin(tags);
create index if not exists idx_mnemonics_due on mnemonics(user_id, due_date);
create index if not exists idx_mnemonic_cards_mnemonic on mnemonic_cards(mnemonic_id);
create index if not exists idx_mnemonic_cards_card on mnemonic_cards(card_id);
create index if not exists idx_mnemonic_review_logs_mnemonic on mnemonic_review_logs(mnemonic_id);

-- 6. Create storage bucket for mnemonic images (run separately if needed)
-- insert into storage.buckets (id, name, public) values ('mnemonic-images', 'mnemonic-images', true);
-- create policy "Users can upload mnemonic images" on storage.objects for insert with check (bucket_id = 'mnemonic-images' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Users can view mnemonic images" on storage.objects for select using (bucket_id = 'mnemonic-images');
-- create policy "Users can delete own mnemonic images" on storage.objects for delete using (bucket_id = 'mnemonic-images' and auth.uid()::text = (storage.foldername(name))[1]);
