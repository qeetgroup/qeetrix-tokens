/**
 * brandTheme — a tenant's brand colour, as the Qeetrix brand tokens, for both colour schemes.
 *
 * Qeet products share one palette. The one exception is a customer's own surface — a hosted
 * sign-in page, a checkout — which shows the customer's colour. That colour may override exactly
 * the tokens in TENANT_TOKENS and nothing else, and every value returned here meets WCAG AA by
 * construction:
 *
 *   - the label on the brand fill reaches 4.5:1 — white, or near-black for a light brand colour;
 *     a mid-tone colour that carries neither is darkened until white does;
 *   - the fill and its hover keep 3:1 against the surfaces of their scheme, so a checked control
 *     stands out on a page, a menu or a dialog: a pale colour is darkened just enough in light (its
 *     label stays near-black), a dark one lightened just enough in dark;
 *   - hover and pressed step away from the label colour, so they only gain contrast — or, where
 *     that would lose the surfaces, the largest step that keeps both, so a hover always shows;
 *   - brand text and links reach 4.5:1, and icons, borders and the focus ring 3:1, on every surface
 *     of the scheme they are for, and on the brand's own tints (bg.brand.subtle, bg.selected) —
 *     a brand Badge, a ghost button's hover, a link or focus ring in a selected row;
 *   - brand text also reaches 4.5:1 on the tints' hover and pressed states — a ghost button
 *     pressed, a selected row hovered — and on the neutral fills at rest, hovered and pressed.
 *
 * Apply the result as CSS variables on the tenant's subtree — with setProperty, because custom
 * properties can't be assigned as style fields:
 *
 *   const { light, dark } = brandTheme("#1a73e8");
 *   for (const [name, value] of Object.entries(light)) lightRoot.style.setProperty(name, value);
 *
 * No dependencies: the colour maths (OKLab/OKLCH, sRGB, WCAG relative luminance) is below.
 */

/** The brand tokens a tenant's colour may override — every one of them, and only these. */
export const TENANT_TOKENS = [
  "--qx-color-bg-brand-bold",
  "--qx-color-bg-brand-bold-hover",
  "--qx-color-bg-brand-bold-pressed",
  "--qx-color-bg-brand-subtle",
  "--qx-color-bg-brand-subtle-hover",
  "--qx-color-bg-brand-subtle-pressed",
  "--qx-color-bg-selected",
  "--qx-color-bg-selected-hover",
  "--qx-color-text-brand",
  "--qx-color-text-link",
  "--qx-color-text-link-hover",
  "--qx-color-text-on-brand",
  "--qx-color-icon-brand",
  "--qx-color-icon-on-brand",
  "--qx-color-border-brand",
  "--qx-color-border-focus",
  "--qx-color-border-selected",
  "--qx-color-selection",
] as const;

export type TenantToken = (typeof TENANT_TOKENS)[number];

/** CSS custom properties for each colour scheme, keyed by variable name. */
export interface BrandTheme {
  light: Record<TenantToken, string>;
  dark: Record<TenantToken, string>;
}

// ---- colour maths -------------------------------------------------------------

type Oklch = { l: number; c: number; h: number };
type Rgb = [number, number, number];

const toLinear = (u: number) => (u <= 0.04045 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4);

function oklchToLinearRgb({ l, c, h }: Oklch): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l1 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m1 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s1 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1,
    -1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1,
    -0.0041960863 * l1 - 0.7034186147 * m1 + 1.707614701 * s1,
  ];
}

function linearRgbToOklch([r, g, b]: Rgb): Oklch {
  const l1 = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m1 = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s1 = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l1 + 0.793617785 * m1 - 0.0040720468 * s1;
  const A = 1.9779984951 * l1 - 2.428592205 * m1 + 0.4505937099 * s1;
  const B = 0.0259040371 * l1 + 0.7827717662 * m1 - 0.808675766 * s1;
  const c = Math.hypot(A, B);
  const h = c < 1e-6 ? 0 : (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c, h: h < 0 ? h + 360 : h };
}

const inGamut = (rgb: Rgb) => rgb.every((u) => u >= -1e-4 && u <= 1 + 1e-4);

/** The colour at this lightness and hue with the most chroma sRGB can show, up to `c`. */
function clampChroma({ l, c, h }: Oklch): Oklch {
  if (inGamut(oklchToLinearRgb({ l, c, h }))) return { l, c, h };
  let lo = 0;
  let hi = c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinearRgb({ l, c: mid, h }))) lo = mid;
    else hi = mid;
  }
  return { l, c: lo, h };
}

/** WCAG 2.2 relative luminance. */
function luminance(color: Oklch): number {
  const [r, g, b] = oklchToLinearRgb(color).map((u) => Math.min(1, Math.max(0, u)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.2 contrast ratio. */
export function contrast(a: Oklch, b: Oklch): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `#rgb` or `#rrggbb` → OKLCH. */
export function parseHex(color: string): Oklch {
  const hex = color.trim().replace(/^#/, "");
  const full = hex.length === 3 ? [...hex].map((ch) => ch + ch).join("") : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) {
    throw new TypeError(`brandTheme: expected a hex colour such as "#1a73e8", got "${color}"`);
  }
  const channel = (i: number) => toLinear(Number.parseInt(full.slice(i, i + 2), 16) / 255);
  return linearRgbToOklch([channel(0), channel(2), channel(4)]);
}

/** Mix `fg` into `bg` by `amount` in OKLab, as CSS `color-mix(in oklab, …)` does. */
function mix(fg: Oklch, bg: Oklch, amount: number): Oklch {
  const lab = ({ l, c, h }: Oklch) => [
    l,
    c * Math.cos((h * Math.PI) / 180),
    c * Math.sin((h * Math.PI) / 180),
  ];
  const [l1, a1, b1] = lab(fg);
  const [l2, a2, b2] = lab(bg);
  const a = a1 * amount + a2 * (1 - amount);
  const b = b1 * amount + b2 * (1 - amount);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { l: l1 * amount + l2 * (1 - amount), c: Math.hypot(a, b), h: h < 0 ? h + 360 : h };
}

const round = (n: number) => Number(n.toFixed(4));
const css = ({ l, c, h }: Oklch, alpha = 1) =>
  `oklch(${round(l)} ${round(c)} ${round(h)}${alpha < 1 ? ` / ${alpha}` : ""})`;
const atLightness = (color: Oklch, l: number) =>
  clampChroma({ l: Math.min(1, Math.max(0, l)), c: color.c, h: color.h });

// ---- the Qeetrix values these are derived against -----------------------------------
// Each is a token value; tests/brand.test.ts asserts they still match the built tokens.

/** graphite.0 and graphite.950: the two label colours. */
export const WHITE: Oklch = { l: 1, c: 0, h: 0 };
export const INK: Oklch = { l: 0.16, c: 0.001, h: 60 };

/** The surfaces brand text, icons and borders must stand out from, per scheme. */
export const SURFACES: Record<"light" | "dark", Oklch[]> = {
  light: [
    { l: 0.985, c: 0.002, h: 60 }, // surface.canvas
    { l: 1, c: 0, h: 0 }, //          surface.default, raised, overlay
  ],
  dark: [
    { l: 0.16, c: 0.001, h: 60 }, //  surface.canvas
    { l: 0.185, c: 0.001, h: 60 }, // surface.default
    { l: 0.21, c: 0.001, h: 60 }, //  surface.raised
    { l: 0.235, c: 0.001, h: 60 }, // surface.overlay
  ],
};

/** The neutral fills an item takes at rest, hovered and pressed (bg.neutral.subtle, -hover, -pressed). */
export const NEUTRALS: Record<"light" | "dark", Oklch[]> = {
  light: [
    { l: 0.958, c: 0.003, h: 60 }, // graphite.100
    { l: 0.937, c: 0.003, h: 60 }, // graphite.150
    { l: 0.912, c: 0.003, h: 60 }, // graphite.200
  ],
  dark: [
    { l: 0.268, c: 0.001, h: 60 }, //  graphite.825
    { l: 0.3, c: 0.0015, h: 60 }, //   graphite.800
    { l: 0.34, c: 0.0015, h: 60 }, //  graphite.750
  ],
};

/** The light subtle fills follow the qeet ramp's 100 / 150 / 200 steps, scaled to the tenant's chroma. */
export const SUBTLE_STEPS = {
  100: { l: 0.952, c: 0.03 },
  150: { l: 0.93, c: 0.044 },
  200: { l: 0.906, c: 0.06 },
} as const;
export const QEET_PEAK_CHROMA = 0.1855;

/** WCAG minimums, plus a margin so rounding the output to 4 decimals can never drop below them. */
const TEXT = 4.5 + 0.05;
const NON_TEXT = 3 + 0.05;

/** The dark subtle fills mix the brand colour into surface.default, as the qeet tokens do. */
const DARK_SUBTLE = { rest: 0.1, hover: 0.14, pressed: 0.18 } as const;
const DARK_SELECTED = { rest: 0.14, hover: 0.18 } as const;

// ---- derivation -----------------------------------------------------------------

/** Walk lightness from `start` in `direction` until `passes`; the step is 0.005. */
function seek(
  color: Oklch,
  start: number,
  direction: 1 | -1,
  passes: (c: Oklch) => boolean,
): Oklch {
  for (let l = start; l >= 0 && l <= 1; l += 0.005 * direction) {
    const candidate = atLightness(color, l);
    if (passes(candidate)) return candidate;
  }
  return atLightness(color, direction === 1 ? 1 : 0);
}

const clears = (color: Oklch, surfaces: Oklch[], ratio: number) =>
  surfaces.every((surface) => contrast(color, surface) >= ratio);

/**
 * The surfaces a checked checkbox, radio, switch or slider sits on, menus and dialogs included: every
 * light surface; in dark, surface.default, raised and overlay.
 */
const FILL_SURFACES: Record<"light" | "dark", Oklch[]> = {
  light: SURFACES.light,
  dark: SURFACES.dark.slice(1),
};

/** Whether a fill stands out from the scheme's surfaces at 3:1 with its label still at 4.5:1. */
const fitsOn = (scheme: "light" | "dark", label: Oklch) => (c: Oklch) =>
  clears(c, FILL_SURFACES[scheme], NON_TEXT) && contrast(c, label) >= TEXT;

/**
 * A fill a checked control shows: 3:1 against the surfaces it sits on, with its label still at 4.5:1,
 * as qeet.650 does for Qeet's own dark hover. `preferred` when it already does; otherwise the nearest
 * fill that does — darker in light, where a pale colour keeps its near-black label, and lighter in
 * dark, where the label is white whenever a fill is that dark.
 */
function onSurfaces(preferred: Oklch, label: Oklch, scheme: "light" | "dark"): Oklch {
  const fits = fitsOn(scheme, label);
  if (fits(preferred)) return preferred;
  const found = seek(preferred, preferred.l, scheme === "light" ? -1 : 1, fits);
  return fits(found) ? found : preferred;
}

/**
 * Hover or pressed: `amount` of lightness away from the label, so it only gains contrast with it.
 *
 * Where that step would lose the surfaces, a hover takes the largest step, up to `amount`, that keeps
 * both the surfaces and the label — away from the label first, then towards it — so it always differs
 * from the fill. Pressed is momentary: the whole step towards the label if that keeps both, otherwise
 * its step away.
 */
function stateOf(
  fill: Oklch,
  label: Oklch,
  amount: number,
  scheme: "light" | "dark",
  momentary: boolean,
): Oklch {
  const fits = fitsOn(scheme, label);
  const away = label === WHITE ? -1 : 1;
  const at = (delta: number) => atLightness(fill, fill.l + delta);
  if (fits(at(amount * away))) return at(amount * away);
  if (momentary) return fits(at(-amount * away)) ? at(-amount * away) : at(amount * away);
  for (let step = Math.round(amount / 0.005); step >= 1; step--) {
    for (const direction of [away, -away]) {
      const candidate = at(step * 0.005 * direction);
      if (fits(candidate)) return candidate;
    }
  }
  return fill;
}

/**
 * Text, links, icons and lines for one scheme: as close to the brand colour as contrast allows,
 * against the scheme's surfaces and the tints derived from the brand colour itself. Links and
 * lines clear the resting tints; brand text clears every tint and neutral fill, through hover and
 * pressed.
 */
function marks(seed: Oklch, scheme: "light" | "dark", tints: { rest: Oklch[]; all: Oklch[] }) {
  const atRest = [...SURFACES[scheme], ...tints.rest];
  const everywhere = [...SURFACES[scheme], ...NEUTRALS[scheme], ...tints.all];
  // Light surfaces need a darker mark, dark surfaces a lighter one.
  const direction = scheme === "light" ? -1 : 1;
  const text = seek(seed, seed.l, direction, (c) => clears(c, everywhere, TEXT));
  const link = seek(seed, seed.l, direction, (c) => clears(c, atRest, TEXT));
  const line = seek(seed, seed.l, direction, (c) => clears(c, atRest, NON_TEXT));
  const linkHover = seek(link, link.l + 0.06 * direction, direction, (c) =>
    clears(c, atRest, TEXT),
  );
  return { text, link, line, linkHover };
}

/** The tenant's brand colour as the Qeetrix brand tokens, for light and dark. */
export function brandTheme(color: string): BrandTheme {
  const seed = clampChroma(parseHex(color));

  // The fill and its label. White first; near-black for a light colour; otherwise darken until
  // white reaches 4.5:1, so a mid-tone never ships with an unreadable label.
  let bold = seed;
  let label = WHITE;
  if (contrast(bold, WHITE) < TEXT) {
    if (contrast(bold, INK) >= TEXT) label = INK;
    else bold = seek(seed, seed.l, -1, (c) => contrast(c, WHITE) >= TEXT);
  }
  // The fill and its hover must also stand out from the scheme's surfaces, for a checked control: a
  // pale fill is darkened just enough in light, a dark one lightened just enough in dark. A fill that
  // already clears them is unchanged. Hover and pressed step away from the label (see stateOf).
  const lightBold = onSurfaces(bold, label, "light");
  const hover = stateOf(lightBold, label, 0.055, "light", false);
  const pressed = stateOf(lightBold, label, 0.11, "light", true);
  const darkBold = onSurfaces(bold, label, "dark");
  const darkHover = stateOf(darkBold, label, 0.055, "dark", false);
  const darkPressed = stateOf(darkBold, label, 0.11, "dark", true);

  const chroma = Math.min(seed.c, QEET_PEAK_CHROMA) / QEET_PEAK_CHROMA;
  const lightSubtle = (step: keyof typeof SUBTLE_STEPS) =>
    clampChroma({ l: SUBTLE_STEPS[step].l, c: SUBTLE_STEPS[step].c * chroma, h: seed.h });
  const surfaceDefaultDark = SURFACES.dark[1] as Oklch;
  const darkSubtle = (amount: number) => mix(seed, surfaceDefaultDark, amount);
  // The tints brand marks are set on: at rest, bg.brand.subtle and bg.selected (one value in
  // light); with them, their hover and pressed states.
  const tints = {
    light: {
      rest: [lightSubtle(100)],
      all: [lightSubtle(100), lightSubtle(150), lightSubtle(200)],
    },
    dark: {
      rest: [darkSubtle(DARK_SUBTLE.rest), darkSubtle(DARK_SELECTED.rest)],
      all: [
        ...[DARK_SUBTLE.rest, DARK_SUBTLE.hover, DARK_SUBTLE.pressed].map(darkSubtle),
        ...[DARK_SELECTED.rest, DARK_SELECTED.hover].map(darkSubtle),
      ],
    },
  };

  const shared = {
    "--qx-color-text-on-brand": css(label),
    "--qx-color-icon-on-brand": css(label),
    "--qx-color-selection": css(seed, 0.2),
  };
  const light = marks(seed, "light", tints.light);
  const dark = marks(seed, "dark", tints.dark);

  return {
    light: {
      ...shared,
      "--qx-color-bg-brand-bold": css(lightBold),
      "--qx-color-bg-brand-bold-hover": css(hover),
      "--qx-color-bg-brand-bold-pressed": css(pressed),
      "--qx-color-bg-brand-subtle": css(lightSubtle(100)),
      "--qx-color-bg-brand-subtle-hover": css(lightSubtle(150)),
      "--qx-color-bg-brand-subtle-pressed": css(lightSubtle(200)),
      "--qx-color-bg-selected": css(lightSubtle(100)),
      "--qx-color-bg-selected-hover": css(lightSubtle(150)),
      "--qx-color-text-brand": css(light.text),
      "--qx-color-text-link": css(light.link),
      "--qx-color-text-link-hover": css(light.linkHover),
      "--qx-color-icon-brand": css(light.line),
      "--qx-color-border-brand": css(light.line),
      "--qx-color-border-focus": css(light.line),
      "--qx-color-border-selected": css(light.line),
    },
    dark: {
      ...shared,
      "--qx-color-bg-brand-bold": css(darkBold),
      "--qx-color-bg-brand-bold-hover": css(darkHover),
      "--qx-color-bg-brand-bold-pressed": css(darkPressed),
      "--qx-color-bg-brand-subtle": css(darkSubtle(DARK_SUBTLE.rest)),
      "--qx-color-bg-brand-subtle-hover": css(darkSubtle(DARK_SUBTLE.hover)),
      "--qx-color-bg-brand-subtle-pressed": css(darkSubtle(DARK_SUBTLE.pressed)),
      "--qx-color-bg-selected": css(darkSubtle(DARK_SELECTED.rest)),
      "--qx-color-bg-selected-hover": css(darkSubtle(DARK_SELECTED.hover)),
      "--qx-color-text-brand": css(dark.text),
      "--qx-color-text-link": css(dark.link),
      "--qx-color-text-link-hover": css(dark.linkHover),
      "--qx-color-icon-brand": css(dark.line),
      "--qx-color-border-brand": css(dark.line),
      "--qx-color-border-focus": css(dark.line),
      "--qx-color-border-selected": css(dark.line),
    },
  };
}
