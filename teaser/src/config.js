// All data for the teaser: event facts, copy (spec §3), brand tokens, safe areas, type sizes.
// Pure module (no DOM): imported by the film and by node tests.
export const SEED = 20261208;
export const BPM = 128, BARS = 16, FPS = 30, DURATION = 30;

export const EVENT = Object.freeze({ date: '2026-12-08', gates: '16:00', tz: 'WITA', venue: 'JIMBARAN BAY BEACH' });

export const C = Object.freeze({
  black: '#0D0D0D', gold: '#D4AF37', pink: '#FF1B6B', green: '#39FF14',
  text: '#F5F5F0', soft: '#BDBDB6', card: '#141414', line: '#2A2A28',
  raster: '#6F81A0', screenBg: '#0A0F1C',
});
export const FONTS = Object.freeze({ display: 'Bungee', head: 'Anton', label: 'Oswald' });

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export function dateLine(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${DAYS[d.getUTCDay()]} · ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const DATE = dateLine(EVENT.date);
const GATES = `${EVENT.gates} ${EVENT.tz}`;

export const COPY = Object.freeze({
  osdChannel: 'CH 03',
  osdPlay: 'PLAY',                       // drawn after a triangle: "▶ PLAY"
  theme1: 'RETRO REWIND',
  theme2: 'BACK TO THE 90s',
  themeLine: 'RETRO REWIND: BACK TO THE 90s',
  tapeLabel: 'SIDE A · NOURISHFEST',
  ready: Object.freeze(['ARE', 'YOU', 'READY?']),
  count: Object.freeze(['3', '2', '1']),
  invited: 'YOU ARE INVITED TO',
  invitedStack: Object.freeze(['YOU ARE', 'INVITED TO']),
  wordmark: 'NOURISHFEST',
  wordmarkStack: Object.freeze(['NOURISH', 'FEST']),
  year: '2026',
  info: Object.freeze([['DATE', DATE], ['GATES', GATES], ['VENUE', EVENT.venue]].map(Object.freeze)),
  infoDate: `DATE: ${DATE}`,
  infoGates: `GATES: ${GATES}`,
  infoVenue: `VENUE: ${EVENT.venue}`,
  saveDate: 'SAVE THE DATE',
  waLine: 'YOUR PASS ARRIVES ON WHATSAPP',
  endInfo: `${DATE} · ${GATES} · ${EVENT.venue}`,
  endInfoLines: Object.freeze([`${DATE} · ${GATES}`, EVENT.venue]),
  tagline1: 'MOVE IN UNITY.',
  tagline2: 'Together, We Make a Difference',
});

export const SAFE = Object.freeze({
  '16x9': Object.freeze({ x: 96, y: 54, w: 1728, h: 972 }),
  '9x16': Object.freeze({ x: 80, y: 260, w: 920, h: 1320 }),
});
export const MIN_TEXT = Object.freeze({ '16x9': 40, '9x16': 44 });
// Font sizes (px) for every readable 2-D string. 3-D type is sized in world units per scene.
export const TYPE = Object.freeze({
  '16x9': Object.freeze({ infoLabel: 40, infoValue: 68, wa: 60, endWordmark: 200, endYear: 96, endTheme: 50, endInfo: 52, tagline1: 64, tagline2: 48, osd: 40 }),
  '9x16': Object.freeze({ infoLabel: 44, infoValue: 64, wa: 56, endWordmark: 190, endYear: 110, endTheme: 52, endInfo: 52, tagline1: 64, tagline2: 50, osd: 44 }),
});
