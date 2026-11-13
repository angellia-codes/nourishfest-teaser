// Timing slate for scenes not built yet: black, scene name, bar.beat counter.
import * as M from '../../lib/motion.js';
import { C, FONTS } from '../config.js';
export function slate(ctx, u, name) {
  M.fill(ctx, C.black);
  const bar = Math.floor(u / 4) + 1, beat = (u % 4) + 1;
  M.text(ctx, name, M.W / 2, M.H / 2 - 40, M.font(64, 400, FONTS.head), C.gold, 'center');
  M.text(ctx, `${bar}.${beat.toFixed(2)}`, M.W / 2, M.H / 2 + 60, M.font(48, 600, FONTS.label), C.text, 'center');
}
