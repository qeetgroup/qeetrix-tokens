/**
 * css.mjs — write a resolved DTCG token as CSS custom properties.
 *
 * One function per DTCG type this package uses. A type with no writer throws, so a new kind of
 * token cannot reach the stylesheet without a reviewed way of being written.
 */
import { EXTENSION } from "./load.mjs";

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
 * A typography role's line height, the ratio of its line height length to its font size
 * (scripts/derive.mjs), rounded *up* at the sixth decimal: 20/14 is written 1.428572 (QTRX-184).
 * Browsers truncate a line box to a fraction of a pixel (1/64 in Chromium and WebKit), and WebKit
 * computes a unitless line height in single precision, so a ratio a hair under the exact one lays
 * out 1/64px short, 15.984375px for 16: 4-decimal rounding (1.3333) did in Chromium and WebKit, and
 * even the full double does for nine roles in WebKit. Rounded up at the sixth decimal, every role
 * lays out at exactly its pixel line height in Chromium, Firefox and WebKit (measured), through
 * the `font` shorthand, `line-height` and `calc(font-size * line-height)` alike, and the ratio
 * stays within 1e-6 of the DTCG document's, which is exact.
 */
function ratio(n) {
  const near = Number(n.toFixed(6));
  return String(near >= n - 1e-12 ? near : Number((near + 1e-6).toFixed(6)));
}

/** The value of the token a `{reference}` names, from the same resolved set. */
function referenced(set, ref, from) {
  const token = set?.[ref.slice(1, -1)];
  if (!token) throw new Error(`${from}: ${ref} is not in the token set`);
  return token.$value;
}

/**
 * Every declaration a token contributes, as `[property, value]`. Most types give one; a typography
 * token gives its `font` shorthand plus each property, so a consumer can use either, and its
 * letter style on Qeet Sans's GEOM axis (`-font-geometry`, read from the font.geometry token the
 * role names), which a `font` shorthand cannot carry. `set` is the resolved token set the token
 * belongs to; only typography needs it.
 */
export function declarationsFor(token, set) {
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
    case "typography": {
      const geometry = token.$extensions?.[EXTENSION]?.fontGeometry;
      if (!geometry) throw new Error(`${token.id}: a typography role names its fontGeometry`);
      return [
        [
          name,
          `${num(v.fontWeight)} ${length(v.fontSize)}/${ratio(v.lineHeight)} ${fontStack(v.fontFamily)}`,
        ],
        [`${name}-font-family`, fontStack(v.fontFamily)],
        [`${name}-font-size`, length(v.fontSize)],
        [`${name}-font-weight`, num(v.fontWeight)],
        [`${name}-line-height`, ratio(v.lineHeight)],
        [`${name}-letter-spacing`, length(v.letterSpacing)],
        [`${name}-font-geometry`, num(referenced(set, geometry, token.id))],
      ];
    }
    default:
      throw new Error(`${token.id}: no CSS writer for $type ${token.$type}`);
  }
}
