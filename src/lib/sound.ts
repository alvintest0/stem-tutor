let audioContext: AudioContext | undefined;

function getCtx(): AudioContext | undefined {
  if (typeof window === 'undefined' || !window.AudioContext) return undefined;
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function tone(
  ctx: AudioContext,
  type: OscillatorType,
  startFreq: number,
  endFreq: number,
  startVol: number,
  duration: number,
  delay = 0,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  const t = ctx.currentTime + delay;
  osc.frequency.setValueAtTime(startFreq, t);
  if (endFreq !== startFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
  gain.gain.setValueAtTime(startVol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration);
}

// Satisfying "thock" — body thud + sharp transient
export function playClick() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 'sine', 260, 80, 0.35, 0.1);
  tone(ctx, 'square', 2400, 2400, 0.04, 0.018);
}

// Soft bell chord when explanation loads
export function playSuccess() {
  const ctx = getCtx();
  if (!ctx) return;
  // C5 + E5 + G5 sine partials with long decay — bell-like
  [[523.25, 0.2], [659.25, 0.12], [783.99, 0.07], [1046.5, 0.05]].forEach(([freq, vol], i) => {
    tone(ctx, 'sine', freq, freq, vol, 1.4 - i * 0.15);
  });
}

// Four-note ascending arpeggio — C5 E5 G5 C6
export function playSurprise() {
  const ctx = getCtx();
  if (!ctx) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    tone(ctx, 'triangle', freq, freq, 0.18, 0.38, i * 0.1);
  });
}

// Light card flip — quick frequency sweep
export function playFlip() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(ctx, 'sine', 900, 420, 0.14, 0.09);
}

// Pomodoro session complete — three spaced bell tones
export function playTimerDone() {
  const ctx = getCtx();
  if (!ctx) return;
  [[523.25, 0.22], [783.99, 0.18], [1046.5, 0.2]].forEach(([freq, vol], i) => {
    tone(ctx, 'sine', freq, freq, vol, 1.1, i * 0.28);
  });
}
