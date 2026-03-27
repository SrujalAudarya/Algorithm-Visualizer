// Sound utility for algorithm visualizations using Web Audio API

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playTone = (frequency: number, duration: number = 0.05, volume: number = 0.08) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Silently fail if audio context is not available
  }
};

// Map array value to a frequency (higher value = higher pitch)
export const valueToFrequency = (value: number, max: number): number => {
  const minFreq = 200;
  const maxFreq = 800;
  return minFreq + (value / max) * (maxFreq - minFreq);
};

export const playSwapSound = (val1: number, val2: number, max: number) => {
  playTone(valueToFrequency(val1, max), 0.05, 0.06);
  setTimeout(() => playTone(valueToFrequency(val2, max), 0.05, 0.06), 30);
};

export const playCompareSound = (value: number, max: number) => {
  playTone(valueToFrequency(value, max), 0.03, 0.04);
};

export const playCompleteSound = (max: number) => {
  const steps = 10;
  for (let i = 0; i < steps; i++) {
    setTimeout(() => {
      playTone(200 + (i / steps) * 600, 0.1, 0.05);
    }, i * 50);
  }
};
