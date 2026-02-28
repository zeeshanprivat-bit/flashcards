'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, LogOut, Plus, BarChart3, Settings, MessageSquare, Lightbulb } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">Flashcards</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <div className="hidden md:flex items-center gap-1 px-2">
            <Link href="/stats">
              <Button variant="ghost" size="sm" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Statistikk</span>
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>AI Chat</span>
              </Button>
            </Link>
            <Link href="/mnemonics">
              <Button variant="ghost" size="sm" className="gap-2">
                <Lightbulb className="w-4 h-4" />
                <span>Huskeregler</span>
              </Button>
            </Link>
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-1">
            <Link href="/stats">
              <Button variant="ghost" size="icon">
                <BarChart3 className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" size="icon">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/mnemonics">
              <Button variant="ghost" size="icon">
                <Lightbulb className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 pl-2">
            <Link href="/decks/new">
              <Button className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ny kortstokk</span>
                <span className="sm:hidden">Ny</span>
              </Button>
            </Link>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-1 pl-2 border-l border-border">
            {email && (
              <div className="hidden sm:block max-w-[120px]">
                <p className="text-xs text-muted-foreground truncate" title={email}>
                  {email}
                </p>
              </div>
            )}
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignOut} 
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Logg ut"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
