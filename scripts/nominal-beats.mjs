// Exact 128 BPM grid for dev films (spike, gallery). The teaser's own beats.json comes from audio/bigbeat.py.
import fs from 'node:fs';
import path from 'node:path';
const film = process.argv[2];
if (!film) { console.error('usage: node scripts/nominal-beats.mjs <film>'); process.exit(1); }
const period = 60 / 128, n = 65;
const beats = Array.from({ length: n }, (_, i) => +(i * period).toFixed(5));
const grid = { bpm: 128, period, offset: 0, beats, downbeats: beats.filter((_, i) => i % 4 === 0), sections: [], source: 'nominal 128 BPM (dev only)' };
fs.writeFileSync(path.join(film, 'beats.json'), JSON.stringify(grid, null, 1));
console.log(`${film}/beats.json: ${n} beats @ 128 BPM`);
