// SM-2 Spaced Repetition Algorithm
// Quality ratings: 1=Again, 2=Hard, 3=Good, 4=Easy

export interface ReviewData {
  easeFactor: number;   // starts at 2.5
  interval: number;     // days until next review
  repetitions: number;  // number of successful reviews
  dueDate: string;      // ISO date string
}

export function getInitialReviewData(): ReviewData {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: new Date().toISOString().split('T')[0],
  };
}

export function calculateNextReview(current: ReviewData, quality: 1 | 2 | 3 | 4): ReviewData {
  let { easeFactor, interval, repetitions } = current;

  if (quality === 1) {
    // Again — reset
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    repetitions += 1;

    // Adjust ease factor based on quality
    const qualityScore = quality === 2 ? 3 : quality === 3 ? 4 : 5;
    easeFactor = easeFactor + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;
  }

  const due = new Date();
  due.setDate(due.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
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

  if (dueDate <= today) return 'Due now';
  if (dueDate === tomorrowStr) return 'Tomorrow';

  const days = Math.round((new Date(dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
  return `In ${days} days`;
}
