// After the motion-blur accumulation (motion.js runs post once per frame): glitch, CRT shutdown,
// grain, vignette. Glitch and grain live here so the sub-frame average can't erase them.
import * as M from '../lib/motion.js';
import { glitchAt, crtOffProgress, grainFrozen, blurSamples } from './safety.js';

let tiles = [], buf = null, bctx = null, vig = null;

function grainTile(seed) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const c = cv.getContext('2d'); const img = c.createImageData(256, 256); const r = M.mulberry32(seed);
  for (let i = 0; i < img.data.length; i += 4) { const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  c.putImageData(img, 0, 0);
  return cv;
}

export function initPost() {
  tiles = Array.from({ length: 8 }, (_, i) => grainTile(9000 + i));
  buf = document.createElement('canvas'); buf.width = M.W; buf.height = M.H;
  bctx = buf.getContext('2d');
}

export const samples = (t) => blurSamples(M.U(t));

export function post(ctx, u, t) {
  const g = glitchAt(u);
  if (g) glitch(ctx, g);
  const off = crtOffProgress(u);
  if (off > 0) crtOff(ctx, off);
  grain(ctx, t, u);
  vignette(ctx);
}

function grain(ctx, t, u) {
  const i = grainFrozen(u) ? 0 : Math.floor(t * 30) % tiles.length;
  ctx.save();
  ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(tiles[i], 'repeat');
  ctx.fillRect(0, 0, M.W, M.H);
  ctx.restore();
}

function vignette(ctx) {
  if (!vig) {
    vig = ctx.createRadialGradient(M.W / 2, M.H / 2, Math.min(M.W, M.H) * 0.35, M.W / 2, M.H / 2, Math.hypot(M.W, M.H) * 0.55);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.45)');
  }
  ctx.save(); ctx.fillStyle = vig; ctx.fillRect(0, 0, M.W, M.H); ctx.restore();
}

// RGB split (±dx), one tracking band with a horizontal tear, a few displaced row blocks. No brightening.
function glitch(ctx, { k, seed }) {
  const amp = Math.sin(Math.PI * k);                       // 0 → 1 → 0 over the event
  const r = M.mulberry32(seed * 977 + Math.floor(k * 8));
  const dx = Math.round(4 + 10 * amp);
  const src = ctx.getImageData(0, 0, M.W, M.H), out = ctx.createImageData(M.W, M.H);
  const s = src.data, o = out.data, W = M.W, H = M.H;
  const bandY = Math.floor((0.15 + 0.7 * k) * H), bandH = Math.floor(H * 0.06);
  const blocks = Array.from({ length: 4 }, () => [Math.floor(r() * H), Math.floor(8 + r() * 40), Math.round((r() - 0.5) * 80 * amp)]);
  for (let y = 0; y < H; y++) {
    let shift = y >= bandY && y < bandY + bandH ? Math.round(30 * amp) : 0;
    for (const [by, bh, bs] of blocks) if (y >= by && y < by + bh) shift += bs;
    const row = y * W;
    for (let x = 0; x < W; x++) {
      const i = (row + x) * 4;
      const xs = Math.min(W - 1, Math.max(0, x - shift));
      const xr = Math.min(W - 1, Math.max(0, xs - dx)), xb = Math.min(W - 1, Math.max(0, xs + dx));
      o[i] = s[(row + xr) * 4]; o[i + 1] = s[(row + xs) * 4 + 1]; o[i + 2] = s[(row + xb) * 4 + 2]; o[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
}

// CRT power-off: squeeze to a horizontal line (first half), then to a dot that fades (second half).
function crtOff(ctx, p) {
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.drawImage(ctx.canvas, 0, 0);
  ctx.save();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, M.W, M.H);
  if (p < 0.5) {
    const sy = Math.max(0.004, 1 - M.E.inCubic(p / 0.5));
    ctx.translate(M.W / 2, M.H / 2); ctx.scale(1, sy); ctx.translate(-M.W / 2, -M.H / 2);
    ctx.drawImage(buf, 0, 0);
  } else if (p < 1) {
    const q = (p - 0.5) / 0.5;
    const w = M.W * Math.max(0.004, 1 - M.E.outCubic(Math.min(1, q * 1.6)));
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#B8C6E0';
    ctx.fillRect(M.W / 2 - w / 2, M.H / 2 - 2, w, 4);
    const dot = ctx.createRadialGradient(M.W / 2, M.H / 2, 0, M.W / 2, M.H / 2, 10);
    dot.addColorStop(0, `rgba(220,230,255,${1 - q})`); dot.addColorStop(1, 'rgba(220,230,255,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = dot; ctx.fillRect(M.W / 2 - 12, M.H / 2 - 12, 24, 24);
  }
  ctx.restore();
}
