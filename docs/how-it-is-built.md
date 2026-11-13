# 🏗️ How it is built

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

---

[← Qeetrix Tokens](../README.md)
