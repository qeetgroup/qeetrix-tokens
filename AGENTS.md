# AGENTS.md — qeetrix-tokens

**The model-neutral instruction file for coding agents.** [CLAUDE.md](CLAUDE.md),
[GEMINI.md](GEMINI.md) and [.github/copilot-instructions.md](.github/copilot-instructions.md) point
here and add nothing architectural.

## What this repository is

**`@qeetrix/tokens`** — the design tokens of **Qeetrix**, the Qeet Group design system, for every
Qeet product on every platform. The source is the **DTCG 2025.10** standard, composed by one
resolver document; **Terrazzo** parses and validates it; small writers in `scripts/` publish it.
Plain ESM, bun, MIT. It holds **decisions, not components**.

| Output | For |
|---|---|
| `dist/tokens.css` | every web app — React, Angular, Vue, plain HTML. CSS reaches it as `@import "@qeetrix/tokens"` (the `style` condition), JS as `@qeetrix/tokens/tokens.css` |
| `dist/dtcg/` | iOS, Android, Figma, docs sites — the source + resolver, and one resolved document per colour scheme |
| `dist/index.js` + `.d.ts` | JavaScript values (motion, icon sizes, breakpoints, geometry) and `brandTheme()` |

## Context hierarchy

```text
qeet-context (L0)  →  Qeetrix product context (L1 — not created yet)  →  qeetrix-tokens (L2 — this)
```

Siblings, by name: `qeetrix-react` (consumes this package; owns the Tailwind/shadcn mapping onto
these tokens) · `qeetrix-ui` (the predecessor, kept stable with its own tokens until retired) ·
`qeetrix-ios` · `qeetrix-android` · `qeetrix-icons` · `qeetrix-docs` · `qeetrix-story`.

## Commands — these are all of them

```bash
bun install
bun run build           # Terrazzo parses src/ → dist/tokens.css, dist/dtcg/, dist/index.*; tsc → dist/brand.*
bun run derive          # recompute derived values (dark tints, alpha layers) from their recipes
bun run typecheck
bun run lint            # biome check .
bun run format          # biome check --write .
bun run test            # rebuilds first, then every suite (~2 s)
bun run test:watch
bun run check:package   # publint + arethetypeswrong on the packed tarball
```

CI (`.github/workflows/ci.yml`) runs `build → typecheck → lint → test → check:package`;
`release.yml` runs the same before publishing.

## Layout

```text
src/qeetrix.resolver.json         the resolver: one foundation set, two modifiers (colorScheme, density)
src/tokens/primitive/             private palettes and scales — never published as CSS
src/tokens/semantic/foundation…   mode-independent semantic tokens (type, space, radius, motion, z, …)
src/tokens/modes/color-scheme/    light / dark: every colour and shadow
src/tokens/modes/density/         default / comfortable / compact: control sizes, row height, form gap
src/tokens/component.tokens.json  the reviewed component decisions
src/brand.ts                      brandTheme() — authored, compiled by tsc
scripts/build.mjs, scripts/lib/   the writers;  scripts/derive.mjs  derived-value maintenance
scripts/npm-versions.mjs           next unused patch on npm; CI skips versions npm has burned
tests/                            source · contrast · dataviz · stylesheet · dtcg · brand · package
tests/__snapshots__/tokens.css    the reviewed stylesheet — a value change shows in the PR diff
```

## Rules

### 1. Strict DTCG 2025.10, validated by Terrazzo
Colours are `{ colorSpace: "oklch", components, hex }` (an achromatic hue is `0`: Terrazzo rejects
the spec's `"none"`), lengths `{ value, unit: "px" | "rem" }`, durations `{ value, unit: "ms" }`.
No CSS in the source — no `var()`, `calc()`, `color-mix()`. A value computed from others is written
as a plain value with its recipe in `$extensions["in.qeet.qeetrix"].derivation`; `bun run derive`
rewrites it, and the tests fail when one drifts.

### 2. Three tiers, referencing downward
`primitive.*` owns values and references nothing. Semantic tokens reference primitives or semantic
tokens. Component tokens reference semantic or component tokens — never a primitive. Every
primitive is used (a colour ramp at least once). The component tier is a reviewed list in
`tests/source.test.ts`: a component token exists only when no semantic token expresses it and it
must match on more than one platform. Pass-through component tokens belong in the component library.

### 3. Names
`{category}.{property}.{role}.{emphasis}-{state}` — e.g. `color.bg.brand.bold-hover`.
Colour properties: `surface`, `bg`, `text`, `icon`, `border`, `overlay`, `selection`, `dataviz`,
`code`. Emphasis `subtle` / `bold`; states `hover`, `pressed`, `selected`, `disabled` (never
`active`, `hovered`, `focused`). Never put a mode in a name — modes are resolver modifiers.
Kebab-case segments. Every public token is described, on itself or its group.

### 4. Modes are orthogonal
`colorScheme` changes colours and shadows only; `density` changes control sizes, row height and form
gap only. Terrazzo verifies they never touch the same token, which is what lets the stylesheet's
mode blocks nest freely.

### 5. Accessibility is tested, not assumed
Every designed pairing is in `tests/contrast.test.ts` and meets WCAG 2.2 AA in every scheme — text
4.5:1, icons, boundaries, focus and chart marks 3:1. The categorical chart palette keeps its
contrast and colour-blind separation thresholds (`tests/dataviz.test.ts`). A new colour role comes
with its pairs.

### 6. One palette; tenants override an allowlist
Every Qeet product uses the same palette. Only a customer's own surface may apply the customer's
colour, through `brandTheme()`, which sets exactly `TENANT_TOKENS` — the tokens flagged
`tenantOverridable` — and guarantees AA for any input.

### 7. Generated files are never edited
`dist/` is build output. `tests/__snapshots__/tokens.css` changes only when a value changes on
purpose — review it in the PR (`bunx vitest run -u` updates it).

## Release

The Qeetrix flow, as in `qeetrix-ui` and `qeetrix-icons`: `version.yml` bumps the **patch** on every
PR; `release.yml` publishes on merge to `main`, then tags `vX.Y.Z`; `rollback.yml` moves `latest`.
While `0.x`: a new token or output is a patch; removing or renaming a token, changing what one
means, or changing an output's shape is a **minor** — raise it in `package.json` by hand. Write the
`CHANGELOG.md` section in the same PR. Publishing needs an `NPM_TOKEN` secret, or npm trusted
publishing with `QEETRIX_NPM_TRUSTED_PUBLISHING=true`.

npm never accepts a version number twice, even one that was unpublished — 0.0.1 and 0.0.2 of this
name are gone for good. `scripts/npm-versions.mjs` reads the registry's full history: the bump skips
burned numbers, and the release stops early with a clear error rather than failing at `npm publish`.

## Gotchas

- **`bun run test` rebuilds first**, so tests never see a stale `dist/`.
- **Breakpoints are `@custom-media`**, not CSS variables: `var()` cannot be used in a media query.
- **Values relative to the current text colour don't belong here.** `currentColor` has no value
  outside a browser, so a tint like "22% of the text colour" stays in the component library's CSS.
- **`qeetrix-ui` still carries its own, older token set.** A change here does not reach it.

## Escalate rather than proceed

Stop and report if a task would change what an existing token means, remove a token a product uses,
weaken a contrast pair or the chart palette's thresholds, add to the tenant allowlist, or require
changing a sibling repository.
