import Link from 'next/link';
import { Brain, Sparkles, ArrowRight, CheckCircle2, BarChart, Zap, Shield, Star } from 'lucide-react';
import LoginForm from './LoginForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        
        <div className="relative container mx-auto px-4 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-drevet læringsplattform
            </div>
            
            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 tracking-tight animate-slide-up">
              Studer smartere,
              <br />
              <span className="text-primary">husk lengre</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
              Transformer tekst til intelligente flashcards med AI. Bruk vitenskapelig bevist 
              spaced repetition for å optimalisere læringsprogresjonen din.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="w-full max-w-md">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Start din læringsreise</h3>
                  <p className="text-muted-foreground mb-4 text-sm">Opprett gratis konto og begynn å lære</p>
                  <LoginForm />
                </div>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Gratis å bruke</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                <span>Databeskyttelse</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-success" />
                <span>Ingen kredittkort</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Alt du trenger for effektiv læring
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Fra tekst til mestring - vår AI-plattform støtter hele din læringsreise
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Zap,
                title: 'AI-generering',
                description: 'Lim inn hvilken som helst tekst og få perfekte flashcards automatisk generert på sekunder.',
                features: ['Automatisk deteksjon', 'Intelligent formatering', 'Flere språk']
              },
              {
                icon: BarChart,
                title: 'Spaced Repetition',
                description: 'Vitenskapelig bevist algoritme sørger for at du repeterer til optimal tid for maksimal retention.',
                features: ['SM-2 algoritme', 'Adaptiv timing', 'Statistikk']
              },
              {
                icon: Brain,
                title: 'Smart analyse',
                description: 'Få detaljert innsikt i læringsprogresjonen din med avanserte analyser og anbefalinger.',
                features: ['Progresjonssporing', 'Temaanalyse', 'Ytelsesmåling']
              }
            ].map((feature, index) => (
              <div key={feature.title} className="card p-8 hover:shadow-lg transition-all duration-300 group" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Så enkelt er det
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Fra tekst til ferdige flashcards på tre enkle steg
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Lim inn tekst',
                description: 'Kopier og lim inn notater, artikler eller hvilken som helst tekst du vil lære.'
              },
              {
                step: '02',
                title: 'AI genererer',
                description: 'Vår AI analyserer teksten og lager perfekte flashcards med spørsmål og svar.'
              },
              {
                step: '03',
                title: 'Lær og repeter',
                description: 'Studiér flashcards og la spaced repetition algoritmen optimalisere læringen din.'
              }
            ].map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Hva brukerne sier
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bli med tusenvis av studenter som allerede forbedrer læringen sin
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Denne plattformen har revolusjonert måten jeg studerer på. Jeg lærer dobbelt så raskt!",
                author: "Maria K.",
                role: "Medisinstudent"
              },
              {
                quote: "AI-genereringen er utrolig smart. Sparer meg timer med å lage flashcards.",
                author: "Erik L.",
                role: "Jussstudent"
              },
              {
                quote: "Spaced repetition fungerer perfekt. Husker mye mer til eksamen.",
                author: "Sofie H.",
                role: "Psykologistudent"
              }
            ].map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Klar til å forbedre læringen din?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Bli med i dag og opplev kraften med AI-drevet læringsoptimalisering
          </p>
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <LoginForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
