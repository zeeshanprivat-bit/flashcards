'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, RefreshCw, ArrowLeft, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export interface RevisionRow {
  id: string;
  topic_id: string;
  topic_name: string;
  revised_at: string; // ISO timestamp
}

// ── helpers ────────────────────────────────────────────────────────────────

function isoDate(isoString: string): string {
  // Converts "2025-01-15T10:30:00Z" → "2025-01-15"
  return isoString.split('T')[0];
}

function formatMonthYear(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });
}

function formatDayHeader(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  return d.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// 0 = Sunday … 6 = Saturday. We want Monday = 0.
function firstDayOfMonth(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay(); // 0=Sun
  return (d + 6) % 7; // Mon=0 … Sun=6
}

const DAY_LABELS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

// Up to 5 distinct colours for topic dots (cycling)
const DOT_COLORS = [
  'var(--rn-terracotta)',
  'var(--rn-fjord)',
  'var(--rn-sage)',
  '#9B6BA8',   // soft purple
  '#C49A3A',   // amber
];

// ── sub-components ─────────────────────────────────────────────────────────

function TopicDot({ color }: { color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 7, height: 7,
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
    }} />
  );
}

// ── main component ─────────────────────────────────────────────────────────

export default function KalenderClient({ revisions }: { revisions: RevisionRow[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // "YYYY-MM-DD"
  const router = useRouter();
  const supabase = createClient();

  // Build a map: "YYYY-MM-DD" → RevisionRow[]
  const byDate = useMemo(() => {
    const map: Record<string, RevisionRow[]> = {};
    for (const r of revisions) {
      const d = isoDate(r.revised_at);
      if (!map[d]) map[d] = [];
      map[d].push(r);
    }
    return map;
  }, [revisions]);

  // Assign a consistent color index per topic_id (for this month's topics)
  const topicColorMap = useMemo(() => {
    const map: Record<string, number> = {};
    let idx = 0;
    for (const r of revisions) {
      if (!(r.topic_id in map)) {
        map[r.topic_id] = idx % DOT_COLORS.length;
        idx++;
      }
    }
    return map;
  }, [revisions]);

  function topicColor(topicId: string): string {
    const idx = topicColorMap[topicId] ?? 0;
    return DOT_COLORS[idx];
  }

  // Navigation
  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  // Calendar grid data
  const numDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month); // Mon=0
  const todayKey = isoDate(today.toISOString());

  // Total cells (pad to full weeks)
  const totalCells = Math.ceil((startOffset + numDays) / 7) * 7;
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: numDays }, (_, i) => i + 1),
    ...Array(totalCells - startOffset - numDays).fill(null),
  ];

  function dayKey(d: number) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  // Stats for the current month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthRevisions = revisions.filter(r => isoDate(r.revised_at).startsWith(monthPrefix));
  const monthDaysActive = new Set(monthRevisions.map(r => isoDate(r.revised_at))).size;
  const monthTopics = new Set(monthRevisions.map(r => r.topic_id)).size;

  const selectedRevisions = selectedDay ? (byDate[selectedDay] ?? []) : [];

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 20, fontFamily: 'var(--font-lora)', fontWeight: 700, color: 'var(--rn-charcoal)', letterSpacing: '-0.01em' }}>
            ReviNord
          </span>
          <span style={{ width: 1, height: 18, background: 'var(--rn-linen)' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--rn-charcoal-light)', fontWeight: 500 }}>
            <Calendar size={14} />
            Kalender
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link
            href="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              borderRadius: 9,
              border: '1.5px solid var(--rn-linen)',
              background: 'white',
              color: 'var(--rn-charcoal-light)',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={13} />
            Dashboard
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
            <RefreshCw size={15} />
          </button>
        </div>
      </nav>

      {/* ── Page body ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 28, fontWeight: 700,
            color: 'var(--rn-charcoal)',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}>
            Revisjonskalender
          </h1>
          <p style={{ fontSize: 14, color: 'var(--rn-charcoal-muted)', margin: 0 }}>
            Se hvilke emner du repeterte og når.
          </p>
        </div>

        {/* Month stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 28,
        }}>
          {[
            { label: 'Revisjoner denne måneden', value: monthRevisions.length },
            { label: 'Aktive dager', value: monthDaysActive },
            { label: 'Unike emner', value: monthTopics },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'white',
              border: '1.5px solid var(--rn-linen)',
              borderRadius: 14,
              padding: '16px 20px',
              boxShadow: 'var(--rn-shadow-xs)',
            }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--rn-charcoal)', fontFamily: 'var(--font-lora)' }}>
                {value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--rn-charcoal-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Calendar card */}
        <div style={{
          background: 'white',
          border: '1.5px solid var(--rn-linen)',
          borderRadius: 20,
          boxShadow: 'var(--rn-shadow-xs)',
          overflow: 'hidden',
        }}>
          {/* Month navigation */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--rn-linen)',
          }}>
            <button
              onClick={prevMonth}
              style={{
                width: 36, height: 36, borderRadius: 9,
                border: '1.5px solid var(--rn-linen)',
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--rn-charcoal-light)',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 18, fontWeight: 700,
              color: 'var(--rn-charcoal)',
              letterSpacing: '-0.01em',
              textTransform: 'capitalize',
            }}>
              {formatMonthYear(year, month)}
            </span>
            <button
              onClick={nextMonth}
              style={{
                width: 36, height: 36, borderRadius: 9,
                border: '1.5px solid var(--rn-linen)',
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--rn-charcoal-light)',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid var(--rn-linen)',
          }}>
            {DAY_LABELS.map(label => (
              <div key={label} style={{
                padding: '10px 0',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--rn-charcoal-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {label}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    style={{
                      borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid var(--rn-linen)',
                      borderBottom: '1px solid var(--rn-linen)',
                      minHeight: 80,
                      background: 'var(--rn-cream-light)',
                    }}
                  />
                );
              }

              const key = dayKey(day);
              const dayRevs = byDate[key] ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDay;
              const hasRevisions = dayRevs.length > 0;

              return (
                <div
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  style={{
                    borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid var(--rn-linen)',
                    borderBottom: '1px solid var(--rn-linen)',
                    minHeight: 80,
                    padding: '10px 10px 8px',
                    cursor: hasRevisions ? 'pointer' : 'default',
                    background: isSelected
                      ? 'var(--rn-cream-dark)'
                      : hasRevisions
                        ? 'var(--rn-cream-light)'
                        : 'white',
                    transition: 'background 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {/* Day number */}
                  <div style={{
                    width: 26, height: 26,
                    borderRadius: '50%',
                    background: isToday ? 'var(--rn-terracotta)' : 'transparent',
                    color: isToday ? 'white' : isSelected ? 'var(--rn-charcoal)' : 'var(--rn-charcoal-light)',
                    fontSize: 13,
                    fontWeight: isToday ? 700 : 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 6,
                  }}>
                    {day}
                  </div>

                  {/* Topic dots */}
                  {hasRevisions && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {/* Deduplicate topics for dots */}
                      {Array.from(new Map(dayRevs.map(r => [r.topic_id, r])).values())
                        .slice(0, 6)
                        .map(r => (
                          <TopicDot key={r.topic_id} color={topicColor(r.topic_id)} />
                        ))}
                      {new Set(dayRevs.map(r => r.topic_id)).size > 6 && (
                        <span style={{ fontSize: 9, color: 'var(--rn-charcoal-muted)' }}>
                          +{new Set(dayRevs.map(r => r.topic_id)).size - 6}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Revision count badge */}
                  {dayRevs.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 6, right: 8,
                      fontSize: 10,
                      color: 'var(--rn-charcoal-muted)',
                      fontWeight: 600,
                    }}>
                      {dayRevs.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Day detail panel ─────────────────────────────────────────────── */}
        {selectedDay && (
          <div style={{
            marginTop: 20,
            background: 'white',
            border: '1.5px solid var(--rn-linen)',
            borderRadius: 18,
            padding: '24px 28px',
            boxShadow: 'var(--rn-shadow-xs)',
            animation: 'rn-fade-up 0.2s ease',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 17, fontWeight: 700,
              color: 'var(--rn-charcoal)',
              margin: '0 0 16px',
              letterSpacing: '-0.01em',
              textTransform: 'capitalize',
            }}>
              {formatDayHeader(
                parseInt(selectedDay.split('-')[0]),
                parseInt(selectedDay.split('-')[1]) - 1,
                parseInt(selectedDay.split('-')[2]),
              )}
            </h2>

            {selectedRevisions.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--rn-charcoal-muted)', margin: 0 }}>
                Ingen revisjoner denne dagen.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedRevisions.map(r => (
                  <Link
                    key={r.id}
                    href={`/topics/${r.topic_id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1.5px solid var(--rn-linen)',
                      background: 'var(--rn-cream-light)',
                      textDecoration: 'none',
                      transition: 'border-color 0.15s ease, background 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = topicColor(r.topic_id);
                      (e.currentTarget as HTMLElement).style.background = 'white';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--rn-linen)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--rn-cream-light)';
                    }}
                  >
                    <div style={{
                      width: 10, height: 10,
                      borderRadius: '50%',
                      background: topicColor(r.topic_id),
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 600,
                        color: 'var(--rn-charcoal)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {r.topic_name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--rn-charcoal-muted)' }}>
                        {new Date(r.revised_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--rn-charcoal-muted)', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Recent activity (all time) ───────────────────────────────────── */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 18, fontWeight: 700,
            color: 'var(--rn-charcoal)',
            margin: '0 0 16px',
            letterSpacing: '-0.01em',
          }}>
            Siste aktivitet
          </h2>

          {revisions.length === 0 ? (
            <div style={{
              background: 'white',
              border: '1.5px solid var(--rn-linen)',
              borderRadius: 16,
              padding: '32px 24px',
              textAlign: 'center',
              color: 'var(--rn-charcoal-muted)',
              fontSize: 14,
            }}>
              Ingen revisjoner ennå. Gå til <Link href="/dashboard" style={{ color: 'var(--rn-terracotta)', fontWeight: 600, textDecoration: 'none' }}>dashbordet</Link> for å logge din første revisjon.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Group by date */}
              {Object.entries(
                revisions.slice(0, 60).reduce<Record<string, RevisionRow[]>>((acc, r) => {
                  const d = isoDate(r.revised_at);
                  if (!acc[d]) acc[d] = [];
                  acc[d].push(r);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 14)
                .map(([date, rows]) => {
                  const [y, m, d] = date.split('-').map(Number);
                  const label = formatDayHeader(y, m - 1, d);
                  return (
                    <div key={date}>
                      {/* Date heading */}
                      <div style={{
                        fontSize: 11, fontWeight: 600,
                        color: 'var(--rn-charcoal-muted)',
                        textTransform: 'capitalize',
                        letterSpacing: '0.04em',
                        padding: '16px 0 8px',
                      } as React.CSSProperties}>
                        {label}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {rows.map(r => (
                          <Link
                            key={r.id}
                            href={`/topics/${r.topic_id}`}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '11px 16px',
                              borderRadius: 12,
                              border: '1.5px solid var(--rn-linen)',
                              background: 'white',
                              textDecoration: 'none',
                              transition: 'border-color 0.15s ease',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = topicColor(r.topic_id);
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = 'var(--rn-linen)';
                            }}
                          >
                            <div style={{
                              width: 9, height: 9,
                              borderRadius: '50%',
                              background: topicColor(r.topic_id),
                              flexShrink: 0,
                            }} />
                            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--rn-charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.topic_name}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--rn-charcoal-muted)', flexShrink: 0 }}>
                              {new Date(r.revised_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
