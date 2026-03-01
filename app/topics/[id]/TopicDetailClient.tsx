'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, Clock, AlertTriangle, Circle,
  Pencil, Trash2, RefreshCw, Check, X
} from 'lucide-react';
import { STATUS_META, getDueLabel, getLastRevisedLabel } from '@/lib/revision';
import type { TopicWithStatus, TopicStatus, Revision } from '@/lib/types';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function daysBetween(a: string, b: string) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

// ── Progress ring ──────────────────────────────────────────────────────────

function ProgressRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const sw = 4;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(Math.max(pct, 0), 1));
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
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
  const props = { size: 16, style: { color } };
  switch (status) {
    case 'overdue': return <AlertTriangle {...props} />;
    case 'due-soon': return <Clock {...props} />;
    case 'on-track': return <CheckCircle2 {...props} />;
    case 'fresh': return <CheckCircle2 {...props} />;
    default: return <Circle {...props} />;
  }
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TopicDetailClient({
  topic: initial,
  revisions: initialRevisions,
}: {
  topic: TopicWithStatus;
  revisions: Revision[];
}) {
  const [topic, setTopic] = useState<TopicWithStatus>(initial);
  const [revisions, setRevisions] = useState<Revision[]>(initialRevisions);
  const [revising, setRevising] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(topic.name);
  const [saving, setSaving] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const meta = STATUS_META[topic.status];

  // ── Log revision ───────────────────────────────────────────────────────
  const handleRevise = useCallback(async () => {
    setRevising(true);
    try {
      const res = await fetch(`/api/topics/${topic.id}/revise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!res.ok) return;
      const updated = await res.json();
      const interval = updated.interval ?? 1;
      setTopic(prev => ({
        ...prev,
        ...updated,
        status: 'fresh' as TopicStatus,
        daysAgo: 0,
        dueIn: interval,
        daysLate: null,
        progressPct: 0.05,
      }));
      // Add a new revision entry
      const newRevision: Revision = {
        id: crypto.randomUUID(),
        topic_id: topic.id,
        user_id: '',
        revised_at: new Date().toISOString(),
        notes: null,
        ease_before: topic.ease_factor,
        ease_after: updated.ease_factor,
        interval_before: topic.interval,
        interval_after: updated.interval,
        due_date_after: updated.due_date,
      };
      setRevisions(prev => [newRevision, ...prev]);
    } finally {
      setRevising(false);
    }
  }, [topic]);

  // ── Rename topic ───────────────────────────────────────────────────────
  const startEdit = () => {
    setEditName(topic.name);
    setEditing(true);
    setTimeout(() => editRef.current?.select(), 0);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditName(topic.name);
  };

  const saveEdit = useCallback(async () => {
    const name = editName.trim();
    if (!name || name === topic.name) { cancelEdit(); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/topics/${topic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setTopic(prev => ({ ...prev, name: updated.name }));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [editName, topic]);

  // ── Delete topic ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm('Slette dette emnet? Hele revisjonshistorikken vil fjernes.')) return;
    await fetch(`/api/topics/${topic.id}`, { method: 'DELETE' });
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--rn-cream)', fontFamily: 'var(--font-inter)' }}>

      {/* ── Nav strip ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(247,244,239,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--rn-linen)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <Link
          href="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--rn-charcoal-light)', textDecoration: 'none', fontSize: 14,
          }}
        >
          <ArrowLeft size={16} />
          Dashbord
        </Link>
        <span style={{ color: 'var(--rn-linen-dark)' }}>·</span>
        <span style={{ fontSize: 14, color: 'var(--rn-charcoal-mid)', fontWeight: 500 }}>
          {topic.name}
        </span>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Topic header ───────────────────────────────────────────── */}
        <div style={{
          background: 'white',
          border: '1.5px solid var(--rn-linen)',
          borderRadius: 20,
          padding: '32px 32px 28px',
          boxShadow: 'var(--rn-shadow-sm)',
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            {/* Progress ring */}
            <div style={{ flexShrink: 0, paddingTop: 4 }}>
              <ProgressRing pct={topic.progressPct} color={meta.color} size={56} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Title row */}
              {editing ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input
                    ref={editRef}
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    style={{
                      flex: 1,
                      fontSize: 22,
                      fontFamily: 'var(--font-lora)',
                      fontWeight: 700,
                      color: 'var(--rn-charcoal)',
                      border: '1.5px solid var(--rn-fjord)',
                      borderRadius: 10,
                      padding: '6px 12px',
                      outline: 'none',
                      background: 'var(--rn-fjord-bg)',
                    }}
                  />
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    style={{
                      width: 34, height: 34, borderRadius: 9, border: 'none',
                      background: 'var(--rn-sage)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{
                      width: 34, height: 34, borderRadius: 9, border: '1.5px solid var(--rn-linen)',
                      background: 'white', color: 'var(--rn-charcoal-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h1 style={{
                    margin: 0,
                    fontFamily: 'var(--font-lora)',
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--rn-charcoal)',
                    lineHeight: 1.2,
                  }}>
                    {topic.name}
                  </h1>
                  <button
                    onClick={startEdit}
                    title="Rename"
                    style={{
                      width: 30, height: 30, borderRadius: 8, border: '1.5px solid var(--rn-linen)',
                      background: 'white', color: 'var(--rn-charcoal-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              )}

              {/* Status + meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  className="rn-pill"
                  style={{ background: meta.bg, color: meta.color, fontSize: 13 }}
                >
                  <StatusIcon status={topic.status} />
                  {getDueLabel(topic)}
                </span>
                <span style={{ fontSize: 13, color: 'var(--rn-charcoal-muted)' }}>
                  {getLastRevisedLabel(topic)}
                </span>
                {topic.repetitions > 0 && (
                  <span style={{ fontSize: 13, color: 'var(--rn-charcoal-muted)' }}>
                    · {topic.repetitions} revisjon{topic.repetitions === 1 ? '' : 'er'} totalt
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--rn-linen)' }}>
            <button
              onClick={handleRevise}
              disabled={revising}
              style={{
                flex: 1,
                padding: '11px 20px',
                borderRadius: 11,
                border: 'none',
                background: revising ? 'var(--rn-linen)' : 'var(--rn-terracotta)',
                color: revising ? 'var(--rn-charcoal-muted)' : 'white',
                fontSize: 15,
                fontWeight: 600,
                cursor: revising ? 'default' : 'pointer',
                fontFamily: 'var(--font-inter)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.18s ease',
              }}
            >
              {revising
                ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                : <CheckCircle2 size={16} />}
              {revising ? 'Logger revisjon…' : 'Logg revisjon nå'}
            </button>

            <button
              onClick={handleDelete}
              title="Slett emne"
              style={{
                padding: '11px 16px',
                borderRadius: 11,
                border: '1.5px solid var(--rn-linen)',
                background: 'white',
                color: 'var(--rn-charcoal-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--rn-overdue-bg)';
                (e.currentTarget as HTMLElement).style.color = 'var(--rn-overdue)';
                (e.currentTarget as HTMLElement).style.borderColor = '#D8B8B8';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'white';
                (e.currentTarget as HTMLElement).style.color = 'var(--rn-charcoal-muted)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--rn-linen)';
              }}
            >
              <Trash2 size={14} />
              Slett
            </button>
          </div>
        </div>

        {/* ── SM-2 details strip ─────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 32,
        }}>
          {[
            { label: 'Intervall', value: `${topic.interval} dag${topic.interval === 1 ? '' : 'er'}`, note: 'Nåværende mellomrom' },
            { label: 'Letthetsgrad', value: topic.ease_factor.toFixed(2), note: 'SM-2-multiplikator' },
            { label: 'Repetisjoner', value: String(topic.repetitions), note: 'Påfølgende gjentagelser' },
          ].map(({ label, value, note }) => (
            <div
              key={label}
              style={{
                background: 'white',
                border: '1.5px solid var(--rn-linen)',
                borderRadius: 14,
                padding: '14px 18px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--rn-charcoal)', fontFamily: 'var(--font-lora)', lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--rn-charcoal-mid)', marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--rn-charcoal-muted)', marginTop: 2 }}>{note}</div>
            </div>
          ))}
        </div>

        {/* ── Revision timeline ──────────────────────────────────────── */}
        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--rn-charcoal-muted)',
            }}>
              Revisjonshistorikk
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--rn-linen)' }} />
            {revisions.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--rn-charcoal-muted)' }}>
                {revisions.length} revisjon{revisions.length === 1 ? '' : 'er'}
              </span>
            )}
          </div>

          {revisions.length === 0 ? (
            <div style={{
              background: 'white',
              border: '1.5px solid var(--rn-linen)',
              borderRadius: 16,
              padding: '40px 24px',
              textAlign: 'center',
              color: 'var(--rn-charcoal-muted)',
              fontSize: 14,
            }}>
              Ingen revisjoner logget ennå. Trykk «Logg revisjon nå» når du studerer dette emnet.
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute',
                left: 19,
                top: 20,
                bottom: 20,
                width: 1,
                background: 'var(--rn-linen)',
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {revisions.map((rev, i) => {
                  const prev = revisions[i + 1];
                  const gapDays = prev
                    ? daysBetween(prev.revised_at, rev.revised_at)
                    : null;
                  return (
                    <div
                      key={rev.id}
                      style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start',
                      }}
                    >
                      {/* Dot */}
                      <div style={{
                        width: 38,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        paddingTop: 12,
                        position: 'relative',
                        zIndex: 1,
                      }}>
                        <div style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: i === 0 ? 'var(--rn-terracotta)' : 'var(--rn-sage)',
                          border: '2px solid white',
                          boxShadow: '0 0 0 2px ' + (i === 0 ? 'var(--rn-terracotta-bg)' : 'var(--rn-sage-bg)'),
                        }} />
                      </div>

                      {/* Card */}
                      <div style={{
                        flex: 1,
                        background: 'white',
                        border: '1.5px solid var(--rn-linen)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        boxShadow: 'var(--rn-shadow-xs)',
                        marginBottom: 4,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--rn-charcoal)' }}>
                              {i === 0 ? 'Siste revisjon' : `Revisjon nr. ${revisions.length - i}`}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--rn-charcoal-muted)', marginTop: 2 }}>
                              {formatDateTime(rev.revised_at)}
                            </div>
                          </div>
                          {rev.interval_after != null && (
                            <span style={{
                              fontSize: 11,
                              background: 'var(--rn-fjord-bg)',
                              color: 'var(--rn-fjord)',
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}>
                              +{rev.interval_after}d intervall
                            </span>
                          )}
                        </div>

                        {gapDays !== null && gapDays > 0 && (
                          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--rn-charcoal-muted)' }}>
                            {gapDays} dag{gapDays === 1 ? '' : 'er'} siden forrige revisjon
                          </div>
                        )}

                        {rev.notes && (
                          <div style={{
                            marginTop: 8,
                            padding: '8px 10px',
                            background: 'var(--rn-cream)',
                            borderRadius: 8,
                            fontSize: 13,
                            color: 'var(--rn-charcoal-mid)',
                            fontStyle: 'italic',
                          }}>
                            {rev.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
