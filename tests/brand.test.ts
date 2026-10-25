/**
 * brandTheme() — a tenant's colour as the brand tokens. Only the allowlisted tokens, and AA by
 * construction for any colour a tenant can supply.
 */
import { type Color, clampChroma, converter, formatHex, parse, wcagContrast } from "culori";
import { describe, expect, it } from "vitest";
import { cssVariable } from "../scripts/lib/css.mjs";
import { EXTENSION } from "../scripts/lib/load.mjs";
import {
  brandTheme,
  INK,
  NEUTRALS,
  QEET_PEAK_CHROMA,
  SUBTLE_STEPS,
  SURFACES,
  TENANT_TOKENS,
  WHITE,
} from "../src/brand";
import { type DtcgColor, toCulori, tokensFor } from "./support";

const light = tokensFor({ colorScheme: "light" });
const dark = tokensFor({ colorScheme: "dark" });
const components = (set: typeof light, id: string) => {
  const token = set[id];
  if (!token) throw new Error(`no token ${id}`);
  return (token.$value as DtcgColor).components;
};
const asOklch = ([l, c, h]: number[]) => ({ l, c, h });

describe("contract", () => {
  it("overrides exactly the tokens the source flags as tenant-overridable", () => {
    const flagged = Object.values(light)
      .filter((t) => t.$extensions?.[EXTENSION]?.tenantOverridable)
      .map((t) => cssVariable(t.id))
      .sort();
    expect([...TENANT_TOKENS].sort()).toEqual(flagged);
  });

  it("derives against the real token values", () => {
    expect(asOklch(components(light, "primitive.color.graphite.0"))).toEqual(WHITE);
    expect(asOklch(components(light, "primitive.color.graphite.950"))).toEqual(INK);
    expect(SURFACES.light).toEqual(
      ["canvas", "default"].map((s) => asOklch(components(light, `color.surface.${s}`))),
    );
    for (const s of ["raised", "overlay"]) {
      expect(asOklch(components(light, `color.surface.${s}`))).toEqual(SURFACES.light[1]);
    }
    expect(SURFACES.dark).toEqual(
      ["canvas", "default", "raised", "overlay"].map((s) =>
        asOklch(components(dark, `color.surface.${s}`)),
      ),
    );
    for (const [scheme, set] of [
      ["light", light],
      ["dark", dark],
    ] as const) {
      expect(NEUTRALS[scheme]).toEqual(
        ["subtle", "subtle-hover", "subtle-pressed"].map((s) =>
          asOklch(components(set, `color.bg.neutral.${s}`)),
        ),
      );
    }
    for (const [step, { l, c }] of Object.entries(SUBTLE_STEPS)) {
      const [tl, tc] = components(light, `primitive.color.qeet.${step}`);
      expect({ l: tl, c: tc }).toEqual({ l, c });
    }
    const qeetChroma = Object.keys(light)
      .filter((id) => id.startsWith("primitive.color.qeet."))
      .map((id) => components(light, id)[1]);
    expect(Math.max(...qeetChroma)).toBe(QEET_PEAK_CHROMA);
  });

  it("rejects anything but a hex colour", () => {
    expect(() => brandTheme("blue")).toThrow(TypeError);
    expect(() => brandTheme("#12345")).toThrow(TypeError);
    expect(() => brandTheme("#1a73e8")).not.toThrow();
    expect(() => brandTheme("#fff")).not.toThrow();
  });
});

describe("Qeet's own colour", () => {
  it("reproduces the Qeet brand fill and its white label", () => {
    const { light: theme } = brandTheme("#d04800");
    const bold = converter("oklab")(parse(theme["--qx-color-bg-brand-bold"]) as Color);
    const qeet = converter("oklab")(
      toCulori(light["primitive.color.qeet.600"]?.$value as DtcgColor),
    );
    const distance = Math.hypot(
      (bold.l as number) - (qeet.l as number),
      (bold.a as number) - (qeet.a as number),
      (bold.b as number) - (qeet.b as number),
    );
    expect(distance).toBeLessThan(0.005);
    expect(theme["--qx-color-text-on-brand"]).toBe("oklch(1 0 0)");
  });
});

describe("any tenant colour", () => {
  // Every 20° of hue × five lightnesses × two chromas, clamped to sRGB as a tenant's hex would be.
  const seeds = [...Array(18).keys()].flatMap((i) =>
    [0.3, 0.45, 0.6, 0.75, 0.9].flatMap((l) =>
      [0.06, 0.2].map(
        (c) => formatHex(clampChroma({ mode: "oklch", l, c, h: i * 20 }, "oklch")) as string,
      ),
    ),
  );
  const colour = (value: string) => parse(value) as Color;
  const surfaces = {
    light: ["canvas", "default", "raised", "overlay", "sunken"].map((s) =>
      toCulori(light[`color.surface.${s}`]?.$value as DtcgColor),
    ),
    dark: ["canvas", "default", "raised", "overlay", "sunken"].map((s) =>
      toCulori(dark[`color.surface.${s}`]?.$value as DtcgColor),
    ),
  };

  it(`covers ${seeds.length} distinct colours`, () => {
    expect(new Set(seeds).size).toBeGreaterThan(150);
  });

  it.each(["light", "dark"] as const)(
    "returns every tenant token and nothing else, in %s",
    (scheme) => {
      for (const seed of seeds) {
        expect(Object.keys(brandTheme(seed)[scheme]).sort()).toEqual([...TENANT_TOKENS].sort());
      }
    },
  );

  it.each(["light", "dark"] as const)("meets AA for every seed, in %s", (scheme) => {
    const failures: string[] = [];
    for (const seed of seeds) {
      const t = brandTheme(seed)[scheme];
      const label = colour(t["--qx-color-text-on-brand"]);
      for (const fill of [
        "--qx-color-bg-brand-bold",
        "--qx-color-bg-brand-bold-hover",
        "--qx-color-bg-brand-bold-pressed",
      ] as const) {
        const ratio = wcagContrast(label, colour(t[fill]));
        if (ratio < 4.5) failures.push(`${seed} label on ${fill}: ${ratio.toFixed(2)}`);
      }
      for (const [token, min] of [
        ["--qx-color-text-brand", 4.5],
        ["--qx-color-text-link", 4.5],
        ["--qx-color-text-link-hover", 4.5],
        ["--qx-color-icon-brand", 3],
        ["--qx-color-border-focus", 3],
        ["--qx-color-border-brand", 3],
      ] as const) {
        for (const surface of surfaces[scheme].slice(0, 4)) {
          const ratio = wcagContrast(colour(t[token]), surface);
          if (ratio < min) failures.push(`${seed} ${token}: ${ratio.toFixed(2)} < ${min}`);
        }
        failures.push(...onTints(seed, t, token, min));
      }
      failures.push(...onTints(seed, t, "--qx-color-text-brand", 4.5, TEXT_TINTS));
      failures.push(...onNeutralFills(seed, t, scheme));
    }
    expect(failures).toEqual([]);
  });
});

/** Brand marks on the brand's own tints: a brand Badge, a ghost button's hover, a selected row. */
const TINTS = ["--qx-color-bg-brand-subtle", "--qx-color-bg-selected"] as const;
/** Brand text, also through the tints' states: a ghost button hovered and pressed. */
const TEXT_TINTS = [
  "--qx-color-bg-brand-subtle-hover",
  "--qx-color-bg-brand-subtle-pressed",
  "--qx-color-bg-selected-hover",
] as const;
function onTints(
  seed: string,
  t: Record<string, string>,
  token: string,
  min: number,
  tints: readonly string[] = TINTS,
): string[] {
  return tints.flatMap((tint) => {
    const ratio = wcagContrast(
      parse(t[token] as string) as Color,
      parse(t[tint] as string) as Color,
    );
    return ratio < min ? [`${seed} ${token} on ${tint}: ${ratio.toFixed(2)} < ${min}`] : [];
  });
}

/** Brand text on the neutral fills a tenant can't change, at rest, hovered and pressed. */
const NEUTRAL_FILLS = ["subtle", "subtle-hover", "subtle-pressed"].map(
  (s) => `color.bg.neutral.${s}`,
);
function onNeutralFills(
  seed: string,
  t: Record<string, string>,
  scheme: "light" | "dark",
): string[] {
  const set = scheme === "light" ? light : dark;
  return NEUTRAL_FILLS.flatMap((id) => {
    const fill = toCulori(set[id]?.$value as DtcgColor);
    const ratio = wcagContrast(parse(t["--qx-color-text-brand"]) as Color, fill);
    return ratio < 4.5 ? [`${seed} --qx-color-text-brand on ${id}: ${ratio.toFixed(2)} < 4.5`] : [];
  });
}

describe("named tenant colours", () => {
  // A blue, a green, a purple, a near-yellow and a dark one: the shapes a tenant's colour takes.
  const named = {
    blue: "#1a73e8",
    green: "#0f9d58",
    purple: "#7c3aed",
    "near-yellow": "#f5d90a",
    dark: "#1b1f3b",
  };
  const marks = [
    ["--qx-color-text-brand", 4.5],
    ["--qx-color-text-link", 4.5],
    ["--qx-color-text-link-hover", 4.5],
    ["--qx-color-icon-brand", 3],
    ["--qx-color-border-brand", 3],
    ["--qx-color-border-focus", 3],
  ] as const;

  it.each(
    Object.entries(named).flatMap(([name, hex]) =>
      (["light", "dark"] as const).map((scheme) => [name, hex, scheme] as const),
    ),
  )(
    "%s (%s) keeps brand text and lines readable on the brand tints and neutral fills, in %s",
    (_, hex, scheme) => {
      const t = brandTheme(hex)[scheme];
      expect([
        ...marks.flatMap(([token, min]) => onTints(hex, t, token, min)),
        ...onTints(hex, t, "--qx-color-text-brand", 4.5, TEXT_TINTS),
        ...onNeutralFills(hex, t, scheme),
      ]).toEqual([]);
    },
  );
});
