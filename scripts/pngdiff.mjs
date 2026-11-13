// node scripts/pngdiff.mjs a.png b.png   → share of pixels with any channel delta > 8, and max delta
import fs from 'node:fs';
import { PNG } from 'pngjs';
const [a, b] = process.argv.slice(2).map((f) => PNG.sync.read(fs.readFileSync(f)));
let n = 0, max = 0;
for (let i = 0; i < a.data.length; i += 4) {
  let d = 0;
  for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(a.data[i + c] - b.data[i + c]));
  if (d > 8) n++;
  if (d > max) max = d;
}
console.log(`${((100 * n) / (a.width * a.height)).toFixed(4)}% pixels delta>8, max delta ${max}`);
