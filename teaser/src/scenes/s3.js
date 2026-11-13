// Scene 3 — COUNTDOWN (bars 7–9). Black void with a faint gold floor grid. ARE · YOU · READY? fly out of
// the dark one per beat; 3 · 2 · 1 slam on 8.1/8.2/8.3 (hard cuts, shake + a neon pulse on the numeral
// only); YOU ARE INVITED TO holds through the silence before the drop.
import * as M from '../../lib/motion.js';
import * as G from '../../lib/gl.js';
import { C, COPY } from '../config.js';
import { cue } from '../grid.js';
import { ENV_TEX, neonLights } from '../../sets/env.js';
import { word3D } from '../../sets/type3d.js';
import { SHAKES, shakeAmp, pulseAt, pulseRadius } from '../safety.js';
const { THREE } = G;

const READY = [cue(7, 1), cue(7, 2), cue(7, 3)], COUNT = [cue(8, 1), cue(8, 2), cue(8, 3)], INVITED = cue(9, 1), END = cue(10, 1);
let S = null;

function row(words, gap) {                           // lay words out on one line, centred
  const total = words.reduce((a, w) => a + w.width, 0) + gap * (words.length - 1);
  let x = -total / 2;
  return words.map((w) => { const c = x + w.width / 2; x += w.width + gap; return [c, 0]; });
}

export function build() {
  const P = M.FORMAT.portrait;
  const scene = new THREE.Scene();
  scene.environment = ENV_TEX; scene.background = new THREE.Color(C.black); scene.fog = new THREE.Fog(0x0d0d0d, 16, 40);
  neonLights(scene, { pink: [-6, 3, 6], green: [6, -1, 4], gold: [0, 6, 8], k: 0.9 });
  const grid = new THREE.GridHelper(80, 40, 0x3a3112, 0x241f0c); grid.position.y = -3.2; scene.add(grid);
  const ready = COPY.ready.map((w) => word3D(w, { face: 'head', size: P ? 1.5 : 1.4, depth: 0.35, bevel: 0.03, front: 'chrome', side: 'gold', neon: 'pinkNeon' }));
  const readyHome = P ? [[0, 2.3], [0, 0], [0, -2.3]] : row(ready, 0.6);
  const nums = COPY.count.map((n) => word3D(n, { face: 'display', size: 4.2, depth: 1.0, bevel: 0.08, front: 'gold', side: 'chrome', neon: 'pinkNeon', neon2: 'greenNeon' }));
  const invited = (P ? COPY.invitedStack : [COPY.invited]).map((w) => word3D(w, { face: 'head', size: P ? 1.25 : 1.1, depth: 0.3, bevel: 0.03, front: 'chrome', side: 'gold', neon: 'greenNeon' }));
  const invitedHome = P ? [[0, 0.9], [0, -0.9]] : [[0, 0]];
  for (const w of [...ready, ...nums, ...invited]) scene.add(w.group);
  const cam = G.camera(P ? 50 : 35);
  S = { cam, ready, readyHome, nums, invited, invitedHome };
  S.gl = { scene, camera: cam, bloom: 0.4, bloomThreshold: 0.9, update: (t, u) => update(u) };
}

function update(u) {
  const P = M.FORMAT.portrait;
  G.lookFrom(S.cam, [Math.sin(u * 0.15) * 0.8, 0.3 + 0.2 * Math.sin(u * 0.1), P ? 16 : 14], [0, 0, 0]);
  S.ready.forEach((w, i) => {
    const k = M.springU(u, READY[i] - 0.15, M.SPRING.snappy);
    const exit = M.E.inCubic(M.prog(u, COUNT[0] - 0.4, COUNT[0]));
    w.group.visible = u >= READY[i] && u < COUNT[0];
    w.group.position.set(S.readyHome[i][0], S.readyHome[i][1], -30 * (1 - k) + exit * 20);
    w.group.rotation.y = (1 - k) * 0.6;
  });
  S.nums.forEach((n, i) => {
    const end = i < 2 ? COUNT[i + 1] : INVITED;
    const k = M.springU(u, COUNT[i], { stiffness: 420, damping: 34 });
    n.group.visible = u >= COUNT[i] && u < end;
    n.group.scale.setScalar(M.lerp(2.6, 1, k));
    n.group.position.set(0, 0, 5 * (1 - k));
    n.group.rotation.z = (i - 1) * -0.06;
  });
  S.invited.forEach((w, i) => {
    const k = M.springU(u, INVITED - 0.1, M.SPRING.gentle);
    w.group.visible = u >= INVITED && u < END;
    w.group.position.set(S.invitedHome[i][0], S.invitedHome[i][1], -6 * (1 - k));
  });
}

export function draw(ctx, u, t) {
  M.fill(ctx, C.black);
  ctx.save();
  for (const s0 of SHAKES) M.shake(ctx, u, s0, shakeAmp(M.W, M.H), 3, 0.1);
  G.renderSet(ctx, S.gl, t, u);
  ctx.restore();
  const p = pulseAt(u);
  if (p > 0) {                                       // neon pulse on the numeral only (≤ 25% of frame)
    const r = pulseRadius(M.W, M.H);
    const g = ctx.createRadialGradient(M.W / 2, M.H / 2, 0, M.W / 2, M.H / 2, r);
    g.addColorStop(0, `rgba(255,27,107,${0.32 * p})`); g.addColorStop(1, 'rgba(255,27,107,0)');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
    ctx.fillRect(M.W / 2 - r, M.H / 2 - r, 2 * r, 2 * r); ctx.restore();
  }
}
