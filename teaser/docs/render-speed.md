# Render speed (spec §9.1)

- Date: 2026-11-13
- Machine: Windows 11, 2 CPU cores, Intel UHD Graphics 600
- `--gpu` WebGL renderer: ANGLE (Intel UHD Graphics 600, Direct3D11)
  - 60 frames (1920×1080, scene-4 weight, bloom, no blur, 2 workers): 48 s wall → **0.8 s/frame**
  - Full pass, both formats (1,800 frames): ≈ 24 min, plus motion-blur frames (Task 6: 6 samples on ≈ 90 frames per format)
- `--cpu` (SwiftShader): 265 s wall → 4.4 s/frame (≈ 2.2 h per full pass): not used
- Decision: **RENDER_HOST = workspace, always with `--gpu`** (every `render.mjs` command in later tasks adds `--gpu`).
- Bloom/shadow tweaks to `lib/gl.js` not needed.
