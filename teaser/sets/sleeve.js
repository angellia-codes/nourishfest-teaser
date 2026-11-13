// VHS tape sleeve as the invitation (scene 5). Cover on +z: SAVE THE DATE (gold Anton), a pink band
// carrying NOURISHFEST in black Bungee (text on pink is black), 2026 in gold. Spine on +x.
import * as M from '../lib/motion.js';
import * as G from '../lib/gl.js';
import { MAT } from './materials.js';
import { C, COPY, FONTS } from '../src/config.js';
const { THREE } = G;

export function sleeve() {
  const front = G.canvasTexture(1024, 1792);
  front.draw((c, w, h) => {
    c.fillStyle = C.black; c.fillRect(0, 0, w, h);
    c.strokeStyle = C.gold; c.lineWidth = 10; c.strokeRect(28, 28, w - 56, h - 56);
    c.textAlign = 'center';
    const [l1, ...rest] = COPY.saveDate.split(' ');
    const l2 = rest.join(' ');
    const s = Math.min(M.fitSize(c, l1, 400, FONTS.head, w * 0.8, 320), M.fitSize(c, l2, 400, FONTS.head, w * 0.8, 320));
    c.fillStyle = C.gold; c.font = M.font(s, 400, FONTS.head);
    c.fillText(l1, w / 2, h * 0.2); c.fillText(l2, w / 2, h * 0.2 + s * 1.02);
    c.save(); c.translate(w / 2, h * 0.64); c.rotate(-0.08);
    c.fillStyle = C.pink; c.fillRect(-w, -95, w * 2, 190);
    c.fillStyle = C.green; c.fillRect(-w, 110, w * 2, 16);
    const ws = M.fitSize(c, COPY.wordmark, 400, FONTS.display, w * 0.86, 150);
    c.fillStyle = C.black; c.font = M.font(ws, 400, FONTS.display); c.fillText(COPY.wordmark, 0, ws * 0.36);
    c.restore();
    c.fillStyle = C.gold; c.font = M.font(170, 400, FONTS.display); c.fillText(COPY.year, w / 2, h * 0.86);
  });
  const spine = G.canvasTexture(256, 1792);
  spine.draw((c, w, h) => {
    c.fillStyle = C.black; c.fillRect(0, 0, w, h);
    c.fillStyle = C.pink; c.fillRect(0, h * 0.08, w, 24);
    c.save(); c.translate(w / 2, h / 2); c.rotate(-Math.PI / 2);
    c.fillStyle = C.gold; c.font = M.font(110, 400, FONTS.display); c.textAlign = 'center'; c.fillText(COPY.wordmark, 0, 40);
    c.restore();
  });
  const mat = (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.5, 0.5), [mat(spine), MAT.plastic, MAT.plastic, MAT.plastic, mat(front), MAT.plastic]);
  const group = new THREE.Group();
  group.add(box);
  return { group, update() {} };
}
