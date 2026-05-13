# basic example — Node + Viem

Minimal Node script that builds a `viem-error-parser` decoder, throws a few
synthetic errors at it, and prints what comes out.

## Run

```bash
pnpm install
pnpm run start
```

You should see something like:

```
[1] ERC20InsufficientBalance(sender=0x..., balance=5n, needed=100n)
[2] Reverted: deadline expired
[3] Panic: Arithmetic overflow or underflow. (code 0x11)
[4] The transaction was rejected by the user.
[5] Unknown error.
```

The fixtures live in `index.ts` — feel free to swap in real errors you've
caught in production.
