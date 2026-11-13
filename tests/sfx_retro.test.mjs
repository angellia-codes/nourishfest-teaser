import test from 'node:test';
import assert from 'node:assert/strict';
import { SYNTH, render, SR } from '../teaser/audio/sfx_retro.mjs';
import { RETRO } from '../teaser/src/hits.js';

test('every retro name has a synth', () => {
  for (const r of RETRO) assert.equal(typeof SYNTH[r], 'function', r);
});

test('synths are finite, bounded and deterministic', () => {
  for (const r of RETRO) {
    const a = SYNTH[r]({ len: 0.8 }, 5), b = SYNTH[r]({ len: 0.8 }, 5);
    assert.ok(a.length > 0.15 * SR, `${r} too short`);
    assert.ok(a.every(Number.isFinite), `${r} not finite`);
    assert.ok(Math.max(...a.map(Math.abs)) <= 1.5, `${r} too hot`);
    assert.deepEqual(a, b);
  }
});

test('render places each sound at its hit time and nowhere else', () => {
  const { L, placed } = render([{ t: 1.0, label: 'g', opts: { retro: 'glitch' } }, { t: 0.5, label: 'silent' }], 2);
  assert.equal(placed.length, 1);
  assert.ok(L.slice(0, SR).every((v) => v === 0));
  assert.ok(L.slice(SR, SR + SR / 5).some((v) => v !== 0));
});
