#!/usr/bin/env python3
"""
Writes the native fonts (QTRX-91): src/fonts/QeetSans.ttf and src/fonts/FiraCode-VF.ttf, the full
variable fonts as TrueType, for Android (res/font, Compose FontFamily) and iOS (Core Text), which
load TTF or OTF but not WOFF2; and src/fonts/native.json, each file's axes, size and sha256, with
the sha256 of the WOFF2 it came from and the fontTools that made it.

Both fonts have TrueType outlines, so this is fontTools' WOFF2 decompression: it rebuilds the
tables the web file packs, keeps every axis and glyph, and writes the same bytes on every run with
the same fontTools. qeetrix-android and qeetrix-ios pin these files by their sha256, as they pin
the tokens, so neither converts the web files itself. tests/package.test.ts fails when a WOFF2
changes and this hasn't been run again.

The fonts are SIL OFL 1.1 with no reserved font name; the licences ship beside them. Needs
fontTools and brotli (pip install fonttools brotli). Run from the repo root:
python3 scripts/native-fonts.py
"""
import hashlib
import json
import os

import fontTools
from fontTools.ttLib import TTFont, woff2

FONTS = os.path.join(os.path.dirname(__file__), "..", "src", "fonts")

# family, the variable WOFF2 the web ships, the TTF written beside it, its licence
SOURCES = [
    ("Qeet Sans", "QeetSans.woff2", "QeetSans.ttf", "QeetSans-OFL.txt"),
    ("Fira Code", "FiraCode-VF.woff2", "FiraCode-VF.ttf", "FiraCode-OFL.txt"),
]


def sha256(path):
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def main():
    fonts = []
    for family, source, file, licence in SOURCES:
        target = os.path.join(FONTS, file)
        woff2.decompress(os.path.join(FONTS, source), target)
        axes = [
            {"tag": a.axisTag, "min": a.minValue, "default": a.defaultValue, "max": a.maxValue}
            for a in TTFont(target)["fvar"].axes
        ]
        fonts.append(
            {
                "family": family,
                "file": file,
                "format": "truetype",
                "axes": axes,
                "bytes": os.path.getsize(target),
                "sha256": sha256(target),
                "licence": licence,
                "from": {"file": source, "sha256": sha256(os.path.join(FONTS, source))},
            }
        )
        print(f"{file}: {len(axes)} axes, {os.path.getsize(target):,} bytes")
    with open(os.path.join(FONTS, "native.json"), "w") as handle:
        json.dump({"fontTools": fontTools.version, "fonts": fonts}, handle, indent=2)
        handle.write("\n")


if __name__ == "__main__":
    main()
