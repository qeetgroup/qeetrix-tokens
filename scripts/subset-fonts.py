#!/usr/bin/env python3
"""
Cuts the web subsets of the two typefaces (QTRX-10): src/fonts/<Font>-<subset>.woff2 and
src/fonts/subsets.json, which scripts/build.mjs turns into @font-face rules with unicode-range.

Each font's characters are split three ways: latin (Basic Latin, Latin-1, general punctuation,
₹ € ™, the arrows and the keyboard symbols product copy uses: ⌘ ⌥ ⇧ ⌃ ⏎ ↵ ⌫ ⎋), latin-ext
(Latin Extended, combining marks, Vietnamese) and other (everything else the font has). Each
subset's unicode-range lists exactly the characters it holds, so a page downloads only the files
for the characters it shows, and no character pulls in the whole font. Qeet Sans keeps the axes
the type roles use (opsz, GEOM, wght), pins YTAS and SHRP to their defaults, and is cut once
upright and once italic (ital 0 and 1), so a page without italics never loads them.

The fonts are SIL OFL 1.1 with no reserved font name, so subsetting is permitted; the licences
ship beside them. Needs fontTools and brotli (pip install fonttools brotli). Run from the repo
root: python3 scripts/subset-fonts.py
"""
import json
import os
from io import BytesIO

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FONTS = os.path.join(os.path.dirname(__file__), "..", "src", "fonts")

LATIN = (
    list(range(0x0000, 0x0100))
    + [0x0131, 0x0152, 0x0153, 0x02BB, 0x02BC, 0x02C6, 0x02DA, 0x02DC, 0x0304, 0x0308, 0x0329]
    + list(range(0x2000, 0x2070))
    + [0x20AC, 0x20B9, 0x2122, 0x2212, 0x2215, 0xFEFF, 0xFFFD]
    + list(range(0x2190, 0x219A))
    + [0x21B5, 0x21E7, 0x2303, 0x2318, 0x2325, 0x232B, 0x238B, 0x23CE]
)
LATIN_EXT_RANGES = [
    (0x0100, 0x036F),
    (0x1D00, 0x1DBF),
    (0x1E00, 0x1EFF),
    (0x2C60, 0x2C7F),
    (0xA720, 0xA7FF),
    (0xFB00, 0xFB06),
]

# family, source file, output prefix, weight range, style, axes to pin (None: the default)
SOURCES = [
    ("Qeet Sans", "QeetSans.woff2", "QeetSans", "400 700", "normal",
     {"YTAS": None, "SHRP": None, "ital": 0}),
    ("Qeet Sans", "QeetSans.woff2", "QeetSans-Italic", "400 700", "italic",
     {"YTAS": None, "SHRP": None, "ital": 1}),
    ("Fira Code", "FiraCode-VF.woff2", "FiraCode", "300 700", "normal", {}),
]


def ranges(codepoints):
    """U+0000-00FF, U+0131 … from a sorted set of code points."""
    out, start, prev = [], None, None
    for cp in sorted(codepoints):
        if start is None:
            start = prev = cp
        elif cp == prev + 1:
            prev = cp
        else:
            out.append((start, prev))
            start = prev = cp
    if start is not None:
        out.append((start, prev))
    return ", ".join(f"U+{a:04X}" if a == b else f"U+{a:04X}-{b:04X}" for a, b in out)


def cut(font_bytes, codepoints):
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.glyph_names = False
    font = TTFont(BytesIO(font_bytes))
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    out = BytesIO()
    font.flavor = "woff2"
    font.save(out)
    return out.getvalue()


def main():
    manifest = []
    for family, source, prefix, weight, style, pins in SOURCES:
        font = TTFont(os.path.join(FONTS, source))
        if pins:
            defaults = {a.axisTag: a.defaultValue for a in font["fvar"].axes}
            font = instancer.instantiateVariableFont(
                font,
                {tag: defaults[tag] if value is None else value for tag, value in pins.items()},
                inplace=False,
            )
        buffer = BytesIO()
        font.flavor = None
        font.save(buffer)
        pinned = buffer.getvalue()
        have = set(font.getBestCmap())
        latin = have & set(LATIN)
        latin_ext = {
            cp for cp in have - latin if any(a <= cp <= b for a, b in LATIN_EXT_RANGES)
        }
        other = have - latin - latin_ext
        files = []
        for name, cps in (("latin", latin), ("latin-ext", latin_ext), ("other", other)):
            if not cps:
                continue
            file = f"{prefix}-{name}.woff2"
            data = cut(pinned, sorted(cps))
            with open(os.path.join(FONTS, file), "wb") as handle:
                handle.write(data)
            files.append({"subset": name, "file": file, "unicodeRange": ranges(cps), "bytes": len(data)})
            print(f"{file}: {len(cps)} characters, {len(data):,} bytes")
        manifest.append({"family": family, "weight": weight, "style": style, "files": files})
    with open(os.path.join(FONTS, "subsets.json"), "w") as handle:
        json.dump(manifest, handle, indent=2)
        handle.write("\n")


if __name__ == "__main__":
    main()
