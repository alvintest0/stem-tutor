let audioContext: AudioContext | undefined;

function getAudioContext(): AudioContext | undefined {
  if (typeof window === 'undefined' || !window.AudioContext) return undefined;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  startDelay = 0,
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  const startTime = ctx.currentTime + startDelay;
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playClick() {
  playTone(700, 0.06, 0.08, 'sine');
}

export function playHover() {
  playTone(1000, 0.03, 0.035, 'sine');
}

export function playSurprise() {
  playTone(523.25, 0.1, 0.07, 'triangle', 0); // C5
  playTone(659.25, 0.1, 0.07, 'triangle', 0.08); // E5
  playTone(783.99, 0.15, 0.08, 'triangle', 0.16); // G5
}
