# Auction-Hub

A complete live auction platform with separate buyer and seller flows, realtime bidding via Socket.io, and a dark futuristic UI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, Socket.io on /api/socket.io)
- `pnpm --filter @workspace/auction-hub run dev` — run the frontend (port varies, preview at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, Framer Motion, Wouter, shadcn/ui, socket.io-client
- API: Express 5 + Socket.io (realtime bidding)
- DB: PostgreSQL + Drizzle ORM (tables: users, auctions, bids, categories)
- Auth: JWT (bcryptjs + jsonwebtoken), token stored in localStorage
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `lib/db/src/schema/` — DB schema (users, auctions, bids, categories)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, auctions, bids, categories)
- `artifacts/api-server/src/lib/auth.ts` — JWT + bcrypt helpers
- `artifacts/api-server/src/middleware/requireAuth.ts` — JWT auth middleware
- `artifacts/auction-hub/src/` — React frontend
- `artifacts/auction-hub/src/hooks/use-auth.ts` — auth context/hook
- `artifacts/auction-hub/src/pages/` — all pages (landing, login, register, buyer/*, seller/*)

## Architecture decisions

- JWT auth (not session-based): token stored in localStorage as `auction_hub_token`, sent as Bearer header in all API calls
- Socket.io path is `/api/socket.io` (served by Express HTTP server alongside REST API)
- Separate buyer/seller protected routes enforced client-side by role check from JWT user
- Realtime bids: server emits `bid:new` to room `auction:{id}` on every placed bid; clients join room on auction detail page mount
- OpenAPI-first: all API contracts defined in `openapi.yaml`, codegen produces typed React Query hooks and Zod schemas

## Product

- Landing page with live stats (active auctions, total bids, total value)
- Buyer flow: browse live auctions with search/filter/sort, place bids in realtime, view bid history, see won auctions
- Seller flow: create auctions, view all bids per auction, manually accept winner
- 10 pre-seeded demo auctions across 10 categories (Electronics, Vehicles, Watches, Sneakers, Gaming, Gold, Fashion, Furniture, Cosmetics, Collectibles)
- Demo accounts: `demo.buyer@hub.com` / `password123` (buyer), `alex@seller.com` / `password123` (seller)

## User preferences

- Dark futuristic theme always (no light mode)
- Brand colors: deep dark bg (#0a0a0f), neon red/crimson primary (hsl 355 85% 50%)
- No emojis in UI

## Gotchas

- Password hash in seed data uses bcrypt rounds=12 with hardcoded hash — if changing password logic, re-seed users
- Socket.io WS path `/api/socket.io` must be listed in artifact.toml paths for the proxy to forward WS connections
- `useAcceptWinner` hook requires `id` param (auction id) — pass as first arg

## Pointers

- See `pnpm-workspace` skill for workspace structure
- See `lib/api-spec/openapi.yaml` for all endpoint contracts
