// The 128 BPM grid. u = beats from the first downbeat (motion.js measures the same from beats.json).
import { BPM, BARS, FPS, DURATION } from './config.js';

export const BEAT = 60 / BPM;          // 0.46875 s
export const BAR = 4 * BEAT;           // 1.875 s
export { BARS };
export const FRAMES = Math.round(DURATION * FPS);
export const cue = (bar, beat = 1) => (bar - 1) * 4 + (beat - 1);
export const secs = (u) => u * BEAT;
export const frameOf = (u) => Math.round(secs(u) * FPS);
export const SCENES = Object.freeze({
  s1: [cue(1), cue(4)],      // PRESS PLAY
  s2: [cue(4), cue(7)],      // BACK TO THE 90s
  s3: [cue(7), cue(10)],     // COUNTDOWN
  s4: [cue(10), cue(14)],    // REVEAL
  s5: [cue(14), BARS * 4],   // FINAL CALL
});
