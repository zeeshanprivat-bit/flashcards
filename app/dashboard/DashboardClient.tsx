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
    <div className="min-h-screen bg-white">
      <Navbar email={email} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Velkommen tilbake!</h1>
          <p className="text-gray-600">Klar til å fortsette læringsreisen din?</p>
        </div>

        {/* Quick Stats - Simple Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{decks.length}</div>
            <div className="text-xs text-gray-600">Kortstokker</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{totalCards}</div>
            <div className="text-xs text-gray-600">Totalt kort</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-2xl font-bold text-amber-700">{totalDue}</div>
            <div className="text-xs text-amber-600">Klar for repetisjon</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{decksWithDue.length}</div>
            <div className="text-xs text-purple-600">Aktive kortstokker</div>
          </div>
        </div>

        {/* Priority Action */}
        {totalDue > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalDue} kort forfaller</div>
                <div className="text-sm opacity-90">{decksWithDue.length} kortstokk{decksWithDue.length !== 1 ? 'er' : ''} å repetere</div>
              </div>
              <Link href="/study">
                <Button className="bg-white text-purple-600 hover:bg-gray-100">
                  Start økt
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <Link href="/decks/new" className="flex-1">
            <Button className="w-full bg-gray-900 text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Opprett ny kortstokk
            </Button>
          </Link>
          <Link href="/study" className="flex-1">
            <Button variant="outline" className="w-full border-2 border-gray-300 hover:border-gray-400">
              <Brain className="w-4 h-4 mr-2" />
              Start økt
            </Button>
          </Link>
        </div>

        {/* Priority Decks */}
        {totalDue > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Prioriterte kortstokker</h2>
            <div className="space-y-3">
              {decksWithDue.slice(0, 3).map((deck) => (
                <div key={deck.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900">{deck.title}</div>
                      <div className="text-sm text-gray-500">{deck.due_count} forfaller</div>
                    </div>
                  </div>
                  <Link href={`/study/${deck.id}`}>
                    <Button size="sm" className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                      Studer ({deck.due_count})
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Decks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Alle kortstokker</h2>
            {decks.length > 0 && (
              <span className="text-sm text-gray-500">{decks.length} kortstokker</span>
            )}
          </div>

          {/* Empty State */}
          {decks.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Ingen kortstokker ennå</h3>
              <p className="text-gray-600 mb-4">Opprett din første kortstokk for å begynne å lære</p>
              <Link href="/decks/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Opprett kortstokk
                </Button>
              </Link>
            </div>
          )}

          {/* Deck List */}
          {decks.length > 0 && (
            <div className="space-y-2">
              {decks.map((deck) => (
                <div key={deck.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      (deck.due_count ?? 0) > 0 ? 'bg-amber-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{deck.title}</div>
                      <div className="text-sm text-gray-500">{deck.card_count} kort</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(deck.due_count ?? 0) > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                        {deck.due_count} forfaller
                      </span>
                    )}
                    <Link href={`/decks/${deck.id}`}>
                      <Button variant="ghost" size="sm">
                        Åpne
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(deck.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Slett
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
