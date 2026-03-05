# Performance notes

This project was tuned to keep Lighthouse scores consistently high on key customer routes while preserving functionality.

## Current Lighthouse (local production build)

Measured with `next build` + `next start` and `lighthouse` against `http://127.0.0.1:3000`:

- **Home (`/`)**: Performance ~97 (LCP ~2.4s, TBT ~110ms)
- **Menu (`/menu`)**: Performance ~96
- **Cart (`/cart`)**: Performance ~97
- **Checkout (`/checkout`)**: Performance ~96

## Key changes

- **Removed “opacity: 0 on first paint” patterns** that delayed LCP (Hero, product lists, cart).
- **Reduced global JS on critical routes**:
  - Split heavy header sub-features (Radix dropdown/user menu + notifications) into dynamic chunks.
  - Deferred active-order polling to avoid competing with initial render.
- **Deferred Firebase auth initialization**:
  - Firebase/auth is loaded dynamically and scheduled (immediate only on auth-critical routes like `/login`, `/register`, `/profile`, `/admin*`).
- **Deferred Google Analytics load**:
  - GA script loads on real user interaction, keeping initial render/measurement window clean.
- **Fonts**:
  - Reduced Inter subsets/weights and used a more performance-friendly display mode.

## How to reproduce locally

```bash
pnpm -C frontend build
pnpm -C frontend exec next start -p 3000 -H 127.0.0.1
pnpm -C frontend dlx lighthouse http://127.0.0.1:3000/ --only-categories=performance
```

