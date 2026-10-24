import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/** Every run tests what the source builds now — never a stale dist/. */
export default function build() {
  execFileSync("bun", ["run", "build"], {
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    stdio: "pipe",
  });
}
