# @qeetrix/tokens

## 0.0.12

For the native libraries (QTRX-91), found moving qeetrix-android and qeetrix-ios onto
`@qeetrix/react` 0.2.2, tokens 0.0.11 and icons 2.0.0. Nothing for the web changes.

### Added

- **The variable fonts as TrueType, for Android and iOS**, which load TTF or OTF but not WOFF2:
  `fonts/QeetSans.ttf` (1.19 MB, all six axes: opsz, GEOM, wght, YTAS, SHRP, ital) and
  `fonts/FiraCode-VF.ttf` (286 KB, wght 300–700). They're fontTools' decompression of the
  published `QeetSans.woff2` and `FiraCode-VF.woff2` (`scripts/native-fonts.py`): every glyph and
  axis kept, the same bytes on every run.
- **`fonts/native.json`**: each TTF's family, axes, size, sha256 and licence, the sha256 of the
  WOFF2 it came from, and the fontTools version. The native sync scripts pin these files by hash
  and stop converting the WOFF2 themselves. A test fails if a WOFF2 changes and the TTFs aren't
  written again.

## 0.0.11

Docs only: the README imports the stylesheet by its full path, `@qeetrix/tokens/tokens.css`
(QTRX-26). No token or file changes.

## 0.0.10

From the QTRX issues found on qeet.in, the new ui.qeet.in and the Qeet ID console.

### Migrating from 0.0.9

- **Breakpoints moved to their own sheet.** An app that uses `@media (--qx-viewport-*)` adds
  `@import "@qeetrix/tokens/custom-media.css";` where its CSS build transpiles custom media.
  Nothing else needs a change.

### Changed

- **The fonts load as subsets** (QTRX-10). Each face is cut into latin, latin-ext and other files
  (scripts/subset-fonts.py), each declared with the `unicode-range` of exactly the characters it
  holds, so a page downloads only what its text uses and no character falls through to a whole
  font. The upright Latin Qeet Sans is 89 KB (the full variable file is 290 KB); its italic is its
  own files, loaded only where italics show; YTAS and SHRP are pinned to their defaults, opsz,
  GEOM and wght kept. Fira Code's Latin is 44 KB (was 113 KB). The full variable files still ship
  in `fonts/` for other platforms; the latin cut includes ₹, €, the arrows and the keyboard
  symbols.
- **`tokens.css` is plain CSS** (QTRX-27): the `@custom-media` breakpoints are in
  `@qeetrix/tokens/custom-media.css`, an opt-in sheet, so Lightning CSS (Vite 8) and other
  pipelines accept `tokens.css` without warnings. The README shows the Vite setting.
- **Categorical data-viz colours** (QTRX-37): slots 4 and 5 (purple, pink) are ΔEok 0.21 apart in
  light and dark (were 0.15 and 0.10); every neighbour pair is at least 0.15 apart for normal
  vision and 0.08 under deuteranopia, protanopia and tritanopia, green and amber included. Light
  moves teal, purple, pink and green; dark moves all eight into OKLCH L 0.58–0.78 (amber 0.83;
  six slots were 0.70–0.88), still 3:1 or more on every surface. A test holds the neighbours to it.

## 0.0.9

- **New `size.icon.2xs`** (`--qx-size-icon-2xs`, `ICON_SIZE["2xs"]`): 12px, for marks inside 16–20px
  chips such as Badge and filter tags. Badge drew 12px icons from a number in its own CSS; it now
  has a token on the scale. The scale is 12 · 14 · 16 · 20 · 24.

## 0.0.8

Contrast fixes, found while building the Storybook on 0.0.7. Every pair below now has a test, and
each would have failed one before (except `code.string`, which passed with too little margin).

- **Dark danger red** (`primitive.color.red.400`, used only by the dark scheme): `#fc4351` →
  `#fe777c` (oklch 0.66 0.22 22 → 0.73 0.165 20). It sat only 0.025 lightness above red.500 and off
  the ramp's hue progression. `text.danger` reaches 5.89:1 on `bg.neutral.subtle` (was 4.39),
  5.30:1 on `bg.neutral.subtle-hover` (a highlighted destructive Menu item; was 3.94) and 4.57:1 on
  `bg.neutral.subtle-pressed` (was 3.40). `code.literal` reaches 5.89:1 on the code block panel
  (was 4.39). `icon.danger`, `dataviz.negative` and `dataviz.diverging.1` follow, and gain contrast.
- **Light status text moves one step darker**, except danger:
  - `text.success`: green.700 → green.800 (`#017e51` → `#016542`): 5.92:1 on
    `bg.neutral.subtle-hover` (was 4.27), 6.17:1 on `bg.selected` (was 4.45), 5.76:1 on
    `bg.selected-hover` (was 4.16), 6.28:1 on `bg.success.subtle` (was 4.53).
  - `text.warning`: amber.700 → amber.800 (`#8c6000` → `#734c01`): 6.16:1 on `bg.selected-hover`
    (was 4.49).
  - `text.info`: blue.700 → blue.800 (`#006db4` → `#065793`): 6.05:1 on `bg.selected-hover` (was
    4.39).
- **Light `text.brand`**: qeet.700 → qeet.800 (`#b73d10` → `#9b3314`): 5.47:1 on
  `bg.brand.subtle-pressed`, a ghost button pressed (was 4.26). `text.link` stays qeet.700.
- **Dark `text.brand`**: qeet.500 → qeet.400 (`#f26d0e` → `#ff9646`): 5.43:1 on
  `bg.neutral.subtle-pressed` (was 3.90) and 6.30:1 on `-hover` (was 4.53). `text.link` stays
  qeet.500, the identity orange.
- **Dark info blue** (`primitive.color.blue.400`): `#29a6fc` → `#2fa9ff` (oklch 0.7 0.163 245 →
  0.71 0.162 245). Dark `text.info` reaches 4.62:1 on `bg.neutral.subtle-pressed` (was 4.45).
  `icon.info`, `code.keyword` and dark `dataviz.sequential.6` / `diverging.7` follow, as does light
  `dataviz.sequential.4`; both sequential scales stay in order.
- **Light `code.string`**: green.700 → green.800 (`#017e51` → `#016542`), matching `text.success`
  again: 6.30:1 on the code block panel and `surface.sunken` (was 4.55).
- **Light status borders** move from the 300 steps to the 600 steps, as `border.danger` and the
  dark scheme already were: `border.success` `#8fe0b0` → `#029862`, `border.warning` `#e9c775` →
  `#a77601`, `border.info` `#97d3ff` → `#0186d5`. They reach at least 3.26:1 on every surface and on
  their own subtle fill (were 1.37–1.63). They are now the same in both schemes, so they leave the
  colour-scheme blocks of `tokens.css` and are declared once, in `:root`.
- **`brandTheme()`** also guarantees brand text and links 4.5:1, and icons, borders and the focus
  ring 3:1, on the brand's own tints (`bg.brand.subtle`, `bg.selected`): a brand Badge, a ghost
  button's hover, a link or focus ring in a selected row. Brand text also reaches 4.5:1 on the
  tints' hover and pressed states and on the neutral fills (`bg.neutral.subtle`, `-hover`,
  `-pressed`). For `brandTheme("#1a73e8")`, light `text.brand` goes from `#136ee3` to `#005ecb`
  (on `bg.brand.subtle` 4.18:1 → 5.28:1, on `-pressed` 3.63:1 → 4.59:1) and dark from `#2d83f9` to
  `#64a3ff` (4.60:1 on the pressed neutral fill). Links change less.
- **Tests:**
  - a matrix of status and brand text (danger, warning, success, info, brand) on every interaction
    fill — `bg.neutral.subtle`, `bg.selected` and `bg.brand.subtle`, each at rest, hovered and
    pressed where the state exists — read from the tokens, so a new state joins it by itself: 40
    pairs per scheme;
  - status text on `surface.overlay`; links on `bg.brand.subtle` and `bg.selected`;
  - the focus frame on `bg.selected`;
  - every status border on every surface and on its own subtle fill;
  - the code colours on the code block panel (`bg.neutral.subtle`);
  - `brandTheme()` on the brand tints and, for brand text, the neutral fills, for the 180 sample
    colours and a named blue, green, purple, near-yellow and dark colour.
- README: the token count is 212, not 211; the `text.brand` swatches and the `brandTheme()`
  guarantee are updated.

## 0.0.7

- **New `typography.label.caps`** (`--qx-typography-label-caps`): 11 / 16px at weight 600, tracked
  +6% (0.66px), for the small capitals that label a group — navigation sections, table column
  groups, panel sections. The component sets `text-transform: uppercase`. Untracked capitals crowd
  together and read as a default; this is the only role with letter spacing, since Qeet Sans spaces
  every other size itself. First used by the console sidebar in `@qeetrix/react`
  (`qeetrix-files/qeetrix-react/07-components.md`, C1).
- The private type scale gains an 11px step (`primitive.font.size.11`) for it.
- **Test:** `label.caps` is written as a font shorthand with its letter spacing, and no other role is
  tracked.

## 0.0.6

- **The fonts ship with the tokens.** `tokens.css` now opens with `@font-face` rules for **Qeet Sans**
  (Cal Sans, unmodified variable font) and **Fira Code**, so `@import "@qeetrix/tokens"` alone loads
  the typefaces the tokens name. A file downloads only when text uses its family. The files and their
  SIL Open Font Licences are at `@qeetrix/tokens/fonts/*`. Previously the fonts existed only inside
  `@qeetrix/ui`.
- **Tests:** every declared face points at a shipped file; each font ships with its licence; the
  family names match the tokens' font stacks.
- **Fixed:** `scripts/npm-versions.mjs` encodes the registry URL fully and validates the package name
  before any request (found by CodeQL in `qeetrix-react`).
- `qeet-repo.yml` reads the version from `package.json` instead of repeating it.

## 0.0.5

Qeetrix's design language is now **structured and square**: direction C of the design-language
review, recorded in `qeetrix-files/qeetrix-react/05-design-rules.md`.

- **Corners.** Controls and surfaces go to 4px; small marks to 2px. The values change for
  `radius.control` (8→4), `radius.surface` (12→4), `radius.overlay` (12→4), `radius.modal` (16→4),
  `radius.sm` (4→2) and `radius.tooltip` (6→2). `radius.chip` and `radius.full` stay pill-shaped, for
  status tags, avatars and radios.
- **Letterforms.** `font.geometry.body` moves from UI (25) to A11y (0), Qeet Sans's most legible forms.
  The new `font.geometry.display` (100) gives display headlines the Geo forms.
- **New `border.width.accent`** (3px): the Ember bar that marks the current item, and the intent line
  on top of a dialog.
- **New contrast tests.** Field lines, the focus frame and the error frame are now checked at 3:1 on
  the filled field background (`color.bg.neutral.subtle` and `-hover`). All pass in both schemes.
- The private corner and geometry scales drop the steps nothing uses.

## 0.0.4

- **`@import "@qeetrix/tokens"` in CSS.** The package root now serves the stylesheet to CSS tools
  through the `style` export condition (Tailwind, Vite, webpack) and the `style` field
  (postcss-import), and the JS exports to everything else. `@qeetrix/tokens/tokens.css` still
  works, and is the path to use when a JavaScript file imports the stylesheet.
- **README rewritten**: a full token reference with swatches, themes, tenant branding, native and
  Figma use, architecture and quality.
- **Fixed** the tenant-theme example in the docs: CSS variables must be set with
  `style.setProperty`, not `Object.assign(element.style, …)`.

## 0.0.3

The first published version. (0.0.1 and 0.0.2 were used by an earlier package of the same name and
later unpublished; npm never accepts a version number twice, so this release starts at 0.0.3.)

The first release: the Qeetrix design tokens as their own package, designed from enterprise
practice (Material 3, Fluent 2, Atlassian, Primer, Spectrum 2, Carbon, Polaris) rather than carried
over from `@qeetrix/ui`, which keeps its own token set until it is retired.

### Architecture

- **Source in the DTCG 2025.10 standard**, composed by one resolver (`qeetrix.resolver.json`): a
  foundation set and two orthogonal modifiers — `colorScheme` (light, dark) and `density` (default,
  comfortable, compact). Parsed and validated by Terrazzo, a spec-compliant implementation.
- **Three tiers.** Private primitives (palettes and scales), semantic tokens (the public API), and
  eight component decisions with no semantic equivalent. Framework mappings — the shadcn/Tailwind
  names — live in `@qeetrix/react`, not here.
- **One naming pattern**: `{category}.{property}.{role}.{emphasis}-{state}`, e.g.
  `color.bg.brand.bold-hover`. Text and icon colours are separate roles.
- **Explicit interaction states** (hover, pressed, selected, disabled) as plain values, identical on
  web, iOS, Android and Figma.

### Outputs

- `tokens.css` — every public token for the default modes on `:root`, and one block per mode
  (`[data-qx-color-scheme]`, `[data-qx-density]`) with exactly the tokens it changes. Breakpoints as
  `@custom-media`; durations collapse under `prefers-reduced-motion`.
- `dtcg/` — the standard source and resolver, plus one resolved document per colour scheme.
- `index.js` — `DURATION`, `EASING`, `SPRING`, `ICON_SIZE`, `ICON_STROKE`, `BREAKPOINT`, `COMPONENT`,
  and `brandTheme()` with `TENANT_TOKENS`.

### Design

- **Kept, as Qeet's own:** the qeet brand ramp (500 = #F26D0E, 600 = Ember, the action colour), the
  graphite neutrals, the red, green, amber and blue status ramps, near-black dark mode.
- **Type**: a 4px-grid scale with a 14px interface base and a 12px floor — display, heading, title,
  body, label (lg/md/sm) and code — in Qeet Sans, with Cal Sans's Base geometry for headings and UI
  geometry for text.
- **Shape**: 8px controls, 12px surfaces and menus, 16px dialogs, pill chips.
- **Space**: a 4px grid in rem, with inset, gap and layout roles.
- **Motion**: standard polynomial and exponential curves — enter decelerates (out-quart), exit
  accelerates (in-cubic), large moves use out-expo — 0–400ms, and Compose-style springs for native.
- **Density**: control heights 24–44px; compact never goes below the 24px minimum target.
- **Breakpoints**: 600 / 840 / 1200 / 1600px, the same window size classes as Android.
- **Charts**: a new eight-colour categorical palette, 3:1 against every chart surface and
  distinguishable under deuteranopia, protanopia and tritanopia; sequential and diverging scales.
- **Rating stars** use a darker amber in light mode so they reach 3:1 on white.

### Guarantees, enforced by tests

WCAG 2.2 AA for every designed colour pairing in both schemes; the chart palette's contrast and
colour-blind thresholds; `brandTheme()` meeting AA for any tenant colour; valid DTCG for the source
and every published document; no unused primitive; a reviewed component tier; and a stylesheet
snapshot, so every value change shows in review.
