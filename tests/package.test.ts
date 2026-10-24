/**
 * The published contract: every exported path exists, only dist/ and the changelog ship, src/ holds
 * only authored files, and the JavaScript values equal the tokens they come from.
 */
import { existsSync, readdirSync } from "node:fs";
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

  it("keeps src/ to authored files — nothing generated is written there", () => {
    expect(readdirSync(join(root, "src")).sort()).toEqual([
      "brand.ts",
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
