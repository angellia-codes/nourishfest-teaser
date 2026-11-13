// The safety schedule (spec §7) and the cue windows the post pass and motion blur key off. Pure.
import { cue } from './grid.js';

export const GLITCHES = [cue(4, 1), cue(5, 1), cue(16, 3)];
export const GLITCH_LEN = 0.4;                        // beats (≈ 0.19 s)
// the first two glitches straddle their cut (start 0.1 beat early); the third is the CRT shutdown
export function glitchAt(u) {
  for (const g of GLITCHES.slice(0, 2)) {
    const a = g - 0.1;
    if (u >= a && u < a + GLITCH_LEN) return { k: (u - a) / GLITCH_LEN, seed: Math.round(g * 10) };
  }
  return null;
}
export const CRT_OFF = [cue(16, 3), cue(16, 4.5)];
export const crtOffProgress = (u) => Math.min(1, Math.max(0, (u - CRT_OFF[0]) / (CRT_OFF[1] - CRT_OFF[0])));

export const SHAKES = [cue(8, 1), cue(8, 2), cue(8, 3), cue(10, 1)];
export const shakeAmp = (w, h) => 0.018 * Math.min(w, h);

export const PULSES = [cue(8, 1), cue(8, 2), cue(8, 3)];
export const PULSE_LEN = 0.5;                         // beats
export const pulseRadius = (w, h) => 0.9 * Math.sqrt((0.25 * w * h) / Math.PI);
export function pulseAt(u) {
  for (const p of PULSES) if (u >= p && u < p + PULSE_LEN) return Math.cos(((u - p) / PULSE_LEN) * Math.PI / 2) ** 2;
  return 0;
}

export const WHIPS = [cue(4, 3), cue(5, 3), cue(6, 1), cue(6, 3)];
export const FLY = [cue(3, 3), cue(4, 1)];
export function blurSamples(u) {
  if (u >= FLY[0] && u < FLY[1]) return 6;
  for (const w of WHIPS) if (Math.abs(u - w) <= 0.25) return 6;
  return 1;
}

export const END_HOLD = [cue(15, 1), cue(16, 3)];
export const grainFrozen = (u) => u >= END_HOLD[0];
