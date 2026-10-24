# @qeetrix/tokens

The design tokens of **Qeetrix**, the Qeet Group design system — colour, typography, spacing,
radius, elevation, motion and density — for every Qeet product, on every platform.

[![CI](https://github.com/qeetgroup/qeetrix-tokens/actions/workflows/ci.yml/badge.svg)](./.github/workflows/ci.yml)

> **Status — 0.0.3, the first published version.**

## What's inside

One source of truth in the [DTCG 2025.10](https://www.designtokens.org/) standard, one output per
kind of consumer:

| Import | For | Contains |
|---|---|---|
| `@qeetrix/tokens/tokens.css` | Web apps — React, Angular, Vue, plain HTML | CSS variables for every mode. No raw palette values |
| `@qeetrix/tokens/dtcg/light.tokens.json`<br>`@qeetrix/tokens/dtcg/dark.tokens.json` | iOS, Android, Figma, docs sites | Every token, resolved for one colour scheme |
| `@qeetrix/tokens/dtcg/qeetrix.resolver.json` | Tools that read DTCG resolvers | The source and its modes (colour scheme × density), as published |
| `@qeetrix/tokens` | JavaScript | `DURATION`, `EASING`, `SPRING`, `ICON_SIZE`, `ICON_STROKE`, `BREAKPOINT`, `COMPONENT`, and `brandTheme()` |

## Install

```bash
bun add @qeetrix/tokens@0.0.3 --exact
```

Pin the exact version while the package is `0.x`: npm treats every `0.0.x` release as potentially
breaking, so `^0.0.3` never picks up `0.0.4` on its own.

## Web

```css
@import "@qeetrix/tokens/tokens.css";

.panel {
  background: var(--qx-color-surface-raised);
  box-shadow: var(--qx-shadow-raised);
  color: var(--qx-color-text-default);
  border-radius: var(--qx-radius-surface);
  padding: var(--qx-space-inset-lg);
  font: var(--qx-typography-body-md);
}
```

- **Colour scheme** — `data-qx-color-scheme="dark"` (or `"light"`) on `<html>` or on any subtree.
- **Density** — `data-qx-density="compact"`, `"comfortable"` or `"default"` on any element.
- **Breakpoints** — `@custom-media --qx-viewport-medium | expanded | large | xlarge` (600 / 840 /
  1200 / 1600px, the same window size classes as Android). Needs a CSS build step that understands
  `@custom-media` (Lightning CSS, PostCSS, Tailwind v4).
- **Reduced motion** — every duration collapses to 0ms under `prefers-reduced-motion: reduce`.
- The stylesheet is self-contained: no Tailwind or other stylesheet is needed behind it.

## JavaScript

```ts
import { DURATION, EASING, BREAKPOINT } from "@qeetrix/tokens";

element.animate(keyframes, { duration: DURATION.normal, easing: EASING.enter });
const wide = matchMedia(`(width >= ${BREAKPOINT.expanded}px)`).matches;
```

## iOS, Android, Figma and docs sites

Read `dtcg/<scheme>.tokens.json` — a standard DTCG 2025.10 document — or run the resolver for any
combination of modes. Colours are `{ "colorSpace": "oklch", "components": [L, C, H], "hex" }`;
lengths are `{ "value", "unit": "px" | "rem" }`; references between tokens are kept, so the
primitive → semantic relationships survive into Figma Variables. Native motion uses
`motion.spring.*` (Compose stiffness and damping ratio).

## How the tokens are organised

| Tier | Holds | Example |
|---|---|---|
| Primitive | Raw palettes and scales — private, never published as CSS | `primitive.color.qeet.600` |
| Semantic | Meaning — the API products use | `color.bg.brand.bold`, `color.text.subtle`, `radius.control` |
| Component | The few component decisions with no semantic equivalent | `component.sidebar.width.expanded` |

Names follow one pattern: `{category}.{property}.{role}.{emphasis}-{state}` —
`color.bg.brand.bold-hover`, `color.text.subtle`, `color.border.focus`. Emphasis is `subtle` or
`bold`; states are `hover`, `pressed`, `selected`, `disabled`. Text and icon colours are separate:
text must reach 4.5:1, icons 3:1.

**One palette for every product**: graphite (neutrals), qeet (the brand) and red, green, amber and
blue for status. Brand is a semantic role (`color.bg.brand.bold`, `color.text.brand`, …), not a
separate palette. Charts use a dedicated categorical palette designed for colour-blind readers.

## A tenant's brand colour

A customer's own surface — a hosted sign-in page, a checkout — may show the customer's colour.
`brandTheme()` turns one colour into every brand token, for both schemes, with WCAG AA guaranteed:

```ts
import { brandTheme } from "@qeetrix/tokens";

const { light, dark } = brandTheme("#1a73e8");
Object.assign(document.documentElement.style, light);
```

It overrides exactly the tokens in `TENANT_TOKENS` — brand fills, brand text and links, brand
icons and borders, the focus ring, selection — and nothing else.

## Contributing

Rules, commands and what CI enforces are in [AGENTS.md](AGENTS.md). Security reports:
[SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Qeet Group
