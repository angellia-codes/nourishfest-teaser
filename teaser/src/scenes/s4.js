// Scene 4 — REVEAL (bars 10–13). 10.1 the drop: NOURISHFEST slams in (gold faces, chrome bevel, pink and
// green neon outlines), a shockwave ripples the floor, props orbit, the camera arcs. 10.3 2026 stamps.
// 12.1 the title rises and the flat info panel builds (overlay.infoPanel): DATE, GATES, VENUE.
import * as M from '../../lib/motion.js';
import * as G from '../../lib/gl.js';
import { C, COPY } from '../config.js';
import { cue } from '../grid.js';
import { MAT, neonMat } from '../../sets/materials.js';
import { ENV_TEX, neonLights } from '../../sets/env.js';
import { word3D } from '../../sets/type3d.js';
import { cassette } from '../../sets/cassette.js';
import { vinyl } from '../../sets/vinyl.js';
import { boombox } from '../../sets/boombox.js';
import { infoPanel } from '../overlay.js';
import { SHAKES, shakeAmp } from '../safety.js';
const { THREE } = G;

const DROP = cue(10, 1), STAMP = cue(10, 3), RISE = cue(12, 1), END = cue(14, 1);
let S = null;

export function build() {
  const P = M.FORMAT.portrait;
  const scene = new THREE.Scene();
  scene.environment = ENV_TEX; scene.background = new THREE.Color(C.black); scene.fog = new THREE.Fog(0x0d0d0d, 18, 40);
  neonLights(scene, { pink: [-9, 2, 7], green: [9, 1, 5], gold: [0, 7, 8], k: 0.55 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), MAT.floor); floor.rotation.x = -Math.PI / 2; floor.position.y = -2.4; scene.add(floor);
  const ringMat = neonMat('#FF1B6B', 2.5); ringMat.transparent = true;
  const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.05, 128), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.y = -2.38; scene.add(ring);
  const opts = { face: 'display', depth: 0.6, bevel: 0.06, front: 'gold', side: 'chrome', neon: 'pinkNeon', neon2: 'greenNeon' };
  const words = P ? COPY.wordmarkStack.map((w) => word3D(w, { ...opts, size: 1.0 })) : [word3D(COPY.wordmark, { ...opts, size: 1.12 })];
  const title = new THREE.Group();
  if (P) { words[0].group.position.y = 0.7; words[1].group.position.y = -0.7; }
  words.forEach((w) => title.add(w.group));
  scene.add(title);
  const year = word3D(COPY.year, { face: 'display', size: 0.9, depth: 0.3, bevel: 0.04, front: 'chrome', side: 'gold', neon: 'greenNeon' });
  year.group.position.set(P ? 0 : words[0].width / 2 - year.width / 2, P ? -1.95 : -1.55, 0.4);
  title.add(year.group);
  const orbit = [cassette(), vinyl(), cassette(), vinyl(), boombox()];
  [0.9, 0.55, 0.9, 0.55, 0.32].forEach((k, i) => { orbit[i].group.scale.setScalar(k); scene.add(orbit[i].group); });
  const cam = G.camera(P ? 50 : 35);
  S = { cam, title, year, ring, ringMat, orbit };
  S.gl = { scene, camera: cam, bloom: 0.3, bloomThreshold: 0.92, update: (t, u) => update(u) };
}

function update(u) {
  const P = M.FORMAT.portrait;
  const a = M.lerp(-0.28, 0.22, M.E.inOutSine(M.prog(u, DROP, END)));
  const d = P ? 17 : 13.5;
  G.lookFrom(S.cam, [Math.sin(a) * d, 1.0, Math.cos(a) * d], [0, 0, 0]);
  const k = M.springU(u, DROP, { stiffness: 400, damping: 24 });
  const r = M.springU(u, RISE - 0.1, M.SPRING.gentle);
  S.title.scale.setScalar(M.lerp(2.2, 1, k) * (1 - 0.2 * r));
  S.title.position.set(0, r * (P ? 3.2 : 1.9), 6 * (1 - k));
  const ks = M.springU(u, STAMP, { stiffness: 500, damping: 20 });
  S.year.group.visible = u >= STAMP;
  S.year.group.scale.setScalar(M.lerp(1.8, 1, ks));
  S.year.group.rotation.z = -0.07;
  const w = M.prog(u, DROP, DROP + 1.5);
  S.ring.visible = u >= DROP && w < 1;
  const s = 1 + 24 * M.E.outCubic(w);
  S.ring.scale.set(s, s, 1);
  S.ringMat.opacity = 1 - w;
  const R = (P ? 5.2 : 7.2) * (1 + 0.15 * r) * M.lerp(0.3, 1, M.springU(u, DROP, M.SPRING.snappy));
  S.orbit.forEach((o, i) => {
    const ang = (i / S.orbit.length) * M.TAU + (u - DROP) * 0.35;
    o.group.position.set(Math.cos(ang) * R, (i % 2 ? 1.2 : -1.0) + 0.3 * Math.sin(u + i) + r * (P ? 2.0 : 1.0), Math.sin(ang) * R * 0.6);
    o.group.rotation.set(i % 2 ? 1.2 : 0.2, u * 0.5 + i, 0.1 * i);
    o.update(u, { spin: 1.2, drop: 1 });
  });
}

export function draw(ctx, u, t) {
  M.fill(ctx, C.black);
  ctx.save();
  for (const s0 of SHAKES) M.shake(ctx, u, s0, shakeAmp(M.W, M.H), 3, 0.1);
  G.renderSet(ctx, S.gl, t, u);
  ctx.restore();
  infoPanel(ctx, u);
}
