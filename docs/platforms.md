# 📱 iOS, Android and Figma

`dtcg/light.tokens.json` and `dtcg/dark.tokens.json` are standard DTCG 2025.10 documents. Each
contains every token for one colour scheme at default density.

- **Colours** are `{ "colorSpace": "oklch", "components": [L, C, H], "hex": "#rrggbb", "alpha" }`.
- **Lengths** are `{ "value": 2, "unit": "rem" }` or `px`, and **durations** are
  `{ "value": 200, "unit": "ms" }`.
- **References are kept.** `color.bg.brand.bold` points to `{primitive.color.qeet.600}`, so the
  link between primitive and semantic tokens survives into Figma Variables.
- **Typography roles** carry two more facts in `$extensions["in.qeet.qeetrix"]`: `lineHeight`, the
  line height as a length (`{ "value": 1.25, "unit": "rem" }` for `body.md`), for a platform that
  sets line height in points or sp; and `fontGeometry`, the `font.geometry` token the role uses
  (`"{font.geometry.body}"`). The composite's own `lineHeight` is that length divided by the font
  size at full precision (`1.4285714285714286`), so `fontSize × lineHeight` is exactly 20 in
  double and single precision.

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

---

[← Qeetrix Tokens](../README.md)
