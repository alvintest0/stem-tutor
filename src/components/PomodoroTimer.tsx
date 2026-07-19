import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { playClick, playTimerDone } from '@/lib/sound';

const MODES = {
  study:      { label: 'Study',       minutes: 25, color: '#10b981', dim: 'rgba(16,185,129,0.2)'  },
  shortBreak: { label: 'Short Break', minutes: 5,  color: '#38bdf8', dim: 'rgba(56,189,248,0.2)'  },
  longBreak:  { label: 'Long Break',  minutes: 15, color: '#a78bfa', dim: 'rgba(167,139,250,0.2)' },
} as const;

type Mode = keyof typeof MODES;

const R = 108;
const CIRC = 2 * Math.PI * R;

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('study');
  const [timeLeft, setTimeLeft] = useState(MODES.study.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const modeRef = useRef<Mode>('study');

  useEffect(() => { modeRef.current = mode; }, [mode]);

  const total = MODES[mode].minutes * 60;
  const dashOffset = CIRC * (timeLeft / total - 1) * -1;
  const { color, dim } = MODES[mode];
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
    <div className="mx-auto mt-6 max-w-md">
      <motion.div
        className="overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl"
        animate={{ boxShadow: `0 25px 60px -12px ${dim}` }}
        transition={{ duration: 0.6 }}
      >
        {/* Mode pills */}
        <div className="flex gap-1 rounded-xl bg-white/10 p-1">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <motion.button
              key={m}
              onClick={() => switchMode(m)}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                mode === m ? 'text-slate-900 shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
              style={mode === m ? { backgroundColor: color } : {}}
            >
              {MODES[m].label}
            </motion.button>
          ))}
        </div>

        {/* Session cycle dots */}
        <div className="mt-6 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: i < sessions % 4 || (sessions > 0 && sessions % 4 === 0) ? 1 : 0.7,
                opacity: i < sessions % 4 ? 1 : 0.2,
                backgroundColor: i < sessions % 4 ? color : '#fff',
              }}
              transition={{ duration: 0.3 }}
              className="h-2 w-2 rounded-full"
            />
          ))}
        </div>

        {/* Ring */}
        <div className="relative mx-auto mt-2 w-fit">
          <svg width="280" height="280" viewBox="0 0 280 280">
            <defs>
              <filter id="ring-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Track */}
            <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />

            {/* Glow halo */}
            <circle
              cx="140" cy="140" r={R}
              fill="none" stroke={dim} strokeWidth="18" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={dashOffset}
              transform="rotate(-90 140 140)"
              style={{ transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s ease' }}
            />

            {/* Sharp ring */}
            <circle
              cx="140" cy="140" r={R}
              fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={dashOffset}
              transform="rotate(-90 140 140)"
              filter="url(#ring-glow)"
              style={{ transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s ease, stroke 0.5s' }}
            />
          </svg>

          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={mode}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="font-display text-6xl font-bold tabular-nums text-white"
            >
              {mm}:{ss}
            </motion.span>

            <AnimatePresence mode="wait">
              <motion.span
                key={mode + '-label'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mt-2 text-sm font-semibold tracking-wide"
                style={{ color }}
              >
                {MODES[mode].label}
              </motion.span>
            </AnimatePresence>

            {isRunning && (
              <motion.div
                className="mt-3 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: color }}
                animate={{ opacity: [1, 0.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-1 flex items-center justify-center gap-5">
          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/50 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>

          <motion.button
            onClick={toggleRun}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl"
            style={{ backgroundColor: color, boxShadow: `0 8px 30px ${dim}` }}
            aria-label={isRunning ? 'Pause' : 'Start'}
          >
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div key="pause" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Pause className="h-6 w-6 fill-white stroke-none" />
                </motion.div>
              ) : (
                <motion.div key="play" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Play className="h-6 w-6 fill-white stroke-none" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="h-11 w-11" />
        </div>

        {/* Footer */}
        <div className="mt-5 text-center">
          <AnimatePresence mode="wait">
            {sessions > 0 ? (
              <motion.p key="count" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-white/50">
                {sessions} session{sessions !== 1 ? 's' : ''} completed
              </motion.p>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/25">
                Study 25 min · Short break 5 min · Long break after 4 sessions
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
