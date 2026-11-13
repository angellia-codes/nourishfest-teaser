// Flat, camera-facing 2-D type (spec §6.2): everything the viewer must read. Sizes from config.TYPE,
// positions inside config.SAFE. Lines cut in on their hit at full opacity; a 0.25-beat settle moves them.
import * as M from '../lib/motion.js';
import { C, COPY, FONTS, SAFE, TYPE, MIN_TEXT } from './config.js';
import { cue } from './grid.js';

const F = () => M.FORMAT.name;
const settle = (u, u0, dist = 24) => (u < u0 ? null : (1 - M.E.outQuint(M.prog(u, u0, u0 + 0.25))) * dist);
// split a line at the space nearest its middle (same words, two lines)
function wrap2(str) {
  const mid = str.length / 2;
  let best = -1;
  for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return best < 0 ? [str] : [str.slice(0, best), str.slice(best + 1)];
}

export function drawPlay(c, x, y, size, color) {
  c.fillStyle = color;
  c.beginPath(); c.moveTo(x, y - size / 2); c.lineTo(x + size * 0.87, y); c.lineTo(x, y + size / 2); c.closePath(); c.fill();
}

// ---------------------------------------------------------------- info panel (12.1, 12.3, 13.1)
export const INFO_AT = [cue(12, 1), cue(12, 3), cue(13, 1)];
export function infoPanel(ctx, u) {
  if (u < INFO_AT[0]) return;
  const s = SAFE[F()], t = TYPE[F()], P = M.FORMAT.portrait;
  const rowH = P ? t.infoLabel + t.infoValue + 40 : t.infoValue + 30;
  const w = P ? s.w : Math.min(s.w, 1240), h = COPY.info.length * rowH + 48;
  const x = (M.W - w) / 2, y = s.y + s.h - h - 6;      // 6 px inside the safe edge (stroke is 4 px)
  const lf = M.font(t.infoLabel, 600, FONTS.label), vf = M.font(t.infoValue, 400, FONTS.head);
  ctx.save();
  M.rrect(ctx, x, y, w, h, 18);
  ctx.fillStyle = 'rgba(20,20,20,0.88)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = C.gold; ctx.stroke();
  COPY.info.forEach(([label, value], i) => {
    const d = settle(u, INFO_AT[i]);
    if (d === null) return;
    const ry = y + 24 + i * rowH;
    if (P) {
      M.text(ctx, `${label}:`, x + 36, ry + t.infoLabel + d, lf, C.gold, 'left', t.infoLabel * 0.14);
      M.text(ctx, value, x + 36, ry + t.infoLabel + 12 + t.infoValue + d, vf, C.text);
    } else {
      const base = ry + rowH / 2 + t.infoValue * 0.36 + d;
      M.text(ctx, `${label}:`, x + 44, base, lf, C.gold, 'left', t.infoLabel * 0.14);
      M.text(ctx, value, x + 320, base, vf, C.text);
    }
  });
  ctx.restore();
}

// ---------------------------------------------------------------- WhatsApp line (14.3)
export const WA_AT = cue(14, 3);
function bubble(ctx, x, y, r) {            // generic chat bubble, not the WhatsApp logo
  ctx.fillStyle = C.green;
  M.rrect(ctx, x - r, y - r * 0.8, 2 * r, 1.6 * r, r * 0.5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - r * 0.55, y + r * 0.7); ctx.lineTo(x - r * 0.85, y + r * 1.15); ctx.lineTo(x - r * 0.1, y + r * 0.78); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.black;
  for (const dx of [-0.45, 0, 0.45]) { ctx.beginPath(); ctx.arc(x + dx * r, y, r * 0.13, 0, M.TAU); ctx.fill(); }
}
export function waLine(ctx, u) {
  if (u < WA_AT) return;
  const s = SAFE[F()], t = TYPE[F()], P = M.FORMAT.portrait;
  const r = P ? 46 : 50;
  const maxW = P ? s.w - 40 : s.x + s.w - M.W * 0.42 - 2 * r - 50;
  const fit = (str) => Math.min(t.wa, M.fitSize(ctx, str, 400, FONTS.head, maxW, t.wa));
  let lines = [COPY.waLine], fs = fit(COPY.waLine);
  if (fs < MIN_TEXT[F()]) { lines = wrap2(COPY.waLine); fs = Math.min(...lines.map(fit)); }
  const lh = fs * 1.12, f = M.font(fs, 400, FONTS.head);
  const k = M.springU(u, WA_AT, M.SPRING.bouncy);
  const rr = r * (0.6 + 0.4 * k);
  ctx.save();
  if (P) {
    const by = s.y + s.h - 330;
    bubble(ctx, M.W / 2, by, rr);
    lines.forEach((l, i) => M.text(ctx, l, M.W / 2, by + r + 30 + fs + i * lh, f, C.text, 'center'));
  } else {
    const bx = M.W * 0.42 + r, by = M.H * 0.6;
    bubble(ctx, bx, by, rr);
    const top = by - (lines.length * lh) / 2;
    lines.forEach((l, i) => M.text(ctx, l, bx + r + 34, top + fs * 0.86 + i * lh, f, C.text, 'left'));
  }
  ctx.restore();
}

// ---------------------------------------------------------------- end card (15.1 → 16.3, fully still)
export function endCard(ctx) {
  M.fill(ctx, C.black);
  const s = SAFE[F()], t = TYPE[F()], P = M.FORMAT.portrait, cx = M.W / 2;
  const wm = P ? COPY.wordmarkStack : [COPY.wordmark];
  const wmS = Math.min(...wm.map((w) => Math.min(t.endWordmark, M.fitSize(ctx, w, 400, FONTS.display, s.w * 0.92, t.endWordmark))));
  const label = (size) => M.font(size, 600, FONTS.label);
  const rows = [
    ...wm.map((str) => ({ str, size: wmS, font: M.font(wmS, 400, FONTS.display), color: C.gold, shadow: C.pink, gap: 0.12 })),
    { str: COPY.year, size: t.endYear, font: M.font(t.endYear, 400, FONTS.display), color: C.text, gap: 0.45 },
    { str: COPY.themeLine, size: t.endTheme, font: label(t.endTheme), color: C.green, track: 0.12, gap: 0.6 },
    ...(P ? COPY.endInfoLines : [COPY.endInfo]).map((str, i, arr) => ({ str, size: t.endInfo, font: label(t.endInfo), color: C.text, track: 0.06, gap: i === arr.length - 1 ? 0.85 : 0.45 })),
    { str: COPY.tagline1, size: t.tagline1, font: M.font(t.tagline1, 400, FONTS.head), color: C.black, sticker: C.pink, gap: 0.55 },
    { str: COPY.tagline2, size: t.tagline2, font: M.font(t.tagline2, 400, FONTS.label), color: C.soft, gap: 0 },
  ];
  const total = rows.reduce((a, r) => a + r.size * (1 + r.gap), 0);
  let y = s.y + (s.h - total) / 2;
  for (const r of rows) {
    const base = y + r.size * 0.86;
    if (r.sticker) {                       // brand sticker tag: pink fill, black text, −2°
      const L = M.layout(ctx, r.str, r.font);
      ctx.save(); ctx.translate(cx, base - r.size * 0.36); ctx.rotate(-0.035);
      ctx.fillStyle = r.sticker; ctx.fillRect(-L.width / 2 - 26, -r.size * 0.72, L.width + 52, r.size * 1.3);
      M.text(ctx, r.str, 0, r.size * 0.36, r.font, r.color, 'center');
      ctx.restore();
    } else {
      if (r.shadow) M.text(ctx, r.str, cx + 6, base + 6, r.font, r.shadow, 'center');
      M.text(ctx, r.str, cx, base, r.font, r.color, 'center', (r.track ?? 0) * r.size);
    }
    y += r.size * (1 + r.gap);
  }
}
