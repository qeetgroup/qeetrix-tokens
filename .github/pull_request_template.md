## What and why

<!-- What changes in the tokens, and the reason. Link the issue. -->

## Version

<!-- version.yml bumps the patch. While 0.x: a new token or output is a patch; removing or renaming
a token, changing what one means, or changing an output's shape is a minor — raise it in
package.json by hand. -->

- [ ] `CHANGELOG.md` has a section for the new version, written for the person upgrading

## Checklist

- [ ] `bun run build && bun run typecheck && bun run lint && bun run test && bun run check:package`
- [ ] The stylesheet snapshot (`tests/__snapshots__/tokens.css`) changed only where a value changed on purpose
- [ ] A new colour role has its pairs in `tests/contrast.test.ts`, and they pass in every scheme
- [ ] Derived values were regenerated with `bun run derive` after changing a primitive they use
- [ ] A new public token has a `$description` (on itself or its group)
- [ ] A new component token is added to the reviewed list in `tests/source.test.ts`, with the reason
- [ ] A renamed or removed token: qeetrix-react, qeetrix-ios and qeetrix-android are told

<!-- Stop and escalate instead of merging if this changes what an existing token means, removes a
token a product uses, weakens a contrast pair or the chart palette, adds to the tenant allowlist, or
needs a change in another repository. -->
