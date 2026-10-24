/**
 * The token source: valid DTCG 2025.10, composed by the resolver, and held to the Qeetrix
 * architecture — naming, layering, descriptions, no unused primitives, derived values that still
 * match their recipes, and a component tier that only grows on purpose.
 */
import { converter } from "culori";
import { describe, expect, it } from "vitest";
import { EXTENSION } from "../scripts/lib/load.mjs";
import {
  authoredTokens,
  DENSITIES,
  type DtcgColor,
  document,
  readJson,
  resolver,
  SCHEMES,
  sourceFiles,
  toCulori,
} from "./support";

const files = sourceFiles();
const authored = files.flatMap((file) =>
  [...authoredTokens(readJson(`src/${file}`))].map((t) => ({ ...t, file })),
);
const layerOf = (id: string) =>
  id.startsWith("primitive.")
    ? "primitive"
    : id.startsWith("component.")
      ? "component"
      : "semantic";
/** Every `{reference}` inside a value, composites included. */
const referencesIn = (value: unknown): string[] =>
  typeof value === "string"
    ? [...value.matchAll(/\{([^}]+)\}/g)].map((m) => m[1] as string)
    : value !== null && typeof value === "object"
      ? Object.values(value).flatMap(referencesIn)
      : [];

describe("standard", () => {
  it("parses as DTCG 2025.10 with Terrazzo, in every combination of modes", () => {
    const permutations = resolver.listPermutations?.() ?? [];
    expect(permutations).toHaveLength(SCHEMES.length * DENSITIES.length);
    for (const input of permutations) {
      expect(Object.keys(resolver.apply(input)).length).toBeGreaterThan(300);
    }
  });

  it("has orthogonal modifiers: colour scheme and density never change the same token", () => {
    expect(resolver.orthogonal).toBe(true);
  });

  it("wires every source file into the resolver exactly once", () => {
    const refs = JSON.stringify(document).match(/"\$ref":"\.\/(tokens\/[^"]+)"/g) ?? [];
    const referenced = refs.map((r) => r.replace(/^"\$ref":"\.\//, "").replace(/"$/, "")).sort();
    expect(referenced).toEqual([...files].sort());
  });
});

describe("naming", () => {
  const TOP_LEVEL = [
    "primitive",
    "color",
    "shadow",
    "typography",
    "font",
    "space",
    "size",
    "radius",
    "border",
    "focus",
    "motion",
    "opacity",
    "icon",
    "z",
    "breakpoint",
    "component",
  ];
  const COLOR_PROPERTIES = [
    "surface",
    "bg",
    "text",
    "icon",
    "border",
    "overlay",
    "selection",
    "dataviz",
    "code",
  ];

  it("uses kebab-case or numeric segments only", () => {
    const bad = authored.filter(
      ({ id }) => !id.split(".").every((s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)),
    );
    expect(bad.map((t) => t.id)).toEqual([]);
  });

  it("keeps every token under a known category, and colour under a known property", () => {
    expect(
      authored.filter(({ id }) => !TOP_LEVEL.includes(id.split(".")[0] as string)).map((t) => t.id),
    ).toEqual([]);
    expect(
      authored
        .filter(
          ({ id }) =>
            id.startsWith("color.") && !COLOR_PROPERTIES.includes(id.split(".")[1] as string),
        )
        .map((t) => t.id),
    ).toEqual([]);
  });

  it("never names a mode — modes are resolver modifiers, not words in a token", () => {
    const modeWords = new Set([...SCHEMES, "comfortable", "compact", "dense"]);
    expect(
      authored.filter(({ id }) => id.split(/[.-]/).some((w) => modeWords.has(w))).map((t) => t.id),
    ).toEqual([]);
  });

  it("names interaction states one way: hover, pressed, selected, disabled", () => {
    const banned = new Set(["active", "hovered", "focused", "activated", "rest"]);
    expect(
      authored.filter(({ id }) => id.split(/[.-]/).some((w) => banned.has(w))).map((t) => t.id),
    ).toEqual([]);
  });
});

describe("documentation", () => {
  it("describes every public token, on itself or a group above it", () => {
    expect(
      authored.filter((t) => layerOf(t.id) !== "primitive" && !t.described).map((t) => t.id),
    ).toEqual([]);
  });

  it("describes every primitive scale and palette", () => {
    expect(
      authored.filter((t) => layerOf(t.id) === "primitive" && !t.described).map((t) => t.id),
    ).toEqual([]);
  });
});

describe("layering", () => {
  it("references only downward: primitives own values, components never reach for a primitive", () => {
    const allowed: Record<string, string[]> = {
      primitive: [],
      semantic: ["primitive", "semantic"],
      component: ["semantic", "component"],
    };
    const violations = authored.flatMap(({ id, token }) =>
      referencesIn(token.$value)
        .filter((ref) => !allowed[layerOf(id)]?.includes(layerOf(ref)))
        .map((ref) => `${id} → ${ref}`),
    );
    expect(violations).toEqual([]);
  });

  it("uses every primitive — a colour ramp at least once, every other primitive exactly as authored", () => {
    const used = new Set(authored.flatMap(({ token }) => referencesIn(token.$value)));
    const unused = authored
      .filter(({ id }) => layerOf(id) === "primitive" && !used.has(id))
      .filter(({ id }) => {
        if (!id.startsWith("primitive.color.")) return true;
        const ramp = id.split(".").slice(0, 3).join(".");
        return ![...used].some((ref) => ref.startsWith(`${ramp}.`));
      })
      .map(({ id }) => id);
    expect(unused).toEqual([]);
  });

  it("keeps the component tier to decisions with no semantic equivalent (the reviewed list)", () => {
    expect(
      authored
        .filter(({ id }) => layerOf(id) === "component")
        .map(({ id }) => id)
        .sort(),
    ).toEqual([
      "component.command-palette.width",
      "component.sidebar.width.collapsed",
      "component.sidebar.width.expanded",
      "component.sidebar.width.mobile",
      "component.timeline.marker-size",
      "component.tour.card-width",
      "component.tour.offset",
      "component.tour.spotlight-padding",
    ]);
  });
});

describe("derived values", () => {
  const oklab = converter("oklab");
  const primitive = (ref: string) => {
    const id = ref.slice(1, -1);
    const found = authored.find((t) => t.id === id);
    if (!found) throw new Error(`no primitive ${id}`);
    return found.token.$value as DtcgColor;
  };
  const derived = authored.filter(({ token }) => {
    const ext = token.$extensions as Record<string, Record<string, unknown>> | undefined;
    return ext?.[EXTENSION]?.derivation;
  });

  it("exist where a value cannot be a plain reference (dark tints, translucent layers)", () => {
    expect(derived.length).toBeGreaterThan(10);
  });

  it.each(derived.map((t) => [`${t.file}: ${t.id}`, t] as const))(
    "%s still equals its recipe",
    (_, t) => {
      const recipe = (
        t.token.$extensions as Record<string, Record<string, Record<string, unknown>>>
      )[EXTENSION]?.derivation as Record<string, unknown>;
      const actual = t.token.$value as DtcgColor;
      if ("alpha" in recipe) {
        const base = primitive(recipe.alpha as string);
        expect(actual.components).toEqual(base.components);
        expect(actual.alpha).toBe(recipe.amount);
        return;
      }
      const fg = oklab(toCulori(primitive(recipe.mix as string)));
      const bg = oklab(toCulori(primitive(recipe.over as string)));
      const amount = recipe.amount as number;
      const expected = ["l", "a", "b"].map(
        (k) => (fg[k] as number) * amount + (bg[k] as number) * (1 - amount),
      );
      const got = oklab(toCulori(actual));
      ["l", "a", "b"].forEach((k, i) => {
        expect(Math.abs((got[k] as number) - (expected[i] as number)), `${t.id} ${k}`).toBeLessThan(
          0.002,
        );
      });
    },
  );
});

describe("metadata", () => {
  it("flags tenant-overridable tokens only among the brand colours, the same in every scheme", () => {
    const flagged = (file: string) =>
      authored
        .filter((t) => t.file === file)
        .filter(
          ({ token }) =>
            (token.$extensions as Record<string, Record<string, unknown>> | undefined)?.[EXTENSION]
              ?.tenantOverridable,
        )
        .map(({ id }) => id)
        .sort();
    const light = flagged("tokens/modes/color-scheme/light.tokens.json");
    expect(light).toEqual(flagged("tokens/modes/color-scheme/dark.tokens.json"));
    expect(
      light.every((id) =>
        /^color\.(bg\.(brand|selected)|text\.(brand|link|on-brand)|icon\.(brand|on-brand)|border\.(brand|focus|selected)|selection)/.test(
          id,
        ),
      ),
    ).toBe(true);
  });
});
