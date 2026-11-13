# ⚡ JavaScript

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
| `brandTheme(hex)` · `TENANT_TOKENS` | [A tenant's brand colour](brand-theme.md) |

Every value is declared `as const`, so TypeScript knows the literal type: `DURATION.normal` has
type `200`, not `number`. Colours are deliberately **not** exported to JavaScript. Use the CSS
variables, so colour schemes and tenant themes keep working.

---

[← Qeetrix Tokens](../README.md)
