/**
 * WCAG 2.2 AA for every pairing the colour roles are designed for, in every colour scheme.
 * Text 4.5:1 (1.4.3); icons, control boundaries, focus indicators and chart marks 3:1 (1.4.11).
 * Translucent layers are composited over the surface they sit on before measuring.
 */
import { type Color, converter, wcagContrast } from "culori";
import { describe, expect, it } from "vitest";
import { type DtcgColor, SCHEMES, toCulori, tokensFor } from "./support";

const rgb = converter("rgb");
const over = (fg: Color, bg: Color): Color => {
  const f = rgb(fg);
  const b = rgb(bg);
  const a = f.alpha ?? 1;
  const ch = (k: string) => (f[k] as number) * a + (b[k] as number) * (1 - a);
  return { mode: "rgb", r: ch("r"), g: ch("g"), b: ch("b") };
};

const SURFACES = ["canvas", "default", "raised", "overlay", "sunken"].map(
  (s) => `color.surface.${s}`,
);
const pairs = (fgs: string[], bgs: string[], min: number) =>
  fgs.flatMap((fg) => bgs.map((bg): [string, string, number] => [fg, bg, min]));

/** [foreground, background, minimum]. A background may be "a over b". */
const AA_PAIRS: [string, string, number][] = [
  // body text everywhere it is designed to sit
  ...pairs(["color.text.default", "color.text.subtle", "color.text.subtlest"], SURFACES, 4.5),
  ...pairs(
    ["color.text.default", "color.text.subtle"],
    [
      "color.bg.neutral.subtle",
      "color.bg.neutral.subtle-hover",
      "color.bg.brand.subtle",
      "color.bg.selected",
      "color.bg.input",
    ],
    4.5,
  ),
  ...pairs(["color.text.brand", "color.text.link", "color.text.link-hover"], SURFACES, 4.5),
  // labels on bold fills, through every interaction state
  ...pairs(
    ["color.text.on-brand", "color.icon.on-brand"],
    ["color.bg.brand.bold", "color.bg.brand.bold-hover", "color.bg.brand.bold-pressed"],
    4.5,
  ),
  ...pairs(
    ["color.text.on-bold"],
    [
      "color.bg.danger.bold",
      "color.bg.danger.bold-hover",
      "color.bg.danger.bold-pressed",
      "color.bg.success.bold",
      "color.bg.info.bold",
    ],
    4.5,
  ),
  ["color.text.on-warning", "color.bg.warning.bold", 4.5],
  ...pairs(
    ["color.text.inverse"],
    [
      "color.bg.neutral.bold",
      "color.bg.neutral.bold-hover",
      "color.bg.neutral.bold-pressed",
      "color.surface.inverse",
    ],
    4.5,
  ),
  // status text on surfaces and on its own subtle fill
  ...(["danger", "warning", "success", "info"] as const).flatMap(
    (s): [string, string, number][] => [
      ...pairs(
        [`color.text.${s}`],
        ["color.surface.canvas", "color.surface.default", "color.surface.raised"],
        4.5,
      ),
      [`color.text.${s}`, `color.bg.${s}.subtle`, 4.5],
    ],
  ),
  // non-text: icons, control boundaries, focus (1.4.11)
  ...pairs(
    [
      "color.icon.default",
      "color.icon.subtle",
      "color.icon.brand",
      "color.icon.danger",
      "color.icon.warning",
      "color.icon.success",
      "color.icon.info",
      "color.icon.highlight",
    ],
    ["color.surface.canvas", "color.surface.default", "color.surface.raised"],
    3,
  ),
  ...pairs(
    [
      "color.border.strong",
      "color.border.focus",
      "color.border.brand",
      "color.border.selected",
      "color.border.danger",
    ],
    [...SURFACES, "color.bg.input"],
    3,
  ),
  ["color.border.focus", "color.bg.brand.subtle", 3],
  // selected text stays readable
  ["color.text.default", "color.selection over color.surface.default", 4.5],
  ["color.text.link", "color.selection over color.surface.default", 4.5],
  // code
  ...pairs(
    [
      "color.code.keyword",
      "color.code.string",
      "color.code.number",
      "color.code.literal",
      "color.code.punctuation",
      "color.code.comment",
    ],
    ["color.surface.sunken", "color.surface.default"],
    4.5,
  ),
  // chart status marks and chrome
  ...pairs(
    [
      "color.dataviz.positive",
      "color.dataviz.negative",
      "color.dataviz.warning",
      "color.dataviz.axis",
    ],
    ["color.surface.default", "color.surface.canvas"],
    3,
  ),
];

describe.each(SCHEMES.map((s) => [s]))("%s", (scheme) => {
  const set = tokensFor({ colorScheme: scheme });
  const colour = (id: string): Color => {
    const token = set[id];
    if (!token) throw new Error(`no token ${id}`);
    return toCulori(token.$value as DtcgColor);
  };
  /** "a over b over c": composited innermost-first onto an opaque base. */
  const surface = (spec: string): Color => {
    const layers = spec.split(/\s+over\s+/).map(colour);
    let acc = layers.pop() as Color;
    if ((acc.alpha ?? 1) < 1) acc = over(acc, colour("color.surface.default"));
    while (layers.length) acc = over(layers.pop() as Color, acc);
    return acc;
  };

  it("meets AA on every designed pairing", () => {
    const failures = AA_PAIRS.map(([fg, bg, min]) => ({
      fg,
      bg,
      min,
      ratio: wcagContrast(surface(`${fg} over ${bg}`), surface(bg)),
    }))
      .filter((r) => r.ratio < r.min)
      .map((r) => `${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)}:1 < ${r.min}:1`);
    expect(AA_PAIRS.length).toBeGreaterThan(140);
    expect(failures).toEqual([]);
  });
});
