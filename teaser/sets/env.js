// Chrome and gold reflect a room made of the brand's own neon tubes (no downloaded HDRI).
import * as G from '../lib/gl.js';
const { THREE } = G;

export let ENV_TEX = null;

export function initEnv() {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x050505);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const tube = (hex, k, pos, scale) => {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) }));
    m.position.set(...pos); m.scale.set(...scale); s.add(m);
  };
  tube('#FF1B6B', 6, [-6, 2, 2], [0.4, 6, 0.4]);
  tube('#39FF14', 5, [6, 1, -2], [0.4, 5, 0.4]);
  tube('#D4AF37', 4, [0, 7, 0], [8, 0.3, 0.3]);
  tube('#F5F5F0', 2.5, [0, 3, 8], [6, 2, 0.2]);
  tube('#FF1B6B', 3, [4, -1, 6], [3, 0.2, 0.2]);
  // broad soft panels: flat metal faces reflect a wide slice of the room, so they need big dim fills (not only tubes)
  tube('#F5F5F0', 0.8, [0, 1, 9], [18, 9, 0.2]);        // softbox behind the camera
  tube('#F5F5F0', 2.2, [0, 4.5, 9.5], [14, 1.2, 0.2]);   // bright strip: gives chrome a gradient
  tube('#D4AF37', 0.9, [0, -5, 2], [24, 0.2, 24]);      // warm floor bounce
  tube('#FF1B6B', 0.8, [-10, 1, 0], [0.2, 10, 20]);     // pink wall left
  tube('#39FF14', 0.6, [10, 1, 0], [0.2, 10, 20]);      // green wall right
  tube('#F5F5F0', 0.7, [0, 9, -2], [20, 0.2, 14]);      // ceiling
  const pm = new THREE.PMREMGenerator(G.R);
  ENV_TEX = pm.fromScene(s, 0.02).texture;
  pm.dispose();
}

export function neonLights(scene, { pink = [-5, 3, 3], green = [5, 2, -2], gold = [0, 6, 4], k = 1 } = {}) {
  const add = (hex, i, p) => { const l = new THREE.PointLight(hex, i * k, 40, 1.6); l.position.set(...p); scene.add(l); return l; };
  return { pink: add(0xff1b6b, 60, pink), green: add(0x39ff14, 40, green), gold: add(0xd4af37, 30, gold) };
}
