import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { playClick, playTimerDone } from '@/lib/sound';

const MODES = {
  study:      { label: 'Study',       minutes: 25, color: '#10b981', ring: '#d1fae5' },
  shortBreak: { label: 'Short Break', minutes: 5,  color: '#0ea5e9', ring: '#e0f2fe' },
  longBreak:  { label: 'Long Break',  minutes: 15, color: '#8b5cf6', ring: '#ede9fe' },
} as const;

type Mode = keyof typeof MODES;

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('study');
  const [timeLeft, setTimeLeft] = useState(MODES.study.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const modeRef = useRef<Mode>('study');

  useEffect(() => { modeRef.current = mode; }, [mode]);

  const total = MODES[mode].minutes * 60;
  const dashOffset = CIRCUMFERENCE * (1 - timeLeft / total);
  const { color, ring } = MODES[mode];
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (modeRef.current === 'study') setSessions((s) => s + 1);
          playTimerDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  function switchMode(m: Mode) {
    playClick();
    setMode(m);
    setIsRunning(false);
    setTimeLeft(MODES[m].minutes * 60);
  }

  function toggleRun() {
    playClick();
    setIsRunning((r) => !r);
  }

  function reset() {
    playClick();
    setIsRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
  }

  return (
    <div className="mx-auto mt-8 flex max-w-sm flex-col items-center">
      {/* Mode pills */}
      <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="relative mt-8">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <defs>
            <filter id="subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle cx="110" cy="110" r={RADIUS} fill="none" stroke={ring} strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="110" cy="110" r={RADIUS}
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
            transform="rotate(-90 110 110)"
            filter="url(#subtle-glow)"
            style={{ transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease, stroke 0.3s' }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={mode}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-5xl font-bold tabular-nums text-slate-900"
          >
            {mm}:{ss}
          </motion.span>
          <AnimatePresence mode="wait">
            <motion.span
              key={mode + '-label'}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="mt-1 text-xs font-medium"
              style={{ color }}
            >
              {MODES[mode].label}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-3">
        <motion.button
          onClick={reset}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50"
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </motion.button>

        <motion.button
          onClick={toggleRun}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          style={{ backgroundColor: color }}
          className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-md"
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          <AnimatePresence mode="wait">
            {isRunning ? (
              <motion.div key="pause" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.12 }}>
                <Pause className="h-6 w-6 fill-white stroke-none" />
              </motion.div>
            ) : (
              <motion.div key="play" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.12 }}>
                <Play className="h-6 w-6 fill-white stroke-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="h-10 w-10" />
      </div>

      {/* Session count */}
      {sessions > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-sm text-slate-500"
        >
          🍅 <span className="font-medium text-slate-700">{sessions} session{sessions !== 1 ? 's' : ''} done</span>
        </motion.p>
      )}

      <p className="mt-4 max-w-xs text-center text-xs text-slate-400">
        Study 25 min · Short break 5 min · Long break after 4 sessions
      </p>
    </div>
  );
}
