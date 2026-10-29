<div align="center">

# 🎨 Qeetrix Tokens

**The design tokens of Qeetrix, the Qeet Group design system.**

Colour, typography, spacing, shape, elevation, motion and density come from one source in the
[DTCG 2025.10](https://www.designtokens.org/) standard. They are published as CSS variables,
standard DTCG JSON and typed JavaScript for every Qeet product on web, iOS and Android.

[![npm](https://img.shields.io/npm/v/@qeetrix/tokens?style=flat-square&color=111111&label=npm)](https://www.npmjs.com/package/@qeetrix/tokens)
[![CI](https://img.shields.io/github/actions/workflow/status/qeetgroup/qeetrix-tokens/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/qeetgroup/qeetrix-tokens/actions/workflows/ci.yml)
![DTCG](https://img.shields.io/badge/DTCG-2025.10-111111?style=flat-square)
![WCAG](https://img.shields.io/badge/WCAG_2.2-AA-2E7D32?style=flat-square)
![Dependencies](https://img.shields.io/badge/dependencies-0-2E7D32?style=flat-square)
![Provenance](https://img.shields.io/badge/npm-provenance-111111?style=flat-square&logo=npm&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-typed-3178C6?style=flat-square&logo=typescript&logoColor=white)
[![License](https://img.shields.io/badge/license-MIT-111111?style=flat-square)](LICENSE)

**[Quick start](#-quick-start)** · **[Token reference](#-token-reference)** ·
**[Themes](#-colour-scheme-and-density)** · **[Tenant brand](#-a-tenants-brand-colour)** ·
**[iOS, Android, Figma](#-ios-android-and-figma)** · **[How it's built](#%EF%B8%8F-how-it-is-built)**

</div>

```css
@import "@qeetrix/tokens";

.card {
  background: var(--qx-color-surface-raised);
  color: var(--qx-color-text-default);
  border: var(--qx-border-width-default) solid var(--qx-color-border-default);
  border-radius: var(--qx-radius-surface);
  box-shadow: var(--qx-shadow-raised);
  padding: var(--qx-space-inset-lg);
  font: var(--qx-typography-body-md);
}
```

---

## 📑 Contents

- [✨ Why Qeetrix Tokens](#-why-qeetrix-tokens)
- [📊 At a glance](#-at-a-glance)
- [📦 Installation](#-installation)
- [🔤 Fonts](#-fonts)
- [🚀 Quick start](#-quick-start)
- [🌗 Colour scheme and density](#-colour-scheme-and-density)
- [🧭 What's in the package](#-whats-in-the-package)
- [🎨 Token reference](#-token-reference)
- [🏷️ Naming](#%EF%B8%8F-naming)
- [🟠 Palette](#-palette)
- [📈 Data visualisation](#-data-visualisation)
- [🏢 A tenant's brand colour](#-a-tenants-brand-colour)
- [⚡ JavaScript](#-javascript)
- [📱 iOS, Android and Figma](#-ios-android-and-figma)
- [🏗️ How it is built](#%EF%B8%8F-how-it-is-built)
- [✅ Quality](#-quality)
- [🧱 Versioning](#-versioning)
- [🧩 The Qeetrix family](#-the-qeetrix-family)
- [🛠️ Development](#%EF%B8%8F-development)
- [⚖️ License](#%EF%B8%8F-license)

---

## ✨ Why Qeetrix Tokens

- **One source, every platform.** The tokens that style a web console also style the iOS and
  Android apps and the Figma library. A change in this repository reaches all of them.
- **An open standard.** The source is strict [DTCG 2025.10](https://www.designtokens.org/),
  validated by [Terrazzo](https://terrazzo.app/). Any DTCG tool can read it.
- **Accessible by construction.** Every designed colour pairing meets WCAG 2.2 AA in both colour
  schemes. A test checks this on every change.
- **Themes without JavaScript.** Light and dark, plus three densities, are data attributes. Any
  subtree can switch, and no class names or rebuilds are needed.
- **Meaning, not paint.** Products use roles such as `--qx-color-bg-danger-bold`. Raw palette
  values are not in the stylesheet at all, so they can't leak into product code.
- **Safe white-labelling.** `brandTheme()` turns a customer's colour into the brand tokens, with
  AA contrast guaranteed for any input.
- **Charts for everyone.** A dedicated categorical palette stays distinguishable under
  deuteranopia, protanopia and tritanopia.
- **Small and trustworthy.** No runtime dependencies, ESM, fully typed, and published with npm
  provenance from GitHub Actions.

## 📊 At a glance

<div align="center">

| 🎯 213 tokens | 🌗 2 colour schemes | 📏 3 densities | ♿ WCAG 2.2 AA | 📦 0 dependencies |
|:---:|:---:|:---:|:---:|:---:|
| semantic + component | light · dark | default · comfortable · compact | every pairing, tested | about 38 kB packed |

</div>

## 📦 Installation

```bash
bun add @qeetrix/tokens
```

```bash
npm install @qeetrix/tokens
```

**Requirements:** ESM only, Node 20+ or any modern bundler. The stylesheet works in every
evergreen browser.

## 🔤 Fonts

**The fonts come with the tokens.** `@import "@qeetrix/tokens"` declares **Qeet Sans** (Cal Sans,
variable: weight 400–700, optical size and the GEOM letter style) and **Fira Code** (weight
300–700). Each is declared as subsets (latin, latin-ext, other; Qeet Sans upright and italic apart),
each with the `unicode-range` of what it holds, so a browser downloads only the files for the
characters a page shows: about 89 KB of Qeet Sans for English text. There's nothing extra to load
or opt out of.

- **The files** are at `@qeetrix/tokens/fonts/*`, for `<link rel="preload">` (preload
  `QeetSans-latin.woff2`) or native apps, which use the full variable `QeetSans.woff2` and
  `FiraCode-VF.woff2`. `scripts/subset-fonts.py` cuts the subsets.
- **Licence:** both fonts are under the SIL Open Font Licence 1.1, shipped beside them
  (`fonts/*-OFL.txt`).
- **Build support:** Vite, Next.js, webpack and Tailwind v4 inside them (`@tailwindcss/vite`,
  `@tailwindcss/postcss`) rewrite the font URLs automatically. The standalone Tailwind CLI and bare
  postcss-import don't: serve `dist/fonts/` yourself there.

## 🚀 Quick start

**1. Import the stylesheet once**, at the root of your app:

```css
@import "@qeetrix/tokens";
```

In a CSS file, the package name is enough. CSS tools (Tailwind, Vite, webpack, PostCSS) pick
the stylesheet, and JavaScript tools pick the JS exports. **To import the stylesheet from a
JavaScript file**, such as a Next.js root layout, use the full path, because there the package
name means the JS module:

```ts
import "@qeetrix/tokens/tokens.css";
```

**2. Style with semantic tokens.** Every variable starts with `--qx-`:

```css
.button-primary {
  height: var(--qx-size-control-md);
  padding-inline: var(--qx-space-inset-md);
  border-radius: var(--qx-radius-control);
  background: var(--qx-color-bg-brand-bold);
  color: var(--qx-color-text-on-brand);
  font: var(--qx-typography-label-md);
  transition: background var(--qx-motion-duration-fast) var(--qx-motion-easing-standard);
}
.button-primary:hover  { background: var(--qx-color-bg-brand-bold-hover); }
.button-primary:active { background: var(--qx-color-bg-brand-bold-pressed); }
.button-primary:focus-visible {
  outline: var(--qx-focus-ring-width) solid var(--qx-color-border-focus);
  outline-offset: var(--qx-focus-ring-offset);
}
```

**3. Choose a colour scheme and density** on `<html>`, or on any element:

```html
<html data-qx-color-scheme="dark" data-qx-density="compact">
```

Using Tailwind CSS v4? `@qeetrix/react` will ship the full Tailwind mapping. Until then, use the
variables directly: `bg-(--qx-color-surface-raised)`.

## 🌗 Colour scheme and density

| Attribute | Values | Default |
|---|---|---|
| `data-qx-color-scheme` | `light` · `dark` | `light` |
| `data-qx-density` | `default` · `comfortable` · `compact` | `default` |

The two modes are independent, so all six combinations work. Both attributes apply to the subtree
they are set on. A dark sidebar inside a light page, or a compact data table inside a default form,
needs only one attribute:

```html
<body>
  <aside data-qx-color-scheme="dark">…</aside>
  <main>
    <table data-qx-density="compact">…</table>
  </main>
</body>
```

The stylesheet does not follow the OS colour scheme on its own; that is your app's choice. Each
scheme block also sets the CSS `color-scheme` property, so scrollbars and form controls match. To
follow the OS:

```js
const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const apply = () => {
  document.documentElement.dataset.qxColorScheme = prefersDark.matches ? "dark" : "light";
};
apply();
prefersDark.addEventListener("change", apply);
```

**Density** changes only five tokens. Everything else keeps its size:

| Token | compact | default | comfortable |
|---|:---:|:---:|:---:|
| `--qx-size-control-sm` | 24px | 28px | 32px |
| `--qx-size-control-md` | 28px | 32px | 36px |
| `--qx-size-control-lg` | 32px | 40px | 44px |
| `--qx-size-row` | 32px | 40px | 48px |
| `--qx-space-form-gap` | 12px | 16px | 20px |

`compact` never goes below the 24px minimum target size (WCAG 2.2, 2.5.8).

**Reduced motion.** Under `prefers-reduced-motion: reduce`, every `--qx-motion-duration-*`
becomes `0ms`, so transitions built on the tokens stop by themselves.

## 🧭 What's in the package

| Import | For | Contains |
|---|---|---|
| `@import "@qeetrix/tokens"` (in CSS)<br>`import "@qeetrix/tokens/tokens.css"` (in JS) | Web: React, Angular, Vue, plain HTML | Every public token as a CSS variable, one block per mode (breakpoints: `@qeetrix/tokens/custom-media.css`) |
| `@qeetrix/tokens` | JavaScript and TypeScript | `DURATION`, `EASING`, `SPRING`, `ICON_SIZE`, `ICON_STROKE`, `BREAKPOINT`, `COMPONENT`, `brandTheme()`, `TENANT_TOKENS` |
| `@qeetrix/tokens/dtcg/light.tokens.json`<br>`@qeetrix/tokens/dtcg/dark.tokens.json` | iOS, Android, Figma, docs sites | Every token for one colour scheme at default density, as standard DTCG |
| `@qeetrix/tokens/dtcg/qeetrix.resolver.json` | DTCG resolver tools | The source and its modes (colour scheme × density), exactly as authored |

## 🎨 Token reference

Each table below lists CSS variables. The DTCG name is the same path with dots, for example
`--qx-color-bg-brand-bold` is `color.bg.brand.bold`.

### Colour

| Group | What it is for | Examples |
|---|---|---|
| `color-bg-*` | Fills: buttons, badges, banners, selected rows | `bg-brand-bold`, `bg-danger-subtle`, `bg-neutral-subtle-hover` |
| `color-text-*` | Text, at 4.5:1 or better | `text-default`, `text-subtle`, `text-link`, `text-on-brand` |
| `color-icon-*` | Icons, at 3:1 or better | `icon-default`, `icon-success`, `icon-on-bold` |
| `color-border-*` | Borders, dividers and the focus ring | `border-default`, `border-strong`, `border-focus` |
| `color-surface-*` | The layers of a page | `surface-canvas`, `surface-raised`, `surface-overlay` |
| `color-overlay-*` | Translucent layers | `overlay-hover`, `overlay-pressed`, `overlay-scrim` |
| `color-dataviz-*` | Charts | `dataviz-categorical-1` … `8`, `dataviz-grid` |
| `color-code-*` | Syntax highlighting | `code-keyword`, `code-string`, `code-comment` |

Text and icons are separate roles. Text must reach 4.5:1 against its background, while icons and
borders need 3:1. Fills come in two emphases, `subtle` (a tint) and `bold` (a solid colour). The
interactive ones also have `-hover` and `-pressed` states.

**Key colours**

| Token | Light | Dark |
|---|:---:|:---:|
| `--qx-color-bg-brand-bold` | ![#d04800](https://img.shields.io/badge/%23d04800-d04800?style=flat-square) | ![#d04800](https://img.shields.io/badge/%23d04800-d04800?style=flat-square) |
| `--qx-color-text-brand` | ![#9b3314](https://img.shields.io/badge/%239b3314-9b3314?style=flat-square) | ![#ff9646](https://img.shields.io/badge/%23ff9646-ff9646?style=flat-square) |
| `--qx-color-text-default` | ![#0e0d0d](https://img.shields.io/badge/%230e0d0d-0e0d0d?style=flat-square) | ![#f3f1ef](https://img.shields.io/badge/%23f3f1ef-f3f1ef?style=flat-square) |
| `--qx-color-text-subtle` | ![#484747](https://img.shields.io/badge/%23484747-484747?style=flat-square) | ![#d1cfce](https://img.shields.io/badge/%23d1cfce-d1cfce?style=flat-square) |
| `--qx-color-surface-default` | ![#ffffff](https://img.shields.io/badge/%23ffffff-ffffff?style=flat-square) | ![#131312](https://img.shields.io/badge/%23131312-131312?style=flat-square) |
| `--qx-color-surface-canvas` | ![#fbfaf9](https://img.shields.io/badge/%23fbfaf9-fbfaf9?style=flat-square) | ![#0e0d0d](https://img.shields.io/badge/%230e0d0d-0e0d0d?style=flat-square) |
| `--qx-color-border-default` | ![#e3e1e0](https://img.shields.io/badge/%23e3e1e0-e3e1e0?style=flat-square) | ![#262625](https://img.shields.io/badge/%23262625-262625?style=flat-square) |
| `--qx-color-bg-danger-bold` | ![#be2334](https://img.shields.io/badge/%23be2334-be2334?style=flat-square) | ![#be2334](https://img.shields.io/badge/%23be2334-be2334?style=flat-square) |
| `--qx-color-bg-success-bold` | ![#017e51](https://img.shields.io/badge/%23017e51-017e51?style=flat-square) | ![#017e51](https://img.shields.io/badge/%23017e51-017e51?style=flat-square) |
| `--qx-color-bg-warning-bold` | ![#efad1d](https://img.shields.io/badge/%23efad1d-efad1d?style=flat-square) | ![#efad1d](https://img.shields.io/badge/%23efad1d-efad1d?style=flat-square) |
| `--qx-color-bg-info-bold` | ![#006db4](https://img.shields.io/badge/%23006db4-006db4?style=flat-square) | ![#006db4](https://img.shields.io/badge/%23006db4-006db4?style=flat-square) |

<details>
<summary><b>Every colour token</b></summary>

<br>

| Group | Tokens (after `--qx-color-`) |
|---|---|
| Fills | `bg-neutral-subtle` `-hover` `-pressed` · `bg-neutral-bold` `-hover` `-pressed` · `bg-brand-subtle` `-hover` `-pressed` · `bg-brand-bold` `-hover` `-pressed` · `bg-danger-subtle` · `bg-danger-bold` `-hover` `-pressed` · `bg-success-subtle` · `bg-success-bold` · `bg-warning-subtle` · `bg-warning-bold` · `bg-info-subtle` · `bg-info-bold` · `bg-selected` `-hover` · `bg-disabled` · `bg-input` |
| Text | `text-default` · `text-subtle` · `text-subtlest` · `text-disabled` · `text-inverse` · `text-brand` · `text-link` `-hover` · `text-danger` · `text-success` · `text-warning` · `text-info` · `text-on-bold` · `text-on-brand` · `text-on-warning` |
| Icons | `icon-default` · `icon-subtle` · `icon-disabled` · `icon-inverse` · `icon-brand` · `icon-danger` · `icon-success` · `icon-warning` · `icon-info` · `icon-highlight` · `icon-on-bold` · `icon-on-brand` |
| Borders | `border-default` · `border-subtle` · `border-strong` `-hover` · `border-disabled` · `border-focus` · `border-selected` · `border-brand` · `border-danger` · `border-success` · `border-warning` · `border-info` |
| Surfaces | `surface-canvas` · `surface-default` · `surface-raised` · `surface-overlay` · `surface-sunken` · `surface-inverse` |
| Overlays | `overlay-hover` · `overlay-pressed` · `overlay-scrim` · `selection` |
| Charts | `dataviz-categorical-1` … `8` · `dataviz-sequential-1` … `7` · `dataviz-diverging-1` … `7` · `dataviz-positive` · `dataviz-negative` · `dataviz-warning` · `dataviz-axis` · `dataviz-grid` · `dataviz-reference` |
| Code | `code-keyword` · `code-string` · `code-number` · `code-literal` · `code-comment` · `code-punctuation` |

</details>

### Typography

`--qx-typography-<role>-<size>` is a complete `font` shorthand. Each part is also available on its
own as `-font-family`, `-font-size`, `-font-weight`, `-line-height` and `-letter-spacing`.

| Role | lg | md | sm | Weight | For |
|---|:---:|:---:|:---:|:---:|---|
| `display` | 56 / 64 | 48 / 56 | 40 / 48 | 600 | Hero and marketing headlines |
| `heading` | 32 / 40 | 28 / 36 | 24 / 32 | 600 | Page and section headings |
| `title` | 20 / 28 | 18 / 24 | 16 / 24 | 600 | Cards, dialogs, panels |
| `body` | 16 / 24 | **14 / 20** | 12 / 16 | 400 | Running text; `md` is the interface base |
| `label` | 16 / 24 | 14 / 20 | 12 / 16 | 500 | Buttons, inputs, tabs, menus |
| `code` | — | 14 / 20 | 12 / 16 | 400 | Code, in Fira Code |

One more role stands apart: **`--qx-typography-label-caps`**, 11 / 16 at weight 600, tracked +6%
(`-letter-spacing` is 0.66px), for the small capitals that label a group: navigation sections,
table column groups, panel sections. Set `text-transform: uppercase` with it. It's the only role
with letter spacing; Qeet Sans spaces every other size itself.

Sizes are font size / line height in px, and every line height sits on the 4px grid. Sizes are
published in `rem`, so they follow the user's browser font size. Qeet Sans's geometry axis sets
the letterforms for each role:
- display headlines use Geo (`--qx-font-geometry-display`, 100);
- headings and titles use Base (`--qx-font-geometry-heading`, 50);
- body, labels and code use A11y, the most legible forms (`--qx-font-geometry-body`, 0).

`--qx-font-family-indic` is a Noto stack for Indian scripts.

### Space

| Token | xs | sm | md | lg | xl | For |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `--qx-space-inset-*` | 4 | 8 | 12 | 16 | 24 | Padding inside a container |
| `--qx-space-gap-*` | 4 | 8 | 12 | 16 | 24 | Space between siblings |
| `--qx-space-layout-*` | — | 24 | 32 | 48 | 64 | Space between page sections |

Values are px at the default font size, published in `rem` on a 4px grid. `--qx-space-form-gap`
follows density.

### Shape

Qeetrix is square: controls and surfaces have a 4px corner, small marks 2px. Only people and status
are round.

| Token | Value | For |
|---|:---:|---|
| `--qx-radius-none` | 0 | Tables, tab lists, page sections |
| `--qx-radius-sm` | 2px | Small marks: checkboxes, switch tracks, keyboard keys |
| `--qx-radius-tooltip` | 2px | Tooltips |
| `--qx-radius-control` | 4px | Buttons, fields, selects: every control. Fields round only their top corners |
| `--qx-radius-surface` | 4px | Cards, panels, containers |
| `--qx-radius-overlay` | 4px | Menus, popovers |
| `--qx-radius-modal` | 4px | Dialogs, drawers |
| `--qx-radius-chip` | pill | Status tags |
| `--qx-radius-full` | pill | Avatars, radios, presence dots |

Borders: `--qx-border-width-default` (1px), `--qx-border-width-strong` (2px) and
`--qx-border-width-accent` (3px, for the bar that marks the current item and the line on top of a
dialog). Focus ring: `--qx-focus-ring-width` and `--qx-focus-ring-offset` (2px each).

### Elevation

| Token | For |
|---|---|
| `--qx-shadow-raised` | Cards and other surfaces at rest |
| `--qx-shadow-raised-hover` | A raised surface under the pointer |
| `--qx-shadow-overlay` | Menus, popovers, dropdowns |
| `--qx-shadow-modal` | Dialogs and sheets |
| `--qx-shadow-inset` | Sunken wells |

Shadows are neutral. Raised, overlay and modal pair a tight contact shadow with a soft ambient
one. Each colour scheme has its own set.

### Motion

| Duration | ms | For |
|---|:---:|---|
| `--qx-motion-duration-instant` | 0 | No animation |
| `--qx-motion-duration-fast` | 100 | Hover and press feedback |
| `--qx-motion-duration-normal` | 200 | Tooltips, menus, toggles |
| `--qx-motion-duration-slow` | 300 | Dialogs, drawers, sheets |
| `--qx-motion-duration-slower` | 400 | Large or full-screen transitions |

| Easing | Curve | For |
|---|---|---|
| `--qx-motion-easing-standard` | `cubic-bezier(0.65, 0, 0.35, 1)` | Something on screen changes size, position or colour |
| `--qx-motion-easing-enter` | `cubic-bezier(0.25, 1, 0.5, 1)` | Something arrives and decelerates to rest |
| `--qx-motion-easing-exit` | `cubic-bezier(0.32, 0, 0.67, 0)` | Something leaves and accelerates away |
| `--qx-motion-easing-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | Large moves: drawers, page transitions |
| `--qx-motion-easing-linear` | `linear` | Progress and other continuous motion |

Native apps use springs: `motion.spring.snappy` (stiffness 400, damping ratio 0.9) and
`motion.spring.gentle` (stiffness 200, damping ratio 1), with mass 1, as in Jetpack Compose.

### Layers and layout

| Z-index | | Breakpoint | Min width |
|---|:---:|---|:---:|
| `--qx-z-base` | 0 | *compact* | 0 |
| `--qx-z-sticky` | 100 | `--qx-viewport-medium` | 600px |
| `--qx-z-dropdown` | 1000 | `--qx-viewport-expanded` | 840px |
| `--qx-z-overlay` | 1300 | `--qx-viewport-large` | 1200px |
| `--qx-z-modal` | 1400 | `--qx-viewport-xlarge` | 1600px |
| `--qx-z-popover` | 1500 | | |
| `--qx-z-toast` | 1600 | | |
| `--qx-z-tooltip` | 1700 | | |
| `--qx-z-spotlight` | 1800 | | |
| `--qx-z-skip-link` | 1900 | | |

Breakpoints are the window size classes used on Android, and the same on web. They are published as
`@custom-media`, because `var()` cannot be used inside a media query, in their own sheet,
`@qeetrix/tokens/custom-media.css`, so `tokens.css` stays plain CSS that every pipeline accepts
quietly. Import it only where your CSS build transpiles custom media (Lightning CSS, PostCSS,
Tailwind v4). With Vite and Lightning CSS:

```js
// vite.config.js
export default { css: { transformer: "lightningcss", lightningcss: { drafts: { customMedia: true } } } };
```

```css
@import "@qeetrix/tokens/custom-media.css";

@media (--qx-viewport-expanded) {
  .layout { grid-template-columns: var(--qx-component-sidebar-width-expanded) 1fr; }
}
```

### Sizes, icons and the rest

| Token | Value |
|---|---|
| `--qx-size-control-sm` · `-md` · `-lg` | 28 · 32 · 40px (follow density) |
| `--qx-size-row` | 40px (follows density) |
| `--qx-size-target-min` | 24px, the smallest pointer target allowed |
| `--qx-size-icon-2xs` · `-xs` · `-sm` · `-md` · `-lg` | 12 · 14 · 16 · 20 · 24px |
| `--qx-icon-stroke-thin` · `-regular` | 1.5 · 2 |
| `--qx-opacity-disabled` | 0.4, for disabled content with no disabled colour (images) |
| `--qx-component-*` | Eight reviewed component sizes: sidebar widths, command palette, timeline marker, tour |

## 🏷️ Naming

Every semantic token follows one pattern:

```text
color . bg . brand . bold - hover
  │      │     │      │      └── state     hover · pressed · selected · disabled
  │      │     │      └───────── emphasis  subtle · bold
  │      │     └──────────────── role      neutral · brand · danger · success · warning · info
  │      └────────────────────── property  bg · text · icon · border · surface
  └───────────────────────────── category  color · space · size · radius · shadow · motion · …
```

Names describe **meaning, never appearance or mode**. There is no `orange-600` and no `dark-bg`.
The same name holds the right value in light and dark, so code never needs to know which scheme is
active.

## 🟠 Palette

There is **one palette for every Qeet product.** The palette is private: it lives in the DTCG files
as `primitive.*` so that Figma and native apps can see how roles are built, but it is never
published as CSS. Brand is a semantic role (`color.bg.brand.bold`, `color.text.brand`, …), not a
separate palette.

**Qeet**, the brand. 500 is the logo orange and 600 (Ember) is the action colour:

![50](https://img.shields.io/badge/50-fff5ed?style=flat-square)
![100](https://img.shields.io/badge/100-ffebdb?style=flat-square)
![200](https://img.shields.io/badge/200-ffd7b9?style=flat-square)
![300](https://img.shields.io/badge/300-ffba88?style=flat-square)
![400](https://img.shields.io/badge/400-ff9646?style=flat-square)
![500](https://img.shields.io/badge/500-f26d0e?style=flat-square)
![600](https://img.shields.io/badge/600-d04800?style=flat-square)
![700](https://img.shields.io/badge/700-b73d10?style=flat-square)
![800](https://img.shields.io/badge/800-9b3314?style=flat-square)
![900](https://img.shields.io/badge/900-7b2815?style=flat-square)
![950](https://img.shields.io/badge/950-52170d?style=flat-square)

**Graphite**, warm neutrals for text, surfaces and borders, with near-black dark mode:

![0](https://img.shields.io/badge/0-ffffff?style=flat-square)
![50](https://img.shields.io/badge/50-f8f6f5?style=flat-square)
![200](https://img.shields.io/badge/200-e3e1e0?style=flat-square)
![400](https://img.shields.io/badge/400-a6a4a3?style=flat-square)
![500](https://img.shields.io/badge/500-767473?style=flat-square)
![600](https://img.shields.io/badge/600-62605f?style=flat-square)
![700](https://img.shields.io/badge/700-484747?style=flat-square)
![800](https://img.shields.io/badge/800-2e2e2d?style=flat-square)
![900](https://img.shields.io/badge/900-191818?style=flat-square)
![950](https://img.shields.io/badge/950-0e0d0d?style=flat-square)
![1000](https://img.shields.io/badge/1000-040404?style=flat-square)

**Status** colours: danger, success, warning and info.

| | 100 | 300 | 500 | 700 | 900 |
|---|:---:|:---:|:---:|:---:|:---:|
| Red | ![100](https://img.shields.io/badge/100-fee9e9?style=flat-square) | ![300](https://img.shields.io/badge/300-feb5b6?style=flat-square) | ![500](https://img.shields.io/badge/500-f13c50?style=flat-square) | ![700](https://img.shields.io/badge/700-be2334?style=flat-square) | ![900](https://img.shields.io/badge/900-791a20?style=flat-square) |
| Green | ![100](https://img.shields.io/badge/100-ddf7e5?style=flat-square) | ![300](https://img.shields.io/badge/300-8fe0b0?style=flat-square) | ![500](https://img.shields.io/badge/500-20b375?style=flat-square) | ![700](https://img.shields.io/badge/700-017e51?style=flat-square) | ![900](https://img.shields.io/badge/900-005134?style=flat-square) |
| Amber | ![100](https://img.shields.io/badge/100-f8efd4?style=flat-square) | ![300](https://img.shields.io/badge/300-e9c775?style=flat-square) | ![500](https://img.shields.io/badge/500-cb9605?style=flat-square) | ![700](https://img.shields.io/badge/700-8c6000?style=flat-square) | ![900](https://img.shields.io/badge/900-5d3b01?style=flat-square) |
| Blue | ![100](https://img.shields.io/badge/100-e1f2fe?style=flat-square) | ![300](https://img.shields.io/badge/300-97d3ff?style=flat-square) | ![500](https://img.shields.io/badge/500-0393e6?style=flat-square) | ![700](https://img.shields.io/badge/700-006db4?style=flat-square) | ![900](https://img.shields.io/badge/900-104574?style=flat-square) |

Every colour is authored in **OKLCH**, with its sRGB hex alongside, so steps look evenly spaced to
the eye.

## 📈 Data visualisation

Charts use their own palette, not the interface colours, so a series never looks like an error or a
button.

**Categorical**, eight series in order:

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Light | ![1](https://img.shields.io/badge/1-105bbe?style=flat-square) | ![2](https://img.shields.io/badge/2-d76900?style=flat-square) | ![3](https://img.shields.io/badge/3-007976?style=flat-square) | ![4](https://img.shields.io/badge/4-9273d8?style=flat-square) | ![5](https://img.shields.io/badge/5-d15697?style=flat-square) | ![6](https://img.shields.io/badge/6-207e18?style=flat-square) | ![7](https://img.shields.io/badge/7-b68611?style=flat-square) | ![8](https://img.shields.io/badge/8-424e5e?style=flat-square) |
| Dark | ![1](https://img.shields.io/badge/1-4e8ce6?style=flat-square) | ![2](https://img.shields.io/badge/2-ffaa75?style=flat-square) | ![3](https://img.shields.io/badge/3-02b5b2?style=flat-square) | ![4](https://img.shields.io/badge/4-c7b3ff?style=flat-square) | ![5](https://img.shields.io/badge/5-ffa9d2?style=flat-square) | ![6](https://img.shields.io/badge/6-63b55b?style=flat-square) | ![7](https://img.shields.io/badge/7-ffd077?style=flat-square) | ![8](https://img.shields.io/badge/8-748192?style=flat-square) |

- Every series reaches **3:1 against every chart surface** in both schemes.
- Neighbouring series stay apart under **deuteranopia, protanopia and tritanopia**, and so does any
  pair among the first five. Use the first five when you can.
- **Sequential** (`sequential-1` … `7`, blue) for ordered values and **diverging**
  (`diverging-1` … `7`, red through graphite to blue) for values around a midpoint.
- `positive`, `negative` and `warning` for trends, and `axis`, `grid` and `reference` for the chart
  itself.

## 🏢 A tenant's brand colour

Qeet products share one palette. The one exception is a customer's own surface, such as a hosted
sign-in page or a checkout, which may show the customer's colour. `brandTheme()` turns one hex
colour into every brand token, for both schemes:

```ts
import { brandTheme } from "@qeetrix/tokens";

const { light, dark } = brandTheme("#1a73e8"); // the tenant's colour, from your settings

const declarations = (vars: Record<string, string>) =>
  Object.entries(vars).map(([name, value]) => `${name}: ${value};`).join(" ");

// Render after tokens.css, on the server or the client.
const css = `
  :root, [data-qx-color-scheme="light"] { ${declarations(light)} }
  [data-qx-color-scheme="dark"] { ${declarations(dark)} }
`;
```

Put `css` in a `<style>` element. To set a single element instead, use
`element.style.setProperty(name, value)` for each entry. CSS variables can't be set with
`Object.assign(element.style, …)`.

**What you can rely on:**

- It changes **exactly the 18 tokens in `TENANT_TOKENS`**, and nothing else: brand fills and
  their hover and pressed states, brand text and links, brand icons and borders, the focus ring,
  selected fills and the text selection colour.
- **WCAG AA is guaranteed for any input colour.**
  - The label on a brand fill reaches 4.5:1. It is white, or near-black for a light colour, and a
    mid-tone that suits neither is darkened until white works.
  - Brand text and links reach 4.5:1, and icons, borders and the focus ring 3:1, on every surface
    and on the brand's own tints (`bg-brand-subtle`, `bg-selected`): a brand badge, a ghost
    button's hover, a link or focus ring in a selected row. Brand text also reaches 4.5:1 on the
    tints' hover and pressed states, such as a ghost button being pressed, and on the neutral
    fills at rest, hovered and pressed.
- **It is safe with untrusted input.** It accepts only `#rgb` or `#rrggbb` and throws a
  `TypeError` for anything else. Every value it returns is a colour it computed itself, so the
  output is safe to put in a style element.

## ⚡ JavaScript

For values that code needs: animation, media queries, native bridges and canvas.

```ts
import { BREAKPOINT, DURATION, EASING } from "@qeetrix/tokens";

element.animate(keyframes, { duration: DURATION.normal, easing: EASING.enter });

const isWide = matchMedia(`(width >= ${BREAKPOINT.expanded}px)`).matches;
```

| Export | Shape |
|---|---|
| `DURATION` | `{ instant: 0, fast: 100, normal: 200, slow: 300, slower: 400 }`, in ms |
| `EASING` | `{ standard, enter, exit, emphasized, linear }`, as CSS timing functions |
| `SPRING` | `{ snappy, gentle }`, each `{ stiffness, dampingRatio }` |
| `ICON_SIZE` · `ICON_STROKE` | `{ "2xs": 12, xs: 14, sm: 16, md: 20, lg: 24 }` · `{ thin: 1.5, regular: 2 }` |
| `BREAKPOINT` | `{ medium: 600, expanded: 840, large: 1200, xlarge: 1600 }`, in px |
| `COMPONENT` | Sidebar, command palette, timeline and tour geometry, as CSS lengths |
| `brandTheme(hex)` · `TENANT_TOKENS` | [A tenant's brand colour](#-a-tenants-brand-colour) |

Every value is declared `as const`, so TypeScript knows the literal type: `DURATION.normal` has
type `200`, not `number`. Colours are deliberately **not** exported to JavaScript. Use the CSS
variables, so colour schemes and tenant themes keep working.

## 📱 iOS, Android and Figma

`dtcg/light.tokens.json` and `dtcg/dark.tokens.json` are standard DTCG 2025.10 documents. Each
contains every token for one colour scheme at default density.

- **Colours** are `{ "colorSpace": "oklch", "components": [L, C, H], "hex": "#rrggbb", "alpha" }`.
- **Lengths** are `{ "value": 2, "unit": "rem" }` or `px`, and **durations** are
  `{ "value": 200, "unit": "ms" }`.
- **References are kept.** `color.bg.brand.bold` points to `{primitive.color.qeet.600}`, so the
  link between primitive and semantic tokens survives into Figma Variables.

```json
"bg": {
  "brand": {
    "bold": { "$type": "color", "$value": "{primitive.color.qeet.600}" }
  }
}
```

To get final values, for example in a build script that generates Swift or Kotlin, follow the
references:

```js
import light from "@qeetrix/tokens/dtcg/light.tokens.json" with { type: "json" };

const at = (path) => path.split(".").reduce((node, key) => node[key], light);

function resolve(path) {
  let token = at(path);
  while (typeof token.$value === "string" && token.$value.startsWith("{")) {
    token = at(token.$value.slice(1, -1));
  }
  return token.$value;
}

resolve("color.bg.brand.bold").hex; // "#d04800"
resolve("size.control.md");         // { value: 2, unit: "rem" }
```

For other density combinations, run `dtcg/qeetrix.resolver.json` through any DTCG resolver
(Terrazzo, for example). Native motion uses `motion.spring.*`. Z-index is web-only, because native
platforms stack views by hierarchy.

## 🏗️ How it is built

```text
                 src/qeetrix.resolver.json
                           │
   ┌───────────────────────┼─────────────────────────────┐
   │  foundation set        modifiers (independent)      │
   │  primitive + semantic  colorScheme: light · dark    │
   │  + component tokens    density: default ·           │
   │                          comfortable · compact      │
   └───────────────────────┬─────────────────────────────┘
                           ▼
          Terrazzo: parse and validate strict DTCG
                           ▼
               scripts/build.mjs (writers)
           ┌───────────────┼──────────────────┐
           ▼               ▼                  ▼
     dist/tokens.css   dist/dtcg/*.json   dist/index.js + .d.ts
                                          (+ src/brand.ts via tsc)
```

**Three tiers:**

| Tier | Holds | Published as CSS? | Example |
|---|---|:---:|---|
| Primitive | Raw palettes and scales | No | `primitive.color.qeet.600` |
| Semantic | Meaning: the API products use | Yes | `color.bg.brand.bold`, `radius.control` |
| Component | The few decisions with no semantic equivalent (8, reviewed) | Yes | `component.sidebar.width.expanded` |

- **Modes, not copies.** Light, dark and the densities are modifiers on one foundation. A mode
  file holds only what that mode changes, so the stylesheet has `:root` plus one small block per
  mode.
- **Derived values are values.** Hover and pressed states and tints are stored as plain colours,
  with the recipe that made them recorded in `$extensions`. `bun run derive` recomputes them.
  Every platform reads the same final value, and none of them has to calculate it.
- **Framework mappings live elsewhere.** Tailwind and shadcn names belong in `@qeetrix/react`,
  so this package stays framework-neutral.

## ✅ Quality

Every pull request runs the same gate as a release: **build → typecheck → lint → test → package
checks**.

| Suite | Guarantees |
|---|---|
| `source` | Valid DTCG in every mode combination, independent modifiers, the naming pattern, tier rules, a description for every token (on the token or its group), no unused primitives, up-to-date derived values |
| `contrast` | WCAG 2.2 AA for every designed colour pairing, in both schemes |
| `dataviz` | Chart palette contrast and colour-blind separation |
| `stylesheet` | Exact `:root` and mode blocks, no primitives, `@custom-media`, reduced motion |
| `dtcg` | The published resolver and resolved documents parse again in Terrazzo |
| `brand` | `brandTheme()` changes only the allowlist and meets AA for 180 sample colours |
| `package` | Exports, files, JS values equal to the tokens, exact `.d.ts`, a stylesheet snapshot |

The stylesheet snapshot means **every value change shows up in the pull request diff**. Package
checks run [publint](https://publint.dev/) and [Are the Types Wrong?](https://arethetypeswrong.github.io/).
Releases are published from GitHub Actions with **npm provenance**, and the GitHub Actions they use
are pinned to commit SHAs.

## 🧱 Versioning

While the package is `0.x`:

| Change | Release |
|---|---|
| A new token or output | patch (`0.0.x`) |
| A changed value that keeps its meaning | patch, visible in the stylesheet snapshot |
| A removed or renamed token, a changed meaning, or a changed output shape | minor (`0.x.0`) |

Every release is listed in the [CHANGELOG](CHANGELOG.md) and on
[GitHub Releases](https://github.com/qeetgroup/qeetrix-tokens/releases).

## 🧩 The Qeetrix family

| Package | What it is | Uses these tokens? |
|---|---|---|
| **`@qeetrix/tokens`** | Design tokens (this package) | — |
| [`@qeetrix/react`](https://github.com/qeetgroup/qeetrix-react) | The next React component library, including the Tailwind and shadcn mapping | Yes (planned) |
| [`@qeetrix/ui`](https://github.com/qeetgroup/qeetrix-ui) | The current React component library | No: it keeps its own tokens until it is retired |
| [`@qeetrix/icons`](https://github.com/qeetgroup/qeetrix-icons) | Icons and the Qeet logos | No token dependency; its recommended sizes and strokes match `ICON_SIZE` and `ICON_STROKE` |

## 🛠️ Development

```bash
bun install
bun run build           # tokens → dist/tokens.css, dist/dtcg/, dist/index.{js,d.ts}
bun run test            # rebuilds, then runs every suite
bun run typecheck
bun run lint            # Biome
bun run check:package   # publint + Are the Types Wrong?
bun run derive          # recompute derived colours after changing a palette
```

Rules, layout and what CI enforces are in [AGENTS.md](AGENTS.md). To report a vulnerability, see
[SECURITY.md](SECURITY.md).

**Releases.** Opening a pull request bumps the patch version on the branch. Merging to `main`
publishes to npm with provenance, tags `vX.Y.Z` and opens a GitHub Release. `rollback.yml` moves
`latest` back to an earlier version if a release goes wrong.

## ⚖️ License

[MIT](LICENSE) © Qeet Group
