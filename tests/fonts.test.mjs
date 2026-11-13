import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const DIR = new URL('../teaser/fonts/', import.meta.url);
const FILES = ['bungee-400', 'anton-400', 'oswald-400', 'oswald-600'];
// characters each face must draw (roles from the spec: Bungee display, Anton headlines, Oswald labels)
const NEED = {
  'bungee-400': 'RETRO REWIND NOURISHFEST 2026 321',
  'anton-400': 'ARE YOU READY? INVITED TO SAVE THE DATE BACK 90s MOVE IN UNITY. PASS ARRIVES ON WHATSAPP TUE·8 DEC 2026 16:00 WITA JIMBARAN BAY BEACH',
  'oswald-400': 'Together, We Make a Difference',
  'oswald-600': 'CH 03 PLAY SIDE A · NOURISHFEST DATE: GATES: VENUE: TUE · 8 DEC 2026 · 16:00 WITA JIMBARAN BAY BEACH RETRO REWIND: BACK TO THE 90s',
};
const ttf = (f) => fileURLToPath(new URL(`${f}.ttf`, DIR));

for (const f of FILES) {
  test(`${f}: woff2 and ttf exist`, () => {
    assert.ok(fs.existsSync(new URL(`${f}.woff2`, DIR)));
    assert.ok(fs.existsSync(new URL(`${f}.ttf`, DIR)));
  });
  test(`${f}: has every glyph it is used for`, () => {
    const font = opentype.loadSync(ttf(f));
    const missing = [...new Set(NEED[f].replace(/ /g, ''))].filter((ch) => font.charToGlyphIndex(ch) === 0);
    assert.deepEqual(missing, []);
  });
}

test('the play triangle is drawn, not typed', () => {
  const font = opentype.loadSync(ttf('oswald-600'));
  assert.equal(font.charToGlyphIndex('▶'), 0, 'Oswald has no ▶: overlay.drawPlay draws it');
});
