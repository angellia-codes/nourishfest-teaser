// Every visual accent: [u, label, sfx, opts]. sfx = motion-reel palette name(s) or null (silent for
// sfx.mjs). opts.retro names a sound sfx_retro.mjs synthesizes. One list for picture and sound.
import { cue } from './grid.js';

export const PALETTE = ['pop', 'click', 'tick', 'thud', 'whoosh', 'riser', 'swell', 'crash', 'sub', 'impact', 'bell', 'coins', 'blip', 'tok', 'boing', 'type'];
export const RETRO = ['crt_on', 'static', 'tape_play', 'glitch', 'crt_off'];

export const HITS = [
  [cue(1, 3), 'POWER press', 'click', { gain: 0.35 }],
  [cue(1, 3), 'CRT power-on', null, { retro: 'crt_on' }],
  [cue(1, 3.25), 'VHS static', null, { retro: 'static', len: 0.82 }],
  [cue(2, 1), 'theme on screen', null],
  [cue(3, 1), 'PLAY press', 'click', { gain: 0.35 }],
  [cue(3, 1), 'cassette PLAY', null, { retro: 'tape_play' }],
  [cue(4, 1), 'into the TV', 'riser+whoosh', { len: 0.94 }],
  [cue(4, 1), 'glitch 1', null, { retro: 'glitch' }],
  [cue(4, 3), 'whip: boombox', 'whoosh', { len: 0.4 }],
  [cue(5, 1), 'glitch 2: vinyl', null, { retro: 'glitch' }],
  [cue(5, 3), 'whip: headphones', 'whoosh', { len: 0.4, pan: 0.3 }],
  [cue(6, 1), 'whip: music-video set', 'whoosh', { len: 0.4, pan: -0.3 }],
  [cue(6, 3), 'pull back', 'whoosh', { len: 0.5, from: 2400, to: 500 }],
  [cue(7, 1), 'ARE', null],
  [cue(7, 2), 'YOU', null],
  [cue(7, 3), 'READY?', null],
  [cue(8, 1), '3', 'thud+sub', { pitch: 150, to: 60, len: 0.5 }],
  [cue(8, 2), '2', 'thud+sub', { pitch: 125, to: 50, len: 0.5 }],
  [cue(8, 3), '1', 'thud+sub', { pitch: 100, to: 40, len: 0.6 }],
  [cue(9, 1), 'YOU ARE INVITED TO', null],
  [cue(10, 1), 'NOURISHFEST drop', 'impact'],
  [cue(10, 3), '2026 stamp', 'thud', { pitch: 110, to: 55 }],
  [cue(12, 1), 'info: date', 'click'],
  [cue(12, 3), 'info: gates', 'click'],
  [cue(13, 1), 'info: venue', 'click'],
  [cue(14, 1), 'save the date', null],
  [cue(14, 3), 'whatsapp ping 1', 'blip', { pitch: 'E6' }],
  [cue(14, 3.25), 'whatsapp ping 2', 'blip', { pitch: 'A6' }],
  [cue(15, 1), 'end card', null],
  [cue(16, 3), 'CRT power-off', null, { retro: 'crt_off' }],
];
