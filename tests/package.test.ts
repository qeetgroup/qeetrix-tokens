/**
 * The published contract: every exported path exists, only dist/ and the changelog ship, src/ holds
 * only authored files, and the JavaScript values equal the tokens they come from.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { cssVariable } from "../scripts/lib/css.mjs";
import { read, readJson, root, tokensFor } from "./support";

const pkg = readJson("package.json");
const base = tokensFor();
const load = (path: string) => import(pathToFileURL(join(root, path)).href);

describe("package", () => {
  it("ships dist/ and the changelog, nothing else", () => {
    expect(pkg.files).toEqual(["dist", "CHANGELOG.md"]);
    expect(pkg.type).toBe("module");
    expect(pkg.license).toBe("MIT");
  });

  it("points every export at a file the build produced", () => {
    const missing: string[] = [];
    for (const [key, target] of Object.entries<string | Record<string, string>>(pkg.exports)) {
      for (const file of typeof target === "string" ? [target] : Object.values(target)) {
        const path = join(root, file.split("*")[0] as string);
        const ok = file.includes("*")
          ? existsSync(path) && readdirSync(path).length > 0
          : existsSync(path);
        if (!ok) missing.push(`${key} → ${file}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("serves the stylesheet to CSS tools at the package root, and JavaScript to everything else", () => {
    // `@import "@qeetrix/tokens"` resolves through the `style` condition (Tailwind, Vite, webpack)
    // or the top-level `style` field (postcss-import). Conditions match in key order, so `style`
    // must come before `default`.
    expect(Object.keys(pkg.exports["."])).toEqual(["types", "style", "default"]);
    expect(pkg.exports["."].style).toBe(pkg.exports["./tokens.css"]);
    expect(pkg.style).toBe(pkg.exports["./tokens.css"]);
  });

  it("keeps src/ to authored files — nothing generated is written there", () => {
    expect(readdirSync(join(root, "src")).sort()).toEqual([
      "brand.ts",
      "fonts",
      "qeetrix.resolver.json",
      "tokens",
    ]);
  });
});

describe("JavaScript values", () => {
  const value = (id: string) => base[id]?.$value as { value: number; unit: string } & number;

  it("equal the tokens they come from", async () => {
    const m = await load("dist/index.js");
    for (const [k, v] of Object.entries<number>(m.DURATION))
      expect(v, k).toBe(value(`motion.duration.${k}`).value);
    for (const [k, v] of Object.entries<number>(m.ICON_SIZE))
      expect(v, k).toBe(value(`size.icon.${k}`).value);
    for (const [k, v] of Object.entries<number>(m.BREAKPOINT))
      expect(v, k).toBe(value(`breakpoint.${k}`).value);
    for (const [k, v] of Object.entries<number>(m.ICON_STROKE))
      expect(v, k).toBe(value(`icon.stroke.${k}`));
    for (const [k, v] of Object.entries<string>(m.EASING)) {
      const curve = base[`motion.easing.${k}`]?.$value as number[];
      expect(v, k).toBe(
        curve.join() === "0,0,1,1" ? "linear" : `cubic-bezier(${curve.join(", ")})`,
      );
    }
    expect(m.SPRING.snappy).toEqual({
      dampingRatio: value("motion.spring.snappy.damping-ratio"),
      stiffness: value("motion.spring.snappy.stiffness"),
    });
    expect(m.COMPONENT.sidebar.width.expanded).toBe("16rem");
    expect(typeof m.brandTheme).toBe("function");
    expect(m.TENANT_TOKENS).toContain(cssVariable("color.bg.brand.bold"));
  });

  it("are declared with their exact, readonly literal types", async () => {
    const m = await load("dist/index.js");
    const declarations = read("dist/index.d.ts");
    for (const name of Object.keys(m).filter(
      (n) => n === n.toUpperCase() && n !== "TENANT_TOKENS",
    )) {
      expect(declarations, name).toContain(`export declare const ${name}: {`);
    }
    expect(declarations).toContain("readonly normal: 200;");
    expect(declarations).toContain('export { brandTheme, TENANT_TOKENS } from "./brand.js";');
    expect(declarations).not.toMatch(/: (number|string);/);
  });
});

describe("stylesheet snapshot", () => {
  it("changes only on purpose — a value change shows in the pull request's diff", async () => {
    await expect(read("dist/tokens.css")).toMatchFileSnapshot("./__snapshots__/tokens.css");
  });
});

describe("fonts", () => {
  // The @font-face rules open tokens.css, so `@import "@qeetrix/tokens"` brings the fonts too.
  const css = read("dist/tokens.css");
  const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1] ?? "");
  const family = (face: string) => face.match(/font-family:\s*"([^"]+)"/)?.[1];
  const source = (face: string) => face.match(/url\("\.\/([^"]+)"\)/)?.[1];

  it("declares every face it ships, from a file that exists", () => {
    expect(faces.map(family)).toEqual([
      ...Array(6).fill("Qeet Sans"),
      ...Array(3).fill("Fira Code"),
    ]);
    for (const face of faces)
      expect(existsSync(join(root, "dist", source(face) ?? "missing"))).toBe(true);
  });

  // QTRX-10: subsets, each with the unicode-range of exactly what it holds, so a page downloads
  // only what its text uses, and no character falls through to a whole font.
  it("declares subsets with unicode ranges that never overlap, and never the whole font", () => {
    const range = (face: string) => face.match(/unicode-range:\s*([^;]+);/)?.[1] ?? "";
    const style = (face: string) => face.match(/font-style:\s*(\w+)/)?.[1];
    const points = (face: string) =>
      range(face)
        .split(/,\s*/)
        .flatMap((part) => {
          const [a, b = a] = part.replace("U+", "").split("-");
          const from = Number.parseInt(a ?? "0", 16);
          const to = Number.parseInt(b ?? "0", 16);
          return Array.from({ length: to - from + 1 }, (_, i) => from + i);
        });
    const seen = new Map<string, Set<number>>();
    for (const face of faces) {
      expect(range(face), source(face)).not.toBe("");
      expect(source(face)).not.toMatch(/QeetSans\.woff2|FiraCode-VF\.woff2/);
      const key = `${family(face)} ${style(face)}`;
      const set = seen.get(key) ?? new Set<number>();
      for (const point of points(face)) {
        expect(set.has(point), `${key} U+${point.toString(16)}`).toBe(false);
        set.add(point);
      }
      seen.set(key, set);
    }
  });

  it("keeps the upright Latin Qeet Sans under 100 KB, the text every page loads", () => {
    const { size } = statSync(join(root, "dist/fonts/QeetSans-latin.woff2"));
    expect(size).toBeLessThan(100_000);
    expect(size).toBeLessThan(statSync(join(root, "dist/fonts/QeetSans.woff2")).size / 3);
  });

  it("ships each font with its SIL Open Font Licence", () => {
    const files = readdirSync(join(root, "dist/fonts")).sort();
    expect(files).toEqual([
      "FiraCode-OFL.txt",
      "FiraCode-VF.woff2",
      "FiraCode-latin-ext.woff2",
      "FiraCode-latin.woff2",
      "FiraCode-other.woff2",
      "QeetSans-Italic-latin-ext.woff2",
      "QeetSans-Italic-latin.woff2",
      "QeetSans-Italic-other.woff2",
      "QeetSans-OFL.txt",
      "QeetSans-latin-ext.woff2",
      "QeetSans-latin.woff2",
      "QeetSans-other.woff2",
      "QeetSans.woff2",
      "subsets.json",
    ]);
    for (const licence of files.filter((f) => f.endsWith("-OFL.txt"))) {
      expect(read(`dist/fonts/${licence}`)).toContain("SIL Open Font License, Version 1.1");
    }
  });

  it("names the families exactly as the tokens' font stacks do", () => {
    const tokens = read("dist/tokens.css");
    const stack = (name: string) => tokens.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1] ?? "";
    expect(stack("--qx-font-family-sans")).toMatch(/^"Qeet Sans",/);
    expect(stack("--qx-font-family-heading")).toMatch(/^"Qeet Sans",/);
    expect(stack("--qx-font-family-mono")).toMatch(/^"Fira Code",/);
  });
});
