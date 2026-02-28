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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar email={email} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Velkommen tilbake!</h1>
          <p className="text-muted-foreground">Klar til å fortsette læringsreisen din?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">{decks.length}</span>
            </div>
            <h3 className="font-semibold text-foreground">Kortstokker</h3>
            <p className="text-sm text-muted-foreground">Totalt antall</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <span className="text-2xl font-bold text-foreground">{totalCards}</span>
            </div>
            <h3 className="font-semibold text-foreground">Totalt kort</h3>
            <p className="text-sm text-muted-foreground">I alle kortstokker</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <span className="text-2xl font-bold text-foreground">{totalDue}</span>
            </div>
            <h3 className="font-semibold text-foreground">Klar for repetisjon</h3>
            <p className="text-sm text-muted-foreground">Kort som forfaller i dag</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-error" />
              </div>
              <span className="text-2xl font-bold text-foreground">{decksWithDue.length}</span>
            </div>
            <h3 className="font-semibold text-foreground">Aktive kortstokker</h3>
            <p className="text-sm text-muted-foreground">Med forfallende kort</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/decks/new" className="flex-1">
            <Button className="w-full gap-2 h-12 text-base">
              <Plus className="w-5 h-5" />
              Opprett ny kortstokk
            </Button>
          </Link>
          <Link href="/study" className="flex-1">
            <Button variant="outline" className="w-full gap-2 h-12 text-base border-2">
              <Brain className="w-5 h-5" />
              Start økt
            </Button>
          </Link>
        </div>

        {/* Priority Section */}
        {totalDue > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Prioriterte kortstokker</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decksWithDue.slice(0, 3).map((deck) => (
                <DeckCard key={deck.id} deck={deck} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {/* All Decks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Alle kortstokker</h2>
            {decks.length > 6 && (
              <p className="text-sm text-muted-foreground">Viser {decks.length} kortstokker</p>
            )}
          </div>

          {/* Overview banner — only show if there are decks */}
          {decks.length > 0 && (
            <div className="mb-8">
              {allCaughtUp ? (
                <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  <div>
                    <p className="font-semibold text-success text-sm">Alt oppdatert!</p>
                    <p className="text-xs text-success/80 mt-0.5">Ingen kort forfaller nå. Kom tilbake senere eller legg til nye kort.</p>
                  </div>
                </div>
              ) : totalDue > 0 ? (
                <div className="card p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Flame className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground leading-none">{totalDue}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">kort forfaller</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground leading-none">{decksWithDue.length}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">kortstokk{decksWithDue.length !== 1 ? 'er' : ''} å repetere</p>
                        </div>
                      </div>
                    </div>
                    <Link href="/study">
                      <Button className="gap-2">
                        <Brain className="w-4 h-4" />
                        Start økt
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Empty state */}
          {decks.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Ingen kortstokker ennå</h3>
              <p className="text-muted-foreground mb-6">Opprett din første kortstokk for å begynne å lære</p>
              <Link href="/decks/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Opprett kortstokk
                </Button>
              </Link>
            </div>
          )}

          {/* Deck grid */}
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
