import { slate } from './slate.js';
import { waLine, endCard } from '../overlay.js';
export function build() {}
export function draw(ctx, u) { if (u >= 56) return endCard(ctx); slate(ctx, u, 'S5 · FINAL CALL'); waLine(ctx, u); }
