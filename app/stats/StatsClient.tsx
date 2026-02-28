'use client';

import Link from 'next/link';
import { ArrowLeft, Flame, Target, TrendingUp, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import type { ReviewLog } from '@/lib/types';

interface ReviewSummary {
  ease_factor: number;
  interval: number;
  lapses: number;
  repetitions: number;
}

interface Props {
  reviewLogs: ReviewLog[];
  reviews: ReviewSummary[];
  totalCards: number;
  email?: string;
}

function groupByDate(logs: ReviewLog[]): Record<string, ReviewLog[]> {
  const groups: Record<string, ReviewLog[]> = {};
  logs.forEach((log) => {
    const date = log.reviewed_at.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
  });
  return groups;
}

function getStreak(byDate: Record<string, ReviewLog[]>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (byDate[key] && byDate[key].length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function getRetention(logs: ReviewLog[]): number {
  if (logs.length === 0) return 0;
  const good = logs.filter((l) => l.rating >= 3).length;
  return Math.round((good / logs.length) * 100);
}

export default function StatsClient({ reviewLogs, reviews, totalCards, email }: Props) {
  const byDate = groupByDate(reviewLogs);
  const streak = getStreak(byDate);
  const retention = getRetention(reviewLogs);
  const totalReviews = reviewLogs.length;

  // Reviews per day (last 14 days)
  const last14: { date: string; count: number; good: number; again: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const dayLogs = byDate[key] ?? [];
    last14.push({
      date: key,
      count: dayLogs.length,
      good: dayLogs.filter((l) => l.rating >= 3).length,
      again: dayLogs.filter((l) => l.rating === 1).length,
    });
  }
  const maxCount = Math.max(...last14.map((d) => d.count), 1);

  // Ease distribution buckets
  const easeBuckets = [0, 0, 0, 0, 0]; // <1.5, 1.5-2.0, 2.0-2.5, 2.5-3.0, >3.0
  reviews.forEach((r) => {
    const e = r.ease_factor;
    if (e < 1.5) easeBuckets[0]++;
    else if (e < 2.0) easeBuckets[1]++;
    else if (e < 2.5) easeBuckets[2]++;
    else if (e < 3.0) easeBuckets[3]++;
    else easeBuckets[4]++;
  });
  const maxEase = Math.max(...easeBuckets, 1);

  // Rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // 0-indexed: ignore 0, 1=Again, 2=Hard, 3=Good, 4=Easy
  reviewLogs.forEach((l) => { if (l.rating >= 1 && l.rating <= 4) ratingCounts[l.rating]++; });

  // Average interval
  const avgInterval = reviews.length > 0
    ? Math.round(reviews.reduce((s, r) => s + r.interval, 0) / reviews.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={email} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Statistikk</h1>
            <p className="text-sm text-slate-500 mt-0.5">Din studieprestasjon de siste 30 dagene</p>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Flame, label: 'Streak', value: `${streak} dag${streak !== 1 ? 'er' : ''}`, color: 'bg-orange-100 text-orange-600' },
            { icon: Target, label: 'Retensjon', value: `${retention}%`, color: 'bg-emerald-100 text-emerald-600' },
            { icon: TrendingUp, label: 'Repetisjoner (30d)', value: totalReviews.toString(), color: 'bg-violet-100 text-violet-600' },
            { icon: BarChart3, label: 'Snitt intervall', value: `${avgInterval}d`, color: 'bg-blue-100 text-blue-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Reviews per day chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Repetisjoner per dag (siste 14 dager)</h2>
          <div className="flex items-end gap-1.5" style={{ height: '120px' }}>
            {last14.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                  <div
                    className="w-full bg-violet-500 rounded-t-md transition-all"
                    style={{ height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 4 : 0)}%` }}
                    title={`${day.date}: ${day.count} reviews`}
                  />
                </div>
                <span className="text-[9px] text-slate-400">{day.date.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Rating distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Vurderingsfordeling</h2>
            <div className="space-y-2.5">
              {[
                { label: 'Igjen', count: ratingCounts[1], color: 'bg-red-500' },
                { label: 'Vanskelig', count: ratingCounts[2], color: 'bg-orange-500' },
                { label: 'Bra', count: ratingCounts[3], color: 'bg-emerald-500' },
                { label: 'Lett', count: ratingCounts[4], color: 'bg-blue-500' },
              ].map(({ label, count, color }) => {
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-10">{label}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                      <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ease distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Ease-faktor fordeling</h2>
            <div className="flex items-end gap-2" style={{ height: '100px' }}>
              {[
                { label: '<1.5', count: easeBuckets[0] },
                { label: '1.5-2', count: easeBuckets[1] },
                { label: '2-2.5', count: easeBuckets[2] },
                { label: '2.5-3', count: easeBuckets[3] },
                { label: '>3', count: easeBuckets[4] },
              ].map(({ label, count }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                    <div
                      className="w-full bg-violet-400 rounded-t-md transition-all"
                      style={{ height: `${Math.max((count / maxEase) * 100, count > 0 ? 6 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400">{label}</span>
                  <span className="text-[9px] text-slate-500 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-100 rounded-2xl p-4 text-center">
          <p className="text-sm text-slate-600">
            <strong>{totalCards}</strong> totalt kort · <strong>{reviews.length}</strong> med repetisjonsdata · <strong>{reviews.filter(r => r.lapses > 0).length}</strong> glemt
          </p>
        </div>
      </main>
    </div>
  );
}
