'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginClient() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Konto opprettet! Sjekk e-posten din for bekreftelse, og logg inn.');
        setMode('login');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--rn-cream)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-inter)',
    }}>
      {/* Top nav */}
      <div style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--rn-linen)',
      }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: 'var(--rn-charcoal)',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--rn-terracotta)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={14} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-lora)', fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>
            ReviNord
          </span>
        </Link>
        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, color: 'var(--rn-charcoal-light)', textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} />
          Tilbake
        </Link>
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          background: 'white',
          border: '1.5px solid var(--rn-linen)',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: 'var(--rn-shadow-lg)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--rn-charcoal)',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}>
            {mode === 'login' ? 'Logg inn' : 'Opprett konto'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--rn-charcoal-muted)', margin: '0 0 28px' }}>
            {mode === 'login'
              ? 'Fortsett med revisjonssporeren din.'
              : 'Kom i gang med ReviNord — gratis for alltid.'}
          </p>

          {/* Mode toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--rn-cream-dark)',
            borderRadius: 10,
            padding: 4,
            gap: 4,
            marginBottom: 24,
          }}>
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 7,
                  border: 'none',
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? 'var(--rn-charcoal)' : 'var(--rn-charcoal-muted)',
                  fontSize: 14,
                  fontWeight: mode === m ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                  boxShadow: mode === m ? 'var(--rn-shadow-xs)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {m === 'login' ? 'Logg inn' : 'Registrer'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              placeholder="din@epost.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 10,
                border: '1.5px solid var(--rn-linen)',
                background: 'var(--rn-cream-light)',
                color: 'var(--rn-charcoal)',
                fontSize: 15,
                outline: 'none',
                fontFamily: 'var(--font-inter)',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--rn-fjord)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--rn-linen)')}
            />
            <input
              type="password"
              placeholder="Passord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 10,
                border: '1.5px solid var(--rn-linen)',
                background: 'var(--rn-cream-light)',
                color: 'var(--rn-charcoal)',
                fontSize: 15,
                outline: 'none',
                fontFamily: 'var(--font-inter)',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--rn-fjord)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--rn-linen)')}
            />

            {error && (
              <p style={{ fontSize: 13, color: 'var(--rn-overdue)', margin: 0, textAlign: 'center' }}>
                {error}
              </p>
            )}
            {success && (
              <p style={{ fontSize: 13, color: 'var(--rn-sage)', margin: 0, textAlign: 'center' }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                marginTop: 4,
                padding: '12px 0',
                borderRadius: 11,
                border: 'none',
                background: loading || !email || !password ? 'var(--rn-linen)' : 'var(--rn-terracotta)',
                color: loading || !email || !password ? 'var(--rn-charcoal-muted)' : 'white',
                fontSize: 15,
                fontWeight: 600,
                cursor: loading || !email || !password ? 'default' : 'pointer',
                fontFamily: 'var(--font-inter)',
                transition: 'all 0.18s ease',
              }}
            >
              {loading
                ? (mode === 'signup' ? 'Oppretter konto…' : 'Logger inn…')
                : (mode === 'signup' ? 'Opprett konto' : 'Logg inn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
