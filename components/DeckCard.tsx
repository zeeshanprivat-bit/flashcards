'use client';

import Link from 'next/link';
import { BookOpen, Clock, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Deck } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';

interface DeckCardProps {
  deck: Deck;
  onDelete: (id: string) => void;
}

export default function DeckCard({ deck, onDelete }: DeckCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/decks/${deck.id}`} className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-base truncate group-hover:text-violet-700 transition-colors">
            {deck.title}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">{deck.card_count ?? 0} kort</p>
        </Link>
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-10 min-w-[140px] overflow-hidden">
              <button
                onClick={() => { onDelete(deck.id); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Slett kortstokk
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(deck.due_count ?? 0) > 0 && (
          <Badge variant="warning">{deck.due_count} forfaller</Badge>
        )}
        {(deck.due_count ?? 0) === 0 && (deck.card_count ?? 0) > 0 && (
          <Badge variant="success">Oppdatert</Badge>
        )}
        {(deck.card_count ?? 0) === 0 && (
          <Badge variant="secondary">Tom</Badge>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <Link href={`/study/${deck.id}`} className="flex-1">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            disabled={(deck.due_count ?? 0) === 0}
          >
            <Clock className="w-4 h-4" />
            Studer ({deck.due_count ?? 0})
          </Button>
        </Link>
        <Link href={`/decks/${deck.id}`}>
          <Button variant="outline" size="sm">
            <BookOpen className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
