// Scene 2 — BACK TO THE 90s (bars 4–6). One showroom with a station per prop along x. Each shot is a
// moving pose; a whip blends the outgoing and incoming poses over ½ beat (both stations on screen, motion
// blur from safety.blurSamples). 5.1 is a hard cut (glitch 2 in post.js). 6.3 pulls back as the squad orbits.
import * as M from '../../lib/motion.js';
import * as G from '../../lib/gl.js';
import { C } from '../config.js';
import { cue } from '../grid.js';
import { MAT } from '../../sets/materials.js';
import { ENV_TEX, neonLights } from '../../sets/env.js';
import { cassette } from '../../sets/cassette.js';
import { boombox } from '../../sets/boombox.js';
import { vinyl } from '../../sets/vinyl.js';
import { headphones } from '../../sets/headphones.js';
import { memphis } from '../../sets/memphis.js';
const { THREE } = G;

const X = 14;                                        // station spacing (world units)
const lerp3 = (a, b, q) => a.map((v, i) => M.lerp(v, b[i], q));
const pose = (u, u0, u1, from, to, tgt, ease = M.E.inOutSine) => ({ pos: lerp3(from, to, ease(M.prog(u, u0, u1))), tgt });

const SHOTS = [
  { u0: cue(4, 1), u1: cue(4, 3), at: (u) => pose(u, cue(4, 1), cue(4, 3), [-1.6, 0.5, 3.4], [1.0, 0.25, 3.0], [0, 0, 0]) },
  { u0: cue(4, 3), u1: cue(5, 1), at: (u) => pose(u, cue(4, 3), cue(5, 1), [X - 2.2, 0.6, 6.0], [X + 1.8, 0.2, 5.4], [X, 0, 0]) },
  { u0: cue(5, 1), u1: cue(5, 3), at: (u) => pose(u, cue(5, 1), cue(5, 3), [2 * X - 2.6, -0.2, 2.6], [2 * X + 0.6, -0.25, 2.2], [2 * X + 0.3, -0.6, -0.3]) },
  { u0: cue(5, 3), u1: cue(6, 1), at: (u) => { const a = M.lerp(-0.8, 0.6, M.prog(u, cue(5, 3), cue(6, 1))); return { pos: [3 * X + Math.sin(a) * 5.2, 0.8, Math.cos(a) * 5.2], tgt: [3 * X, 0.2, 0] }; } },
  { u0: cue(6, 1), u1: cue(6, 3), at: (u) => pose(u, cue(6, 1), cue(6, 3), [4 * X - 1, 1.0, 7.5], [4 * X + 0.5, 1.6, 4.0], [4 * X, 1.2, -2]) },
  { u0: cue(6, 3), u1: cue(7, 1), at: (u) => pose(u, cue(6, 3), cue(7, 1), [4 * X, 2.2, 7], [4 * X, 4.5, 19], [4 * X, 1.5, 0], M.E.outCubic) },
];
const WHIPS = [{ u: cue(4, 3), roll: 0.18 }, { u: cue(5, 3), roll: -0.25 }, { u: cue(6, 1), roll: 0.22 }, { u: cue(6, 3), roll: 0 }];
const HALF = 0.25, WHIP_PULL = 12;

function camPose(u) {
  for (const w of WHIPS) {
    if (Math.abs(u - w.u) <= HALF) {
      const i = SHOTS.findIndex((s) => s.u0 === w.u);
      const a = SHOTS[i - 1].at(w.u - HALF), b = SHOTS[i].at(w.u + HALF);
      const q = M.E.inOutCubic((u - (w.u - HALF)) / (2 * HALF));
      return { pos: lerp3(a.pos, b.pos, q), tgt: lerp3(a.tgt, b.tgt, q), roll: Math.sin(Math.PI * q) * w.roll, pull: Math.sin(Math.PI * q) };
    }
  }
  const s = SHOTS.find((sh) => u >= sh.u0 && u < sh.u1) ?? (u < SHOTS[0].u0 ? SHOTS[0] : SHOTS.at(-1));
  return { ...s.at(u), roll: 0, pull: 0 };
}

let S = null;
export function build() {
  const P = M.FORMAT.portrait;
  const scene = new THREE.Scene();
  scene.environment = ENV_TEX; scene.background = new THREE.Color(C.black); scene.fog = new THREE.Fog(0x0d0d0d, 10, 28);
  const fog = scene.fog;
  const lights = neonLights(scene, { k: 0.8 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(42, 40), MAT.floor);
  floor.rotation.x = -Math.PI / 2; floor.position.set(14, -2, 0); scene.add(floor);   // x −7..35; the music-video set has its own floor from 36
  const cas = cassette(); scene.add(cas.group);
  const bb = boombox(); bb.group.scale.setScalar(0.55); bb.group.position.set(X, 0, 0); scene.add(bb.group);
  const vi = vinyl(); vi.group.position.set(2 * X, -0.6, 0); scene.add(vi.group);
  const hp = headphones(); hp.group.position.set(3 * X, 0.3, 0); scene.add(hp.group);
  const mv = memphis(); mv.group.position.set(4 * X, 0, 0); scene.add(mv.group);
  const squad = [cassette(), vinyl(), headphones(), boombox()];
  [0.8, 0.45, 0.6, 0.28].forEach((k, i) => { squad[i].group.scale.setScalar(k); scene.add(squad[i].group); });
  const cam = G.camera(P ? 50 : 34);
  S = { fog, cam, lights, cas, bb, vi, hp, mv, squad };
  S.gl = { scene, camera: cam, bloom: 0.3, bloomThreshold: 0.9, update: (t, u) => update(u) };
}

function update(u) {
  const K = M.FORMAT.portrait ? 1.3 : 1;            // 9:16 frames the same shot from further back
  const c = camPose(u);
  // mid-whip the camera backs off and the fog relaxes so both stations stay on screen (never an empty frame)
  const d = c.pos.map((v, i) => v - c.tgt[i]), len = Math.hypot(...d) || 1, k2 = K * (1 + (WHIP_PULL * c.pull) / len);
  G.lookFrom(S.cam, c.tgt.map((v, i) => v + d[i] * k2), c.tgt, c.roll);
  S.fog.near = 10 + 18 * c.pull; S.fog.far = 28 + 30 * c.pull;
  S.lights.pink.position.set(c.tgt[0] - 5, 3, 3);
  S.lights.green.position.set(c.tgt[0] + 5, 2, -2);
  S.lights.gold.position.set(c.tgt[0], 6, 4);
  const k = M.springU(u, cue(4, 1) - 0.2, M.SPRING.snappy);
  S.cas.group.position.set(0, 0, -2.5 * (1 - k));
  S.cas.group.rotation.set(0.15, M.lerp(-0.7, 0.35, M.prog(u, cue(4, 1), cue(4, 3))), 0.05);
  S.cas.update(u, { spin: 1.5 });
  S.bb.update(u);
  S.vi.update(u, { drop: M.E.inOutCubic(M.prog(u, cue(5, 1), cue(5, 2))) });
  S.hp.group.rotation.set(0.2, u * 0.4, 0.1 * Math.sin(u));
  S.hp.group.position.y = 0.3 + 0.15 * Math.sin(u * 1.3);
  S.mv.update(u);
  const R = M.lerp(2.4, 5, M.E.outCubic(M.prog(u, cue(6, 3), cue(7, 1))));
  S.squad.forEach((p, i) => {
    const a = (i / 4) * M.TAU + u * 0.6;
    p.group.visible = u >= cue(6, 1);
    p.group.position.set(4 * X + Math.cos(a) * R, 1.5 + 0.6 * Math.sin(u + i), Math.sin(a) * R);
    p.group.rotation.set(0.3 * i, u * 0.8 + i, 0);
    p.update(u, { spin: 1.5, drop: 1 });
  });
}

export function draw(ctx, u, t) {
  M.fill(ctx, C.black);
  G.renderSet(ctx, S.gl, t, u);
}
