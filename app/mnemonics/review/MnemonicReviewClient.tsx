'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Brain, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface Mnemonic {
  id: string;
  title: string;
  mnemonic_text: string;
  explanation: string | null;
  topic: string;
  subject: string;
  image_url: string | null;
  review_count: number;
}

export default function MnemonicReviewClient() {
  const router = useRouter();
  const [queue, setQueue] = useState<Mnemonic[]>([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetch('/api/mnemonics?due=today')
      .then(res => res.json())
      .then(data => {
        setQueue(data.mnemonics || []);
        setLoading(false);
        if (!data.mnemonics?.length) setFinished(true);
      });
  }, []);

  async function handleRate(rating: 1 | 2 | 3 | 4) {
    const m = queue[current];
    await fetch(`/api/mnemonics/${m.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });

    if (current + 1 >= queue.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
      setRevealed(false);
    }
  }

  if (loading) return <div className="text-center text-slate-400 py-16">Laster...</div>;

  if (finished) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ferdig!</h2>
        <p className="text-slate-500 mb-6">
          {queue.length === 0
            ? 'Ingen huskeregler forfaller i dag.'
            : `Du har repetert ${queue.length} huskeregler.`}
        </p>
        <Link href="/mnemonics">
          <Button>Tilbake til huskeregler</Button>
        </Link>
      </div>
    );
  }

  const m = queue[current];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/mnemonics">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Tilbake</Button>
        </Link>
        <span className="text-sm text-slate-500">{current + 1} / {queue.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-8">
        <div
          className="bg-violet-600 h-1.5 rounded-full transition-all"
          style={{ width: `${((current) / queue.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Title + meta */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="bg-slate-100 px-2 py-0.5 rounded capitalize">{m.subject}</span>
            <span>{m.topic}</span>
            <span className="ml-auto">{m.review_count}x repetert</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{m.title}</h2>
        </div>

        {/* Mnemonic text - always visible */}
        <div className="px-6 pb-4">
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-violet-700 text-xs font-medium mb-2">
              <Brain className="w-3.5 h-3.5" />
              Huskeregel
            </div>
            <p className="text-violet-900 font-medium whitespace-pre-wrap">{m.mnemonic_text}</p>
          </div>
        </div>

        {/* Image */}
        {m.image_url && revealed && (
          <div className="px-6 pb-4">
            <img src={m.image_url} alt="" className="rounded-lg max-h-60 mx-auto" />
          </div>
        )}

        {/* Explanation (hidden until revealed) */}
        {!revealed ? (
          <div className="px-6 pb-6">
            <button
              onClick={() => setRevealed(true)}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Vis forklaring
            </button>
          </div>
        ) : (
          <div className="px-6 pb-6">
            {m.explanation && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <div className="text-xs font-medium text-slate-500 mb-2">Forklaring</div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{m.explanation}</p>
              </div>
            )}

            {/* Rating buttons */}
            <p className="text-sm text-slate-600 font-medium mb-3 text-center">Hvordan husket du denne?</p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleRate(1)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                <span className="text-sm font-semibold">Igjen</span>
                <span className="text-xs text-red-400">1 dag</span>
              </button>
              <button
                onClick={() => handleRate(2)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <span className="text-sm font-semibold">Vanskelig</span>
                <span className="text-xs text-orange-400">3 dager</span>
              </button>
              <button
                onClick={() => handleRate(3)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm font-semibold">Bra</span>
                <span className="text-xs text-blue-400">God</span>
              </button>
              <button
                onClick={() => handleRate(4)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-green-200 text-green-600 hover:bg-green-50 transition-colors"
              >
                <span className="text-sm font-semibold">Lett</span>
                <span className="text-xs text-green-400">Enkel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
