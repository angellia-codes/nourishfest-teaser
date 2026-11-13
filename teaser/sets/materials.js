import * as G from '../lib/gl.js';
const { THREE } = G;

export const MAT = {};
export const neonMat = (hex, k = 3) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false });

export function initMaterials() {
  // ACES desaturates bright accents: gold sits a touch darker than #D4AF37 so it reads as brand gold
  MAT.gold = new THREE.MeshPhysicalMaterial({ color: 0xc9a233, metalness: 1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 });
  MAT.chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.05 });
  MAT.plastic = new THREE.MeshPhysicalMaterial({ color: 0x151515, metalness: 0.05, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  MAT.rubber = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
  MAT.grille = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.7, metalness: 0.3 });
  MAT.glassDark = new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.05, transparent: true, opacity: 0.6 });
  MAT.red = new THREE.MeshStandardMaterial({ color: 0xc81e2a, roughness: 0.5 });
  MAT.green = new THREE.MeshStandardMaterial({ color: 0x2fae22, roughness: 0.5 });
  MAT.foam = new THREE.MeshStandardMaterial({ color: 0xff1b6b, roughness: 0.95 });
  MAT.floor = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.18, metalness: 0.6 });
  MAT.pinkNeon = neonMat('#FF1B6B', 3);
  MAT.greenNeon = neonMat('#39FF14', 2.6);
  MAT.goldNeon = neonMat('#D4AF37', 2.2);
}

let shadowTex = null;
export function blobShadow(w, d, opacity = 0.6) {
  if (!shadowTex) {
    shadowTex = G.canvasTexture(256, 256);
    shadowTex.draw((c, W, H) => {
      const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    });
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}
