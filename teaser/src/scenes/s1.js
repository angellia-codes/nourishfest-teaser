// Scene 1 — PRESS PLAY (bars 1–3). Dark room, CRT on a low table, remote in the foreground (a child of
// the camera). 1.3 POWER: dot → line → grey-blue raster, static. 2.1 tracking settles on RETRO REWIND /
// BACK TO THE 90s with CH 03. 3.1 PLAY. 3.3 → 4.1 the camera rushes into the glass; the RGB phosphor
// grid takes over the frame for the last half beat. The cut at 4.1 is glitch 1 (post.js).
import * as M from '../../lib/motion.js';
import * as G from '../../lib/gl.js';
import { C, COPY, FONTS } from '../config.js';
import { cue } from '../grid.js';
import { MAT, blobShadow } from '../../sets/materials.js';
import { ENV_TEX, neonLights } from '../../sets/env.js';
import { crt, SCREEN_CENTER } from '../../sets/crt.js';
import { remote } from '../../sets/remote.js';
import { drawPlay } from '../overlay.js';
const { THREE } = G;

const POWER = cue(1, 3), THEME = cue(2, 1), PLAY = cue(3, 1), FLY0 = cue(3, 3), CUT = cue(4, 1);
let S = null, noise = [];

function noiseTile(seed) {
  const cv = document.createElement('canvas'); cv.width = 192; cv.height = 144;
  const c = cv.getContext('2d'), img = c.createImageData(192, 144), r = M.mulberry32(seed);
  for (let i = 0; i < img.data.length; i += 4) { const v = 40 + r() * 180; img.data[i] = v * 0.85; img.data[i + 1] = v * 0.9; img.data[i + 2] = v; img.data[i + 3] = 255; }
  c.putImageData(img, 0, 0);
  return cv;
}

export function build() {
  noise = Array.from({ length: 6 }, (_, i) => noiseTile(500 + i));
  const P = M.FORMAT.portrait;
  const scene = new THREE.Scene();
  scene.environment = ENV_TEX; scene.background = new THREE.Color(C.black); scene.fog = new THREE.Fog(0x0d0d0d, 14, 32);
  neonLights(scene, { pink: [-6, 2.5, 3], green: [6, 1.5, -1], gold: [0, 5, 3], k: 0.5 });
  const tv = crt(); scene.add(tv.group);
  const table = new THREE.Mesh(new THREE.BoxGeometry(7, 0.25, 4.5), MAT.plastic); table.position.set(0, -1.85, -1); scene.add(table);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), MAT.floor); floor.rotation.x = -Math.PI / 2; floor.position.y = -4; scene.add(floor);
  const sh = blobShadow(6, 4.5, 0.7); sh.position.set(0.1, -1.72, -1); scene.add(sh);
  const cam = G.camera(P ? 50 : 32);
  scene.add(cam);
  const rm = remote(); cam.add(rm.group);
  S = { scene, cam, tv, rm };
  S.gl = { scene, camera: cam, bloom: 0.35, bloomThreshold: 0.9, update: (t, u) => update(u) };
}

function camPose(u) {
  const P = M.FORMAT.portrait;
  const z0 = P ? 13 : 13, z1 = P ? 9.5 : 8.6;
  const p = M.E.inOutSine(M.prog(u, 0, FLY0));
  const tgt = [SCREEN_CENTER[0], SCREEN_CENTER[1], 0];
  let pos = [M.lerp(0.9, 0.15, p), M.lerp(0.7, 0.25, p), M.lerp(z0, z1, p)];
  if (u >= FLY0) {                                   // log-space dolly to the glass
    const q = M.E.inCubic(M.prog(u, FLY0, CUT));
    const d0 = pos[2] - tgt[2], d = d0 * (0.55 / d0) ** q;
    pos = [M.lerp(pos[0], tgt[0], q), M.lerp(pos[1], tgt[1], q), tgt[2] + d];
  }
  return { pos, tgt };
}

function scanlines(c, w, h) { c.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1); }

function phosphor(c, w, h, alpha, scale) {           // RGB triads, multiplied: tints, never brightens
  c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = alpha;
  for (let x = 0, i = 0; x < w; x += scale, i++) { c.fillStyle = ['#FF3355', '#33FF66', '#3366FF'][i % 3]; c.fillRect(x, 0, scale, h); }
  c.restore();
}

function themeCard(c, w, h, u) {
  c.textAlign = 'center';
  const s1 = M.fitSize(c, COPY.theme1, 400, FONTS.display, w * 0.84, 120);
  c.font = M.font(s1, 400, FONTS.display);
  c.fillStyle = C.pink; c.fillText(COPY.theme1, w / 2 + 5, h * 0.5 + 5);
  const g = c.createLinearGradient(0, h * 0.5 - s1, 0, h * 0.5);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.5, '#9AA3B5'); g.addColorStop(0.55, '#5A6275'); g.addColorStop(1, '#F5F5F0');
  c.fillStyle = g; c.fillText(COPY.theme1, w / 2, h * 0.5);
  const s2 = M.fitSize(c, COPY.theme2, 400, FONTS.head, w * 0.7, 72);
  c.font = M.font(s2, 400, FONTS.head); c.fillStyle = C.green; c.fillText(COPY.theme2, w / 2, h * 0.5 + s2 * 1.35);
  c.textAlign = 'left'; c.font = M.font(70, 600, FONTS.label); c.fillStyle = C.green;
  if (u < PLAY) c.fillText(COPY.osdChannel, 40, 92);
  else { drawPlay(c, 40, 68, 52, C.green); c.fillText(COPY.osdPlay, 104, 92); }
}

function drawScreen(c, w, h, u) {
  c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
  if (u < POWER) return;
  const on = M.prog(u, POWER, POWER + 0.6);
  if (on < 1) {                                      // dot → line → raster; grey-blue, never white
    c.fillStyle = C.raster;
    if (on < 0.25) { c.beginPath(); c.arc(w / 2, h / 2, 4 + 30 * (on / 0.25), 0, M.TAU); c.fill(); }
    else if (on < 0.5) { const lw = w * M.E.outCubic((on - 0.25) / 0.25); c.fillRect(w / 2 - lw / 2, h / 2 - 3, lw, 6); }
    else { const lh = h * M.E.outCubic((on - 0.5) / 0.5); c.fillRect(0, h / 2 - lh / 2, w, lh); }
    return;
  }
  c.fillStyle = C.screenBg; c.fillRect(0, 0, w, h);
  if (u >= THEME) themeCard(c, w, h, u);
  const sa = 1 - 0.92 * M.prog(u, THEME - 0.5, THEME);
  c.save(); c.globalAlpha = sa; c.imageSmoothingEnabled = false;
  c.drawImage(noise[Math.floor(u * 8) % noise.length], 0, 0, w, h);
  c.restore();
  if (u >= THEME && u < THEME + 0.5) { c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(0, h * (1 - M.prog(u, THEME, THEME + 0.5)), w, 26); }
  const ph = M.prog(u, FLY0, CUT);
  if (ph > 0) phosphor(c, w, h, ph * 0.6, Math.max(2, 3 + ph * 12));
  scanlines(c, w, h);
}

function update(u) {
  const P = M.FORMAT.portrait;
  const { pos, tgt } = camPose(u);
  G.lookFrom(S.cam, pos, tgt);
  S.tv.update(u, { glow: u >= POWER ? M.prog(u, POWER, POWER + 1) : 0 });
  S.tv.screenTex.draw((c, w, h) => drawScreen(c, w, h, u));
  const base = P ? [0.42, -1.12, -2.6] : [0.95, -0.62, -2.4];
  const slide = M.springU(u, -0.6, M.SPRING.gentle);
  const exit = M.E.inBack(M.prog(u, cue(3, 2), cue(3, 3)), 1.4);
  S.rm.group.position.set(base[0] + (1 - slide) * 1.8, base[1] - exit * 1.4, base[2]);
  S.rm.group.rotation.set(0.35, 0.15, 0.04 * Math.sin(u * 0.7));
  S.rm.update(u, {
    power: M.bump(u, POWER + 0.05, 0.18),
    play: M.bump(u, PLAY + 0.05, 0.18),
    led: Math.max(M.bump(u, POWER + 0.05, 0.3), M.bump(u, PLAY + 0.05, 0.3)),
  });
}

function flyOverlay(ctx, p) {                        // the phosphor grid fills the frame (log-space zoom)
  const s = 6 * 10 ** M.E.inCubic(p);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.85 * p;
  for (let x = 0, i = 0; x < M.W; x += s, i++) { ctx.fillStyle = ['#FF3355', '#33FF66', '#3366FF'][i % 3]; ctx.fillRect(x, 0, s, M.H); }
  ctx.restore();
}

export function draw(ctx, u, t) {
  M.fill(ctx, C.black);
  G.renderSet(ctx, S.gl, t, u);
  if (u >= CUT - 0.5) flyOverlay(ctx, M.prog(u, CUT - 0.5, CUT));
}
