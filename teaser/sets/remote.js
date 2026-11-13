// Chunky 90s remote: rubber keypad, red POWER, big green PLAY, red IR LED at the front (−z) end.
import * as G from '../lib/gl.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { MAT } from './materials.js';
const { THREE } = G;

export function remote() {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.16, 2.0, 4, 0.07), MAT.plastic));
  const key = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 20);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const b = new THREE.Mesh(key, MAT.rubber); b.position.set(-0.16 + c * 0.16, 0.09, -0.05 + r * 0.2); group.add(b);
  }
  const power = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 24), MAT.red);
  power.position.set(0.16, 0.09, -0.72); group.add(power);
  const play = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 24), MAT.green);
  play.position.set(0, 0.09, -0.4); group.add(play);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x4d0d0d, toneMapped: false });
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), ledMat);
  led.position.set(0, 0.04, -1.0); group.add(led);
  return {
    group,
    update(u, o = {}) {
      power.position.y = 0.09 - 0.035 * (o.power ?? 0);
      play.position.y = 0.09 - 0.035 * (o.play ?? 0);
      ledMat.color.setRGB(0.3 + 3 * (o.led ?? 0), 0.05, 0.05);
    },
  };
}
