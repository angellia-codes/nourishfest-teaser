# /// script
# requires-python = ">=3.10"
# dependencies = ["librosa>=0.10", "numpy", "scipy", "soundfile"]
# ///
"""NourishFest teaser score: original big beat, 128 BPM, 16 bars = 30.0 s, E minor (spec §8.1).

    MOTION_REEL_SKILL=$(scripts/reel.sh path) uv run teaser/audio/bigbeat.py

Writes teaser/audio/music.wav and teaser/beats.json. The grid is measured on a guide click (every
beat, never mixed) so the intro and the drum-less build cannot pull it off.
"""
import json
import os
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

if not os.environ.get("MOTION_REEL_SKILL"):
    sys.exit("set MOTION_REEL_SKILL: MOTION_REEL_SKILL=$(scripts/reel.sh path) uv run teaser/audio/bigbeat.py")
sys.path.insert(0, str(Path(os.environ["MOTION_REEL_SKILL"]) / "scripts"))
import dsp  # noqa: E402
from dsp import (SR, Bus, adsr, clap, crash, filt, hat, hz, kick, measure_beats, pad_chord,  # noqa: E402
                 pluck, reverb, riser, saw, sub_drop, sweep_filter, tvec)

HERE = Path(__file__).resolve().parent
FILM = HERE.parent
BPM, BARS, DUR = 128, 16, 30.0
BEAT = 60 / BPM
STEP = BEAT / 4
N = int(round(SR * DUR))
dsp.seed(20261208)


def U(bar, beat=1.0):
    return (bar - 1) * 4 + (beat - 1)


# ---------------------------------------------------------------- instruments

def snare(gain=1.0):
    n = int(0.25 * SR)
    t = tvec(n)
    body = np.sin(2 * np.pi * np.cumsum(185 + 70 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.05)
    noise = filt(dsp.rng.standard_normal(n), "bandpass", [1500, 9000]) * np.exp(-t / 0.07)
    return np.tanh(1.6 * (0.6 * body + 0.9 * noise)) * gain


def acid(note, length, cut0, cut1, q=6.0):
    n = int(length * SR)
    p = np.linspace(0, 1, n)
    x = sweep_filter(saw(hz(note), n), cut0 * (cut1 / cut0) ** p, "lowpass", q)
    return np.tanh(2.2 * x) * adsr(n, 0.003, 0.08, 0.6, 0.02)


def sub(note, length):
    n = int(length * SR)
    t = tvec(n)
    return np.sin(2 * np.pi * hz(note) * t) * adsr(n, 0.004, 0.2, 0.8, 0.03)


def hum(length):
    n = int(length * SR)
    t = tvec(n)
    x = sum(np.sin(2 * np.pi * f * t) / k for k, f in enumerate((50, 100, 150, 250), start=1))
    return x * np.minimum(1, t / 0.4) * np.minimum(1, (length - t) / 0.2)


# ---------------------------------------------------------------- patterns (16 steps a bar)

KICK_A = {0: 1.0, 10: 0.9}
KICK_B = {0: 1.0, 3: 0.6, 10: 0.9}
SNARE = {4: 1.0, 12: 1.0}
GHOST = {7: 0.3, 15: 0.35, 9: 0.2}
ACID = ["E2", None, "E2", "G2", None, "E2", "B2", None, "E2", None, "D3", "E2", None, "G2", "E2", None]


def play_break(bus, bar, gain=1.0, ghosts=True):
    u0 = U(bar)
    kicks = KICK_B if bar % 2 == 0 else KICK_A
    for s, g in kicks.items():
        bus.add(kick(), u0 + s / 4, 0.95 * g * gain)
    for s, g in SNARE.items():
        bus.add(snare(), u0 + s / 4, 0.7 * g * gain, pan=0.05)
        bus.add(clap(tight=True), u0 + s / 4, 0.25 * gain, pan=-0.05)
    if ghosts:
        for s, g in GHOST.items():
            bus.add(snare(), u0 + s / 4, 0.7 * g * gain, pan=0.1)
    for s in range(0, 16, 2):
        bus.add(hat(open_=(s == 14)), u0 + s / 4, (0.22 if s % 4 else 0.3) * gain, pan=0.25)
    for s in (5, 13):
        bus.add(hat(), u0 + s / 4, 0.12 * gain, pan=0.3)


def play_acid(bus, bar, cut1, gain=1.0, q=6.0):
    u0 = U(bar)
    for s, note in enumerate(ACID):
        if note:
            bus.add(acid(note, STEP * 0.95, 250, cut1, q), u0 + s / 4, 0.45 * gain)


def main():
    drums, bass, music, intro, guide = (Bus(DUR, BPM) for _ in range(5))

    # bars 1-3: intro — hum, filtered break, one pulsing acid note
    music.add(np.stack([hum(U(4) * BEAT)] * 2), 0, 0.05)
    for bar in (1, 2, 3):
        play_break(intro, bar, 0.5, ghosts=False)
        for b in range(4):
            bass.add(acid("E2", BEAT * 0.5, 200, 500 + 300 * (bar - 1), 5.0), U(bar, b + 1), 0.25)

    # bars 4-6: montage — full break, acid line, stabs on the shot cuts
    for bar in (4, 5, 6):
        play_break(drums, bar)
        play_acid(bass, bar, 900 + 500 * (bar - 4))
    for cut in (U(4, 1), U(4, 3), U(5, 1), U(5, 3), U(6, 1), U(6, 3)):
        music.add(pad_chord(["E4", "G4", "B4"], 0.22, (5000, 1200), attack=0.002, release=0.08), cut, 0.5)

    # bars 7-9: build — drums out, snare roll speeding up, riser into silence at 9.4.5
    roll = [(U(7) + i, 0.35) for i in range(4)] + [(U(8) + i / 2, 0.5) for i in range(8)] \
        + [(U(9) + i / 4, 0.6 + 0.03 * i) for i in range(14)]
    for u, g in roll:
        drums.add(snare(), u, g)
    music.add(riser(U(9, 4.5) * BEAT - U(7) * BEAT), U(7), 0.55)
    music.add(pad_chord(["E3", "B3", "E4", "G4"], (U(9, 4.5) - U(7)) * BEAT, (300, 2400), attack=1.2, release=0.05), U(7), 0.35)

    # bar 10.1: the drop
    drums.add(sub_drop(1.2, 80, 30), U(10), 0.9)
    drums.add(crash(1.8), U(10), 0.35)
    for bar in (10, 11, 12, 13):
        play_break(drums, bar, 1.1)
        play_acid(bass, bar, 2600, 1.1, q=8.0)
        for b in range(4):
            bass.add(sub("E1", BEAT * 0.9), U(bar, b + 1), 0.35)
    for u in (U(10), U(12, 1), U(12, 3), U(13, 1)):
        music.add(pad_chord(["E4", "G4", "B4", "D5"], 0.3, (6000, 1500), attack=0.002, release=0.1), u, 0.55)

    # bars 14-15 (+ 16.1-16.2): outro — thinner break, hook under the end card
    for bar in (14, 15, 16):
        u0 = U(bar)
        last = 8 if bar == 16 else 16
        for s in range(0, last):
            if s in (0, 8):
                drums.add(kick(), u0 + s / 4, 0.8)
            if s in (4, 12):
                drums.add(snare(), u0 + s / 4, 0.45)
            if s % 2 == 0:
                drums.add(hat(), u0 + s / 4, 0.18, pan=0.25)
    hook = [(U(14, 1), "B4"), (U(14, 2), "G4"), (U(14, 3), "E4"), (U(15, 1), "D5"), (U(15, 2), "B4"),
            (U(15, 3), "G4"), (U(15, 3.5), "E4"), (U(16, 1), "E4")]
    for u, note in hook:
        music.add(pluck([note], 0.35, 3800), u, 0.5, pan=-0.15)

    # guide click on every beat (grid measurement only)
    for b in range(BARS * 4 + 1):
        guide.add(kick(), b, 1.0)

    # mix
    intro_mono = intro.x[:, :N]
    fc = np.where(tvec(N) < U(3) * BEAT, 350.0, 350.0 * (12 ** np.clip((tvec(N) - U(3) * BEAT) / (BEAT * 4), 0, 1)))
    intro_f = np.stack([sweep_filter(intro_mono[c], fc, "lowpass", 0.9) for c in range(2)])
    mix = drums.x[:, :N] + intro_f + bass.x[:, :N] * 0.9 + reverb(music.x, 0.3)[:, :N]

    # hard silence 9.4.5 -> 10.1 (the gap before the drop)
    a, b = int(U(9, 4.5) * BEAT * SR), int(U(10) * BEAT * SR)
    mix[:, a:b] = 0.0

    # tape stop from 16.3: playback rate falls 1 -> 0 over 0.7 s, then silence
    t0 = U(16, 3) * BEAT
    i0 = int(t0 * SR)
    ramp = 0.7
    tau = tvec(N - i0)
    rate = np.clip(1 - tau / ramp, 0, 1) ** 1.5
    pos = i0 + np.cumsum(rate)
    for c in range(2):
        src = mix[c].copy()
        mix[c, i0:] = np.interp(pos, np.arange(N), src) * (rate > 0)

    mix *= 10 ** (-3 / 20) / (np.abs(mix).max() + 1e-9)

    grid = measure_beats(guide.x[:, :N].mean(axis=0).astype(np.float32), SR, BPM, n_beats=BARS * 4 + 1)
    if abs(grid["bpm"] - BPM) > 0.05 or abs(grid["offset"]) > 0.005:
        sys.exit(f"grid off: {grid['bpm']} bpm, offset {grid['offset']} s")
    grid["beats"] = [b for b in grid["beats"] if b < DUR + 0.5]
    grid["downbeats"] = [b for i, b in enumerate(grid["beats"]) if i % 4 == 0]
    grid["sections"] = [{"name": n, "beat": U(*bb)} for n, bb in
                        (("intro", (1,)), ("montage", (4,)), ("build", (7,)), ("drop", (10,)), ("outro", (14,)), ("shutdown", (16, 3)))]
    mono = mix.mean(axis=0)
    bar_n = int(BEAT * 4 * SR)
    grid["bar_energy"] = [round(float(np.sqrt(np.mean(mono[i * bar_n:(i + 1) * bar_n] ** 2) + 1e-12)), 4) for i in range(BARS)]
    grid["duration"] = DUR
    grid["source"] = "bigbeat.py: original big beat, E minor, 128 BPM; grid measured on a guide click"

    sf.write(HERE / "music.wav", mix.T, SR, subtype="PCM_24")
    (FILM / "beats.json").write_text(json.dumps(grid, indent=1))
    print(f"grid {grid['bpm']} bpm, offset {grid['offset'] * 1000:.2f} ms, rms {grid['fit_residual_ms']} ms")
    print("bar energy:", grid["bar_energy"])
    print(f"-> {HERE / 'music.wav'}, {FILM / 'beats.json'}")


if __name__ == "__main__":
    main()
