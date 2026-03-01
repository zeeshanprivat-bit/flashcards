'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, RefreshCw, User, Mail, Shield, Trash2, AlertTriangle, Check, CalendarDays
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  userId: string;
  email: string;
  createdAt: string;
}

export default function SettingsClient({ userId, email, createdAt }: Props) {
  const supabase = createClient();
  const router = useRouter();

  // Change password
  const [pwStep, setPwStep] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [pwError, setPwError] = useState('');

  // Delete account
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
    : '–';

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  async function handlePasswordReset() {
    setPwStep('sending');
    setPwError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      setPwError(error.message);
      setPwStep('idle');
    } else {
      setPwStep('sent');
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== email) return;
    setDeleting(true);
    // Delete revisions first (foreign key), then topics
    await supabase.from('revisions').delete().eq('user_id', userId);
    await supabase.from('topics').delete().eq('user_id', userId);
    await supabase.auth.signOut();
    window.location.href = '/';
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
          <span style={{ fontSize: 14, color: 'var(--rn-charcoal-light)', fontWeight: 500 }}>
            Innstillinger
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
              fontSize: 13, fontWeight: 500,
              textDecoration: 'none',
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

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '36px 24px 80px' }}>

        <h1 style={{
          fontFamily: 'var(--font-lora)',
          fontSize: 28, fontWeight: 700,
          color: 'var(--rn-charcoal)',
          margin: '0 0 28px',
          letterSpacing: '-0.02em',
        }}>
          Innstillinger
        </h1>

        {/* ── Account info ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: 20 }}>
          <h2 style={sectionHeading}>Konto</h2>
          <div style={card}>
            <Row icon={<Mail size={15} />} label="E-post" value={email} />
            <Divider />
            <Row
              icon={<CalendarDays size={15} />}
              label="Medlem siden"
              value={memberSince}
            />
          </div>
        </section>

        {/* ── Security ─────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 20 }}>
          <h2 style={sectionHeading}>Sikkerhet</h2>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={iconWrap}><Shield size={15} style={{ color: 'var(--rn-charcoal-light)' }} /></div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--rn-charcoal)' }}>Passord</div>
                  <div style={{ fontSize: 12, color: 'var(--rn-charcoal-muted)' }}>
                    Tilbakestill via e-post
                  </div>
                </div>
              </div>
              {pwStep === 'sent' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--rn-sage)', fontWeight: 500 }}>
                  <Check size={14} />
                  Sendt!
                </div>
              ) : (
                <button
                  onClick={handlePasswordReset}
                  disabled={pwStep === 'sending'}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 9,
                    border: '1.5px solid var(--rn-linen)',
                    background: 'var(--rn-cream)',
                    color: 'var(--rn-charcoal)',
                    fontSize: 13, fontWeight: 500,
                    cursor: pwStep === 'sending' ? 'default' : 'pointer',
                    opacity: pwStep === 'sending' ? 0.6 : 1,
                    fontFamily: 'var(--font-inter)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pwStep === 'sending' ? 'Sender…' : 'Send tilbakestillingslenke'}
                </button>
              )}
            </div>
            {pwError && (
              <p style={{ fontSize: 12, color: 'var(--rn-overdue)', marginTop: 10, marginBottom: 0 }}>{pwError}</p>
            )}
          </div>
        </section>

        {/* ── Sign out ─────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 20 }}>
          <h2 style={sectionHeading}>Økt</h2>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={iconWrap}><User size={15} style={{ color: 'var(--rn-charcoal-light)' }} /></div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--rn-charcoal)' }}>Logg ut av ReviNord</div>
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '7px 16px',
                  borderRadius: 9,
                  border: '1.5px solid var(--rn-linen)',
                  background: 'var(--rn-cream)',
                  color: 'var(--rn-charcoal)',
                  fontSize: 13, fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                  transition: 'all 0.15s ease',
                }}
              >
                Logg ut
              </button>
            </div>
          </div>
        </section>

        {/* ── Danger zone ──────────────────────────────────────────────── */}
        <section>
          <h2 style={{ ...sectionHeading, color: 'var(--rn-overdue)' }}>Faresone</h2>
          <div style={{ ...card, borderColor: '#D8B8B8' }}>
            {!showDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ ...iconWrap, background: 'var(--rn-overdue-bg)' }}>
                    <Trash2 size={15} style={{ color: 'var(--rn-overdue)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--rn-charcoal)' }}>Slett konto</div>
                    <div style={{ fontSize: 12, color: 'var(--rn-charcoal-muted)' }}>
                      Fjerner alle emner, revisjoner og kontoen din permanent.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDelete(true)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 9,
                    border: '1.5px solid #D8B8B8',
                    background: 'var(--rn-overdue-bg)',
                    color: 'var(--rn-overdue)',
                    fontSize: 13, fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-inter)',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Slett konto
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
                  <AlertTriangle size={16} style={{ color: 'var(--rn-overdue)', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: 'var(--rn-charcoal)', margin: 0, lineHeight: 1.5 }}>
                    Dette sletter <strong>alle emner og revisjoner</strong> permanent og kan ikke angres.
                    Skriv inn e-postadressen din for å bekrefte.
                  </p>
                </div>
                <input
                  type="email"
                  placeholder={email}
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #D8B8B8',
                    background: 'var(--rn-cream-light)',
                    color: 'var(--rn-charcoal)',
                    fontSize: 14,
                    outline: 'none',
                    fontFamily: 'var(--font-inter)',
                    boxSizing: 'border-box',
                    marginBottom: 14,
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                    style={{
                      flex: 1, padding: '9px 0',
                      borderRadius: 9,
                      border: '1.5px solid var(--rn-linen)',
                      background: 'white',
                      color: 'var(--rn-charcoal)',
                      fontSize: 13, fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== email || deleting}
                    style={{
                      flex: 1, padding: '9px 0',
                      borderRadius: 9,
                      border: 'none',
                      background: deleteConfirm === email && !deleting ? 'var(--rn-overdue)' : 'var(--rn-linen)',
                      color: deleteConfirm === email && !deleting ? 'white' : 'var(--rn-charcoal-muted)',
                      fontSize: 13, fontWeight: 600,
                      cursor: deleteConfirm === email && !deleting ? 'pointer' : 'default',
                      fontFamily: 'var(--font-inter)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {deleting ? 'Sletter…' : 'Bekreft sletting'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Shared micro-styles ────────────────────────────────────────────────────

const sectionHeading: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--rn-charcoal-muted)',
  margin: '0 0 8px',
};

const card: React.CSSProperties = {
  background: 'white',
  border: '1.5px solid var(--rn-linen)',
  borderRadius: 16,
  padding: '18px 20px',
  boxShadow: 'var(--rn-shadow-xs)',
};

const iconWrap: React.CSSProperties = {
  width: 32, height: 32,
  borderRadius: 9,
  background: 'var(--rn-cream-dark)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={iconWrap}>{icon && <span style={{ color: 'var(--rn-charcoal-light)' }}>{icon}</span>}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--rn-charcoal-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: 'var(--rn-charcoal)', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--rn-linen)', margin: '14px 0' }} />;
}
