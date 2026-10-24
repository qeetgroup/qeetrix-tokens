/** The slice of culori 4 the tests use (culori ships no type declarations). */
declare module "culori" {
  export interface Color {
    mode: string;
    alpha?: number;
    [channel: string]: number | string | undefined;
  }
  export function parse(color: string): Color | undefined;
  export function wcagContrast(a: Color | string, b: Color | string): number;
  export function formatHex(color: Color | string | undefined): string | undefined;
  export function converter(mode: string): (color: Color | string) => Color;
  export function clampChroma(color: Color | string, mode?: string): Color;
  export function filterDeficiencyDeuter(severity?: number): (color: Color) => Color;
  export function filterDeficiencyProt(severity?: number): (color: Color) => Color;
  export function filterDeficiencyTrit(severity?: number): (color: Color) => Color;
}
