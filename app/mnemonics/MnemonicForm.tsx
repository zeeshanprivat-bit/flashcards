'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ImagePlus, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/compress-image';

const SUBJECTS = [
  'general', 'anatomi', 'fysiologi', 'farmakologi', 'patologi',
  'kardiologi', 'nevrologi', 'gastroenterologi', 'endokrinologi',
  'infeksjonsmedisin', 'kirurgi', 'pediatri', 'psykiatri',
];

interface MnemonicFormProps {
  mode: 'create' | 'edit';
  initial?: {
    id?: string;
    title: string;
    mnemonic_text: string;
    explanation: string;
    topic: string;
    subject: string;
    tags: string[];
    image_url: string | null;
  };
  linkedCardIds?: string[];
  userCards?: { id: string; front: string; deck_title?: string }[];
}

export default function MnemonicForm({ mode, initial, linkedCardIds = [], userCards = [] }: MnemonicFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initial?.title || '');
  const [mnemonicText, setMnemonicText] = useState(initial?.mnemonic_text || '');
  const [explanation, setExplanation] = useState(initial?.explanation || '');
  const [topic, setTopic] = useState(initial?.topic || '');
  const [subject, setSubject] = useState(initial?.subject || 'general');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url || null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image_url || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showMore, setShowMore] = useState(mode === 'edit');
  const [selectedCards, setSelectedCards] = useState<string[]>(linkedCardIds);
  const [cardSearch, setCardSearch] = useState('');

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const compressed = await compressImage(file, 800, 0.7);
      const fileName = `${Date.now()}.webp`;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Ikke innlogget');
      const path = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('mnemonic-images')
        .upload(path, compressed, { contentType: 'image/webp' });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('mnemonic-images')
        .getPublicUrl(path);
      setImageUrl(publicUrl);
      setImagePreview(URL.createObjectURL(compressed));
    } catch (err: any) {
      setError('Bildeopplasting feilet: ' + (err.message || 'Ukjent feil'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!mnemonicText.trim()) {
      setError('Skriv inn huskeregelen');
      textRef.current?.focus();
      return;
    }

    setSaving(true);
    setError('');

    // Auto-generate title from first line if empty
    const autoTitle = title.trim() || mnemonicText.trim().split('\n')[0].slice(0, 60);

    const body = {
      title: autoTitle,
      mnemonic_text: mnemonicText,
      explanation: explanation || null,
      topic: topic || 'Generelt',
      subject: subject || 'general',
      tags,
      image_url: imageUrl,
      linked_card_ids: selectedCards,
    };

    try {
      const url = mode === 'edit' ? `/api/mnemonics/${initial?.id}` : '/api/mnemonics';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lagring feilet');
      }
      const data = await res.json();
      router.push(`/mnemonics/${data.mnemonic.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  }

  const filteredCards = userCards.filter(c =>
    !cardSearch || c.front.toLowerCase().includes(cardSearch.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/mnemonics">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-lg font-bold text-slate-900">
          {mode === 'create' ? 'Ny huskeregel' : 'Rediger huskeregel'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg mb-3">{error}</div>
      )}

      <div className="space-y-3" onKeyDown={handleKeyDown}>
        {/* Main: mnemonic text — the primary input */}
        <textarea
          ref={textRef}
          value={mnemonicText}
          onChange={e => setMnemonicText(e.target.value)}
          placeholder="Skriv huskeregelen din her..."
          rows={4}
          autoFocus
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
        />

        {/* Title — optional, auto-generated if empty */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tittel (valgfritt — lages automatisk)"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        {/* Explanation — optional */}
        <textarea
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          placeholder="Forklaring (valgfritt)"
          rows={2}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
        />

        {/* Image row */}
        <div className="flex items-center gap-2">
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="" className="h-16 rounded-lg border border-slate-200" />
              <button onClick={() => { setImageUrl(null); setImagePreview(null); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-2 hover:border-violet-300 hover:text-violet-600 transition-colors"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
              {uploading ? 'Laster opp...' : 'Legg til bilde'}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Save button */}
        <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Lagrer...' : 'Lagre huskeregel'}
          <span className="text-xs opacity-60 ml-2">⌘↵</span>
        </Button>

        {/* Expandable: more options */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-600 mx-auto"
        >
          {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showMore ? 'Skjul alternativer' : 'Flere alternativer (fag, emneord, kort-kobling)'}
        </button>

        {showMore && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* Subject + Topic */}
            <div className="grid grid-cols-2 gap-3">
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Emne"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Tags */}
            <div>
              <div className="flex gap-1.5 mb-1.5 flex-wrap">
                {tags.map(t => (
                  <span key={t} className="bg-violet-50 text-violet-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    {t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))}><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Legg til emneord (trykk Enter)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Link to flashcards */}
            {userCards.length > 0 && (
              <div>
                <input
                  value={cardSearch}
                  onChange={e => setCardSearch(e.target.value)}
                  placeholder="Søk og knytt til kort..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {filteredCards.slice(0, 15).map(card => (
                    <label key={card.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedCards([...selectedCards, card.id]);
                          else setSelectedCards(selectedCards.filter(id => id !== card.id));
                        }}
                        className="rounded"
                      />
                      <span className="truncate">{card.front}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
