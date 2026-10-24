/**
 * load.mjs — read the token source through Terrazzo, a spec-compliant DTCG 2025.10 parser.
 *
 * The source is plain DTCG (src/tokens/**) composed by one resolver document
 * (src/qeetrix.resolver.json). Terrazzo validates both strictly — value formats, references,
 * types, the resolver's sets and modifiers — and resolves any combination of modifier inputs, so
 * this repository never reimplements the standard. Any violation throws, failing the build.
 */
import { readFileSync } from "node:fs";
import { defineConfig, parse } from "@terrazzo/parser";

export const SRC = new URL("../../src/", import.meta.url);
export const RESOLVER = new URL("qeetrix.resolver.json", SRC);

/** The $extensions namespace this package reads and writes — Qeet's domain, reversed. */
export const EXTENSION = "in.qeet.qeetrix";

/** The resolver document as authored. */
export const resolverDocument = () => JSON.parse(readFileSync(RESOLVER, "utf8"));

/**
 * Parse and validate the source. Returns Terrazzo's resolver: `apply(input)` gives the token set for
 * one combination of modifier contexts; `inputDefault` is the combination with every default.
 * @returns {Promise<import("@terrazzo/parser").Resolver>}
 */
export async function loadResolver() {
  const config = defineConfig({}, { cwd: SRC });
  const { resolver } = await parse([{ filename: RESOLVER, src: readFileSync(RESOLVER, "utf8") }], {
    config,
  });
  return resolver;
}

/** Token ids in a stable order. */
export const sortedIds = (set) => Object.keys(set).sort();

/** Tokens published to apps: everything outside `primitive.*`. */
export const isPublic = (id) => !id.startsWith("primitive.");

/** The platforms a token is for, from its $extensions; undefined means all. */
export const platformsOf = (token) => token.$extensions?.[EXTENSION]?.platforms;
