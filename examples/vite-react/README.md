# vite-react example — Vite + React + Wagmi + `forWagmi`

A minimal Vite + React app using `forWagmi` directly (without the React hook)
to demonstrate the "build a decoder once, decode many" pattern. The decoder
is created at module scope so it is shared across the whole app.

## Run

```bash
pnpm install
pnpm run dev
```

Open the URL printed by Vite. Click **Trigger failure** to see the parsed
error.

## Files

- `src/main.tsx` — bootstraps React and the Wagmi provider.
- `src/App.tsx` — uses the module-scoped `decoder` and a try/catch.
- `src/wagmi.ts` — Wagmi config.
- `src/decoder.ts` — single shared `ErrorDecoder` instance.
