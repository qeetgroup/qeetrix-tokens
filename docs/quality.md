# ✅ Quality

Every push to `develop` and every pull request into it runs the same gate as a release: **build → typecheck →
lint → test → package checks**. `main` takes only a `develop` that passed it.

| Suite | Guarantees |
|---|---|
| `source` | Valid DTCG in every mode combination, independent modifiers, the naming pattern, tier rules, a description for every token (on the token or its group), no unused primitives, up-to-date derived values |
| `contrast` | WCAG 2.2 AA for every designed colour pairing, in both schemes |
| `dataviz` | Chart palette contrast and colour-blind separation |
| `stylesheet` | Exact `:root` and mode blocks, no primitives, `@custom-media`, reduced motion |
| `dtcg` | The published resolver and resolved documents parse again in Terrazzo |
| `brand` | `brandTheme()` changes only the allowlist and meets AA for 180 sample colours |
| `package` | Exports, files, JS values equal to the tokens, exact `.d.ts`, a stylesheet snapshot |

The stylesheet snapshot means **every value change shows up in the pull request diff**. Package
checks run [publint](https://publint.dev/) and [Are the Types Wrong?](https://arethetypeswrong.github.io/).
Releases are published from GitHub Actions with **npm provenance**, and the GitHub Actions they use
are pinned to commit SHAs.

---

[← Qeetrix Tokens](../README.md)
