// A 90s CRT: rounded plastic housing, rubber bezel, a bulged screen with its own canvas, chrome knobs,
// speaker slots and rabbit ears. The screen canvas is drawn by the scene each frame.
import * as G from '../lib/gl.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { MAT } from './materials.js';
const { THREE } = G;

export const SCREEN_W = 3.0, SCREEN_H = 2.25;
export const SCREEN_CENTER = [-0.25, 0.05, 0.42];

export function crt() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(4.4, 3.4, 3.0, 6, 0.35), MAT.plastic);
  body.position.set(0.25, 0, -1.3);
  group.add(body);
  const bezel = new THREE.Mesh(new RoundedBoxGeometry(3.5, 2.75, 0.3, 4, 0.12), MAT.rubber);
  bezel.position.set(-0.25, 0.05, 0.12);
  group.add(bezel);

  const geo = new THREE.PlaneGeometry(SCREEN_W, SCREEN_H, 40, 30);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (SCREEN_W / 2), y = p.getY(i) / (SCREEN_H / 2);
    p.setZ(i, 0.14 * (1 - 0.6 * x * x) * (1 - 0.6 * y * y));
  }
  geo.computeVertexNormals();
  const screenTex = G.canvasTexture(768, 576);
  const screen = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  screen.position.set(-0.25, 0.05, 0.28);
  group.add(screen);
  const glass = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, transparent: true, opacity: 0.12 }));
  glass.position.set(-0.25, 0.05, 0.29);
  group.add(glass);

  for (const y of [0.7, 0.15]) {
    const k = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.14, 32), MAT.chrome);
    k.rotation.x = Math.PI / 2; k.position.set(1.9, y, 0.22); group.add(k);
  }
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.02), MAT.grille);
    s.position.set(1.9, -0.45 - i * 0.12, 0.21); group.add(s);
  }
  const ant = new THREE.Group();
  ant.position.set(0.25, 1.7, -1.3);
  ant.add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.plastic));
  for (const s of [-1, 1]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.6, 8), MAT.chrome);
    rod.rotation.z = -s * 0.5; rod.position.set(s * 0.62, 1.14, 0); ant.add(rod);
  }
  group.add(ant);

  const glow = new THREE.PointLight(0x8fa6d6, 0, 12, 1.8);
  glow.position.set(-0.25, 0.05, 1.6);
  group.add(glow);

  return { group, screenTex, screen, update(u, o = {}) { glow.intensity = 8 * (o.glow ?? 0); } };
}
