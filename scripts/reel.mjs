// node scripts/reel.mjs <script> [args]   run a motion-reel script from the project root
// node scripts/reel.mjs path              print the skill folder
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function findSkill() {
  if (process.env.MOTION_REEL_SKILL) return process.env.MOTION_REEL_SKILL;
  const base = path.join(os.homedir(), '.claude', 'plugins', 'synced');
  const ls = (d) => { try { return fs.readdirSync(d); } catch { return []; } };
  for (const a of ls(base)) for (const b of ls(path.join(base, a))) {
    const d = path.join(base, a, b, 'skills', 'motion-reel');
    if (fs.existsSync(d)) return d;
  }
  return null;
}
const skill = findSkill();
if (!skill) { console.error('motion-reel skill not found: set MOTION_REEL_SKILL'); process.exit(1); }
const [s, ...args] = process.argv.slice(2);
if (s === 'path') { console.log(skill); process.exit(0); }
const env = { ...process.env, MOTION_REEL_SKILL: skill };
const file = path.join(skill, 'scripts', s);
const r = s.endsWith('.py')
  ? spawnSync('uv', ['run', file, ...args], { stdio: 'inherit', env })
  : spawnSync(process.execPath, [file, ...args], { stdio: 'inherit', env });
process.exit(r.status ?? 1);
