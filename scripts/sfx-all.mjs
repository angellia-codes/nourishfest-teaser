// palette SFX (motion-reel sfx.mjs) + retro SFX (sfx_retro.mjs) → <film>/audio/sfx.wav, which mix.mjs reads
//   node scripts/sfx-all.mjs [film]
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const F = process.argv[2] || 'teaser';
const run = (cmd, args) => { const r = spawnSync(cmd, args, { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status ?? 1); };
run(process.execPath, ['scripts/reel.mjs', 'sfx.mjs', F]);                 // also refreshes out/<film>/hits.json
fs.renameSync(`${F}/audio/sfx.wav`, `${F}/audio/sfx_palette.wav`);
run(process.execPath, [`${F}/audio/sfx_retro.mjs`, F]);
run('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${F}/audio/sfx_palette.wav`, '-i', `${F}/audio/sfx_retro.wav`,
  '-filter_complex', '[0:a][1:a]amix=inputs=2:normalize=0:duration=longest[a]', '-map', '[a]', '-ar', '48000', '-c:a', 'pcm_s24le', `${F}/audio/sfx.wav`]);
console.log(`-> ${F}/audio/sfx.wav`);
