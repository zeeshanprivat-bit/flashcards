'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Plus, Trash2, Pencil, Check, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { formatDueDate, isDueToday, getInitialReviewData } from '@/lib/sm2';
import type { Deck, Card } from '@/lib/types';

interface Props {
  deck: Deck;
  cards: Card[];
  email?: string;
}

export default function DeckDetailClient({ deck, cards: initialCards, email }: Props) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [deckTitle, setDeckTitle] = useState(deck.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(deck.title);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiPreview, setAiPreview] = useState<{ type?: string; front: string; back: string; cloze_text?: string; tags?: string[] }[]>([]);
  const [aiSaving, setAiSaving] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Collect all unique tags
  const allTags = [...new Set(cards.flatMap((c) => c.tags ?? []))];
  const filteredCards = filterTag ? cards.filter((c) => (c.tags ?? []).includes(filterTag)) : cards;

  const dueCount = cards.filter((c) => {
    const r = Array.isArray(c.review) ? c.review[0] : c.review;
    return !r || isDueToday(r.due_date);
  }).length;

  function startEdit(card: Card) {
    setEditingId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  }

  async function saveEdit(card: Card) {
    const { error } = await supabase
      .from('cards')
      .update({ front: editFront.trim(), back: editBack.trim() })
      .eq('id', card.id);
    if (!error) {
      setCards((prev) => prev.map((c) => c.id === card.id ? { ...c, front: editFront.trim(), back: editBack.trim() } : c));
      setEditingId(null);
    }
  }

  async function saveDeckTitle() {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === deckTitle) { setEditingTitle(false); return; }
    const { error } = await supabase.from('decks').update({ title: trimmed }).eq('id', deck.id);
    if (!error) setDeckTitle(trimmed);
    setEditingTitle(false);
  }

  async function deleteCard(id: string) {
    if (!confirm('Delete this card?')) return;
    await supabase.from('cards').delete().eq('id', id);
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleAiGenerate() {
    if (!aiText.trim() || aiText.trim().length < 5) return;
    setAiGenerating(true);
    setAiError('');
    setAiPreview([]);
    try {
      const res = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText, deckTitle: deckTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setAiPreview(data.cards);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleAiSave() {
    if (aiPreview.length === 0) return;
    setAiSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAiSaving(false); return; }
    const valid = aiPreview.filter((c) => c.front.trim() || (c.cloze_text ?? '').trim());
    const { data: inserted } = await supabase
      .from('cards')
      .insert(valid.map((c) => ({
        deck_id: deck.id,
        user_id: user.id,
        type: c.type || 'basic',
        front: c.type === 'cloze' ? (c.cloze_text ?? '').replace(/\{\{c\d+::(.*?)\}\}/g, '$1') : c.front.trim(),
        back: c.back.trim(),
        cloze_text: c.type === 'cloze' ? c.cloze_text : null,
        tags: c.tags ?? [],
      })))
      .select();
    if (inserted) {
      const rv = getInitialReviewData();
      await supabase.from('reviews').insert(
        inserted.map((card) => ({
          card_id: card.id, user_id: user.id,
          ease_factor: rv.easeFactor, interval: rv.interval,
          repetitions: rv.repetitions, due_date: rv.dueDate, last_reviewed: null,
        }))
      );
      setCards((prev) => [...prev, ...inserted]);
    }
    setAiPreview([]);
    setAiText('');
    setAiOpen(false);
    setAiSaving(false);
  }

  async function addCard() {
    if (!newFront.trim() || !newBack.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: card } = await supabase
      .from('cards')
      .insert({ deck_id: deck.id, user_id: user.id, type: 'basic', front: newFront.trim(), back: newBack.trim(), tags: [] })
      .select()
      .single();

    if (card) {
      const rv = getInitialReviewData();
      await supabase.from('reviews').insert({
        card_id: card.id, user_id: user.id,
        ease_factor: rv.easeFactor, interval: rv.interval,
        repetitions: rv.repetitions, due_date: rv.dueDate, last_reviewed: null,
      });
      setCards((prev) => [...prev, card]);
      setNewFront('');
      setNewBack('');
      setAddingNew(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={email} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              {editingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveDeckTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                    className="text-lg font-bold h-9 w-64"
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveDeckTitle}>
                    <Check className="w-4 h-4 text-emerald-600" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingTitle(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group/title">
                  <h1 className="text-2xl font-bold text-slate-900">{deckTitle}</h1>
                  <button
                    onClick={() => { setTitleDraft(deckTitle); setEditingTitle(true); }}
                    className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
              <p className="text-sm text-slate-500 mt-0.5">{cards.length} kort · {dueCount} forfaller</p>
            </div>
          </div>
          <Link href={`/study/${deck.id}`}>
            <Button disabled={dueCount === 0}>
              <Clock className="w-4 h-4" />
              Studer ({dueCount})
            </Button>
          </Link>
        </div>

        {/* AI Generate panel */}
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => { setAiOpen((v) => !v); setAiPreview([]); setAiError(''); }}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Generer kort fra tekst
            </div>
            {aiOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {aiOpen && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
              {aiPreview.length === 0 ? (
                <>
                  <Textarea
                    placeholder="Lim inn forelesningsnotater, artikler eller annet innhold — AI lager flashcards fra det."
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className="min-h-[140px] leading-relaxed"
                    maxLength={8000}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{aiText.length}/8000</span>
                    <Button
                      onClick={handleAiGenerate}
                      disabled={aiGenerating || aiText.trim().length < 20}
                    >
                      <Sparkles className="w-4 h-4" />
                      {aiGenerating ? 'Genererer...' : 'Generer kort'}
                    </Button>
                  </div>
                  {aiError && <p className="text-sm text-red-500">{aiError}</p>}
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600">{aiPreview.length} kort generert — se gjennom og legg til i kortstokken</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {aiPreview.map((c, i) => (
                      <div key={i} className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3">
                        <div>
                          <span className="block text-xs font-medium text-violet-500 mb-1">Q</span>
                          <p className="text-xs text-slate-800 leading-relaxed">{c.front}</p>
                        </div>
                        <div>
                          <span className="block text-xs font-medium text-emerald-500 mb-1">A</span>
                          <p className="text-xs text-slate-600 leading-relaxed">{c.back}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setAiPreview([])}>
                      <X className="w-4 h-4" /> Generer på nytt
                    </Button>
                    <Button size="sm" onClick={handleAiSave} disabled={aiSaving}>
                      <Check className="w-4 h-4" />
                      {aiSaving ? 'Legger til...' : `Legg til ${aiPreview.length} kort`}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 mb-4">
            <span className="text-xs text-slate-400 mr-1">Filter:</span>
            <button
              onClick={() => setFilterTag(null)}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full border transition-all ${!filterTag ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-500 hover:border-violet-300'}`}
            >Alle</button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-2.5 py-0.5 text-xs font-medium rounded-full border transition-all ${filterTag === tag ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-500 hover:border-violet-300'}`}
              >{tag}</button>
            ))}
          </div>
        )}

        {/* Cards list */}
        <div className="space-y-3">
          {filteredCards.map((card) => {
            const review = Array.isArray(card.review) ? card.review[0] : card.review;
            const due = review ? formatDueDate(review.due_date) : 'Forfaller nå';
            const isEditing = editingId === card.id;

            return (
              <div key={card.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 group">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-violet-600 mb-1">Spørsmål</label>
                        <Textarea value={editFront} onChange={(e) => setEditFront(e.target.value)} className="min-h-[80px] text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-emerald-600 mb-1">Svar</label>
                        <Textarea value={editBack} onChange={(e) => setEditBack(e.target.value)} className="min-h-[80px] text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" /> Avbryt
                      </Button>
                      <Button size="sm" onClick={() => saveEdit(card)}>
                        <Check className="w-4 h-4" /> Lagre
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="block text-xs font-medium text-violet-500 mb-1">Q</span>
                          <p className="text-sm text-slate-800 leading-relaxed">{card.front}</p>
                        </div>
                        <div>
                          <span className="block text-xs font-medium text-emerald-500 mb-1">A</span>
                          <p className="text-sm text-slate-600 leading-relaxed">{card.back}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(card)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteCard(card.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center flex-wrap gap-1.5">
                      <Badge variant={due === 'Forfaller nå' ? 'warning' : 'secondary'} className="text-xs">
                        {due}
                      </Badge>
                      {card.type === 'cloze' && (
                        <Badge variant="secondary" className="text-xs">Cloze</Badge>
                      )}
                      {(card.tags ?? []).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500">{tag}</span>
                      ))}
                      {review && (
                        <span className="ml-auto text-xs text-slate-400">
                          {review.interval}d · EF {review.ease_factor?.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add new card */}
          {addingNew ? (
            <div className="bg-white rounded-2xl border border-violet-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Nytt kort</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-violet-600 mb-1">Spørsmål</label>
                  <Textarea value={newFront} onChange={(e) => setNewFront(e.target.value)} placeholder="Skriv spørsmål..." className="min-h-[80px] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-600 mb-1">Svar</label>
                  <Textarea value={newBack} onChange={(e) => setNewBack(e.target.value)} placeholder="Skriv svar..." className="min-h-[80px] text-sm" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setAddingNew(false); setNewFront(''); setNewBack(''); }}>
                  <X className="w-4 h-4" /> Avbryt
                </Button>
                <Button size="sm" onClick={addCard} disabled={!newFront.trim() || !newBack.trim()}>
                  <Check className="w-4 h-4" /> Legg til kort
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-sm text-slate-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              Legg til kort
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
