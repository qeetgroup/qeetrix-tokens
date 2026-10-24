# Security

## Reporting a vulnerability

Report it **privately**: through GitHub's private vulnerability reporting (the repository's
**Security** tab → **Report a vulnerability**), or directly to a repository administrator. Do not
describe it in an issue or a pull request.

Include the affected version, the file or token involved, and what an attacker could do with it.

## Scope

`@qeetrix/tokens` ships static files — a stylesheet, JSON documents and a JavaScript module of
constants — and has no runtime dependencies. The realistic risks are in how it is built and
published, not in what it does at runtime:

- **The release path.** Publishing runs only from `.github/workflows/release.yml` on `main`, in the
  `npm-publish` environment, with npm provenance; actions are pinned to commit SHAs.
- **The supply chain of the build.** Dependencies are development-only, installed from a frozen
  lockfile, and updated by Dependabot with a three-day cooldown.
- **Generated CSS.** Values are emitted from the token source as authored; nothing user-supplied
  reaches the build.
