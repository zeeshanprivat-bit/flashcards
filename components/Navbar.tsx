'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, LogOut, Plus, BarChart3, Settings, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  email?: string;
}

export default function Navbar({ email }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900 hover:text-violet-700 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span>Flashcards</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/stats">
            <Button size="sm" variant="ghost">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistikk</span>
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="sm" variant="ghost">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </Button>
          </Link>
          <Link href="/decks/new">
            <Button size="sm" variant="default">
              <Plus className="w-4 h-4" />
              Ny kortstokk
            </Button>
          </Link>
          {email && (
            <span className="hidden sm:block text-xs text-slate-400 truncate max-w-[160px]">{email}</span>
          )}
          <Link href="/settings">
            <Button size="icon" variant="ghost" title="Innstillinger">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="icon" variant="ghost" onClick={handleSignOut} title="Logg ut">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
