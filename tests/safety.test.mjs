import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../teaser/src/safety.js';
import { cue, BEAT } from '../teaser/src/grid.js';

test('exactly 3 glitch events at 4.1, 5.1, 16.3', () => {
  assert.deepEqual(S.GLITCHES, [cue(4, 1), cue(5, 1), cue(16, 3)]);
  let events = 0, inside = false;
  for (let f = 0; f < 900; f++) {
    const u = (f + 0.5) / 30 / BEAT;
    const on = !!S.glitchAt(u) || (S.crtOffProgress(u) > 0 && S.crtOffProgress(u) < 1);
    if (on && !inside) events++;
    inside = on;
  }
  assert.equal(events, 3);
});

test('shakes: only on 8.1, 8.2, 8.3, 10.1 and ≤ 2% of the short side', () => {
  assert.deepEqual(S.SHAKES, [cue(8, 1), cue(8, 2), cue(8, 3), cue(10, 1)]);
  assert.ok(S.shakeAmp(1920, 1080) <= 0.02 * 1080);
  assert.ok(S.shakeAmp(1080, 1920) <= 0.02 * 1080);
});

test('pulses: ≤ 25% of the frame and ≤ 3 in any second', () => {
  for (const [w, h] of [[1920, 1080], [1080, 1920]]) {
    const r = S.pulseRadius(w, h);
    assert.ok((Math.PI * r * r) / (w * h) <= 0.25);
  }
  const ts = S.PULSES.map((u) => u * BEAT);
  for (const a of ts) assert.ok(ts.filter((b) => b >= a && b < a + 1).length <= 3);
  assert.equal(S.pulseAt(cue(8, 1)), 1);
  assert.equal(S.pulseAt(cue(8, 1) + S.PULSE_LEN), 0);
});

test('end card: grain frozen through the hold', () => {
  assert.deepEqual(S.END_HOLD, [cue(15, 1), cue(16, 3)]);
  assert.equal(S.grainFrozen(cue(15, 1)), true);
  assert.equal(S.grainFrozen(cue(14, 4.9)), false);
});

test('motion blur only on whips and the fly-through', () => {
  assert.equal(S.blurSamples(cue(4, 3)), 6);
  assert.equal(S.blurSamples(cue(3, 4)), 6);
  assert.equal(S.blurSamples(cue(2, 1)), 1);
  assert.equal(S.blurSamples(cue(15, 2)), 1);
});

test('CRT shutdown runs 16.3 → 16.4.5', () => {
  assert.equal(S.crtOffProgress(cue(16, 3)), 0);
  assert.equal(S.crtOffProgress(cue(16, 4.5)), 1);
});
