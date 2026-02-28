'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import type { UserSettings } from '@/lib/types';

interface Props {
  userId: string;
  email?: string;
  settings: UserSettings;
}

export default function SettingsClient({ userId, email, settings: initial }: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [dailyGoal, setDailyGoal] = useState(initial.daily_goal);
  const [newCardsPerDay, setNewCardsPerDay] = useState(initial.new_cards_per_day);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveSettings() {
    setSaving(true);
    setSaved(false);
    await supabase.from('user_settings').upsert({
      user_id: userId,
      daily_goal: dailyGoal,
      new_cards_per_day: newCardsPerDay,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleExport(format: 'csv' | 'json') {
    const res = await fetch(`/api/export?format=${format}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-export.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus('Importing...');
    const text = await file.text();
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImportStatus(`Imported ${data.imported} cards successfully!`);
    } catch (err: any) {
      setImportStatus(`Error: ${err.message}`);
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    // Delete all user data
    await supabase.from('review_logs').delete().eq('user_id', userId);
    await supabase.from('reviews').delete().eq('user_id', userId);
    await supabase.from('cards').delete().eq('user_id', userId);
    await supabase.from('decks').delete().eq('user_id', userId);
    await supabase.from('ai_usage').delete().eq('user_id', userId);
    await supabase.from('ai_generation_jobs').delete().eq('user_id', userId);
    await supabase.from('user_settings').delete().eq('user_id', userId);

    // Sign out
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={email} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        </div>

        {/* Study settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Study settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Daily review goal</label>
              <Input
                type="number"
                min={1}
                max={500}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value) || 30)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">New cards per day</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newCardsPerDay}
                onChange={(e) => setNewCardsPerDay(parseInt(e.target.value) || 20)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button onClick={handleSaveSettings} disabled={saving} size="sm">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            {saved && <span className="text-xs text-emerald-600 font-medium">Saved!</span>}
          </div>
        </div>

        {/* Import / Export */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Import & Export</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
              <Download className="w-4 h-4" /> Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> Import CSV
            </Button>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </div>
          {importStatus && (
            <p className={`text-xs ${importStatus.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{importStatus}</p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            CSV format: front, back, type (optional), cloze_text (optional), tags (optional, comma-separated)
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-red-600 mb-2">Danger zone</h2>
          <p className="text-xs text-slate-500 mb-4">
            Delete your account and all associated data. This action is permanent and cannot be undone.
          </p>
          {!showDelete ? (
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDelete(true)}>
              <Trash2 className="w-4 h-4" /> Delete all my data
            </Button>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-xs text-red-700 flex-1">Are you sure? All decks, cards, and review history will be permanently deleted.</p>
              <Button size="sm" variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Confirm delete'}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
