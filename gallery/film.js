// Dev film: one prop every 2 beats, auto-framed, slowly orbiting. Item i is sharpest at t = (2i + 1) × 0.46875 s.
import * as M from '../teaser/lib/motion.js';
import * as G from '../teaser/lib/gl.js';
import { FONTS } from '../teaser/src/config.js';
import { initMaterials } from '../teaser/sets/materials.js';
import { initEnv, ENV_TEX, neonLights } from '../teaser/sets/env.js';
import { initType } from '../teaser/sets/type3d.js';
import { ITEMS } from './items.js';
const { THREE } = G;
let SET;

M.film({
  fonts: [M.font(100, 400, FONTS.display), M.font(100, 400, FONTS.head), M.font(40, 400, FONTS.label), M.font(40, 600, FONTS.label)],
  samples: 1,
  async init() {
    await G.initGL();
    G.R.shadowMap.enabled = false;
    initMaterials(); initEnv(); await initType();
    const scene = new THREE.Scene();
    scene.environment = ENV_TEX; scene.background = new THREE.Color(0x0d0d0d);
    neonLights(scene);
    const cam = G.camera(30);
    const items = ITEMS();
    items.forEach((it) => scene.add(it.group));
    scene.updateMatrixWorld(true);
    const spheres = items.map((it) => new THREE.Box3().setFromObject(it.group).getBoundingSphere(new THREE.Sphere()));
    SET = {
      scene, camera: cam, bloom: 0.35, bloomThreshold: 0.9,
      update(t, u) {
        const i = Math.floor(u / 2) % items.length;
        items.forEach((it, j) => { it.group.visible = j === i; it.update?.(u, {}); });
        const s = spheres[i], d = (s.radius / Math.sin((30 * Math.PI) / 360)) * 1.15, a = -0.5 + (u % 2) * 0.5;
        G.lookFrom(cam, [s.center.x + Math.sin(a) * d, s.center.y + d * 0.2, s.center.z + Math.cos(a) * d], [s.center.x, s.center.y, s.center.z]);
      },
    };
  },
  draw(ctx, u, t) { M.fill(ctx, '#0D0D0D'); G.renderSet(ctx, SET, t, u); },
});
