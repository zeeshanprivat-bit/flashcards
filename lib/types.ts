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
