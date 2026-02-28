'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FlashCard from '@/components/FlashCard';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { calculateNextReview, getInitialReviewData } from '@/lib/sm2';
import type { Deck, Card } from '@/lib/types';

interface Props {
  deck: Deck;
  dueCards: Card[];
  email?: string;
}

const RATINGS: { label: string; variant: 'again' | 'hard' | 'good' | 'easy'; value: 1 | 2 | 3 | 4; hint: string }[] = [
  { label: 'Again', variant: 'again', value: 1, hint: 'Completely forgot' },
  { label: 'Hard', variant: 'hard', value: 2, hint: 'Remembered with difficulty' },
  { label: 'Good', variant: 'good', value: 3, hint: 'Remembered correctly' },
  { label: 'Easy', variant: 'easy', value: 4, hint: 'Perfect recall' },
];

export default function StudyClient({ deck, dueCards, email }: Props) {
  const supabase = createClient();
  const [cards] = useState<Card[]>(dueCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [submitting, setSubmitting] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = Math.round((currentIndex / cards.length) * 100);

  const handleRating = useCallback(async (quality: 1 | 2 | 3 | 4) => {
    if (!currentCard || submitting) return;
    setSubmitting(true);

    const review = Array.isArray(currentCard.review) ? currentCard.review[0] : currentCard.review;
    const currentData = review
      ? { easeFactor: review.ease_factor, interval: review.interval, repetitions: review.repetitions, dueDate: review.due_date }
      : getInitialReviewData();

    const next = calculateNextReview(currentData, quality);

    // Upsert review record
    if (review?.id) {
      await supabase.from('reviews').update({
        ease_factor: next.easeFactor,
        interval: next.interval,
        repetitions: next.repetitions,
        due_date: next.dueDate,
        last_reviewed: new Date().toISOString(),
      }).eq('id', review.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('reviews').insert({
        card_id: currentCard.id,
        user_id: user?.id,
        ease_factor: next.easeFactor,
        interval: next.interval,
        repetitions: next.repetitions,
        due_date: next.dueDate,
        last_reviewed: new Date().toISOString(),
      });
    }

    // Update stats
    setStats((prev) => ({
      ...prev,
      [quality === 1 ? 'again' : quality === 2 ? 'hard' : quality === 3 ? 'good' : 'easy']:
        prev[quality === 1 ? 'again' : quality === 2 ? 'hard' : quality === 3 ? 'good' : 'easy'] + 1,
    }));

    setSubmitting(false);

    if (currentIndex + 1 >= cards.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  }, [currentCard, currentIndex, cards.length, submitting, supabase]);

  useEffect(() => {
    if (done) return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!revealed) setRevealed(true);
      }
      if (revealed && !submitting) {
        if (e.key === '1') handleRating(1);
        if (e.key === '2') handleRating(2);
        if (e.key === '3') handleRating(3);
        if (e.key === '4') handleRating(4);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, revealed, submitting, handleRating]);

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar email={email} />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Nothing due!</h2>
          <p className="text-slate-500 mb-6">All cards in this deck are up to date. Come back later.</p>
          <Link href="/dashboard">
            <Button variant="outline"><ArrowLeft className="w-4 h-4" /> Back to decks</Button>
          </Link>
        </main>
      </div>
    );
  }

  if (done) {
    const total = stats.again + stats.hard + stats.good + stats.easy;
    const correct = stats.good + stats.easy;
    const pct = Math.round((correct / total) * 100);

    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar email={email} />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Session complete!</h2>
          <p className="text-slate-500 mb-8">{total} cards reviewed · {pct}% good or easy</p>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Again', count: stats.again, color: 'bg-red-100 text-red-700' },
              { label: 'Hard', count: stats.hard, color: 'bg-orange-100 text-orange-700' },
              { label: 'Good', count: stats.good, color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Easy', count: stats.easy, color: 'bg-blue-100 text-blue-700' },
            ].map(({ label, count, color }) => (
              <div key={label} className={`rounded-2xl p-4 ${color}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline"><ArrowLeft className="w-4 h-4" /> All decks</Button>
            </Link>
            <Link href={`/decks/${deck.id}`}>
              <Button variant="secondary">View deck</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={email} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/decks/${deck.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" /> {deck.title}
            </Button>
          </Link>
          <span className="text-sm text-slate-500 font-medium">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-8">
          <div
            className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flash card */}
        <div style={{ perspective: '1200px', minHeight: '280px' }} className="mb-8">
          <FlashCard
            front={currentCard.front}
            back={currentCard.back}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
          />
        </div>

        {/* Rating buttons — only show after reveal */}
        {revealed ? (
          <div>
            <p className="text-xs text-center text-slate-400 font-medium uppercase tracking-wider mb-3">How well did you know this? <span className="normal-case font-normal">(press 1–4)</span></p>
            <div className="grid grid-cols-4 gap-3">
              {RATINGS.map(({ label, variant, value, hint }) => (
                <button
                  key={label}
                  onClick={() => handleRating(value)}
                  disabled={submitting}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all active:scale-95 disabled:opacity-50
                    ${variant === 'again' ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700' :
                      variant === 'hard' ? 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700' :
                      variant === 'good' ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700' :
                      'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700'}`}
                >
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-[10px] opacity-70 text-center leading-tight">{hint}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Button size="lg" onClick={() => setRevealed(true)} className="px-12">
              Reveal answer
              <span className="ml-2 text-xs opacity-60 font-normal">Space</span>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
