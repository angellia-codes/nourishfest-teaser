import { word3D } from '../teaser/sets/type3d.js';
import { cassette } from '../teaser/sets/cassette.js';
import { boombox } from '../teaser/sets/boombox.js';
import { vinyl } from '../teaser/sets/vinyl.js';
import { headphones } from '../teaser/sets/headphones.js';
import { memphis } from '../teaser/sets/memphis.js';
import { sleeve } from '../teaser/sets/sleeve.js';
import { crt } from '../teaser/sets/crt.js';
import { remote } from '../teaser/sets/remote.js';

export const ITEMS = () => [
  word3D('NOURISHFEST', { face: 'display', size: 0.9, depth: 0.35, bevel: 0.04, front: 'gold', side: 'chrome', neon: 'pinkNeon', neon2: 'greenNeon' }),
  word3D('READY?', { face: 'head', size: 1.2, depth: 0.3, bevel: 0.03, front: 'chrome', side: 'gold', neon: 'pinkNeon' }),
  word3D('3', { face: 'display', size: 2.0, depth: 0.5, bevel: 0.05, front: 'gold', side: 'chrome', neon: 'pinkNeon', neon2: 'greenNeon' }),
  (() => {
    const tv = crt();
    tv.screenTex.draw((c, w, h) => {
      c.fillStyle = '#0A0F1C'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#FF1B6B'; c.font = '400 120px Bungee'; c.textAlign = 'center'; c.fillText('CRT', w / 2, h / 2 + 40);
    });
    return { group: tv.group, update: (u) => tv.update(u, { glow: 1 }) };
  })(),
  (() => { const r = remote(); r.group.rotation.x = 0.5; return { group: r.group, update: (u) => r.update(u, { power: 1, led: 1 }) }; })(),
  cassette(),
  boombox(),
  (() => { const v = vinyl(); v.group.rotation.x = 0.45; return v; })(),
  headphones(),
  memphis(),
  sleeve(),
];
