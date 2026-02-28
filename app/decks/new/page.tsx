'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Plus, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { getInitialReviewData } from '@/lib/sm2';

interface CardDraft {
  type: 'basic' | 'cloze';
  front: string;
  back: string;
  cloze_text?: string;
  tags: string[];
  tagInput?: string;
}

export default function NewDeckPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [cards, setCards] = useState<CardDraft[]>([{ type: 'basic', front: '', back: '', tags: [], tagInput: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiStyle, setAiStyle] = useState('balanced');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const validCards = cards.filter((c) => {
    if (c.type === 'cloze') return (c.cloze_text ?? '').trim().length > 0;
    return c.front.trim() && c.back.trim();
  });

  function updateCard(index: number, field: string, value: any) {
    setCards((prev) => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  }

  function addTag(index: number, tag: string) {
    const t = tag.trim().toLowerCase();
    if (!t) return;
    setCards((prev) => prev.map((c, i) => i === index ? { ...c, tags: [...new Set([...c.tags, t])], tagInput: '' } : c));
  }

  function removeTag(index: number, tag: string) {
    setCards((prev) => prev.map((c, i) => i === index ? { ...c, tags: c.tags.filter((tt) => tt !== tag) } : c));
  }

  function removeCard(index: number) {
    setCards((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index));
  }

  function addCard() {
    setCards((prev) => [...prev, { type: 'basic', front: '', back: '', tags: [], tagInput: '' }]);
  }

  async function handleAiGenerate() {
    if (aiText.trim().length < 20) return;
    setAiGenerating(true);
    setAiError('');
    try {
      const res = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText, deckTitle: title, style: aiStyle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setCards((prev) => {
        const nonEmpty = prev.filter((c) => c.front.trim() || c.back.trim() || (c.cloze_text ?? '').trim());
        const newCards = data.cards.map((c: any) => ({
          type: c.type || 'basic',
          front: c.front || '',
          back: c.back || '',
          cloze_text: c.cloze_text || '',
          tags: c.tags || [],
          tagInput: '',
        }));
        return [...nonEmpty, ...newCards];
      });
      setAiText('');
      setAiOpen(false);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleSave() {
    if (!title.trim() || validCards.length === 0) return;
    setSaving(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: deck, error: deckErr } = await supabase
        .from('decks')
        .insert({ title: title.trim(), user_id: user.id })
        .select()
        .single();
      if (deckErr) throw deckErr;

      const { data: insertedCards, error: cardsErr } = await supabase
        .from('cards')
        .insert(validCards.map((c) => ({
          deck_id: deck.id,
          user_id: user.id,
          type: c.type,
          front: c.type === 'cloze' ? (c.cloze_text ?? '').replace(/\{\{c\d+::(.*?)\}\}/g, '$1') : c.front.trim(),
          back: c.back.trim(),
          cloze_text: c.type === 'cloze' ? c.cloze_text?.trim() : null,
          tags: c.tags,
        })))
        .select();
      if (cardsErr) throw cardsErr;

      const rv = getInitialReviewData();
      await supabase.from('reviews').insert(
        (insertedCards ?? []).map((card) => ({
          card_id: card.id,
          user_id: user.id,
          ease_factor: rv.easeFactor,
          interval: rv.interval,
          repetitions: rv.repetitions,
          due_date: rv.dueDate,
          last_reviewed: null,
        }))
      );

      router.push(`/decks/${deck.id}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create new deck</h1>
            <p className="text-sm text-slate-500 mt-0.5">Add cards manually, or use AI to generate them from text</p>
          </div>
        </div>

        {/* Deck title */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Deck title</label>
          <Input
            placeholder="e.g. Anatomy — Heart & Circulatory System"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        {/* Cards list */}
        <div className="space-y-3 mb-3">
          {cards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Card {i + 1}</span>
                  <div className="flex rounded-lg border border-slate-200 p-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => updateCard(i, 'type', 'basic')}
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-md transition-all ${card.type === 'basic' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >Basic</button>
                    <button
                      type="button"
                      onClick={() => updateCard(i, 'type', 'cloze')}
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-md transition-all ${card.type === 'cloze' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >Cloze</button>
                  </div>
                </div>
                <button
                  onClick={() => removeCard(i)}
                  disabled={cards.length === 1}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 rounded disabled:pointer-events-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {card.type === 'cloze' ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-violet-600 mb-1">
                      Cloze text <span className="font-normal text-slate-400">— wrap blanks in {'{{c1::answer}}'}</span>
                    </label>
                    <Textarea
                      placeholder="e.g. Ved hjertesvikt er {{c1::BNP}} ofte forhøyet."
                      value={card.cloze_text ?? ''}
                      onChange={(e) => updateCard(i, 'cloze_text', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-600 mb-1">Extra info (optional)</label>
                    <Textarea
                      placeholder="Additional explanation shown after reveal"
                      value={card.back}
                      onChange={(e) => updateCard(i, 'back', e.target.value)}
                      className="min-h-[50px] text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-violet-600 mb-1">Question</label>
                    <Textarea
                      placeholder="e.g. What is the mitochondria?"
                      value={card.front}
                      onChange={(e) => updateCard(i, 'front', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-600 mb-1">Answer</label>
                    <Textarea
                      placeholder="e.g. The powerhouse of the cell"
                      value={card.back}
                      onChange={(e) => updateCard(i, 'back', e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="mt-3">
                <div className="flex items-center flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600">
                      {tag}
                      <button onClick={() => removeTag(i, tag)} className="text-slate-400 hover:text-red-500">&times;</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={card.tagInput ?? ''}
                    onChange={(e) => updateCard(i, 'tagInput', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(i, card.tagInput ?? ''); }
                    }}
                    onBlur={() => addTag(i, card.tagInput ?? '')}
                    className="text-xs border-none outline-none bg-transparent w-24 py-0.5 text-slate-500 placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add card button */}
        <button
          onClick={addCard}
          className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-300 rounded-2xl text-sm text-slate-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all mb-4"
        >
          <Plus className="w-4 h-4" />
          Add card
        </button>

        {/* AI accordion */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <button
            onClick={() => { setAiOpen((v) => !v); setAiError(''); }}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Generate cards with AI
              <span className="text-xs font-normal text-slate-400">— paste text and AI extracts flashcards</span>
            </div>
            {aiOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {aiOpen && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
              <Textarea
                placeholder="Paste lecture notes, textbook excerpts, article text... AI will extract key Q&A pairs and add them to your card list."
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                className="min-h-[160px] leading-relaxed"
                maxLength={8000}
              />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Style</label>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { value: 'balanced', label: 'Balanced' },
                    { value: 'high-yield', label: 'High-yield' },
                    { value: 'exam-focus', label: 'Exam focus' },
                    { value: 'clinical-case', label: 'Clinical case' },
                  ] as const).map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setAiStyle(s.value)}
                      className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${aiStyle === s.value ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-500 hover:border-violet-300'}`}
                    >{s.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{aiText.length}/8000</span>
                <Button
                  onClick={handleAiGenerate}
                  disabled={aiGenerating || aiText.trim().length < 20}
                >
                  <Sparkles className="w-4 h-4" />
                  {aiGenerating ? 'Generating...' : 'Generate & add cards'}
                </Button>
              </div>
              {aiError && <p className="text-sm text-red-500">{aiError}</p>}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {/* Save */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {validCards.length} card{validCards.length !== 1 ? 's' : ''} ready
          </p>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim() || validCards.length === 0}
            size="lg"
          >
            <Check className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save deck'}
          </Button>
        </div>
      </main>
    </div>
  );
}
