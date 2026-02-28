'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, ImagePlus, X, Loader2 } from 'lucide-react';
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
  const [selectedCards, setSelectedCards] = useState<string[]>(linkedCardIds);
  const [cardSearch, setCardSearch] = useState('');

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const compressed = await compressImage(file, 800, 0.7);
      const fileName = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.webp`;

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

  function removeImage() {
    setImageUrl(null);
    setImagePreview(null);
  }

  async function handleSave() {
    if (!title.trim() || !mnemonicText.trim() || !topic.trim()) {
      setError('Tittel, huskeregeltekst og emne er påkrevd');
      return;
    }

    setSaving(true);
    setError('');

    const body = {
      title,
      mnemonic_text: mnemonicText,
      explanation,
      topic,
      subject,
      tags,
      image_url: imageUrl,
      linked_card_ids: selectedCards,
    };

    try {
      const url = mode === 'edit' ? `/api/mnemonics/${initial?.id}` : '/api/mnemonics';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

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

  const filteredCards = userCards.filter(c =>
    !cardSearch || c.front.toLowerCase().includes(cardSearch.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mnemonics">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">
          {mode === 'create' ? 'Ny huskeregel' : 'Rediger huskeregel'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tittel *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="F.eks. 'Kranialnervene'"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Mnemonic text */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Huskeregeltekst *</label>
          <textarea
            value={mnemonicText}
            onChange={e => setMnemonicText(e.target.value)}
            placeholder="F.eks. 'Oh, Oh, Oh, To Touch And Feel Very Green Vegetables, AH!'"
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
          />
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Forklaring</label>
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            placeholder="Hva betyr hver bokstav/del?"
            rows={4}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
          />
        </div>

        {/* Subject + Topic */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fag *</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {SUBJECTS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Emne *</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="F.eks. 'Kranialnerver'"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Emneord</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {tags.map(t => (
              <span key={t} className="bg-violet-50 text-violet-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                {t}
                <button onClick={() => removeTag(t)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="Legg til emneord..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <Button variant="outline" size="sm" type="button" onClick={addTag}>Legg til</Button>
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bilde</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg border border-slate-200" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 border-2 border-dashed border-slate-200 rounded-lg px-4 py-8 w-full text-sm text-slate-500 hover:border-violet-300 hover:bg-violet-50 transition-colors"
            >
              {uploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Komprimerer og laster opp...</>
              ) : (
                <><ImagePlus className="w-5 h-5" /> Klikk for å laste opp bilde (komprimeres automatisk)</>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Link to flashcards */}
        {userCards.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Knytt til kort ({selectedCards.length} valgt)
            </label>
            <input
              value={cardSearch}
              onChange={e => setCardSearch(e.target.value)}
              placeholder="Søk i kort..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {filteredCards.slice(0, 20).map(card => (
                <label key={card.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">
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
                  {card.deck_title && (
                    <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">{card.deck_title}</span>
                  )}
                </label>
              ))}
              {filteredCards.length === 0 && (
                <p className="text-xs text-slate-400 px-3 py-2">Ingen kort funnet</p>
              )}
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mode === 'create' ? 'Opprett huskeregel' : 'Lagre endringer'}
          </Button>
          <Link href="/mnemonics">
            <Button variant="outline">Avbryt</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
