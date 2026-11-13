# Critique log (motion-reel critique-pass; scores 1-10)

## Round 1 — 2026-11-13 (16:9 sheets, strips, sync)
| hook | read | motion | variety | brand | sync | min |
|---|---|---|---|---|---|---|
| 6 | 7 | 8 | 8 | 7 | 9 | 6 |

Worst three:
1. [beats 36-51, 16x9] Orbiting vinyl/cassettes pass in front of NOURISHFEST and hide letters (beat 38, 45: "NOURIS…T") -> the brand name is the payoff of the film -> `s4.js update()`: orbit z is now `-0.8 - |sin| * R * 0.6`, so props circle behind the title plane. FIXED
2. [beats 0-4, 16x9] Frame 0 to 1.3 s is a dark, static TV with a black screen -> weak thumb-stop -> `s1.js update()`: pink/green room lights breathe on the beat (±35%, alternating, far under the flash limits); opening camera frames tighter with the antenna in shot (z0 13 → 11.6, look-at lifted 0.8 until the push). FIXED
3. [beats 4-11, 16x9 phone] TV screen occupies ~15% of the frame; "BACK TO THE 90s" is small on the phone sheet -> same tighter framing as 2 (TV now ~25% wider). FIXED

Checks failed: none of the hard limits. Open: yellow bloom hot spot on a bouncing prop behind the title at beats 43-47 (watch next round); 9:16 sheets not yet reviewed (round 2).
Sync: 30/30 hits within 20 ms (VHS static given a sharp onset); master -14.1 LUFS, -1.1 dBTP.
Verdict: ANOTHER ROUND

## Round 2 — 2026-11-13 (adds the 9:16 sheets)
| hook | read | motion | variety | brand | sync | min |
|---|---|---|---|---|---|---|
| 7 | 7 | 8 | 7 | 8 | 9 | 7 |

Worst three:
1. [beats 0-11, 9x16 phone] The TV is ~45% of the frame width; "BACK TO THE 90s" tiny on the phone page -> `s1.js camPose()`: portrait z0 13 → 10.6, z1 9.5 → 7.8 (screen text now ≈ 2× larger). FIXED
2. [beats 44-45, 9x16 + 16x9] The info panel appears while the title is still rising, hiding "2026" for ~0.4 s -> `s4.js update()`: rise spring starts at RISE − 0.6 beats so the title is already up. FIXED
3. [beats 36-51, both] Four bars of one static title + orbit; yellow bloom hot spot behind the title -> `s4.js`: camera arc now also climbs (y 0.6 → 1.9), bloom threshold 0.92 → 1.0. FIXED (hot spot still faint on one frame, see round 3)

Checks failed: none of the hard limits. Frame 0 still a dark TV -> LED + beat-lit room added (round 3).
Verdict: ANOTHER ROUND

## Round 3 — 2026-11-13 (both formats: contact, phone pages, strips at 4.9, 13.0, 16.7, 26.0, 28.9; sync)
| hook | read | motion | variety | brand | sync | min |
|---|---|---|---|---|---|---|
| 7 | 8 | 8 | 8 | 8 | 9 | 7 |

Worst three:
1. [beats 0-4, both] Frame 0 is still a dark TV with a black screen; the only motion before POWER (beat 3) is the push-in and the remote -> thumb-stop is the weakest part of the film -> `s1.js update()`: neon now switches on pink at beat 1 and green at beat 2 (ramp, no flash) and a standby LED pulses on the beat (red, green after POWER). PARTLY FIXED: the spec's "dark room, slow push-in" opening limits how loud this can be; scored 7, flagged for Angel's look review.
2. [beats 56-62, both phone] End-card info and theme lines read small on the phone page -> `config.js TYPE`: endTheme 44/46 → 50/52, endInfo 44/46 → 52/52, tagline2 42/44 → 48/50 (still inside the safe areas, checked on stills). FIXED
3. [beats 36-38, 16x9] The shockwave ring reads as a thin line through the title right after the drop -> `s4.js`: ring thicker (1.12) and fades with (1−w)². FIXED

Checks failed: none of the hard limits (copy = config.js; text inside safe areas; no full-screen flash; 3 glitch events; end card unchanged 26.25 → 29.06 s: max channel delta 2/255, 0.00% pixels > 8).
Known soft spot: a faint warm bloom blob behind the title on a few 16:9 frames (beats 43-47), a prop reflecting the gold light; not removed (bloom threshold 1.0 did not take it out).
Sync: 30/30 hits within 20 ms (median 1.4 ms); master -14.1 LUFS, -1.1 dBTP.
Verdict: ANOTHER ROUND would be needed to reach hook ≥ 8; recorded as READY FOR LOOK REVIEW (hook 7 is an open item, not an ≥8 pass).
