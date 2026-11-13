import json
import re
import subprocess
from pathlib import Path

import numpy as np
import pytest

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out/teaser"
FILES = {"16x9": (OUT / "final.mp4", 1920, 1080), "9x16": (OUT / "final_9x16.mp4", 1080, 1920)}


def probe(f):
    r = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", str(f)],
                       capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def gray(f, w, h):
    sw, sh = (160, 90) if w > h else (90, 160)
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(f), "-vf", f"scale={sw}:{sh}:flags=area,format=gray", "-f", "rawvideo", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.uint8).reshape(-1, sh, sw).astype(np.float32) / 255.0


@pytest.mark.parametrize("fmt", FILES)
def test_container(fmt):
    f, w, h = FILES[fmt]
    p = probe(f)
    v = next(s for s in p["streams"] if s["codec_type"] == "video")
    a = next(s for s in p["streams"] if s["codec_type"] == "audio")
    assert (v["codec_name"], v["pix_fmt"], v["width"], v["height"]) == ("h264", "yuv420p", w, h)
    assert v["r_frame_rate"] == "30/1"
    assert abs(int(v["nb_read_frames"]) - 900) <= 1
    assert abs(float(v["duration"]) - 30.0) <= 1 / 30
    assert a["codec_name"] == "aac"
    assert f.stat().st_size <= 50 * 1024 * 1024
    data = f.read_bytes()
    assert 0 <= data.find(b"moov") < data.find(b"mdat"), "not +faststart"


@pytest.mark.parametrize("fmt", FILES)
def test_loudness(fmt):
    r = subprocess.run(["ffmpeg", "-nostats", "-i", str(FILES[fmt][0]), "-filter_complex", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    s = r.stderr[r.stderr.rfind("Summary:"):]
    i = float(re.search(r"I:\s+(-?[\d.]+) LUFS", s).group(1))
    tp = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", s).group(1))
    assert abs(i + 14) <= 0.5, i
    assert tp <= -1.0, tp


@pytest.mark.parametrize("fmt", FILES)
def test_no_general_flashes(fmt):
    f, w, h = FILES[fmt]
    lum = gray(f, w, h) ** 2.2
    big = (np.abs(np.diff(lum, axis=0)) >= 0.1) & (np.minimum(lum[1:], lum[:-1]) < 0.8)
    flagged = big.mean(axis=(1, 2)) > 0.25
    worst = max(int(flagged[i:i + 30].sum()) for i in range(len(flagged) - 29))
    assert worst <= 6, f"{worst} large-area luminance transitions within one second (> 3 flashes)"
    assert (lum > 0.8).mean(axis=(1, 2)).max() < 0.25, "a frame is more than 25% near-white"


@pytest.mark.parametrize("fmt", FILES)
def test_end_card_holds_still(fmt):
    f, w, h = FILES[fmt]
    g = gray(f, w, h)
    a, b = int(np.ceil(26.25 * 30)) + 1, int(29.0625 * 30) - 1
    diffs = np.abs(np.diff(g[a:b + 1], axis=0)).mean(axis=(1, 2)) * 255
    assert diffs.max() < 1.0, f"end card moves: max mean diff {diffs.max():.2f}"


def test_every_hit_has_its_sound():
    r = subprocess.run(["node", "scripts/reel.mjs", "sync.py", "teaser"], cwd=ROOT, capture_output=True, text=True, check=True)
    m = re.search(r"(\d+)/(\d+) hits within 20 ms", r.stdout)
    assert m and m.group(1) == m.group(2), r.stdout[-400:]
