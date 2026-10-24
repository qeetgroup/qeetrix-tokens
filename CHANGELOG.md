# @qeetrix/tokens

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
