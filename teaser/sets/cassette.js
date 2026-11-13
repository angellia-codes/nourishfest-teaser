import * as G from '../lib/gl.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { MAT } from './materials.js';
import { C, COPY, FONTS } from '../src/config.js';
const { THREE } = G;

export function cassette() {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new RoundedBoxGeometry(2.0, 1.26, 0.24, 3, 0.05), MAT.plastic));
  const lab = G.canvasTexture(1024, 512);
  lab.draw((c, w, h) => {
    c.fillStyle = C.pink; c.fillRect(0, 0, w, h);
    c.fillStyle = C.black; c.fillRect(0, h * 0.64, w, h * 0.05);
    c.font = `600 ${Math.round(h * 0.15)}px ${FONTS.label}`; c.textAlign = 'center'; c.letterSpacing = `${Math.round(h * 0.02)}px`;
    c.fillText(COPY.tapeLabel, w / 2, h * 0.22);
    c.letterSpacing = '0px';
    c.fillStyle = '#121212'; c.beginPath(); c.roundRect(w * 0.2, h * 0.3, w * 0.6, h * 0.28, h * 0.14); c.fill();
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.85), new THREE.MeshStandardMaterial({ map: lab, roughness: 0.6 }));
  label.position.set(0, 0.12, 0.125);
  group.add(label);
  const packMat = new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.4 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.5 });
  const reels = [-0.36, 0.36].map((x) => {
    const r = new THREE.Group();
    r.position.set(x, 0.155, 0.13);
    const pack = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 40), packMat); pack.rotation.x = Math.PI / 2; r.add(pack);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 6), hubMat); hub.rotation.x = Math.PI / 2; hub.position.z = 0.01; r.add(hub);
    group.add(r);
    return r;
  });
  return { group, update(u, o = {}) { const a = -(o.spin ?? 1) * u * Math.PI; for (const r of reels) r.rotation.z = a; } };
}
