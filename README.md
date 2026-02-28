# Flashcards — AI-powered spaced repetition

Paste any text → AI generates flashcards → study with SM-2 spaced repetition. Built with Next.js 14, Supabase, and OpenAI.

---

## Setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New project → copy your **Project URL** and **anon key**.

### 2. Run this SQL in Supabase SQL Editor

```sql
-- Decks
create table decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  created_at timestamptz default now()
);

-- Cards
create table cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references decks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  front text not null,
  back text not null,
  created_at timestamptz default now()
);

-- Reviews (spaced repetition state per card)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  ease_factor float default 2.5,
  interval int default 0,
  repetitions int default 0,
  due_date date default current_date,
  last_reviewed timestamptz
);

-- AI usage tracking (rate limiting)
create table ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table decks enable row level security;
alter table cards enable row level security;
alter table reviews enable row level security;
alter table ai_usage enable row level security;

-- RLS policies (users can only access their own data)
create policy "Users own their decks" on decks for all using (auth.uid() = user_id);
create policy "Users own their cards" on cards for all using (auth.uid() = user_id);
create policy "Users own their reviews" on reviews for all using (auth.uid() = user_id);
create policy "Users own their ai_usage" on ai_usage for all using (auth.uid() = user_id);

-- Indexes for performance
create index idx_cards_deck_id on cards(deck_id);
create index idx_reviews_card_id on reviews(card_id);
create index idx_reviews_due_date on reviews(due_date);
create index idx_ai_usage_user_created on ai_usage(user_id, created_at);
```

### 3. Enable Google OAuth (optional)
In Supabase → Authentication → Providers → Google → enable and add your Google OAuth credentials.

### 4. Set redirect URL
In Supabase → Authentication → URL Configuration → add:
```
http://localhost:3000/api/auth/callback
```
(Add your production URL too when deploying)

### 5. Create `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
```

### 6. Run the app
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features
- **AI card generation** — paste text, GPT-4o-mini extracts Q&A pairs (max 20 generations/day per user)
- **SM-2 spaced repetition** — Again / Hard / Good / Easy ratings schedule next review
- **Flip card animation** — tap to reveal answer
- **Deck management** — create, edit, delete decks and individual cards
- **Cloud sync** — all data stored in Supabase, accessible from any device
- **Auth** — email magic link + Google OAuth

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
