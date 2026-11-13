import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENT, COPY, dateLine, SAFE, MIN_TEXT, TYPE, DURATION, FPS } from '../teaser/src/config.js';
import { BEAT, BAR, BARS, FRAMES, cue, secs, frameOf, SCENES } from '../teaser/src/grid.js';

test('date line is derived and correct', () => {
  assert.equal(dateLine('2026-12-08'), 'TUE · 8 DEC 2026');
  assert.equal(EVENT.gates, '16:00');
});

test('copy matches the spec', () => {
  assert.equal(COPY.infoDate, 'DATE: TUE · 8 DEC 2026');
  assert.equal(COPY.infoGates, 'GATES: 16:00 WITA');
  assert.equal(COPY.infoVenue, 'VENUE: JIMBARAN BAY BEACH');
  assert.equal(COPY.endInfo, 'TUE · 8 DEC 2026 · 16:00 WITA · JIMBARAN BAY BEACH');
  assert.deepEqual(COPY.endInfoLines, ['TUE · 8 DEC 2026 · 16:00 WITA', 'JIMBARAN BAY BEACH']);
  assert.equal(COPY.themeLine, 'RETRO REWIND: BACK TO THE 90s');
  assert.equal(COPY.waLine, 'YOUR PASS ARRIVES ON WHATSAPP');
  assert.equal(COPY.tapeLabel, 'SIDE A · NOURISHFEST');
  assert.deepEqual(COPY.count, ['3', '2', '1']);
  assert.ok(Object.isFrozen(COPY));
});

test('no superseded or forbidden wording', () => {
  const all = JSON.stringify(COPY);
  for (const bad of [/HIP-?HOP/i, /NO URISH/i, /IN WHATSAPP/i, /10 DE[CS]/i, /17:00/, /8\.12|08\/12/]) assert.doesNotMatch(all, bad);
});

test('grid: 16 bars of 128 BPM are exactly 30 s / 900 frames', () => {
  assert.equal(BEAT, 0.46875);
  assert.equal(BAR, 1.875);
  assert.equal(BARS * BAR, DURATION);
  assert.equal(FRAMES, 900);
  assert.equal(FPS, 30);
});

test('cue maps bar.beat to beats and seconds', () => {
  assert.equal(cue(1), 0);
  assert.equal(cue(1, 3), 2);
  assert.equal(cue(9, 4.5), 35.5);
  assert.equal(secs(cue(10, 1)), 16.875);
  assert.equal(secs(cue(16, 3)), 29.0625);
  assert.equal(frameOf(cue(10, 1)), 506);
});

test('scenes tile the film', () => {
  const r = Object.values(SCENES);
  assert.equal(r[0][0], 0);
  for (let i = 1; i < r.length; i++) assert.equal(r[i][0], r[i - 1][1]);
  assert.equal(r.at(-1)[1], 64);
});

test('safe areas and type sizes', () => {
  assert.deepEqual(SAFE['16x9'], { x: 96, y: 54, w: 1728, h: 972 });
  assert.deepEqual(SAFE['9x16'], { x: 80, y: 260, w: 920, h: 1320 });
  for (const fmt of ['16x9', '9x16']) {
    for (const [k, v] of Object.entries(TYPE[fmt])) assert.ok(v >= MIN_TEXT[fmt], `${fmt} ${k} ${v}px < ${MIN_TEXT[fmt]}`);
  }
});
