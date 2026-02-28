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
    <div className="min-h-screen bg-gray-50">
      <Navbar email={email} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Velkommen tilbake!</h1>
          <p className="text-gray-600">Klar til å fortsette læringsreisen din?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{decks.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Kortstokker</h3>
            <p className="text-sm text-gray-500">Totalt antall</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{totalCards}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Totalt kort</h3>
            <p className="text-sm text-gray-500">I alle kortstokker</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{totalDue}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Klar for repetisjon</h3>
            <p className="text-sm text-gray-500">Kort som forfaller i dag</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{decksWithDue.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Aktive kortstokker</h3>
            <p className="text-sm text-gray-500">Med forfallende kort</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/decks/new" className="flex-1">
            <Button className="w-full gap-2 h-12 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-5 h-5" />
              Opprett ny kortstokk
            </Button>
          </Link>
          <Link href="/study" className="flex-1">
            <Button variant="outline" className="w-full gap-2 h-12 text-base border-2 border-gray-300 hover:border-gray-400">
              <Brain className="w-5 h-5" />
              Start økt
            </Button>
          </Link>
        </div>

        {/* Status Alert */}
        {decks.length > 0 && (
          <div className="mb-8">
            {allCaughtUp ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-900">Alt oppdatert!</p>
                    <p className="text-sm text-emerald-700">Ingen kort forfaller nå. Kom tilbake senere eller legg til nye kort.</p>
                  </div>
                </div>
              </div>
            ) : totalDue > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-700">{totalDue}</p>
                      <p className="text-sm text-purple-600">kort forfaller</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-700">{decksWithDue.length}</p>
                      <p className="text-sm text-blue-600">kortstokker</p>
                    </div>
                  </div>
                  <Link href="/study">
                    <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Brain className="w-4 h-4" />
                      Start økt
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decks Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {decks.length === 0 ? 'Kom i gang' : 'Dine kortstokker'}
            </h2>
            {decks.length > 6 && (
              <p className="text-sm text-gray-500">{decks.length} kortstokker</p>
            )}
          </div>

          {/* Empty State */}
          {decks.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ingen kortstokker ennå</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Opprett din første kortstokk for å begynne å lære med AI-genererte flashcards</p>
              <Link href="/decks/new">
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="w-4 h-4" />
                  Opprett kortstokk
                </Button>
              </Link>
            </div>
          )}

          {/* Deck Grid */}
          {decks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <DeckCard key={deck.id} deck={deck} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
