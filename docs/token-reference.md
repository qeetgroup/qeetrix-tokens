# 🎨 Token reference

Each table below lists CSS variables. The DTCG name is the same path with dots, for example
`--qx-color-bg-brand-bold` is `color.bg.brand.bold`.

## Colour

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
| `--qx-color-border-default` | ![#e3e1e0](https://img.shields.io/badge/%23e3e1e0-e3e1e0?style=flat-square) | ![#383837](https://img.shields.io/badge/%23383837-383837?style=flat-square) |
| `--qx-color-bg-danger-bold` | ![#be2334](https://img.shields.io/badge/%23be2334-be2334?style=flat-square) | ![#be2334](https://img.shields.io/badge/%23be2334-be2334?style=flat-square) |
| `--qx-color-bg-success-bold` | ![#017e51](https://img.shields.io/badge/%23017e51-017e51?style=flat-square) | ![#017e51](https://img.shields.io/badge/%23017e51-017e51?style=flat-square) |
| `--qx-color-bg-warning-bold` | ![#efad1d](https://img.shields.io/badge/%23efad1d-efad1d?style=flat-square) | ![#efad1d](https://img.shields.io/badge/%23efad1d-efad1d?style=flat-square) |
| `--qx-color-bg-info-bold` | ![#006db4](https://img.shields.io/badge/%23006db4-006db4?style=flat-square) | ![#006db4](https://img.shields.io/badge/%23006db4-006db4?style=flat-square) |

<details>
<summary><b>Every colour token</b></summary>

<br>

| Group | Tokens (after `--qx-color-`) |
|---|---|
| Fills | `bg-neutral-subtle` `-hover` `-pressed` · `bg-neutral-bold` `-hover` `-pressed` · `bg-brand-subtle` `-hover` `-pressed` · `bg-brand-bold` `-hover` `-pressed` · `bg-danger-subtle` `-pressed` · `bg-danger-bold` `-hover` `-pressed` · `bg-success-subtle` · `bg-success-bold` · `bg-warning-subtle` · `bg-warning-bold` · `bg-info-subtle` · `bg-info-bold` · `bg-selected` `-hover` · `bg-disabled` · `bg-input` |
| Text | `text-default` · `text-subtle` · `text-subtlest` · `text-disabled` · `text-inverse` · `text-brand` · `text-link` `-hover` · `text-danger` · `text-success` · `text-warning` · `text-info` · `text-on-bold` · `text-on-brand` · `text-on-warning` |
| Icons | `icon-default` · `icon-subtle` · `icon-disabled` · `icon-inverse` · `icon-brand` · `icon-danger` · `icon-success` · `icon-warning` · `icon-info` · `icon-highlight` · `icon-on-bold` · `icon-on-brand` |
| Borders | `border-default` · `border-subtle` · `border-strong` `-hover` · `border-disabled` · `border-focus` · `border-selected` · `border-brand` · `border-danger` · `border-success` · `border-warning` · `border-info` |
| Surfaces | `surface-canvas` · `surface-default` · `surface-raised` · `surface-overlay` · `surface-sunken` · `surface-inverse` |
| Overlays | `overlay-hover` · `overlay-pressed` · `overlay-scrim` · `selection` |
| Charts | `dataviz-categorical-1` … `8` · `dataviz-sequential-1` … `7` · `dataviz-diverging-1` … `7` · `dataviz-positive` · `dataviz-negative` · `dataviz-warning` · `dataviz-axis` · `dataviz-grid` · `dataviz-reference` |
| Code | `code-keyword` · `code-string` · `code-number` · `code-literal` · `code-comment` · `code-punctuation` |

</details>

## Typography

`--qx-typography-<role>-<size>` is a complete `font` shorthand. Each part is also available on its
own as `-font-family`, `-font-size`, `-font-weight`, `-line-height` and `-letter-spacing`, and
`-font-geometry` holds the role's letter style, which a `font` shorthand can't carry:

```css
.title {
  font: var(--qx-typography-title-md);
  font-variation-settings: "GEOM" var(--qx-typography-title-md-font-geometry);
}
```

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

Sizes are font size / line height in px, and every line height sits exactly on the 4px grid. Sizes
are published in `rem`, so they follow the user's browser font size. `-line-height` is a unitless
ratio, rounded up at the sixth decimal (`1.428572` for 20 / 14), so a browser, which truncates a
line box to a fraction of a pixel, lays every role out at exactly its line height: 20px, not
20.0004px or 19.984375px. That holds for the shorthand, `line-height` and
`calc(var(-font-size) * var(-line-height))`, in Chromium, Firefox and WebKit. Qeet Sans's geometry
axis sets the letterforms for each role, in `-font-geometry`:
- display headlines use Geo (`--qx-font-geometry-display`, 100);
- headings and titles use Base (`--qx-font-geometry-heading`, 50);
- body, labels and code use A11y, the most legible forms (`--qx-font-geometry-body`, 0). Fira
  Code has no GEOM axis and ignores it.

### Text in every language

| Token | Families | For |
|---|---|---|
| `--qx-font-family-text` | Qeet Sans, every script's face below, the platforms' Japanese and Chinese fonts, then the generic families | Text in any language a Qeet product ships: **use this one for multilingual text** |
| `--qx-font-family-indic` | Noto Sans and its Devanagari, Bengali, Tamil, Telugu, Kannada, Gujarati, Gurmukhi, Malayalam and Odia faces | Indian scripts on their own |
| `--qx-font-family-cjk` | Noto Sans JP, Noto Sans SC, then Hiragino Sans, PingFang SC, Yu Gothic UI and Microsoft YaHei UI | Japanese and Chinese on their own |

Don't chain stacks (`var(--qx-font-family-sans), var(--qx-font-family-indic)`): each ends in the
generic families, so the system font would come before the Indian faces. `--qx-font-family-text` has
the generics only at its end. The typography roles keep Qeet Sans's own stack; to set a role in the
multilingual one, give its family after the shorthand:

```css
.message {
  font: var(--qx-typography-body-md);
  font-family: var(--qx-font-family-text);
}
```

The stacks name the faces; the app loads them (Google Fonts serves every Noto face listed). Japanese
comes before Chinese, so a page in Chinese should put Noto Sans SC first under `:lang(zh)`: the same
characters are drawn differently in each.

## Space

| Token | xs | sm | md | lg | xl | For |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `--qx-space-inset-*` | 4 | 8 | 12 | 16 | 24 | Padding inside a container |
| `--qx-space-gap-*` | 4 | 8 | 12 | 16 | 24 | Space between siblings |
| `--qx-space-layout-*` | — | 24 | 32 | 48 | 64 | Space between page sections |

Values are px at the default font size, published in `rem` on a 4px grid. `--qx-space-form-gap`
follows density.

## Shape

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

## Elevation

| Token | For |
|---|---|
| `--qx-shadow-raised` | Cards and other surfaces at rest |
| `--qx-shadow-raised-hover` | A raised surface under the pointer |
| `--qx-shadow-overlay` | Menus, popovers, dropdowns |
| `--qx-shadow-modal` | Dialogs and sheets |
| `--qx-shadow-inset` | Sunken wells |

Shadows are neutral. Raised, overlay and modal pair a tight contact shadow with a soft ambient
one. Each colour scheme has its own set.

## Motion

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

## Layers and layout

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

## Sizes, icons and the rest

| Token | Value |
|---|---|
| `--qx-size-control-sm` · `-md` · `-lg` | 28 · 32 · 40px (follow density) |
| `--qx-size-row` | 40px (follows density) |
| `--qx-size-target-min` | 24px, the smallest pointer target allowed |
| `--qx-size-icon-2xs` · `-xs` · `-sm` · `-md` · `-lg` | 12 · 14 · 16 · 20 · 24px |
| `--qx-icon-stroke-thin` · `-regular` | 1.5 · 2 |
| `--qx-opacity-disabled` | 0.4, for disabled content with no disabled colour (images) |
| `--qx-component-*` | Eight reviewed component sizes: sidebar widths, command palette, timeline marker, tour |

---

[← Qeetrix Tokens](../README.md)
