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

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Velkommen tilbake!</h1>
          <p className="text-gray-600 mt-1">Klar til å fortsette læringsreisen din?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{decks.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Kortstokker</h3>
            <p className="text-xs text-gray-500">Totalt antall</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalCards}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Totalt kort</h3>
            <p className="text-xs text-gray-500">I alle kortstokker</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalDue}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Klar for repetisjon</h3>
            <p className="text-xs text-gray-500">Kort som forfaller i dag</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{decksWithDue.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Aktive kortstokker</h3>
            <p className="text-xs text-gray-500">Med forfallende kort</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Opprett ny kortstokk</h3>
                <p className="text-blue-100 text-sm">Start med AI-genererte flashcards</p>
              </div>
              <Plus className="w-8 h-8 text-blue-200" />
            </div>
            <Link href="/decks/new">
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-medium">
                Opprett kortstokk
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Start økt</h3>
                <p className="text-purple-100 text-sm">Repetisjon med mellomrom</p>
              </div>
              <Brain className="w-8 h-8 text-purple-200" />
            </div>
            <Link href="/study">
              <Button className="w-full bg-white text-purple-600 hover:bg-purple-50 font-medium">
                Start økt
              </Button>
            </Link>
          </div>
        </div>

        {/* Priority Alert */}
        {totalDue > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{totalDue} kort forfaller</h3>
                  <p className="text-sm text-gray-600">{decksWithDue.length} kortstokk{decksWithDue.length !== 1 ? 'er' : ''} å repetere</p>
                </div>
              </div>
              <Link href="/study">
                <Button className="bg-amber-500 text-white hover:bg-amber-600">
                  Start økt
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Decks Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {decks.length === 0 ? 'Kom i gang' : 'Dine kortstokker'}
            </h2>
            {decks.length > 0 && (
              <span className="text-sm text-gray-500">{decks.length} kortstokker</span>
            )}
          </div>

          {/* Empty State */}
          {decks.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ingen kortstokker ennå</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Opprett din første kortstokk for å begynne å lære med AI-genererte flashcards</p>
              <Link href="/decks/new">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Opprett kortstokk
                </Button>
              </Link>
            </div>
          )}

          {/* Deck Grid */}
          {decks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <div key={deck.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{deck.title}</h3>
                      <p className="text-sm text-gray-500">{deck.card_count} kort</p>
                    </div>
                    {(deck.due_count ?? 0) > 0 && (
                      <div className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
                        {deck.due_count} forfaller
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/study/${deck.id}`} className="flex-1">
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        Studer
                      </Button>
                    </Link>
                    <Link href={`/decks/${deck.id}`}>
                      <Button variant="outline" size="sm" className="border-gray-300">
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
