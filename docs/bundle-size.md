# Bundle size

`viem-error-parser` is built to be tree-shakable. The package sets:

- `"type": "module"` — ESM by default.
- `"sideEffects": false` — bundlers know it's safe to drop unused exports.
- Dual ESM + CJS dist with separate entry points per subpath.

## What you actually pay for

The "minimum cost" for a typical Viem app:

| What you import                                                  | Approx. gzipped on top of viem |
|------------------------------------------------------------------|-------------------------------:|
| `import { forViem } from 'viem-error-parser'` with presets       | ~10 KB                         |
| `import { forViem } from 'viem-error-parser'` with `includeCommon: false` | ~6 KB                  |
| `import { useErrorParser } from 'viem-error-parser/react'`       | ~7 KB (`react` is a peer)      |
| `import type { ... } from 'viem-error-parser/types'`             | **0 KB**                       |

Numbers are rough — measure your own bundle with something like
[`vite-bundle-visualizer`](https://github.com/KusStar/vite-bundle-visualizer)
or [`bundlephobia`](https://bundlephobia.com/package/viem-error-parser).

## Tips for the smallest footprint

- **Skip the presets** if you ship contracts that never throw the standard
  ERC errors. `forViem({ includeCommon: false })` drops the curated ABIs.
- **Import what you need.** `import { extractRevertData }` is a single
  function — bundlers won't pull in the decoder, classifier, or registry.
- **Type-only imports.** Import types from `'viem-error-parser/types'`
  with `import type` so they vanish at build time.
- **No CJS surprise.** All entries ship `.js` (ESM) and `.cjs` (CJS). Modern
  bundlers prefer the ESM build, which is what tree-shakes. CommonJS
  consumers will pull a slightly larger artifact.

## Verifying

The package emits sourcemaps, so any modern bundle visualiser will show
exactly which functions made it into your output. If you ever see something
unexpected (for example, the React hook in a non-React app), check that
you're not accidentally re-exporting the entire `viem-error-parser` from a
shared module.
