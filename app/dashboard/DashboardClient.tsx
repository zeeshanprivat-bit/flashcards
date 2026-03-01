'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Trash2, CheckCircle2, Clock, AlertTriangle, Circle,
  ChevronRight, BookOpen, RefreshCw, LogOut, Settings
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { STATUS_META, getDueLabel, getLastRevisedLabel } from '@/lib/revision';
import type { TopicWithStatus, TopicStatus } from '@/lib/types';

// ── Tiny sub-components ────────────────────────────────────────────────────

function ProgressRing({ pct, color, size = 40 }: { pct: number; color: string; size?: number }) {
  const sw = 2.5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(Math.max(pct, 0), 1));
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--rn-linen)" strokeWidth={sw} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

function StatusIcon({ status }: { status: TopicStatus }) {
  const color = STATUS_META[status].color;
  const props = { size: 14, style: { color } };
  switch (status) {
    case 'overdue': return <AlertTriangle {...props} />;
    case 'due-soon': return <Clock {...props} />;
    case 'on-track': return <CheckCircle2 {...props} />;
    case 'fresh': return <CheckCircle2 {...props} />;
    default: return <Circle {...props} />;
  }
}

// ── Topic card ─────────────────────────────────────────────────────────────

function TopicCard({
  topic,
  onRevise,
  onDelete,
  revising,
}: {
  topic: TopicWithStatus;
  onRevise: (id: string) => void;
  onDelete: (id: string) => void;
  revising: boolean;
}) {
  const meta = STATUS_META[topic.status];

  return (
    <div
      style={{
        background: 'white',
        border: '1.5px solid var(--rn-linen)',
        borderRadius: 16,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: 'var(--rn-shadow-xs)',
        transition: 'box-shadow 0.18s ease, border-color 0.18s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--rn-shadow-md)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--rn-linen-dark)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--rn-shadow-xs)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--rn-linen)';
      }}
    >
      {/* Progress ring */}
      <ProgressRing pct={topic.progressPct} color={meta.color} size={40} />

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={`/topics/${topic.id}`}
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: 'var(--rn-charcoal)',
            textDecoration: 'none',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {topic.name}
        </Link>
        <span style={{ fontSize: 12, color: 'var(--rn-charcoal-muted)', fontFamily: 'var(--font-inter)' }}>
          {getLastRevisedLabel(topic)}
        </span>
      </div>

      {/* Status pill */}
      <span
        className="rn-pill"
        style={{ background: meta.bg, color: meta.color, flexShrink: 0, fontSize: 12 }}
      >
        <StatusIcon status={topic.status} />
        {getDueLabel(topic)}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => onRevise(topic.id)}
          disabled={revising}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 9,
            border: 'none',
            background: revising ? 'var(--rn-linen)' : 'var(--rn-terracotta)',
            color: revising ? 'var(--rn-charcoal-muted)' : 'white',
            fontSize: 13,
            fontWeight: 500,
            cursor: revising ? 'default' : 'pointer',
            fontFamily: 'var(--font-inter)',
            transition: 'all 0.18s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {revising
            ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
            : <CheckCircle2 size={13} />}
          {revising ? 'Logger…' : 'Logg revisjon'}
        </button>

        <Link
          href={`/topics/${topic.id}`}
          title="View topic"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            border: '1.5px solid var(--rn-linen)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--rn-charcoal-light)',
            transition: 'all 0.15s ease',
            flexShrink: 0,
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--rn-cream-dark)';
            (e.currentTarget as HTMLElement).style.color = 'var(--rn-charcoal)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--rn-charcoal-light)';
          }}
        >
          <ChevronRight size={15} />
        </Link>

        <button
          onClick={() => onDelete(topic.id)}
          title="Delete topic"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            border: '1.5px solid var(--rn-linen)',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--rn-charcoal-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--rn-overdue-bg)';
            (e.currentTarget as HTMLElement).style.color = 'var(--rn-overdue)';
            (e.currentTarget as HTMLElement).style.borderColor = '#D8B8B8';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--rn-charcoal-muted)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--rn-linen)';
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Group config ───────────────────────────────────────────────────────────

const GROUP_ORDER: TopicStatus[] = ['overdue', 'due-soon', 'on-track', 'fresh', 'new'];
const GROUP_LABELS: Record<TopicStatus, string> = {
  overdue: 'Forfalt',
  'due-soon': 'Forfaller snart',
  'on-track': 'På sporet',
  fresh: 'Fersk',
  new: 'Ikke startet',
};

// ── Main dashboard ─────────────────────────────────────────────────────────

export default function DashboardClient({
  topics: initial,
  email,
}: {
  topics: TopicWithStatus[];
  email: string;
}) {
  const [topics, setTopics] = useState<TopicWithStatus[]>(initial);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [revisiting, setRevisiting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // ── Stats ──────────────────────────────────────────────────────────────
  const overdue = topics.filter(t => t.status === 'overdue').length;
  const dueSoon = topics.filter(t => t.status === 'due-soon').length;
  const onTrack = topics.filter(t => t.status === 'on-track' || t.status === 'fresh').length;
  const urgent = overdue + dueSoon;

  // ── Add topic ──────────────────────────────────────────────────────────
  const handleAdd = useCallback(async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return;
      const topic = await res.json();
      const withStatus: TopicWithStatus = {
        ...topic,
        status: 'new' as TopicStatus,
        daysAgo: null,
        dueIn: null,
        daysLate: null,
        progressPct: 0,
      };
      setTopics(prev => [...prev, withStatus]);
      setNewName('');
      inputRef.current?.focus();
    } finally {
      setAdding(false);
    }
  }, [newName]);

  // ── Log revision ───────────────────────────────────────────────────────
  const handleRevise = useCallback(async (id: string) => {
    setRevisiting(id);
    try {
      const res = await fetch(`/api/topics/${id}/revise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!res.ok) return;
      const updated = await res.json();
      setTopics(prev => prev.map(t => {
        if (t.id !== id) return t;
        const interval = updated.interval ?? 1;
        return {
          ...t,
          ...updated,
          status: 'fresh' as TopicStatus,
          daysAgo: 0,
          dueIn: interval,
          daysLate: null,
          progressPct: 0.05,
        };
      }));
    } finally {
      setRevisiting(null);
    }
  }, []);

  // ── Delete topic ───────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Slette dette emnet? Revisjonshistorikken vil også fjernes.')) return;
    await fetch(`/api/topics/${id}`, { method: 'DELETE' });
    setTopics(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Sign out ───────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // ── Group topics ───────────────────────────────────────────────────────
  const grouped = GROUP_ORDER.reduce<Record<string, TopicWithStatus[]>>((acc, s) => {
    acc[s] = topics.filter(t => t.status === s);
    return acc;
  }, {} as Record<string, TopicWithStatus[]>);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--rn-cream)', fontFamily: 'var(--font-inter)' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(247,244,239,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--rn-linen)',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20, fontFamily: 'var(--font-lora)', fontWeight: 700, color: 'var(--rn-charcoal)', letterSpacing: '-0.01em' }}>
            ReviNord
          </span>
          {email && (
            <span style={{ fontSize: 12, color: 'var(--rn-charcoal-muted)', paddingTop: 1, display: 'none' }} className="sm:block">
              {email}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/settings"
            style={{
              width: 36, height: 36, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--rn-charcoal-light)',
              border: '1.5px solid var(--rn-linen)',
              background: 'white',
              textDecoration: 'none',
            }}
            title="Innstillinger"
          >
            <Settings size={15} />
          </Link>
          <button
            onClick={handleSignOut}
            title="Logg ut"
            style={{
              width: 36, height: 36, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--rn-charcoal-light)',
              border: '1.5px solid var(--rn-linen)',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 30,
            fontWeight: 700,
            color: 'var(--rn-charcoal)',
            margin: 0,
            lineHeight: 1.25,
          }}>
            Dine revisjonsemner
          </h1>
          <p style={{ color: 'var(--rn-charcoal-light)', marginTop: 8, fontSize: 15, lineHeight: 1.5 }}>
            {topics.length === 0
              ? 'Legg til ditt første emne nedenfor for å starte.'
              : urgent > 0
                ? `${urgent} emne${urgent === 1 ? '' : 'r'} trenger oppmerksomhet · ${onTrack} på sporet`
                : `Alle ${onTrack} emne${onTrack === 1 ? '' : 'r'} på sporet — godt arbeid.`}
          </p>
        </div>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        {topics.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 32,
          }}>
            {[
              { label: 'Forfalt', count: overdue, color: 'var(--rn-overdue)', bg: 'var(--rn-overdue-bg)' },
              { label: 'Forfaller snart', count: dueSoon, color: 'var(--rn-terracotta)', bg: 'var(--rn-terracotta-bg)' },
              { label: 'På sporet', count: onTrack, color: 'var(--rn-sage)', bg: 'var(--rn-sage-bg)' },
            ].map(({ label, count, color, bg }) => (
              <div
                key={label}
                style={{
                  background: count > 0 ? bg : 'white',
                  border: `1.5px solid ${count > 0 ? color + '44' : 'var(--rn-linen)'}`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 700, color: count > 0 ? color : 'var(--rn-charcoal-muted)', fontFamily: 'var(--font-lora)', lineHeight: 1 }}>
                  {count}
                </div>
                <div style={{ fontSize: 12, color: 'var(--rn-charcoal-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Add topic input ────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: 0,
          marginBottom: 40,
          background: 'white',
          border: '1.5px solid var(--rn-linen)',
          borderRadius: 14,
          padding: '8px 8px 8px 18px',
          boxShadow: 'var(--rn-shadow-sm)',
          alignItems: 'center',
        }}>
          <Plus size={15} style={{ color: 'var(--rn-charcoal-muted)', flexShrink: 0, marginRight: 10 }} />
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !adding && handleAdd()}
            placeholder="Legg til et emne, f.eks. Kardiologisk farmakologi…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              color: 'var(--rn-charcoal)',
              fontFamily: 'var(--font-inter)',
              minWidth: 0,
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || adding}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              background: newName.trim() && !adding ? 'var(--rn-terracotta)' : 'var(--rn-linen)',
              color: newName.trim() && !adding ? 'white' : 'var(--rn-charcoal-muted)',
              fontSize: 13,
              fontWeight: 500,
              cursor: newName.trim() && !adding ? 'pointer' : 'default',
              fontFamily: 'var(--font-inter)',
              transition: 'all 0.18s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Plus size={14} />
            Legg til
          </button>
        </div>

        {/* ── Topic groups ───────────────────────────────────────────────── */}
        {topics.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '72px 0',
            color: 'var(--rn-charcoal-muted)',
          }}>
            <BookOpen size={38} style={{ margin: '0 auto 16px', opacity: 0.3, display: 'block' }} />
            <p style={{ fontSize: 16, fontFamily: 'var(--font-lora)', color: 'var(--rn-charcoal-light)', margin: '0 0 6px' }}>
              Revisjonssporeren din er tom
            </p>
            <p style={{ fontSize: 14, margin: 0 }}>
              Legg til et emne ovenfor for å starte timeplanen din.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {GROUP_ORDER.filter(s => (grouped[s]?.length ?? 0) > 0).map(status => (
              <section key={status}>
                {/* Group header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}>
                  <StatusIcon status={status} />
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: STATUS_META[status].color,
                    fontFamily: 'var(--font-inter)',
                  }}>
                    {GROUP_LABELS[status]}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--rn-charcoal-muted)' }}>
                    ({grouped[status].length})
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--rn-linen)', marginLeft: 4 }} />
                </div>

                {/* Topic cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {grouped[status].map(topic => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onRevise={handleRevise}
                      onDelete={handleDelete}
                      revising={revisiting === topic.id}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
