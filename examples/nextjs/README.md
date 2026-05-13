# nextjs example — App Router + Wagmi + `useErrorParser`

A minimal Next.js 14 App Router page that:

1. Wires up Wagmi with a public mainnet client.
2. Uses `useErrorParser` from `viem-error-parser/react` to translate any
   thrown error into a toast-ready string.
3. Calls a deliberately-failing `writeContract` to demonstrate the output.

## Run

```bash
pnpm install
pnpm run dev
```

Open <http://localhost:3000>. Click the **Trigger failure** button — you'll see
the parsed error message rendered below it.

## Key files

- `app/layout.tsx` — wraps the tree in Wagmi + React Query providers.
- `app/page.tsx` — uses `useErrorParser` and shows the result.
- `lib/wagmi.ts` — minimal Wagmi config.
- `lib/abis.ts` — a sample custom error ABI registered with the parser.
