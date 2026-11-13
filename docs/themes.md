# 🌗 Colour scheme and density

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

---

[← Qeetrix Tokens](../README.md)
