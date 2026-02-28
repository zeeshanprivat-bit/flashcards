'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Brain, Clock, Tag, Hash, Eye, Link2 } from 'lucide-react';
import Link from 'next/link';
import { formatDueDate, isDueToday } from '@/lib/sm2';

interface Mnemonic {
  id: string;
  title: string;
  mnemonic_text: string;
  explanation: string | null;
  topic: string;
  subject: string;
  tags: string[];
  image_url: string | null;
  ease_factor: number;
  interval: number;
  repetitions: number;
  lapses: number;
  due_date: string;
  review_count: number;
  last_reviewed_at: string | null;
  created_at: string;
}

interface LinkedCard {
  id: string;
  front: string;
  back: string;
  type: string;
}

export default function MnemonicDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [mnemonic, setMnemonic] = useState<Mnemonic | null>(null);
  const [linkedCards, setLinkedCards] = useState<LinkedCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/mnemonics/${id}`)
      .then(res => res.json())
      .then(data => {
        setMnemonic(data.mnemonic);
        setLinkedCards(data.linked_cards || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Er du sikker på at du vil slette denne huskeregelen?')) return;
    await fetch(`/api/mnemonics/${id}`, { method: 'DELETE' });
    router.push('/mnemonics');
  }

  async function handleReview(rating: 1 | 2 | 3 | 4) {
    const res = await fetch(`/api/mnemonics/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    if (res.ok) {
      const data = await res.json();
      setMnemonic(data.mnemonic);
    }
  }

  if (loading) return <div className="text-center text-slate-400 py-16">Laster...</div>;
  if (!mnemonic) return <div className="text-center text-slate-400 py-16">Ikke funnet</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mnemonics">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{mnemonic.title}</h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span className="bg-slate-100 px-2 py-0.5 rounded capitalize">{mnemonic.subject}</span>
            <span>{mnemonic.topic}</span>
          </div>
        </div>
        <Link href={`/mnemonics/${id}/edit`}>
          <Button size="sm" variant="outline"><Edit className="w-4 h-4" /></Button>
        </Link>
        <Button size="sm" variant="outline" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        {/* Mnemonic text */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-violet-700 text-sm font-medium mb-2">
            <Brain className="w-4 h-4" />
            Huskeregel
          </div>
          <p className="text-lg text-violet-900 font-medium whitespace-pre-wrap">{mnemonic.mnemonic_text}</p>
        </div>

        {/* Explanation */}
        {mnemonic.explanation && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-sm font-medium text-slate-700 mb-2">Forklaring</div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{mnemonic.explanation}</p>
          </div>
        )}

        {/* Image */}
        {mnemonic.image_url && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <img src={mnemonic.image_url} alt={mnemonic.title} className="rounded-lg max-h-80 mx-auto" />
          </div>
        )}

        {/* Tags */}
        {mnemonic.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mnemonic.tags.map(t => (
              <span key={t} className="bg-violet-50 text-violet-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" />{t}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500">Repetert</div>
            <div className="text-lg font-bold text-slate-900">{mnemonic.review_count}x</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500">Intervall</div>
            <div className="text-lg font-bold text-slate-900">{mnemonic.interval}d</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500">Ease</div>
            <div className="text-lg font-bold text-slate-900">{mnemonic.ease_factor.toFixed(1)}</div>
          </div>
          <div className={`rounded-lg p-3 text-center ${isDueToday(mnemonic.due_date) ? 'bg-violet-50' : 'bg-slate-50'}`}>
            <div className="text-xs text-slate-500">Neste</div>
            <div className={`text-lg font-bold ${isDueToday(mnemonic.due_date) ? 'text-violet-700' : 'text-slate-900'}`}>
              {formatDueDate(mnemonic.due_date)}
            </div>
          </div>
        </div>

        {/* Quick review */}
        {isDueToday(mnemonic.due_date) && (
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <p className="text-sm text-violet-700 font-medium mb-3">Hvordan husket du denne?</p>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleReview(1)} className="text-red-600 border-red-200 hover:bg-red-50">
                Igjen
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleReview(2)} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                Vanskelig
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleReview(3)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                Bra
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleReview(4)} className="text-green-600 border-green-200 hover:bg-green-50">
                Lett
              </Button>
            </div>
          </div>
        )}

        {/* Linked cards */}
        {linkedCards.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Link2 className="w-4 h-4" />
              Tilknyttede kort ({linkedCards.length})
            </div>
            <div className="space-y-2">
              {linkedCards.map(card => (
                <div key={card.id} className="border border-slate-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-slate-800">{card.front}</p>
                  <p className="text-slate-500 mt-1 text-xs">{card.back}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
