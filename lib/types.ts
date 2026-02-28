export interface Deck {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  card_count?: number;
  due_count?: number;
}

export interface Card {
  id: string;
  deck_id: string;
  user_id: string;
  front: string;
  back: string;
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
  due_date: string;
  last_reviewed: string | null;
}

export interface GeneratedCard {
  front: string;
  back: string;
}
