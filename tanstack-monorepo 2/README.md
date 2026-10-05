# TanStack SSR + CSR monorepo

One shared app (`packages/app`) rendered by two shells:

| Package | What | Port |
|---|---|---|
| `apps/ssr` | **TanStack Start** – server-side rendering, hydration, server functions | 3000 |
| `apps/csr` | **TanStack Router + Vite** – pure client-side SPA | 3001 |
| `packages/app` | Pages, components, data access, Tailwind v4 theme shared by both | – |

Tooling: pnpm workspaces + Turborepo, TypeScript, Tailwind CSS v4.

## Quick start

```bash
corepack enable          # or: npm i -g pnpm
pnpm install
pnpm dev                 # runs both apps via turbo
# or individually
pnpm dev:ssr             # http://localhost:3000
pnpm dev:csr             # http://localhost:3001
```

`routeTree.gen.ts` is generated automatically in each app on first `dev`/`build`.

## Build & run

```bash
pnpm build               # builds both
pnpm start:ssr           # node .output/server/index.mjs  (Start, Node target)
pnpm preview:csr         # serves apps/csr/dist
```

## How the sharing works

* Each app keeps its own `src/routes/*` files because the root route differs
  (Start renders the full `<html>` document; the SPA mounts into `#root`).
  Route files are thin: they import page components and data functions from `@repo/app`.
* Route **loaders** call the same async functions (`getPosts`, `getPost`). In the SSR app
  they run on the server for the first request and on the client afterwards; in the CSR app
  they always run in the browser.
* `apps/ssr/src/routes/index.tsx` shows an SSR-only feature (`createServerFn`). The shared
  `HomePage` takes `renderedAt` as an optional prop so the CSR app can render it without it.
* `@repo/app` is consumed as TypeScript source (its `exports` point at `src/`), so Vite
  transpiles it directly and HMR works across packages.
* Tailwind: `packages/app/src/styles.css` imports Tailwind and declares `@source "./"`
  so classes used in the shared package are picked up by both apps.

## Adding a route

1. Add the page component to `packages/app/src/pages/` and export it from `src/index.ts`.
2. Add `apps/ssr/src/routes/<name>.tsx` and `apps/csr/src/routes/<name>.tsx` that wire it up.

## Deploying

* **SSR**: `pnpm --filter @repo/ssr build` produces `.output/` (Node). To target another
  platform (Cloudflare, Netlify, Vercel, Bun…) see
  https://tanstack.com/start/latest/docs/framework/react/guide/hosting
* **CSR**: upload `apps/csr/dist` to any static host with an SPA fallback
  (a Netlify `_redirects` file is included in `apps/csr/public`).
