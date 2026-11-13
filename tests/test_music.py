import json
from pathlib import Path

import numpy as np
import soundfile as sf

F = Path(__file__).resolve().parent.parent / "teaser"
B = 60 / 128


def T(u):
    return u * B


def load():
    y, sr = sf.read(F / "audio/music.wav")
    return y, sr


def rms(y, sr, a, b):
    s = y[int(a * sr):int(b * sr)].mean(axis=1)
    return float(np.sqrt(np.mean(s ** 2)) + 1e-12)


def test_length_is_30s():
    y, sr = load()
    assert sr == 48000 and y.shape[1] == 2
    assert abs(len(y) / sr - 30.0) < 1 / 30


def test_grid_is_128_on_zero():
    g = json.loads((F / "beats.json").read_text())
    assert abs(g["bpm"] - 128) < 0.05
    assert abs(g["offset"]) < 0.005
    assert g["duration"] == 30.0
    assert [s["name"] for s in g["sections"]] == ["intro", "montage", "build", "drop", "outro", "shutdown"]


def test_half_beat_of_silence_before_the_drop():
    y, sr = load()
    assert rms(y, sr, T(35.5) + 0.01, T(36) - 0.005) < 0.002


def test_drop_hits_harder_than_build_and_intro():
    y, sr = load()
    drop = rms(y, sr, T(36), T(44))
    assert drop > 1.4 * rms(y, sr, T(24), T(32))
    assert rms(y, sr, 0, T(8)) < 0.6 * rms(y, sr, T(12), T(24))


def test_tape_stop_ends_in_silence():
    y, sr = load()
    assert rms(y, sr, 29.85, 30.0) < 0.002


def test_headroom():
    y, _ = load()
    assert np.abs(y).max() <= 10 ** (-2.9 / 20)
