import Link from 'next/link';
import { Brain, Sparkles, ArrowRight, CheckCircle2, BarChart, Zap, Shield, Star } from 'lucide-react';
import LoginForm from './LoginForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-drevet læringsplattform
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Studer smartere,
            <br />
            husk lengre
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transformer tekst til intelligente flashcards med AI. Bruk vitenskapelig bevist 
            spaced repetition for å optimalisere læringsprogresjonen din.
          </p>
          
          {/* CTA */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start din læringsreise</h3>
              <p className="text-gray-600 mb-6 text-sm">Opprett gratis konto og begynn å lære</p>
              <LoginForm />
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Gratis å bruke</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Databeskyttelse</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-500" />
              <span>Ingen kredittkort</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Process Combined */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Alt du trenger for effektiv læring
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fra tekst til mestring på tre enkle steg
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Zap,
                title: 'Lim inn tekst',
                description: 'Kopier og lim inn notater, artikler eller hvilken som helst tekst du vil lære.',
                color: 'from-purple-500 to-purple-600'
              },
              {
                step: '02',
                icon: Brain,
                title: 'AI genererer',
                description: 'Vår AI analyserer teksten og lager perfekte flashcards med spørsmål og svar.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                step: '03',
                icon: BarChart,
                title: 'Lær og repeter',
                description: 'Studiér flashcards og la spaced repetition algoritmen optimalisere læringen din.',
                color: 'from-emerald-500 to-emerald-600'
              }
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="absolute top-4 right-4 text-3xl font-bold text-gray-200">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Elsket av studenter overalt
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bli med tusenvis som allerede forbedrer læringen sin
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
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
              <div key={index} className="bg-gray-50 rounded-2xl p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Klar til å forbedre læringen din?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Bli med i dag og opplev kraften med AI-drevet læringsoptimalisering
          </p>
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <LoginForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
