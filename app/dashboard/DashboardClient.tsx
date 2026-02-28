'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Brain, BookOpen, Clock, CheckCircle2, Flame } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DeckCard from '@/components/DeckCard';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { Deck } from '@/lib/types';

interface Props {
  decks: Deck[];
  email?: string;
}

export default function DashboardClient({ decks: initialDecks, email }: Props) {
  const [decks, setDecks] = useState<Deck[]>(initialDecks);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete(id: string) {
    if (!confirm('Slette denne kortstokken og alle kort? Dette kan ikke angres.')) return;
    await supabase.from('decks').delete().eq('id', id);
    setDecks((prev) => prev.filter((d) => d.id !== id));
  }

  const totalDue = decks.reduce((sum, d) => sum + (d.due_count ?? 0), 0);
  const totalCards = decks.reduce((sum, d) => sum + (d.card_count ?? 0), 0);
  const decksWithDue = decks.filter((d) => (d.due_count ?? 0) > 0);
  const topDueDeck = decksWithDue.sort((a, b) => (b.due_count ?? 0) - (a.due_count ?? 0))[0];
  const allCaughtUp = decks.length > 0 && totalDue === 0 && totalCards > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={email} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Dine kortstokker</h1>
          <Link href="/decks/new">
            <Button>
              <Plus className="w-4 h-4" />
              Ny kortstokk
            </Button>
          </Link>
        </div>

        {/* Overview banner — only show if there are decks */}
        {decks.length > 0 && (
          <div className="mb-8">
            {allCaughtUp ? (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800 text-sm">Alt oppdatert!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Ingen kort forfaller nå. Kom tilbake senere eller legg til nye kort.</p>
                </div>
              </div>
            ) : totalDue > 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-900 leading-none">{totalDue}</p>
                        <p className="text-xs text-slate-500 mt-0.5">kort forfaller</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-900 leading-none">{decksWithDue.length}</p>
                        <p className="text-xs text-slate-500 mt-0.5">kortstokk{decksWithDue.length !== 1 ? 'er' : ''} å repetere</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-900 leading-none">{totalCards}</p>
                        <p className="text-xs text-slate-500 mt-0.5">totalt kort</p>
                      </div>
                    </div>
                  </div>
                  {topDueDeck && (
                    <Link href={`/study/${topDueDeck.id}`}>
                      <Button size="sm">
                        <Clock className="w-4 h-4" />
                        Start repetisjon · {topDueDeck.title}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-violet-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Ingen kortstokker ennå</h2>
            <p className="text-slate-500 mb-6 max-w-sm">
              Lag din første kortstokk ved å lime inn tekst og la AI generere flashcards for deg.
            </p>
            <Link href="/decks/new">
              <Button size="lg">
                <Plus className="w-5 h-5" />
                Lag første kortstokk
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
