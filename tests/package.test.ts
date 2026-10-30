/**
 * The published contract: every exported path exists, only dist/ and the changelog ship, src/ holds
 * only authored files, and the JavaScript values equal the tokens they come from.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
    expect(m.COMPONENT.timeline.markerSize).toBe("28px"); // QTRX-185: a fixed size, as the CSS draws it
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
      "FiraCode-VF.ttf",
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
      "QeetSans.ttf",
      "QeetSans.woff2",
      "native.json",
      "subsets.json",
    ]);
    for (const licence of files.filter((f) => f.endsWith("-OFL.txt"))) {
      expect(read(`dist/fonts/${licence}`)).toContain("SIL Open Font License, Version 1.1");
    }
  });

  it("ships the variable fonts as TrueType for Android and iOS, each pinned by its sha256 (QTRX-91)", () => {
    interface NativeFont {
      family: string;
      file: string;
      axes: { tag: string; min: number; default: number; max: number }[];
      bytes: number;
      sha256: string;
      licence: string;
      from: { file: string; sha256: string };
    }
    const native = readJson("dist/fonts/native.json") as { fontTools: string; fonts: NativeFont[] };
    const file = (name: string) => readFileSync(join(root, "dist/fonts", name));
    const sha256 = (data: Buffer) => createHash("sha256").update(data).digest("hex");
    // The axes as the font itself declares them, in its fvar table (16.16 fixed-point values).
    const axesOf = (font: Buffer) => {
      const tables = font.readUInt16BE(4);
      let fvar = 0;
      for (let i = 0; i < tables; i++) {
        if (font.toString("latin1", 12 + i * 16, 16 + i * 16) === "fvar") {
          fvar = font.readUInt32BE(12 + i * 16 + 8);
        }
      }
      const start = fvar + font.readUInt16BE(fvar + 4);
      const size = font.readUInt16BE(fvar + 10);
      return Array.from({ length: font.readUInt16BE(fvar + 8) }, (_, i) => {
        const at = start + i * size;
        const fixed = (offset: number) => font.readInt32BE(at + offset) / 65536;
        return {
          tag: font.toString("latin1", at, at + 4),
          min: fixed(4),
          default: fixed(8),
          max: fixed(12),
        };
      });
    };

    expect(native.fontTools).toMatch(/^\d+\.\d+\.\d+$/);
    expect(native.fonts.map((font) => [font.family, font.file])).toEqual([
      ["Qeet Sans", "QeetSans.ttf"],
      ["Fira Code", "FiraCode-VF.ttf"],
    ]);
    for (const font of native.fonts) {
      const data = file(font.file);
      expect(data.length).toBe(font.bytes);
      expect(sha256(data)).toBe(font.sha256);
      expect(data.readUInt32BE(0)).toBe(0x00010000); // TrueType outlines, not WOFF2
      expect(axesOf(data)).toEqual(font.axes);
      // A changed WOFF2 needs `python3 scripts/native-fonts.py` again, so the two stay one font.
      expect(sha256(file(font.from.file))).toBe(font.from.sha256);
      expect(read(`dist/fonts/${font.licence}`)).toContain("SIL Open Font License, Version 1.1");
    }
    expect(native.fonts[0]?.axes.map((axis) => axis.tag)).toEqual([
      "opsz",
      "GEOM",
      "wght",
      "YTAS",
      "SHRP",
      "ital",
    ]);
  });

  it("names the families exactly as the tokens' font stacks do", () => {
    const tokens = read("dist/tokens.css");
    const stack = (name: string) => tokens.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1] ?? "";
    expect(stack("--qx-font-family-sans")).toMatch(/^"Qeet Sans",/);
    expect(stack("--qx-font-family-heading")).toMatch(/^"Qeet Sans",/);
    expect(stack("--qx-font-family-mono")).toMatch(/^"Fira Code",/);
  });
});
