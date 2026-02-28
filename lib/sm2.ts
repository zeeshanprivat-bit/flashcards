// SM-2 Spaced Repetition Algorithm
// Rating mapping: 1=Again(0), 2=Hard(3), 3=Good(4), 4=Easy(5)

export interface ReviewData {
  easeFactor: number;   // starts at 2.5, min 1.3
  interval: number;     // days until next review
  repetitions: number;  // number of consecutive successful reviews
  lapses: number;       // number of times card was forgotten (rated "Again")
  dueDate: string;      // ISO date string
}

export function getInitialReviewData(): ReviewData {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    lapses: 0,
    dueDate: new Date().toISOString().split('T')[0],
  };
}

export function calculateNextReview(current: ReviewData, quality: 1 | 2 | 3 | 4): ReviewData {
  let { easeFactor, interval, repetitions, lapses } = current;

  if (quality === 1) {
    // Again — lapse: reset to learning steps, increment lapses
    repetitions = 0;
    lapses += 1;
    interval = 1; // First learning step: review again tomorrow
  } else {
    // Learning steps for new/lapsed cards
    if (repetitions === 0) {
      interval = 1;    // First step: 1 day
    } else if (repetitions === 1) {
      interval = 3;    // Second step: 3 days
    } else {
      interval = Math.round(interval * easeFactor);
    }

    repetitions += 1;

    // Adjust ease factor based on quality (SM-2 formula)
    const qualityScore = quality === 2 ? 3 : quality === 3 ? 4 : 5;
    easeFactor = easeFactor + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3; // Min ease
  }

  const due = new Date();
  due.setDate(due.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    lapses,
    dueDate: due.toISOString().split('T')[0],
  };
}

export function isDueToday(dueDate: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dueDate <= today;
}

export function formatDueDate(dueDate: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (dueDate <= today) return 'Forfaller nå';
  if (dueDate === tomorrowStr) return 'I morgen';

  const days = Math.round((new Date(dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
  return `Om ${days} dager`;
}
