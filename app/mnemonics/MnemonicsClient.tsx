'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter, Trash2, Edit, Eye, Brain, Clock, Tag, X } from 'lucide-react';
import Link from 'next/link';
import { formatDueDate, isDueToday } from '@/lib/sm2';

interface Mnemonic {
  id: string;
  title: string;
  mnemonic_text: string;
  explanation: string | null;
  topic: string;
  subject: string;
  tags: string[];
  image_url: string | null;
  ease_factor: number;
  interval: number;
  repetitions: number;
  lapses: number;
  due_date: string;
  review_count: number;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

const SUBJECTS = [
  'general', 'anatomi', 'fysiologi', 'farmakologi', 'patologi',
  'kardiologi', 'nevrologi', 'gastroenterologi', 'endokrinologi',
  'infeksjonsmedisin', 'kirurgi', 'pediatri', 'psykiatri',
];

export default function MnemonicsClient() {
  const [mnemonics, setMnemonics] = useState<Mnemonic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showDueOnly, setShowDueOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchMnemonics = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (subjectFilter) params.set('subject', subjectFilter);
    if (tagFilter) params.set('tag', tagFilter);
    if (showDueOnly) params.set('due', 'today');

    const res = await fetch(`/api/mnemonics?${params.toString()}`);
    const data = await res.json();
    setMnemonics(data.mnemonics || []);

    // Extract all unique tags
    const tags = new Set<string>();
    (data.mnemonics || []).forEach((m: Mnemonic) => m.tags?.forEach(t => tags.add(t)));
    setAllTags(Array.from(tags).sort());

    setLoading(false);
  }, [search, subjectFilter, tagFilter, showDueOnly]);

  useEffect(() => {
    fetchMnemonics();
  }, [fetchMnemonics]);

  async function handleDelete(id: string) {
    if (!confirm('Er du sikker på at du vil slette denne huskeregelen?')) return;
    await fetch(`/api/mnemonics/${id}`, { method: 'DELETE' });
    setMnemonics(prev => prev.filter(m => m.id !== id));
  }

  const dueCount = mnemonics.filter(m => isDueToday(m.due_date)).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Huskeregler</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mnemonics.length} huskeregler · {dueCount} forfaller i dag
          </p>
        </div>
        <div className="flex gap-2">
          {dueCount > 0 && (
            <Link href="/mnemonics/review">
              <Button variant="outline" size="sm">
                <Brain className="w-4 h-4" />
                Repeter ({dueCount})
              </Button>
            </Link>
          )}
          <Link href="/mnemonics/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Ny huskeregel
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Søk i huskeregler..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="">Alle fag</option>
              {SUBJECTS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="">Alle emneord</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showDueOnly}
                onChange={e => setShowDueOnly(e.target.checked)}
                className="rounded"
              />
              Kun forfalt
            </label>
            {(subjectFilter || tagFilter || showDueOnly) && (
              <button
                onClick={() => { setSubjectFilter(''); setTagFilter(''); setShowDueOnly(false); }}
                className="text-xs text-violet-600 hover:underline ml-auto"
              >
                Nullstill filtre
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mnemonic list */}
      {loading ? (
        <div className="text-center text-slate-400 py-16">Laster...</div>
      ) : mnemonics.length === 0 ? (
        <div className="text-center py-16">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Ingen huskeregler funnet</p>
          <Link href="/mnemonics/new">
            <Button size="sm" className="mt-4">
              <Plus className="w-4 h-4" />
              Opprett din første huskeregel
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {mnemonics.map(m => (
            <div
              key={m.id}
              className="border border-slate-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-sm transition-all bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/mnemonics/${m.id}`} className="font-semibold text-slate-900 hover:text-violet-700 truncate">
                      {m.title}
                    </Link>
                    {isDueToday(m.due_date) && (
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Forfaller
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-2">{m.mnemonic_text}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="bg-slate-100 px-2 py-0.5 rounded capitalize">{m.subject}</span>
                    <span>{m.topic}</span>
                    {m.tags?.map(t => (
                      <span key={t} className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded">
                        <Tag className="w-3 h-3 inline mr-0.5" />{t}
                      </span>
                    ))}
                    <span className="ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDueDate(m.due_date)}
                    </span>
                    <span>·</span>
                    <span>{m.review_count}x repetert</span>
                  </div>
                </div>
                {m.image_url && (
                  <img src={m.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                )}
              </div>
              <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100">
                <Link href={`/mnemonics/${m.id}`}>
                  <Button size="sm" variant="ghost"><Eye className="w-3.5 h-3.5" /></Button>
                </Link>
                <Link href={`/mnemonics/${m.id}/edit`}>
                  <Button size="sm" variant="ghost"><Edit className="w-3.5 h-3.5" /></Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
