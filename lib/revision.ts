/**
 * ReviNord revision logic — wraps SM-2 for topic-based revision tracking.
 * Each "Log revision" action is treated as quality=3 (Good recall).
 */

import { calculateNextReview, type ReviewData } from './sm2';
import type { Topic, TopicStatus, TopicWithStatus } from './types';

export function topicToReviewData(topic: Topic): ReviewData {
  return {
    easeFactor: topic.ease_factor,
    interval: topic.interval,
    repetitions: topic.repetitions,
    lapses: topic.lapses,
    dueDate: topic.due_date,
  };
}

/**
 * Calculate the next SM-2 state when a user logs a revision.
 * Defaults to quality=3 (Good).
 */
export function calcNextRevision(topic: Topic): ReviewData {
  return calculateNextReview(topicToReviewData(topic), 3);
}

/** Number of days between two ISO date strings (b - a). */
function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Derive the display status of a topic based on its SM-2 state.
 * Returns status + helper numbers for the UI.
 */
export function getTopicWithStatus(topic: Topic): TopicWithStatus {
  const today = todayISO();
  const dueDate = topic.due_date;
  const daysToGo = daysBetween(today, dueDate); // negative = overdue
  const daysAgo = topic.last_revised_at
    ? daysBetween(topic.last_revised_at.split('T')[0], today)
    : null;

  let status: TopicStatus;
  let dueIn: number | null = null;
  let daysLate: number | null = null;
  let progressPct = 0;

  if (topic.repetitions === 0 && !topic.last_revised_at) {
    // Never revised
    status = 'new';
    progressPct = 0;
  } else if (daysToGo < 0) {
    // Overdue
    status = 'overdue';
    daysLate = Math.abs(daysToGo);
    progressPct = 1;
  } else if (daysToGo === 0) {
    // Due today
    status = 'due-soon';
    dueIn = 0;
    progressPct = 0.95;
  } else {
    const interval = topic.interval || 1;
    const pct = 1 - daysToGo / interval;

    if (pct >= 0.8) {
      // < 20% interval remaining
      status = 'due-soon';
      dueIn = daysToGo;
      progressPct = pct;
    } else if (pct >= 0.05) {
      status = 'on-track';
      dueIn = daysToGo;
      progressPct = pct;
    } else {
      // Just revised
      status = 'fresh';
      dueIn = daysToGo;
      progressPct = pct;
    }
  }

  return { ...topic, status, daysAgo, dueIn, daysLate, progressPct };
}

export const STATUS_META: Record<
  TopicStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  new: {
    label: 'Ikke startet',
    color: 'var(--rn-charcoal-muted)',
    bg: 'var(--rn-cream-dark)',
    border: 'var(--rn-linen)',
  },
  fresh: {
    label: 'Fersk',
    color: 'var(--rn-sage)',
    bg: 'var(--rn-sage-bg)',
    border: '#C8DFC8',
  },
  'on-track': {
    label: 'På sporet',
    color: 'var(--rn-fjord)',
    bg: 'var(--rn-fjord-bg)',
    border: '#BFCFDF',
  },
  'due-soon': {
    label: 'Forfaller snart',
    color: 'var(--rn-terracotta)',
    bg: 'var(--rn-terracotta-bg)',
    border: '#DEC4B8',
  },
  overdue: {
    label: 'Forfalt',
    color: 'var(--rn-overdue)',
    bg: 'var(--rn-overdue-bg)',
    border: '#D8B8B8',
  },
};

export function getDueLabel(topic: TopicWithStatus): string {
  switch (topic.status) {
    case 'new':
      return 'Aldri repetert';
    case 'fresh':
      return `Om ${topic.dueIn} dag${topic.dueIn === 1 ? '' : 'er'}`;
    case 'on-track':
      return `Om ${topic.dueIn} dag${topic.dueIn === 1 ? '' : 'er'}`;
    case 'due-soon':
      return topic.dueIn === 0 ? 'Forfaller i dag' : `Om ${topic.dueIn} dag${topic.dueIn === 1 ? '' : 'er'}`;
    case 'overdue':
      return `${topic.daysLate} dag${topic.daysLate === 1 ? '' : 'er'} forsinket`;
  }
}

export function getLastRevisedLabel(topic: TopicWithStatus): string {
  if (topic.daysAgo === null) return 'Aldri repetert';
  if (topic.daysAgo === 0) return 'Nettopp repetert';
  if (topic.daysAgo === 1) return 'Repetert i går';
  return `Repetert for ${topic.daysAgo} dager siden`;
}
