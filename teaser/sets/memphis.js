// The abstract 90s music-video set: checker floor plus seeded squiggles, zig-zags, triangles and rings.
import * as M from '../lib/motion.js';
import * as G from '../lib/gl.js';
import { C } from '../src/config.js';
const { THREE } = G;

export function memphis(seed = 7) {
  const group = new THREE.Group();
  const R = M.mulberry32(seed);
  const tex = G.canvasTexture(512, 512);
  tex.draw((c, w, h) => { const n = 8; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { c.fillStyle = (i + j) % 2 ? C.black : C.soft; c.fillRect((i * w) / n, (j * h) / n, w / n, h / n); } });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(5, 5);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, metalness: 0.2 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2; group.add(floor);
  const mats = [C.pink, C.green, C.gold].map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.25, roughness: 0.4 }));
  const squiggle = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => new THREE.Vector3(i * 0.35 - 1.4, Math.sin(i * 1.3) * 0.35, 0))), 80, 0.08, 10);
  const zig = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 7 }, (_, i) => new THREE.Vector3(i * 0.4 - 1.2, i % 2 ? 0.35 : -0.35, 0)), false, 'catmullrom', 0.02), 80, 0.07, 8);
  const tri = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0.6), new THREE.Vector2(-0.55, -0.4), new THREE.Vector2(0.55, -0.4)]), { depth: 0.18, bevelEnabled: false });
  tri.center();
  const geos = [squiggle, zig, tri, new THREE.TorusGeometry(0.45, 0.1, 12, 40)];
  const shapes = Array.from({ length: 16 }, (_, i) => {
    const m = new THREE.Mesh(geos[i % 4], mats[i % 3]);
    group.add(m);
    return { m, home: [(R() - 0.5) * 12, 0.2 + R() * 4.2, -6 + R() * 7], spin: [R() - 0.5, R() - 0.5, R() - 0.5].map((v) => v * 2), phase: R() * 6.28 };
  });
  return {
    group,
    update(u) {
      for (const s of shapes) {
        s.m.position.set(s.home[0], s.home[1] + 0.25 * Math.sin(u * 0.8 + s.phase), s.home[2]);
        s.m.rotation.set(s.phase + u * s.spin[0], u * s.spin[1], u * s.spin[2]);
      }
    },
  };
}
