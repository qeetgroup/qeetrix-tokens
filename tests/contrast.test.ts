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

/** Status and brand text: every role that colours text by meaning. */
const ROLE_TEXT = ["danger", "warning", "success", "info", "brand"].map((r) => `color.text.${r}`);
/**
 * Every fill an item takes at rest, hovered, pressed or selected — the neutral, selected and brand
 * tints and each of their states — read from the tokens, so a new state joins the matrix by itself.
 */
const INTERACTION_FILLS = Object.keys(tokensFor())
  .filter((id) =>
    /^color\.bg\.(neutral\.subtle|selected|brand\.subtle)(-hover|-pressed)?$/.test(id),
  )
  .sort();

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
  // links on the brand's own tints: a link in a selected row
  ...pairs(
    ["color.text.link", "color.text.link-hover"],
    ["color.bg.brand.subtle", "color.bg.selected"],
    4.5,
  ),
  // the matrix: status and brand text on every interaction fill, at rest, hovered and pressed — a
  // destructive Menu item, a ghost button, a Badge in a selected row, a status value in a field
  ...pairs(ROLE_TEXT, INTERACTION_FILLS, 4.5),
  // labels on bold fills, through every interaction state
  ...pairs(
    ["color.text.on-brand", "color.icon.on-brand"],
    ["color.bg.brand.bold", "color.bg.brand.bold-hover", "color.bg.brand.bold-pressed"],
    4.5,
  ),
  // a checked checkbox, radio, switch or slider thumb is the brand fill, at rest and hovered, on
  // whatever surface it sits on, menus and dialogs included (QTRX-187). Pressed is momentary.
  ...pairs(["color.bg.brand.bold", "color.bg.brand.bold-hover"], SURFACES, 3),
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
  // status text on surfaces (overlay: a destructive Menu item at rest) and on its own subtle fill
  // (a Badge); the interaction fills are in the matrix above
  ...(["danger", "warning", "success", "info"] as const).flatMap(
    (s): [string, string, number][] => [
      ...pairs(
        [`color.text.${s}`],
        [
          "color.surface.canvas",
          "color.surface.default",
          "color.surface.raised",
          "color.surface.overlay",
        ],
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
      "color.border.warning",
      "color.border.success",
      "color.border.info",
    ],
    [...SURFACES, "color.bg.input"],
    3,
  ),
  // a status rule against its own tint: the rule under a status banner
  ...(["danger", "warning", "success", "info"] as const).map((s): [string, string, number] => [
    `color.border.${s}`,
    `color.bg.${s}.subtle`,
    3,
  ]),
  // the focus frame on a brand tint, and inside a selected row
  ["color.border.focus", "color.bg.brand.subtle", 3],
  ["color.border.focus", "color.bg.selected", 3],
  // filled fields: their bottom line, focus frame and error frame sit on the field fill
  ...pairs(
    ["color.border.strong", "color.border.focus", "color.border.danger"],
    ["color.bg.neutral.subtle", "color.bg.neutral.subtle-hover"],
    3,
  ),
  // selected text stays readable
  ["color.text.default", "color.selection over color.surface.default", 4.5],
  ["color.text.link", "color.selection over color.surface.default", 4.5],
  // code, on the surfaces it is set on and on the code block panel (bg.neutral.subtle)
  ...pairs(
    [
      "color.code.keyword",
      "color.code.string",
      "color.code.number",
      "color.code.literal",
      "color.code.punctuation",
      "color.code.comment",
    ],
    ["color.surface.sunken", "color.surface.default", "color.bg.neutral.subtle"],
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
    expect(AA_PAIRS.length).toBeGreaterThan(200);
    expect(INTERACTION_FILLS).toHaveLength(8);
    expect(failures).toEqual([]);
  });
});

/**
 * Rules aren't held to a WCAG minimum, but they must show. In light, border.subtle is 1.20:1 on the
 * white surfaces and border.default 1.30:1; dark held neither on surface.overlay, its lightest
 * surface, where border.subtle equalled the fill (1.00:1) and border.default was 1.10:1 (QTRX-183).
 */
describe("rules and the brand hover", () => {
  const ratio = (scheme: string, fg: string, bg: string) => {
    const set = tokensFor({ colorScheme: scheme });
    const colour = (id: string) => toCulori(set[id]?.$value as DtcgColor);
    return wcagContrast(colour(fg), colour(bg));
  };
  const on = ["overlay", "raised", "default"].map((s) => `color.surface.${s}`);
  const at = (scheme: string, fg: string) => on.map((bg) => ratio(scheme, fg, bg).toFixed(2));

  it.each(SCHEMES.map((s) => [s]))(
    "keeps border.subtle visible on every surface in %s, and border.default stronger",
    (scheme) => {
      for (const bg of on) {
        expect(ratio(scheme, "color.border.subtle", bg), bg).toBeGreaterThanOrEqual(1.2);
      }
      for (const bg of SURFACES) {
        expect(ratio(scheme, "color.border.default", bg), bg).toBeGreaterThan(
          ratio(scheme, "color.border.subtle", bg),
        );
      }
    },
  );

  it("draws the dark rules one tone step apart, as light does (QTRX-183)", () => {
    // on overlay, raised and default: light is 1.20 and 1.30 on each
    expect(at("dark", "color.border.subtle")).toEqual(["1.22", "1.30", "1.37"]);
    expect(at("dark", "color.border.default")).toEqual(["1.42", "1.51", "1.58"]);
  });

  it("keeps a hovered checked control at 3:1 on the dark overlays, with its white label (QTRX-187)", () => {
    // qeet.700, the hover before, was 2.93, 3.11 and 3.27
    expect(at("dark", "color.bg.brand.bold-hover")).toEqual(["3.31", "3.52", "3.70"]);
    for (const scheme of SCHEMES) {
      expect(
        ratio(scheme, "color.text.on-brand", "color.bg.brand.bold-hover"),
        scheme,
      ).toBeGreaterThanOrEqual(4.5);
    }
    expect(ratio("dark", "color.text.on-brand", "color.bg.brand.bold-hover").toFixed(2)).toBe(
      "5.04",
    );
  });
});
