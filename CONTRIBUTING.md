# Contributing to viem-error-parser

Thanks for considering a contribution! This document describes how to set up
the project locally, the conventions we follow, and how to get your changes
merged.

By participating in this project you agree to abide by the
[Code of Conduct](./CODE_OF_CONDUCT.md).

## Requirements

- **Node.js** `>= 18.18.0`
- **pnpm** `>= 9` (we standardize on pnpm; npm and yarn work but are not in CI)
- A POSIX shell (Linux, macOS, or WSL on Windows)

## Getting started

```bash
git clone https://github.com/isaacnewton123/viem-error-parser.git
cd viem-error-parser
pnpm install
```

To run every check the same way CI does:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

## Project layout

```
src/
  types.ts            # public branded types + the `./types` entry
  utils/              # pure, dependency-free helpers (hex, error signature)
  core/               # decoder pipeline (traverse, extract, registry, classifier, decoder)
  presets/            # bundled ABI sets (ERC20/721/1155, OZ, ERC-2612)
  integrations/       # framework factories (viem, wagmi, react hook)
  index.ts            # main entry barrel
  entry-react.ts      # `./react` entry barrel
  entry-wagmi.ts      # `./wagmi` entry barrel

test/
  utils/              # tests for src/utils
  core/               # tests for src/core
  integration/        # end-to-end tests via the public entries
```

The folders mirror dependency direction: `utils` depends on nothing internal,
`core` may depend on `utils`, `integrations` and `presets` may depend on
`core`, and the entry barrels are the only things importing across the whole
tree.

## Branches and commits

- Open a feature branch off `master`. Suggested prefix: `feat/`, `fix/`,
  `docs/`, `chore/`, `refactor/`, or `test/`.
- We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  for commit messages and PR titles. Examples:
  - `feat(decoder): support custom panic reasons`
  - `fix(extract): handle empty data fields`
  - `docs: clarify forWagmi usage in README`

## Code style

- **TypeScript strict mode is on.** Treat any `tsc` warning as an error.
- **No `any`, no unsafe casts** — `@typescript-eslint/no-explicit-any` and
  `no-unsafe-*` rules are errors. Use branded types from `src/types.ts`
  (`HexString`, `Selector`, `ErrorSignature`) and explicit guards.
- **All public functions and exported types must have TSDoc** (`/** ... */`)
  with `@param` and `@returns`.
- **No new dependencies** without discussion in an issue first. `viem` is
  the only runtime dependency; `react` is an optional peer.
- **No `import` side-effects.** Modules must be safe to tree-shake.

Run `pnpm run lint -- --fix` to apply the auto-fixable rules. Prettier is
not enforced as a separate step; ESLint handles formatting via its rules.

## Testing

- New behavior requires a new test. Bug fixes require a regression test.
- Unit tests live next to the layer they cover (`test/utils/`, `test/core/`).
  End-to-end tests via the public API live in `test/integration/`.
- Use the existing test files as templates. Prefer focused, descriptive
  `it(...)` names over large multi-assertion tests.
- Run the full suite with `pnpm run test` and view coverage with
  `pnpm run test:coverage`. The CI threshold is **90%** for `utils/` and
  `core/`.

## Submitting a pull request

1. Make sure `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, and
   `pnpm run build` all pass locally.
2. Add or update an entry in `CHANGELOG.md` under `## [Unreleased]`.
3. Open a PR against `master`. Fill in the PR template — describe the change,
   the motivation, and how it was tested.
4. Be ready for review comments; we aim to respond within a few days.
5. A maintainer will squash-merge once CI is green and review is approved.

## Releasing (maintainers only)

1. Bump the version in `package.json` (we follow semver).
2. Move entries from `## [Unreleased]` to a new dated section in
   `CHANGELOG.md`.
3. Commit, tag (`git tag -s v0.x.y`), and push the tag. The
   `.github/workflows/publish.yml` workflow publishes to npm with provenance.

## Reporting bugs or proposing features

- **Bug**: open a [bug report](https://github.com/isaacnewton123/viem-error-parser/issues/new?template=bug_report.yml)
  with a minimal reproduction.
- **Feature**: open a [feature request](https://github.com/isaacnewton123/viem-error-parser/issues/new?template=feature_request.yml)
  and outline the use case before sending code.

## Security

Please do **not** report security issues in public issues. See
[`SECURITY.md`](./SECURITY.md) for the private reporting channel.

## License

By contributing you agree that your contributions will be licensed under the
[MIT License](./LICENSE).
