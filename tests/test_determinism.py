import shutil
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STILLS = ROOT / "out/teaser/stills"
TIMES = ["5.000", "12.400", "20.100", "27.000"]


def render(order, dest):
    subprocess.run(["node", "scripts/reel.mjs", "render.mjs", "--film", "teaser", "--fps", "30", "--workers", "2", "--gpu", "--at", ",".join(order)],
                   cwd=ROOT, check=True, capture_output=True)
    dest.mkdir(parents=True)
    for t in TIMES:
        shutil.copy(STILLS / f"t{t}.png", dest / f"t{t}.png")


def test_frames_rendered_out_of_order_match(tmp_path):
    render(TIMES, tmp_path / "a")
    render(TIMES[::-1], tmp_path / "b")
    for t in TIMES:
        a = np.asarray(Image.open(tmp_path / "a" / f"t{t}.png").convert("RGB"), np.int16)
        b = np.asarray(Image.open(tmp_path / "b" / f"t{t}.png").convert("RGB"), np.int16)
        bad = (np.abs(a - b) > 8).any(axis=2).mean()
        assert bad <= 0.0005, f"{t} s: {bad:.4%} of pixels differ"
