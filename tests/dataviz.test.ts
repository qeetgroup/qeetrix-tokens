/**
 * The categorical chart palette, held to the thresholds it was designed against: 3:1 against the
 * surfaces charts sit on, distinct for normal vision, and distinguishable under deuteranopia,
 * protanopia and tritanopia — every neighbouring pair, and any two of the first five series.
 */
import {
  type Color,
  converter,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  wcagContrast,
} from "culori";
import { describe, expect, it } from "vitest";
import { type DtcgColor, SCHEMES, toCulori, tokensFor } from "./support";

const oklab = converter("oklab");
/** Euclidean distance in OKLab (ΔEok). */
const distance = (a: Color, b: Color) => {
  const x = oklab(a);
  const y = oklab(b);
  return Math.hypot(
    (x.l as number) - (y.l as number),
    (x.a as number) - (y.a as number),
    (x.b as number) - (y.b as number),
  );
};
const DEFICIENCIES = {
  deuteranopia: filterDeficiencyDeuter(1),
  protanopia: filterDeficiencyProt(1),
  tritanopia: filterDeficiencyTrit(1),
};

describe.each(SCHEMES.map((s) => [s]))("%s", (scheme) => {
  const set = tokensFor({ colorScheme: scheme });
  const colour = (id: string) => toCulori(set[id]?.$value as DtcgColor);
  const series = Array.from({ length: 8 }, (_, i) => colour(`color.dataviz.categorical.${i + 1}`));

  it("has eight series, each 3:1 against every surface a chart sits on", () => {
    expect(series).toHaveLength(8);
    for (const surface of ["canvas", "default", "raised"]) {
      const bg = colour(`color.surface.${surface}`);
      for (const [i, c] of series.entries()) {
        expect(wcagContrast(c, bg), `series ${i + 1} on ${surface}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("keeps every pair distinct for normal vision (ΔEok ≥ 0.08)", () => {
    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        expect(
          distance(series[i] as Color, series[j] as Color),
          `${i + 1} vs ${j + 1}`,
        ).toBeGreaterThanOrEqual(0.08);
      }
    }
  });

  // QTRX-37: neighbours are the pairs a reader compares most (adjacent series, stacked parts).
  it("keeps every neighbour well apart: ΔEok ≥ 0.15, and ≥ 0.08 under each deficiency", () => {
    for (let i = 0; i < 7; i++) {
      const [a, b] = [series[i] as Color, series[i + 1] as Color];
      expect(distance(a, b), `neighbours ${i + 1}/${i + 2}`).toBeGreaterThanOrEqual(0.15);
      for (const [name, simulate] of Object.entries(DEFICIENCIES)) {
        expect(
          distance(simulate(a), simulate(b)),
          `neighbours ${i + 1}/${i + 2} under ${name}`,
        ).toBeGreaterThanOrEqual(0.08);
      }
    }
  });

  it("keeps the dark series in a dark chart's band, amber alone a little lighter", () => {
    if (scheme !== "dark") return;
    const lightness = series.map((c) => converter("oklch")(c).l as number);
    for (const [i, l] of lightness.entries()) {
      expect(l, `series ${i + 1}`).toBeGreaterThanOrEqual(0.55);
      expect(l, `series ${i + 1}`).toBeLessThanOrEqual(i === 6 ? 0.85 : 0.8);
    }
  });

  it.each(Object.entries(DEFICIENCIES))("stays distinguishable under %s", (_, simulate) => {
    const seen = series.map(simulate);
    for (let i = 0; i < 7; i++) {
      expect(
        distance(seen[i] as Color, seen[i + 1] as Color),
        `neighbours ${i + 1}/${i + 2}`,
      ).toBeGreaterThanOrEqual(0.06);
    }
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        expect(
          distance(seen[i] as Color, seen[j] as Color),
          `first five ${i + 1}/${j + 1}`,
        ).toBeGreaterThanOrEqual(0.04);
      }
    }
  });

  it("orders the sequential scale by lightness and centres the diverging one on a neutral", () => {
    const l = (id: string) => oklab(colour(id)).l as number;
    const sequential = Array.from({ length: 7 }, (_, i) => l(`color.dataviz.sequential.${i + 1}`));
    const rising = scheme === "dark";
    for (let i = 1; i < 7; i++) {
      expect(
        rising
          ? sequential[i] > (sequential[i - 1] as number)
          : sequential[i] < (sequential[i - 1] as number),
      ).toBe(true);
    }
    const mid = oklab(colour("color.dataviz.diverging.4"));
    expect(Math.hypot(mid.a as number, mid.b as number)).toBeLessThan(0.01);
  });
});
