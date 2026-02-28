'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FlashCardProps {
  front: string;
  back: string;
  revealed: boolean;
  onReveal: () => void;
}

export default function FlashCard({ front, back, revealed, onReveal }: FlashCardProps) {
  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: '1200px', minHeight: '280px' }}
      onClick={!revealed ? onReveal : undefined}
    >
      <div
        className={cn(
          'relative w-full transition-transform duration-500',
          'transform-gpu'
        )}
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
          <div className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-4">Question</div>
          <p className="text-xl font-medium text-slate-800 leading-relaxed">{front}</p>
          <div className="mt-6 text-sm text-slate-400">Tap to reveal answer</div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-violet-600 border border-violet-700 shadow-md p-8 text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-violet-200 mb-4">Answer</div>
          <p className="text-xl font-medium text-white leading-relaxed">{back}</p>
        </div>
      </div>
    </div>
  );
}
