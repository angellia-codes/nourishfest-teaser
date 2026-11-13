// GL + shared 3-D setup once, then each scene builds its set; drawScene routes on u.
import * as G from '../../lib/gl.js';
import { SCENES } from '../grid.js';
import { initMaterials } from '../../sets/materials.js';
import { initEnv } from '../../sets/env.js';
import { initType } from '../../sets/type3d.js';
import * as S1 from './s1.js';
import * as S2 from './s2.js';
import * as S3 from './s3.js';
import * as S4 from './s4.js';
import * as S5 from './s5.js';

const ORDER = [[SCENES.s1, S1], [SCENES.s2, S2], [SCENES.s3, S3], [SCENES.s4, S4], [SCENES.s5, S5]];

export async function initScenes() {
  await G.initGL({ exposure: 1.0 });
  G.R.shadowMap.enabled = false;           // painted contact shadows instead (perf)
  initMaterials();
  initEnv();
  await initType();
  for (const [, s] of ORDER) s.build();
}

export function drawScene(ctx, u, t) {
  const hit = ORDER.find(([[a, b]]) => u >= a && u < b) ?? (u < 0 ? ORDER[0] : ORDER.at(-1));
  hit[1].draw(ctx, u, t);
}
