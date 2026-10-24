/**
 * dist/dtcg/ — the published platform-neutral outputs. Each must re-parse as valid DTCG 2025.10 in
 * a spec-compliant tool, exactly as a consumer would read it.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { defineConfig, parse } from "@terrazzo/parser";
import { describe, expect, it } from "vitest";
import { EXTENSION } from "../scripts/lib/load.mjs";
import { authoredTokens, readJson, root, SCHEMES, tokensFor } from "./support";

const DIST = join(root, "dist/dtcg/");
const parseFile = async (file: string) => {
  const url = pathToFileURL(join(DIST, file));
  return parse([{ filename: url, src: readFileSync(url, "utf8") }], {
    config: defineConfig({}, { cwd: pathToFileURL(DIST) }),
  });
};

describe("published resolver", () => {
  it("re-parses with every mode from the published copy of the source", async () => {
    const { resolver } = await parseFile("qeetrix.resolver.json");
    expect(resolver.orthogonal).toBe(true);
    expect(resolver.listPermutations?.()).toHaveLength(6);
  });
});

describe.each(SCHEMES.map((s) => [s]))("resolved %s document", (scheme) => {
  const file = `${scheme}.tokens.json`;
  const doc = readJson(`dist/dtcg/${file}`);

  it("is valid DTCG 2025.10 on its own", async () => {
    const { tokens } = await parseFile(file);
    expect(Object.keys(tokens).length).toBeGreaterThan(300);
  });

  it("records the modes it was resolved for", () => {
    expect(doc.$extensions[EXTENSION].input).toEqual({ colorScheme: scheme, density: "default" });
  });

  it("holds every token of that mode, references kept where the source has them", () => {
    const set = tokensFor({ colorScheme: scheme });
    const exported = [...authoredTokens(doc)];
    expect(exported.map((t) => t.id).sort()).toEqual(Object.keys(set).sort());
    const brand = exported.find((t) => t.id === "color.bg.brand.bold");
    expect(brand?.token.$value).toBe("{primitive.color.qeet.600}");
  });
});
