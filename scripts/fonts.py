# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools", "brotli"]
# ///
"""Brand fonts from @fontsource into teaser/fonts: woff2 for the 2-D canvas, TTF for 3-D type and glyph checks."""
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
NM = ROOT / "node_modules/@fontsource"
OUT = ROOT / "teaser/fonts"
SRC = {
    "bungee-400": NM / "bungee/files/bungee-latin-400-normal.woff2",
    "anton-400": NM / "anton/files/anton-latin-400-normal.woff2",
    "oswald-400": NM / "oswald/files/oswald-latin-400-normal.woff2",
    "oswald-600": NM / "oswald/files/oswald-latin-600-normal.woff2",
}
OUT.mkdir(parents=True, exist_ok=True)
for name, src in SRC.items():
    (OUT / f"{name}.woff2").write_bytes(src.read_bytes())
    font = TTFont(str(src))
    font.flavor = None
    font.save(str(OUT / f"{name}.ttf"))
    print(f"{name}: woff2 + ttf")
