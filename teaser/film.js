// NourishFest 2026 — Retro Rewind Teaser. Pure function of time: window.seek(t) paints frame t.
// Timing is in beats (u) on beats.json; the spec's beat sheet is the plan this follows.
import * as M from './lib/motion.js';
import { FONTS } from './src/config.js';
import { HITS } from './src/hits.js';
import { initScenes, drawScene } from './src/scenes/index.js';

M.film({
  fonts: [M.font(100, 400, FONTS.display), M.font(100, 400, FONTS.head), M.font(40, 400, FONTS.label), M.font(40, 600, FONTS.label)],
  hits: HITS,
  samples: 1,
  async init() { await initScenes(); },
  draw(ctx, u, t) { drawScene(ctx, u, t); },
});
