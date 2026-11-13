# 🏢 A tenant's brand colour

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

**The checked fill**: a checked checkbox, radio, switch or slider is the brand fill, at rest and
hovered, so `brandTheme()` keeps both at 3:1 on the surfaces they sit on, with the label still at
4.5:1, as Qeet's own qeet.650 hover does in dark: every light surface, and `surface-default`,
`-raised` and `-overlay` in dark.

- **Light:** a pale colour that takes the near-black label (a pale pink, a peach) is darkened just
  enough to reach 3:1 on white. It keeps its hue and its near-black label; dark keeps the tenant's
  own colour, which already stands out there.
- **Dark:** a fill too dark for the dark surfaces is lightened just enough.
- **Hover and pressed** step away from the label. Where that would lose the surfaces, the hover
  takes the largest step that keeps both the surfaces and the label, so it always shows; pressed is
  momentary and takes its whole step, towards the label when that keeps both.
- A fill that already clears the surfaces is unchanged, Qeet's own included.

---

[← Qeetrix Tokens](../README.md)
