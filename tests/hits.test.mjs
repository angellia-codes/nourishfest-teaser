import test from 'node:test';
import assert from 'node:assert/strict';
import { HITS, RETRO, PALETTE } from '../teaser/src/hits.js';
import { GLITCHES } from '../teaser/src/safety.js';
import { cue } from '../teaser/src/grid.js';

test('hits are sorted and inside the film', () => {
  for (let i = 1; i < HITS.length; i++) assert.ok(HITS[i][0] >= HITS[i - 1][0], `unsorted at ${HITS[i][1]}`);
  for (const [u] of HITS) assert.ok(u >= 0 && u < 64);
});

test('every sfx name is in the motion-reel palette; every retro name is known', () => {
  for (const [, label, sfx, o] of HITS) {
    if (sfx) for (const n of sfx.split('+')) assert.ok(PALETTE.includes(n), `${label}: unknown sfx ${n}`);
    if (o?.retro) assert.ok(RETRO.includes(o.retro), `${label}: unknown retro ${o.retro}`);
  }
});

test('the spec cues are all present', () => {
  const at = (u, label) => assert.ok(HITS.some((h) => h[0] === u && h[1] === label), `missing ${label} @ ${u}`);
  at(cue(1, 3), 'POWER press'); at(cue(1, 3), 'CRT power-on'); at(cue(3, 1), 'PLAY press'); at(cue(3, 1), 'cassette PLAY');
  at(cue(4, 1), 'into the TV'); at(cue(8, 1), '3'); at(cue(8, 2), '2'); at(cue(8, 3), '1');
  at(cue(10, 1), 'NOURISHFEST drop'); at(cue(10, 3), '2026 stamp');
  at(cue(12, 1), 'info: date'); at(cue(12, 3), 'info: gates'); at(cue(13, 1), 'info: venue');
  at(cue(14, 3), 'whatsapp ping 1'); at(cue(16, 3), 'CRT power-off');
});

test('glitch sounds match the 3 glitch events', () => {
  const g = HITS.filter((h) => h[3]?.retro === 'glitch' || h[3]?.retro === 'crt_off').map((h) => h[0]);
  assert.deepEqual(g, GLITCHES);
});
