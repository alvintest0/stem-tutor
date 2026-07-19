import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { playClick, playTimerDone } from '@/lib/sound';

const MODES = {
  work:       { label: 'Work',        minutes: 25, color: '#10b981', ring: '#d1fae5' },
  shortBreak: { label: 'Short Break', minutes: 5,  color: '#0ea5e9', ring: '#e0f2fe' },
  longBreak:  { label: 'Long Break',  minutes: 15, color: '#8b5cf6', ring: '#ede9fe' },
} as const;

type Mode = keyof typeof MODES;

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const total = MODES[mode].minutes * 60;
  const progress = timeLeft / total;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const { color, ring } = MODES[mode];

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setMode((m) => { if (m === 'work') setSessions((s) => s + 1); return m; });
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
              mode === m
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="relative mt-8">
        <svg width="220" height="220" viewBox="0 0 220 220">
          {/* Track */}
          <circle cx="110" cy="110" r={RADIUS} fill="none" stroke={ring} strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="110"
            cy="110"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 110 110)"
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
          <span className="mt-1 text-xs font-medium text-slate-400">{MODES[mode].label}</span>
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
          {isRunning
            ? <Pause className="h-6 w-6 fill-white" />
            : <Play className="h-6 w-6 fill-white" />
          }
        </motion.button>

        {/* spacer to keep start button centered */}
        <div className="h-10 w-10" />
      </div>

      {/* Session count */}
      {sessions > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-sm text-slate-500"
        >
          {'🍅'.repeat(Math.min(sessions, 8))}{' '}
          <span className="font-medium text-slate-700">{sessions} session{sessions !== 1 ? 's' : ''} done</span>
        </motion.p>
      )}

      <p className="mt-6 max-w-xs text-center text-xs text-slate-400">
        Work 25 min → Short break 5 min → After 4 sessions, take a long break.
      </p>
    </div>
  );
}
