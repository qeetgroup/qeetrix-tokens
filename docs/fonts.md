# 🔤 Fonts

**The fonts come with the tokens.** `@import "@qeetrix/tokens/tokens.css"` declares **Qeet Sans** (Cal Sans,
variable: weight 400–700, optical size and the GEOM letter style) and **Fira Code** (weight
300–700). Each is declared as subsets (latin, latin-ext, other; Qeet Sans upright and italic apart),
each with the `unicode-range` of what it holds, so a browser downloads only the files for the
characters a page shows: about 89 KB of Qeet Sans for English text. There's nothing extra to load
or opt out of.

- **The files** are at `@qeetrix/tokens/fonts/*`, for `<link rel="preload">` (preload
  `QeetSans-latin.woff2`). `scripts/subset-fonts.py` cuts the subsets. The full variable fonts ship
  too: `QeetSans.woff2` and `FiraCode-VF.woff2`.
- **Android and iOS** load TrueType, not WOFF2: `fonts/QeetSans.ttf` (all six axes: opsz, GEOM,
  wght, YTAS, SHRP, ital) and `fonts/FiraCode-VF.ttf` (wght). `fonts/native.json` lists each one's
  axes, size and sha256, and the WOFF2 it was made from, so qeetrix-android and qeetrix-ios pin the
  same files. `scripts/native-fonts.py` writes them.
- **Licence:** both fonts are under the SIL Open Font Licence 1.1, shipped beside them
  (`fonts/*-OFL.txt`).
- **Build support:** Vite, Next.js, webpack and Tailwind v4 inside them (`@tailwindcss/vite`,
  `@tailwindcss/postcss`) rewrite the font URLs automatically. The standalone Tailwind CLI and bare
  postcss-import don't: serve `dist/fonts/` yourself there.

---

[← Qeetrix Tokens](../README.md)
