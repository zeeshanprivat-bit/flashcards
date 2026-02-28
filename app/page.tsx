import LoginForm from './LoginForm';
import { Brain, Zap, RefreshCw } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">Flashcards</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-10 max-w-md">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Studer smartere med AI
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Lim inn tekst og AI lager flashcards automatisk. Repetisjon med mellomrom sørger for at du repeterer til rett tid.
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {[
            { icon: Zap, label: 'AI-genererte kort' },
            { icon: RefreshCw, label: 'Repetisjon med mellomrom' },
            { icon: Brain, label: 'Synkronisert i skyen' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
              <Icon className="w-4 h-4 text-violet-500" />
              {label}
            </div>
          ))}
        </div>

        {/* Auth card */}
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Kom i gang</h2>
            <p className="text-sm text-slate-500 mb-6">Logg inn eller opprett en gratis konto</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
