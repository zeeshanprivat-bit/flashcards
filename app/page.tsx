import LoginForm from './LoginForm';
import { Brain, Zap, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
      
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-primary/10">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-bold text-foreground tracking-tight">Flashcards</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-12 max-w-2xl animate-slide-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wide">AI-drevet læring</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight text-balance">
            Studer smartere,
            <br />
            <span className="text-primary">husk lengre</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto text-pretty">
            Transformer tekst til intelligente flashcards med AI. Bruk vitenskapelig bevist repetisjon for å optimalisere læringen din.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
          {[
            { 
              icon: Zap, 
              title: 'AI-generering',
              description: 'Lim inn hvilken som helst tekst og få perfekte flashcards sekunder'
            },
            { 
              icon: RefreshCw, 
              title: 'Spaced Repetition',
              description: 'Vitenskapelig algoritme sørger for at du repeterer til optimal tid'
            },
            { 
              icon: Brain, 
              title: 'Smart analyse',
              description: 'Detaljert statistikk og innsikt i læringsprogresjonen din'
            },
          ].map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="card p-6 text-center group hover:shadow-lg transition-all duration-300" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="w-full max-w-md animate-scale-in" style={{ animationDelay: '400ms' }}>
          <div className="card p-8 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0"></div>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Start å lære i dag</h2>
              </div>
              <p className="text-muted-foreground mb-6">Opprett en gratis konto og begynn din læringsreise</p>
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span>Gratis å bruke</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span>Ingen kredittkort nødvendig</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span>Databeskyttelse</span>
          </div>
        </div>
      </div>
    </div>
  );
}
