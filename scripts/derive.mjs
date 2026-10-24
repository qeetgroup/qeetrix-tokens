/**
 * derive.mjs — recompute every derived value in the source from its recipe.
 *
 * DTCG has no expressions, so a value that is computed from others — a dark-mode tint (one colour
 * mixed over a surface), a translucent layer (a colour at an alpha) — is written into the source as
 * a plain value, with its recipe beside it in $extensions["in.qeet.qeetrix"].derivation.
 * tests/source.test.ts fails when a value no longer matches its recipe; this script rewrites them.
 * Run it after changing a primitive the recipes use:
 *
 *   bun run derive && bun run format
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { clampChroma, converter, formatHex } from "culori";
import { EXTENSION } from "./lib/load.mjs";

const TOKENS = fileURLToPath(new URL("../src/tokens/", import.meta.url));
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
const docs = new Map(files(TOKENS).map((f) => [f, JSON.parse(readFileSync(f, "utf8"))]));

/** The authored token at a dotted id, from whichever file holds it. */
function find(id) {
  for (const doc of docs.values()) {
    let node = doc;
    for (const segment of id.split(".")) node = node?.[segment];
    if (node && typeof node === "object" && "$value" in node) return node;
  }
  throw new Error(`derive: no token ${id}`);
}
const colourAt = (ref) => {
  const { components, alpha } = find(ref.slice(1, -1)).$value;
  return { mode: "oklch", l: components[0], c: components[1], h: components[2], alpha: alpha ?? 1 };
};

const round = (n, d = 4) => Number(n.toFixed(d));
const oklab = converter("oklab");
const oklch = converter("oklch");
/** A colour as a DTCG 2025.10 value; an achromatic hue is written as 0, which every tool accepts. */
function dtcg(colour, alpha = 1) {
  const o = oklch(colour);
  const chroma = round(o.c ?? 0);
  const value = {
    colorSpace: "oklch",
    components: [round(o.l), chroma, chroma === 0 || o.h === undefined ? 0 : round(o.h, 3)],
    hex: formatHex(clampChroma({ mode: "oklch", l: o.l, c: o.c ?? 0, h: o.h ?? 0 }, "oklch")),
  };
  if (alpha < 1) value.alpha = round(alpha, 3);
  return value;
}

let changed = 0;
const visit = (node) => {
  if (node === null || typeof node !== "object") return;
  const recipe = node.$extensions?.[EXTENSION]?.derivation;
  if (recipe) {
    let next;
    if ("alpha" in recipe) {
      next = dtcg(colourAt(recipe.alpha), recipe.amount);
    } else {
      const fg = oklab(colourAt(recipe.mix));
      const bg = oklab(colourAt(recipe.over));
      const t = recipe.amount;
      next = dtcg({
        mode: "oklab",
        l: fg.l * t + bg.l * (1 - t),
        a: fg.a * t + bg.a * (1 - t),
        b: fg.b * t + bg.b * (1 - t),
      });
    }
    if (JSON.stringify(next) !== JSON.stringify(node.$value)) {
      node.$value = next;
      changed++;
    }
  }
  for (const [key, child] of Object.entries(node)) if (!key.startsWith("$")) visit(child);
};
for (const [file, doc] of docs) {
  const before = changed;
  visit(doc);
  if (changed > before) writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
}
console.log(`✔ derive: ${changed} derived value${changed === 1 ? "" : "s"} updated`);
