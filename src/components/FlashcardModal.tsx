import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Concept } from '@/types';
import { playClick, playFlip } from '@/lib/sound';

interface Props {
  concepts: Concept[];
  onClose: () => void;
}

export function FlashcardModal({ concepts, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState<Set<number>>(new Set());

  const current = concepts[index]!;
  const dotCount = Math.min(concepts.length, 12);

  function handleFlip() {
    playFlip();
    const next = !flipped;
    setFlipped(next);
    if (next) setSeen((s) => new Set(s).add(index));
  }

  function go(dir: number) {
    playClick();
    const next = Math.max(0, Math.min(concepts.length - 1, index + dir));
    if (next === index) return;
    if (flipped) {
      setFlipped(false);
      setTimeout(() => setIndex(next), 230);
    } else {
      setIndex(next);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/85 px-4 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="mb-8 flex w-full max-w-lg items-center justify-between">
        <span className="text-sm font-medium text-white/50">
          {index + 1} / {concepts.length}
        </span>
        <span className="text-sm font-semibold text-emerald-400">
          {seen.size} reviewed
        </span>
        <button
          onClick={() => { playClick(); onClose(); }}
          className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close flashcards"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg" style={{ perspective: '1200px' }}>
        <motion.div
          onClick={handleFlip}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative h-72 cursor-pointer select-none"
        >
          {/* Front */}
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Concept</p>
            <h2 className="mt-4 text-center font-display text-2xl font-bold text-slate-900">
              {current.query}
            </h2>
            <p className="mt-6 text-xs text-slate-400">Tap to reveal explanation</p>
          </div>

          {/* Back */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 flex flex-col overflow-y-auto rounded-2xl bg-emerald-600 p-8 shadow-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
              Explanation
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white">{current.explanation}</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center gap-5">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="rounded-xl p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="flex gap-1.5">
          {Array.from({ length: dotCount }, (_, i) => (
            <button
              key={i}
              onClick={() => { playClick(); setFlipped(false); setIndex(i); }}
              aria-label={`Card ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? 'w-5 bg-white'
                  : seen.has(i)
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-white/25'
              }`}
            />
          ))}
          {concepts.length > 12 && (
            <span className="ml-1 self-center text-xs text-white/30">+{concepts.length - 12}</span>
          )}
        </div>

        <button
          onClick={() => go(1)}
          disabled={index === concepts.length - 1}
          className="rounded-xl p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          aria-label="Next card"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </motion.div>
  );
}
