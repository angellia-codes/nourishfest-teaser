import * as G from '../lib/gl.js';
import { MAT } from './materials.js';
import { C } from '../src/config.js';
const { THREE } = G;

export function vinyl() {
  const group = new THREE.Group();
  const top = G.canvasTexture(1024, 1024);
  top.draw((c, w, h) => {
    const cx = w / 2, cy = h / 2;
    c.fillStyle = '#0a0a0a'; c.fillRect(0, 0, w, h);
    for (let r = 180; r < 508; r += 2) {
      c.strokeStyle = `rgba(255,255,255,${0.025 + (0.02 * ((r * 7919) % 5)) / 5})`;
      c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    }
    c.fillStyle = C.pink; c.beginPath(); c.arc(cx, cy, 170, 0, Math.PI * 2); c.fill();
    c.strokeStyle = C.gold; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, 150, 0, Math.PI * 2); c.stroke();
    c.fillStyle = C.black; c.beginPath(); c.arc(cx, cy, 12, 0, Math.PI * 2); c.fill();
  });
  const black = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.25, clearcoat: 1 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.04, 128),
    [black, new THREE.MeshPhysicalMaterial({ map: top, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15 }), black]);
  group.add(disc);
  // light streaks stay put while the disc turns under them
  const sheen = G.canvasTexture(512, 512);
  sheen.draw((c, w, h) => {
    const g = c.createConicGradient(0, w / 2, h / 2);
    for (const [a, v] of [[0, 0], [0.05, 0.22], [0.1, 0], [0.5, 0], [0.55, 0.18], [0.6, 0], [1, 0]]) g.addColorStop(a, `rgba(255,255,255,${v})`);
    c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); c.arc(w / 2, h / 2, w * 0.18, 0, Math.PI * 2, true); c.fill();
  });
  const streak = new THREE.Mesh(new THREE.CircleGeometry(2, 96), new THREE.MeshBasicMaterial({ map: sheen, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  streak.rotation.x = -Math.PI / 2; streak.position.y = 0.025; group.add(streak);
  const arm = new THREE.Group(); arm.position.set(2.5, 0.1, -1.4);
  arm.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 32), MAT.chrome));
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 12), MAT.chrome); rod.rotation.z = Math.PI / 2; rod.position.set(-1.3, 0.2, 0); arm.add(rod);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.18), MAT.plastic); head.position.set(-2.6, 0.15, 0); arm.add(head);
  group.add(arm);
  return {
    group,
    update(u, o = {}) {
      disc.rotation.y = -u * Math.PI * 0.55 * (o.spin ?? 1);
      const d = o.drop ?? 1;                       // 0 = arm at rest off the disc, 1 = on the grooves
      arm.rotation.y = -0.6 + 0.75 * d;
      arm.rotation.z = 0.08 * (1 - d);
    },
  };
}
