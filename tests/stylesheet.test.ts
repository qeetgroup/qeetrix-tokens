/**
 * dist/tokens.css — what every web app (React, Angular, Vue, plain HTML) loads.
 */
import { describe, expect, it } from "vitest";
import { cssVariable, declarationsFor } from "../scripts/lib/css.mjs";
import { EXTENSION, isPublic } from "../scripts/lib/load.mjs";
import { DENSITIES, read, readDeclarations, SCHEMES, tokensFor } from "./support";

const css = read("dist/tokens.css");
const blocks = readDeclarations(css);
const base = tokensFor();
const root = blocks.get(":root") ?? new Map<string, string>();
const scheme = (s: string) =>
  blocks.get(`[data-qx-color-scheme="${s}"]`) ?? new Map<string, string>();
const density = (d: string) => blocks.get(`[data-qx-density="${d}"]`) ?? new Map<string, string>();

describe(":root", () => {
  it("declares every public token for the default modes, with fully resolved values", () => {
    // Public, for the web (no platforms recorded, or "web" among them), and not a breakpoint.
    const onWeb = (id: string) => {
      const platforms = base[id]?.$extensions?.[EXTENSION]?.platforms as string[] | undefined;
      return (
        isPublic(id) && !id.startsWith("breakpoint.") && (!platforms || platforms.includes("web"))
      );
    };
    const expected = Object.keys(base)
      .filter(onWeb)
      .flatMap((id) =>
        declarationsFor(base[id], base).map((declaration: string[]) => declaration[0] as string),
      );
    expect([...root.keys()].sort()).toEqual(expected.sort());
    expect([...root.values()].filter((v) => v.includes("var("))).toEqual([]);
  });

  it("publishes no primitive — an app cannot read a raw palette value", () => {
    expect([...root.keys()].filter((name) => name.startsWith("--qx-primitive-"))).toEqual([]);
  });

  it("sets the browser's color-scheme with the default mode", () => {
    expect(css).toMatch(/:root \{\n {2}color-scheme: light;/);
  });
});

describe("mode blocks", () => {
  it("re-declare exactly the tokens a colour scheme changes, in every scheme", () => {
    const keys = SCHEMES.map((s) => [...scheme(s).keys()].sort());
    expect((keys[0] ?? []).length).toBeGreaterThan(80);
    for (const k of keys) expect(k).toEqual(keys[0]);
    for (const s of SCHEMES) {
      const set = tokensFor({ colorScheme: s });
      for (const [name, value] of scheme(s)) {
        const id = Object.keys(set).find((i) => cssVariable(i) === name);
        expect(id, name).toBeDefined();
        expect(value, name).toBe(declarationsFor(set[id as string], set)[0][1]);
      }
      expect(css).toContain(`[data-qx-color-scheme="${s}"] {\n  color-scheme: ${s};`);
    }
  });

  it("re-declare exactly the tokens a density changes, in every density", () => {
    const keys = DENSITIES.map((d) => [...density(d).keys()].sort());
    expect(keys[0]).toEqual([
      "--qx-size-control-lg",
      "--qx-size-control-md",
      "--qx-size-control-sm",
      "--qx-size-row",
      "--qx-space-form-gap",
    ]);
    for (const k of keys) expect(k).toEqual(keys[0]);
  });

  it("never overlap: a colour block and a density block share no token", () => {
    const colour = new Set(scheme(SCHEMES[0] as string).keys());
    expect([...density(DENSITIES[0] as string).keys()].filter((k) => colour.has(k))).toEqual([]);
  });

  it("make compact smaller than default, and default smaller than comfortable", () => {
    const px = (v: string) => Number.parseFloat(v) * (v.endsWith("rem") ? 16 : 1);
    const md = (d: string) => px(density(d).get("--qx-size-control-md") as string);
    expect(md("compact")).toBeLessThan(md("default"));
    expect(md("default")).toBeLessThan(md("comfortable"));
    expect(density("default").get("--qx-size-control-md")).toBe(root.get("--qx-size-control-md"));
  });
});

describe("web conventions", () => {
  it("publishes breakpoints as @custom-media in their own opt-in sheet, never as variables", () => {
    const media = read("dist/custom-media.css");
    expect(media.match(/@custom-media --qx-viewport-[a-z]+ \(width >= \d+px\);/g)).toEqual([
      "@custom-media --qx-viewport-medium (width >= 600px);",
      "@custom-media --qx-viewport-expanded (width >= 840px);",
      "@custom-media --qx-viewport-large (width >= 1200px);",
      "@custom-media --qx-viewport-xlarge (width >= 1600px);",
    ]);
    // tokens.css is plain CSS every pipeline accepts quietly: no @custom-media (QTRX-27).
    expect(css).not.toMatch(/@custom-media/);
    expect(css).not.toMatch(/--qx-breakpoint-/);
  });

  it("collapses every duration under prefers-reduced-motion", () => {
    const reduced =
      /@media \(prefers-reduced-motion: reduce\) \{\n {2}:root \{\n([\s\S]*?)\n {2}\}\n\}/.exec(
        css,
      )?.[1] ?? "";
    const durations = [...root.keys()].filter((k) => k.startsWith("--qx-motion-duration-"));
    expect(durations.length).toBeGreaterThan(3);
    for (const d of durations) expect(reduced).toContain(`${d}: 0ms;`);
  });

  it("writes typography as a font shorthand plus each property", () => {
    expect(root.get("--qx-typography-body-md")).toBe(
      '400 0.875rem/1.428572 "Qeet Sans", ui-sans-serif, system-ui, sans-serif',
    );
    expect(root.get("--qx-typography-body-md-line-height")).toBe("1.428572");
    expect(root.get("--qx-typography-body-md-font-geometry")).toBe("0");
  });

  // QTRX-184: a role lays out at exactly its line height, 20px and not 20.0004px or 19.984375px,
  // through the shorthand, line-height and @qeetrix/react's calc(var(-font-size) * var(-line-height)).
  // Browsers truncate a line box to 1/64px and WebKit reads the ratio in single precision, so the
  // stylesheet's ratio is the exact one rounded up at the sixth decimal (scripts/lib/css.mjs).
  const roles = [...root.keys()]
    .filter((name) => name.endsWith("-line-height"))
    .map((name) => name.slice(0, -"-line-height".length));
  const px = (length: string) => Number.parseFloat(length) * (length.endsWith("rem") ? 16 : 1);
  const toSixtyFourths = (n: number) => Math.floor(n * 64) / 64;

  it("lays every role out at exactly its line height on the 4px grid", () => {
    expect(roles).toHaveLength(18);
    for (const id of Object.keys(base).filter((i) => base[i]?.$type === "typography")) {
      const role = cssVariable(id);
      const length = base[id]?.$extensions?.[EXTENSION]?.lineHeight as { value: number };
      const height = length.value * 16;
      const size = px(root.get(`${role}-font-size`) as string);
      const ratio = Number(root.get(`${role}-line-height`));
      const exact = height / size;
      expect(height % 4, role).toBe(0);
      // never under the exact ratio, so truncation lands on the pixel (measured in Chromium,
      // Firefox and WebKit: the full double still left nine roles 1/64px short in WebKit) ...
      expect(ratio, role).toBeGreaterThanOrEqual(exact);
      expect(String(ratio).split(".")[1]?.length ?? 0, role).toBeLessThanOrEqual(6);
      // ... and within 1e-6 of the DTCG document's ratio, which native generators check against
      expect(ratio - exact, role).toBeLessThan(1e-6);
      expect(toSixtyFourths(size * ratio), role).toBe(height);
      expect(toSixtyFourths(Math.fround(Math.fround(size) * Math.fround(ratio))), role).toBe(
        height,
      );
      expect(root.get(role), role).toContain(`/${ratio} `);
    }
  });

  // QTRX-186: each role's GEOM position, so CSS can read it instead of restating design rules §5.
  it("gives every role its letter style as -font-geometry", () => {
    const geometry = (role: string) => root.get(`--qx-font-geometry-${role}`);
    expect(geometry("display")).toBe("100");
    expect(geometry("heading")).toBe("50");
    expect(geometry("body")).toBe("0");
    for (const role of roles) {
      const group = role.slice("--qx-typography-".length).split("-")[0] as string;
      const named =
        group === "display" ? "display" : ["heading", "title"].includes(group) ? "heading" : "body";
      expect(root.get(`${role}-font-geometry`), role).toBe(geometry(named));
    }
  });

  it("tracks small capitals, and only them", () => {
    expect(root.get("--qx-typography-label-caps")).toBe(
      '600 0.6875rem/1.454546 "Qeet Sans", ui-sans-serif, system-ui, sans-serif',
    );
    expect(root.get("--qx-typography-label-caps-letter-spacing")).toBe("0.66px");
    const tracked = [...root.entries()].filter(
      ([name, value]) => name.endsWith("-letter-spacing") && value !== "0px",
    );
    expect(tracked.map(([name]) => name)).toEqual(["--qx-typography-label-caps-letter-spacing"]);
  });

  it("is generated, not hand-written", () => {
    expect(css).toMatch(/GENERATED by @qeetrix\/tokens/);
  });
});
