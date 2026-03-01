// ── ReviNord: Topic revision types ─────────────────────────────────────────

export type TopicStatus = 'fresh' | 'on-track' | 'due-soon' | 'overdue' | 'new';

export interface Topic {
  id: string;
  user_id: string;
  name: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  lapses: number;
  due_date: string;
  last_revised_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TopicWithStatus extends Topic {
  status: TopicStatus;
  daysAgo: number | null;
  dueIn: number | null;
  daysLate: number | null;
  progressPct: number;
}

export interface Revision {
  id: string;
  topic_id: string;
  user_id: string;
  revised_at: string;
  notes: string | null;
  ease_before: number | null;
  ease_after: number | null;
  interval_before: number | null;
  interval_after: number | null;
  due_date_after: string | null;
}

// ── Legacy flashcard types ──────────────────────────────────────────────────

export interface Deck {
  id: string;
  user_id: string;
  title: string;
  parent_id?: string | null;
  created_at: string;
  card_count?: number;
  due_count?: number;
  new_count?: number;
}

export interface Card {
  id: string;
  deck_id: string;
  user_id: string;
  type: 'basic' | 'cloze';
  front: string;
  back: string;
  cloze_text?: string | null;
  tags: string[];
  created_at: string;
  review?: Review;
}

export interface Review {
  id: string;
  card_id: string;
  user_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  lapses: number;
  due_date: string;
  last_reviewed: string | null;
}

export interface ReviewLog {
  id: string;
  card_id: string;
  user_id: string;
  rating: number;
  ease_before: number;
  ease_after: number;
  interval_before: number;
  interval_after: number;
  reviewed_at: string;
}

export interface UserSettings {
  user_id: string;
  daily_goal: number;
  new_cards_per_day: number;
}

export interface GeneratedCard {
  type: 'basic' | 'cloze';
  front: string;
  back: string;
  cloze_text?: string;
  tags: string[];
  source_snippet?: string;
}
