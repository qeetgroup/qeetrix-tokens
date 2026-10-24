/** Shared readers for the suites. The build runs once before them (setup/build.ts). */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Color } from "culori";
import { loadResolver, resolverDocument } from "../scripts/lib/load.mjs";

export const root = fileURLToPath(new URL("..", import.meta.url));
export const read = (path: string) => readFileSync(join(root, path), "utf8");
export const readJson = (path: string) => JSON.parse(read(path));

export type DtcgColor = {
  colorSpace: string;
  components: [number, number, number];
  alpha?: number;
  hex?: string;
};
export type Token = {
  id: string;
  $type: string;
  $value: unknown;
  $description?: string;
  $extensions?: Record<string, Record<string, unknown>>;
  aliasOf?: string;
};
export type TokenSet = Record<string, Token>;

export const resolver = await loadResolver();
export const document = resolverDocument();
export const defaults = resolver.inputDefault as Record<string, string>;
export const tokensFor = (input: Record<string, string> = {}) =>
  resolver.apply({ ...defaults, ...input }) as unknown as TokenSet;
export const SCHEMES = Object.keys(document.modifiers.colorScheme.contexts) as string[];
export const DENSITIES = Object.keys(document.modifiers.density.contexts) as string[];

/** A DTCG colour as a culori colour. */
export const toCulori = (value: DtcgColor): Color => ({
  mode: "oklch",
  l: value.components[0],
  c: value.components[1],
  h: value.components[2],
  alpha: value.alpha ?? 1,
});

/** Every source file under src/tokens, relative to src/. */
export function sourceFiles(dir = join(root, "src/tokens"), base = "tokens"): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sourceFiles(join(dir, entry.name), `${base}/${entry.name}`)
      : [`${base}/${entry.name}`],
  );
}

/** Every token in an authored DTCG document, with the $type and $description it inherits. */
export function* authoredTokens(
  node: Record<string, unknown>,
  path: string[] = [],
  inherited: { type?: string; described: boolean } = { described: false },
): Generator<{ id: string; token: Record<string, unknown>; type?: string; described: boolean }> {
  const type = (node.$type as string | undefined) ?? inherited.type;
  const described = inherited.described || typeof node.$description === "string";
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$") || value === null || typeof value !== "object") continue;
    const child = value as Record<string, unknown>;
    if ("$value" in child) {
      yield {
        id: [...path, key].join("."),
        token: child,
        type: (child.$type as string | undefined) ?? type,
        described: described || typeof child.$description === "string",
      };
    } else {
      yield* authoredTokens(child, [...path, key], { type, described });
    }
  }
}

/** Custom-property declarations per selector in a stylesheet, blocks sharing a selector merged. */
export function readDeclarations(css: string): Map<string, Map<string, string>> {
  const bySelector = new Map<string, Map<string, string>>();
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const block of source.matchAll(/(?:^|\n)([^\n{}@][^\n{}]*?)\s*\{([\s\S]*?)\n\s*\}/g)) {
    const selector = (block[1] as string).trim();
    const vars = bySelector.get(selector) ?? new Map<string, string>();
    for (const d of (block[2] as string).matchAll(/^\s*(--[a-z0-9-]+):\s*(.+?);\s*$/gm)) {
      vars.set(d[1] as string, d[2] as string);
    }
    bySelector.set(selector, vars);
  }
  return bySelector;
}
