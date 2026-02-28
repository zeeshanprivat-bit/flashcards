'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FlashCardProps {
  type?: 'basic' | 'cloze';
  front: string;
  back: string;
  clozeText?: string | null;
  revealed: boolean;
  onReveal: () => void;
}

function renderCloze(text: string, revealed: boolean): ReactNode {
  const parts = text.split(/(\{\{c\d+::.*?\}\})/g);
  return (
    <span>
      {parts.map((part, i) => {
        const match = part.match(/\{\{c\d+::(.*?)\}\}/);
        if (match) {
          return revealed ? (
            <span key={i} className="font-bold text-emerald-400 underline decoration-2 underline-offset-4">{match[1]}</span>
          ) : (
            <span key={i} className="inline-block bg-violet-200 text-violet-200 rounded px-2 mx-0.5 select-none min-w-[60px] text-center">____</span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function FlashCard({ type = 'basic', front, back, clozeText, revealed, onReveal }: FlashCardProps) {
  const isCloze = type === 'cloze' && clozeText;

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: '1200px', minHeight: '280px' }}
      onClick={!revealed ? onReveal : undefined}
    >
      {isCloze ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-md p-8 text-center" style={{ minHeight: '280px' }}>
          <div className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-4">
            {revealed ? 'Fyll inn blanken' : 'Cloze'}
          </div>
          <p className="text-xl font-medium text-slate-800 leading-relaxed">
            {renderCloze(clozeText!, revealed)}
          </p>
          {revealed && back && (
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">{back}</p>
          )}
          {!revealed && (
            <div className="mt-6 text-sm text-slate-400">Trykk for å avsløre</div>
          )}
        </div>
      ) : (
        <div
          className={cn('relative w-full transition-transform duration-500', 'transform-gpu')}
          style={{
            transformStyle: 'preserve-3d',
            transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '280px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-md p-8 text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-4">Spørsmål</div>
            <p className="text-xl font-medium text-slate-800 leading-relaxed">{front}</p>
            <div className="mt-6 text-sm text-slate-400">Trykk for å se svar</div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-violet-600 border border-violet-700 shadow-md p-8 text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-xs font-semibold uppercase tracking-widest text-violet-200 mb-4">Svar</div>
            <p className="text-xl font-medium text-white leading-relaxed">{back}</p>
          </div>
        </div>
      )}
    </div>
  );
}
