import * as G from '../lib/gl.js';
import { MAT } from './materials.js';
const { THREE } = G;

class Helix extends THREE.Curve {
  constructor(len, r, turns) { super(); this.len = len; this.r = r; this.turns = turns; }
  getPoint(t, target = new THREE.Vector3()) {
    const a = t * this.turns * Math.PI * 2;
    return target.set(Math.cos(a) * this.r, -t * this.len, Math.sin(a) * this.r);
  }
}

export function headphones() {
  const group = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.07, 16, 64, Math.PI), MAT.chrome); band.position.y = 0.15; group.add(band);
  const pad = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.11, 12, 32, Math.PI * 0.5), MAT.plastic); pad.rotation.z = Math.PI * 0.25; pad.position.y = 0.15; group.add(pad);
  for (const s of [-1, 1]) {
    const cup = new THREE.Group(); cup.position.set(s * 1.3, 0, 0); cup.rotation.y = (s * Math.PI) / 2;
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.26, 40), MAT.plastic); shell.rotation.x = Math.PI / 2; cup.add(shell);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 12, 48), MAT.gold); ring.position.z = 0.14; cup.add(ring);
    const foam = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), MAT.foam); foam.scale.set(1, 1, 0.32); foam.position.z = -0.16; cup.add(foam);
    group.add(cup);
  }
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new Helix(2.4, 0.08, 20), 600, 0.022, 6), MAT.rubber);
  cable.position.set(-1.3, -0.45, 0.05); group.add(cable);
  return { group, update() {} };
}
