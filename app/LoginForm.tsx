'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginForm() {
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
        setSuccess('Account created! Check your email to confirm, then sign in.');
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
    <div className="space-y-4">
      <div className="flex rounded-xl border border-slate-200 p-1 gap-1">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${mode === 'login' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${mode === 'signup' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          minLength={6}
        />
        <Button type="submit" className="w-full h-11" disabled={loading || !email || !password}>
          {loading ? (mode === 'signup' ? 'Creating account...' : 'Signing in...') : (mode === 'signup' ? 'Create account' : 'Sign in')}
        </Button>
      </form>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      {success && <p className="text-sm text-emerald-600 text-center">{success}</p>}
    </div>
  );
}
