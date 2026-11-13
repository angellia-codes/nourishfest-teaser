// Scene 5 — FINAL CALL (bars 14–16). 14.1 the VHS sleeve turns to face camera (SAVE THE DATE on its
// cover). 14.3 the chat bubble pops with YOUR PASS ARRIVES ON WHATSAPP. 15.1 hard cut to the end card,
// which holds perfectly still; post.js runs the CRT shutdown from 16.3.
import * as M from '../../lib/motion.js';
import * as G from '../../lib/gl.js';
import { C } from '../config.js';
import { cue } from '../grid.js';
import { MAT, blobShadow } from '../../sets/materials.js';
import { ENV_TEX, neonLights } from '../../sets/env.js';
import { sleeve } from '../../sets/sleeve.js';
import { waLine, endCard } from '../overlay.js';
const { THREE } = G;

const SAVE = cue(14, 1), ENDCARD = cue(15, 1);
let S = null;

export function build() {
  const P = M.FORMAT.portrait;
  const scene = new THREE.Scene();
  scene.environment = ENV_TEX; scene.background = new THREE.Color(C.black); scene.fog = new THREE.Fog(0x0d0d0d, 14, 30);
  neonLights(scene, { pink: [-5, 3, 5], green: [5, 1, 4], gold: [0, 6, 6], k: 0.8 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), MAT.floor); floor.rotation.x = -Math.PI / 2; floor.position.y = -2.2; scene.add(floor);
  const sl = sleeve();
  sl.group.position.set(P ? 0 : -2.6, P ? 1.3 : 0, 0);
  scene.add(sl.group);
  const sh = blobShadow(3, 1.4, 0.6); sh.position.set(P ? 0 : -2.6, -2.18, 0); scene.add(sh);
  const cam = G.camera(P ? 45 : 32);
  S = { cam, sl };
  S.gl = { scene, camera: cam, bloom: 0.3, bloomThreshold: 0.9, update: (t, u) => update(u) };
}

function update(u) {
  const P = M.FORMAT.portrait;
  const d = (P ? 11 : 9.5) - 0.6 * M.E.inOutSine(M.prog(u, SAVE, ENDCARD));
  G.lookFrom(S.cam, [0.2, 0.3, d], [0.2, 0, 0]);
  const k = M.springU(u, SAVE - 0.35, M.SPRING.gentle);   // already mid-turn on the hit frame
  S.sl.group.rotation.set(0.06 * (1 - k), M.lerp(-2.3, 0, k), 0);
}

export function draw(ctx, u, t) {
  if (u >= ENDCARD) return endCard(ctx);
  M.fill(ctx, C.black);
  G.renderSet(ctx, S.gl, t, u);
  waLine(ctx, u);
}
