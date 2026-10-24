/**
 * css.mjs — write a resolved DTCG token as CSS custom properties.
 *
 * One function per DTCG type this package uses. A type with no writer throws, so a new kind of
 * token cannot reach the stylesheet without a reviewed way of being written.
 */

/** Numbers without float noise or trailing zeros. */
const num = (n) => (Number.isInteger(n) ? String(n) : String(Number(n.toFixed(4))));

/** A DTCG colour as CSS. The source authors every colour in OKLCH, the space it is designed in. */
export function cssColor(value) {
  if (value.colorSpace !== "oklch") {
    throw new Error(`colours are authored in oklch; got ${value.colorSpace}`);
  }
  const [l, c, h] = value.components;
  const alpha = value.alpha ?? 1;
  return `oklch(${num(l)} ${num(c)} ${num(h)}${alpha < 1 ? ` / ${num(alpha)}` : ""})`;
}

const length = (value) => `${num(value.value)}${value.unit}`;

const GENERIC_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "math",
  "emoji",
  "fangsong",
]);
const family = (name) => (GENERIC_FAMILIES.has(name) ? name : `"${name}"`);
const fontStack = (value) => (Array.isArray(value) ? value : [value]).map(family).join(", ");

const shadowLayer = (s) =>
  `${s.inset ? "inset " : ""}${length(s.offsetX)} ${length(s.offsetY)} ${length(s.blur)} ${length(s.spread)} ${cssColor(s.color)}`;

/** The CSS variable name for a token id: `color.bg.brand.bold` → `--qx-color-bg-brand-bold`. */
export const cssVariable = (id) => `--qx-${id.replaceAll(".", "-")}`;

/**
 * Every declaration a token contributes, as `[property, value]`. Most types give one; a typography
 * token gives its `font` shorthand plus each property, so a consumer can use either.
 */
export function declarationsFor(token) {
  const name = cssVariable(token.id);
  const v = token.$value;
  switch (token.$type) {
    case "color":
      return [[name, cssColor(v)]];
    case "dimension":
    case "duration":
      return [[name, length(v)]];
    case "number":
    case "fontWeight":
      return [[name, num(v)]];
    case "cubicBezier":
      return [[name, v.join() === "0,0,1,1" ? "linear" : `cubic-bezier(${v.map(num).join(", ")})`]];
    case "fontFamily":
      return [[name, fontStack(v)]];
    case "shadow":
      return [[name, (Array.isArray(v) ? v : [v]).map(shadowLayer).join(", ") || "none"]];
    case "typography":
      return [
        [
          name,
          `${num(v.fontWeight)} ${length(v.fontSize)}/${num(v.lineHeight)} ${fontStack(v.fontFamily)}`,
        ],
        [`${name}-font-family`, fontStack(v.fontFamily)],
        [`${name}-font-size`, length(v.fontSize)],
        [`${name}-font-weight`, num(v.fontWeight)],
        [`${name}-line-height`, num(v.lineHeight)],
        [`${name}-letter-spacing`, length(v.letterSpacing)],
      ];
    default:
      throw new Error(`${token.id}: no CSS writer for $type ${token.$type}`);
  }
}
