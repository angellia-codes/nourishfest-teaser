// Extruded type in Bungee (display) and Anton (head): front and side materials, optional neon outlines
// traced from the same glyph outlines (pink in front, a second colour offset behind).
import * as G from '../lib/gl.js';
import { MAT } from './materials.js';
const { THREE } = G;

const URLS = {
  display: new URL('../fonts/bungee-400.ttf', import.meta.url).href,
  head: new URL('../fonts/anton-400.ttf', import.meta.url).href,
};
const FONT = {};
let TextGeometry = null;

export async function initType() {
  const [{ TTFLoader }, { Font }, tg] = await Promise.all([
    import('three/addons/loaders/TTFLoader.js'), import('three/addons/loaders/FontLoader.js'), import('three/addons/geometries/TextGeometry.js')]);
  TextGeometry = tg.TextGeometry;
  const load = (url) => new Promise((res, rej) => new TTFLoader().load(url, (json) => res(new Font(json)), undefined, rej));
  [FONT.display, FONT.head] = await Promise.all([load(URLS.display), load(URLS.head)]);
}

const geoCache = new Map();
function textGeo(str, face, size, depth, bevel) {
  const key = `${str}|${face}|${size}|${depth}|${bevel}`;
  if (!geoCache.has(key)) {
    const g = new TextGeometry(str, { font: FONT[face], size, depth, curveSegments: 8, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: 3 });
    g.computeBoundingBox();
    geoCache.set(key, g);
  }
  return geoCache.get(key);
}

function outline(face, str, size, z, mat) {
  const g = new THREE.Group();
  const r = size * 0.016;
  for (const shape of FONT[face].generateShapes(str, size)) {
    for (const path of [shape, ...shape.holes]) {
      const n = Math.max(24, Math.round(path.getLength() / (size * 0.04)));
      const pts = path.getSpacedPoints(n).slice(0, -1).map((p) => new THREE.Vector3(p.x, p.y, z));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), pts.length * 2, r, 6, true), mat));
    }
  }
  return g;
}

export function word3D(str, { face = 'display', size = 1, depth = 0.3, bevel = 0.03, front = 'gold', side = 'chrome', neon = null, neon2 = null } = {}) {
  const geo = textGeo(str, face, size, depth, bevel);
  const b = geo.boundingBox;
  const group = new THREE.Group();
  const inner = new THREE.Group();
  inner.position.set(-(b.max.x + b.min.x) / 2, -(b.max.y + b.min.y) / 2, -(b.max.z + b.min.z) / 2);
  group.add(inner);
  const mesh = new THREE.Mesh(geo, [MAT[front], MAT[side]]);
  inner.add(mesh);
  if (neon) inner.add(outline(face, str, size, depth + bevel + 0.02, MAT[neon]));
  if (neon2) { const o = outline(face, str, size, -bevel - 0.05, MAT[neon2]); o.position.set(size * 0.04, -size * 0.04, 0); inner.add(o); }
  return { group, mesh, width: b.max.x - b.min.x, height: b.max.y - b.min.y };
}
