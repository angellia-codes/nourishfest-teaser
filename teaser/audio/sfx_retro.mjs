// Retro SFX the motion-reel palette lacks (spec §8.2): crt_on, static, tape_play, glitch, crt_off.
//   node teaser/audio/sfx_retro.mjs [film]   reads out/<film>/hits.json, writes <film>/audio/sfx_retro.wav
// Every hit with opts.retro gets its sound on its time. Seeded: same hits → same file.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const SR = 48000;
const TAU = Math.PI * 2;
const STEM = 0.4;                                    // same stem level as sfx.mjs
const len = (s) => Math.round(s * SR);
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const noise = (s, seed) => { const r = mulberry32(seed); return Float32Array.from({ length: len(s) }, () => r() * 2 - 1); };
const lp = (x, fc) => { const a = Math.exp((-TAU * fc) / SR); let y = 0; return x.map((v) => (y = (1 - a) * v + a * y)); };
const hp = (x, fc) => { const l = lp(x, fc); return x.map((v, i) => v - l[i]); };
const edge = (t, dur, a, r) => Math.min(1, t / a) * Math.min(1, Math.max(0, (dur - t) / r));

export const SYNTH = {
  crt_on(o, seed) {                                  // thunk + faint high whine + static swelling in
    const d = 0.9, N = len(d), x = new Float32Array(N), st = hp(lp(noise(d, seed), 6000), 900);
    let ph = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SR;
      ph += (TAU * (55 + 60 * Math.exp(-t / 0.02))) / SR;
      x[i] = Math.sin(ph) * Math.exp(-t / 0.09) * 0.9
        + Math.sin(TAU * 11800 * t) * 0.025 * Math.min(1, t / 0.05) * Math.exp(-t / 0.6)
        + st[i] * 0.35 * edge(t, d, 0.45, 0.15);
    }
    return x;
  },
  static(o, seed) {                                  // band-limited hiss with crackle
    const d = o.len ?? 0.8, w = hp(lp(noise(d, seed), 7000), 1200), r = mulberry32(seed + 1), x = new Float32Array(w.length);
    for (let i = 0; i < w.length; i++) {
      const crackle = r() < 0.002 ? (r() * 2 - 1) * 0.6 : 0;
      // a loud 15 ms burst gives the bed a detectable onset (sync.py) even over the CRT-on tail
      x[i] = (w[i] * (0.3 + 1.6 * Math.exp(-i / SR / 0.012)) + crackle) * edge(i / SR, d, 0.001, 0.08);
    }
    return x;
  },
  tape_play(o, seed) {                               // two-stage mechanism clunk + motor whir
    const d = 0.6, N = len(d), x = new Float32Array(N), c = lp(noise(d, seed), 1800);
    let ph = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SR;
      const clunk = c[i] * (Math.exp(-t / 0.012) + (t > 0.045 ? 0.7 * Math.exp(-(t - 0.045) / 0.015) : 0)) * 1.4;
      ph += (TAU * (110 + 6 * Math.sin(TAU * 7 * t))) / SR;
      x[i] = clunk + (((ph / TAU) % 1) * 2 - 1) * 0.08 * edge(t, d, 0.08, 0.2);
    }
    return lp(x, 2500);
  },
  glitch(o, seed) {                                  // gated noise + bit-crushed tone, ~0.2 s
    const d = 0.2, N = len(d), x = new Float32Array(N), w = noise(d, seed);
    let ph = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SR;
      ph += (TAU * 320) / SR;
      const gate = Math.sin(TAU * 38 * t) > 0 ? 1 : 0.15;
      x[i] = (w[i] * 0.4 + (Math.round(Math.sin(ph) * 4) / 4) * 0.35) * gate * edge(t, d, 0.002, 0.03);
    }
    return x;
  },
  crt_off(o, seed) {                                 // zap + falling whine + low thump
    const d = 0.75, N = len(d), x = new Float32Array(N), z = hp(noise(d, seed), 2000);
    let p1 = 0, p2 = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SR;
      p1 += (TAU * (9000 * Math.exp(-t / 0.25) + 1500)) / SR;
      p2 += (TAU * (70 * Math.exp(-t / 0.1) + 35)) / SR;
      x[i] = z[i] * 0.5 * Math.exp(-t / 0.03) + Math.sin(p1) * 0.05 * Math.exp(-t / 0.35) + Math.sin(p2) * 0.6 * Math.exp(-t / 0.12);
    }
    return x;
  },
};
const GAIN = { crt_on: 0.5, static: 0.35, tape_play: 0.6, glitch: 0.45, crt_off: 0.6 };

export function render(hits, duration) {
  const N = len(duration), L = new Float32Array(N), R = new Float32Array(N), placed = [];
  hits.forEach((h, k) => {
    const name = h.opts?.retro;
    if (!name) return;
    if (!SYNTH[name]) throw new Error(`unknown retro sfx "${name}" (${h.label})`);
    const x = SYNTH[name](h.opts, 1000 + k * 7919);
    const g = STEM * GAIN[name] * (h.opts.gain ?? 1), pan = h.opts.pan ?? 0;
    const gl = g * Math.sqrt((1 - pan) / 2) * Math.SQRT2, gr = g * Math.sqrt((1 + pan) / 2) * Math.SQRT2;
    const at = Math.round(h.t * SR);
    for (let i = 0; i < x.length && at + i < N; i++) { L[at + i] += gl * x[i]; R[at + i] += gr * x[i]; }
    placed.push(`${h.t.toFixed(3)} s ${name}`);
  });
  return { L, R, placed };
}

function writeWav(file, L, R) {
  const N = L.length, buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  const q = (v) => Math.round(Math.max(-1, Math.min(1, v)) * 32767);
  for (let i = 0; i < N; i++) { buf.writeInt16LE(q(L[i]), 44 + i * 4); buf.writeInt16LE(q(R[i]), 46 + i * 4); }
  fs.writeFileSync(file, buf);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ROOT = process.cwd(), film = process.argv[2] || 'teaser';
  const hits = JSON.parse(fs.readFileSync(path.join(ROOT, 'out', film, 'hits.json'), 'utf8'));
  const duration = Number(JSON.parse(fs.readFileSync(path.join(ROOT, film, 'film.json'), 'utf8')).duration);
  const { L, R, placed } = render(hits, duration);
  writeWav(path.join(ROOT, film, 'audio', 'sfx_retro.wav'), L, R);
  console.log(`${placed.length} retro sfx -> ${film}/audio/sfx_retro.wav\n  ${placed.join('\n  ')}`);
}
