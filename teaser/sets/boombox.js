import * as M from '../lib/motion.js';
import * as G from '../lib/gl.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { MAT } from './materials.js';
import { C } from '../src/config.js';
const { THREE } = G;

export const pumpAt = (u) => Math.exp(-(((u % 1) + 1) % 1) * 6);

export function boombox() {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new RoundedBoxGeometry(6.2, 3.1, 1.5, 4, 0.18), MAT.plastic));
  for (const y of [1.45, -1.45]) { const t = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.08, 1.52), MAT.gold); t.position.y = y; group.add(t); }
  const coneMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8, side: THREE.DoubleSide });
  const speakers = [-1.95, 1.95].map((x) => {
    const s = new THREE.Group(); s.position.set(x, -0.2, 0.76);
    s.add(new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.07, 16, 64), MAT.chrome));
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.3, 0.4, 48, 1, true), coneMat); cone.rotation.x = Math.PI / 2; cone.position.z = -0.2; s.add(cone);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), MAT.chrome); cap.rotation.x = Math.PI / 2; cap.position.z = -0.38; s.add(cap);
    group.add(s);
    return { cone, cap };
  });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.05, 0.05), MAT.glassDark); deck.position.set(0, -0.25, 0.76); group.add(deck);
  for (const [w, h, x, y] of [[1.8, 0.05, 0, 0.3], [1.8, 0.05, 0, -0.8], [0.05, 1.1, -0.88, -0.25], [0.05, 1.1, 0.88, -0.25]]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), MAT.gold); f.position.set(x, y, 0.78); group.add(f);
  }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.09, 12, 64, Math.PI), MAT.chrome);
  handle.scale.set(1, 0.32, 1); handle.position.y = 1.5; group.add(handle);
  const eq = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, 0.055, 0.02), new THREE.MeshBasicMaterial({ toneMapped: false }), 48);
  const mtx = new THREE.Matrix4(), col = new THREE.Color();
  for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) {
    eq.setMatrixAt(i * 6 + j, mtx.makeTranslation(-0.5 + i * 0.143, 0.52 + j * 0.075, 0.76));
    eq.setColorAt(i * 6 + j, col.set(0x222222));
  }
  group.add(eq);
  return {
    group,
    update(u, o = {}) {
      const k = o.pump ?? pumpAt(u);
      for (const s of speakers) { s.cone.position.z = -0.2 + 0.08 * k; s.cap.position.z = -0.38 + 0.1 * k; }
      for (let i = 0; i < 8; i++) {
        const level = Math.round(6 * M.clamp(0.25 + 0.6 * (0.5 + 0.5 * M.noise1(u * 2 + i * 3.1, 7)) * (0.55 + 0.45 * k)));
        for (let j = 0; j < 6; j++) {
          if (j < level) col.set(j < 3 ? C.green : j < 5 ? C.gold : C.pink).multiplyScalar(2.2); else col.set(0x222222);
          eq.setColorAt(i * 6 + j, col);
        }
      }
      eq.instanceColor.needsUpdate = true;
    },
  };
}
