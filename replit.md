# Live Auction Platform

A production-grade real-time auction platform where sellers list items and buyers bid in live auctions — with instant bid synchronization across all connected clients via WebSockets.

## Run & Operate

| Command | What it does |
|---|---|
| `pnpm run --filter @workspace/api-spec codegen` | Regenerate API client + Zod schemas from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push DB schema changes to PostgreSQL |
| `pnpm run typecheck` | Full TypeScript check (libs + artifacts) |

Workflows:
- **API Server**: `export PORT=8080 && cd artifacts/api-server && pnpm run dev` (port 8080)
- **Auction Hub**: `export PORT=8081 BASE_PATH=/ && cd artifacts/auction-hub && pnpm run dev` (port 8081)

Required env vars: `DATABASE_URL`, `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`

Demo accounts (password: `password123`):
- Seller: `seller@demo.com`
- Buyer: `buyer@demo.com`

## Stack

- **Frontend**: React 18 + Vite + TailwindCSS v4 + ShadCN UI + Framer Motion
- **Backend**: Express 5 + Socket.io (realtime) + Pino logging
- **Database**: PostgreSQL via Replit managed DB, Drizzle ORM
- **Storage**: Replit Object Storage (GCS-backed) for auction images
- **Auth**: JWT (bcryptjs) stored in localStorage
- **Codegen**: Orval → React Query hooks + Zod schemas from OpenAPI spec
- **Build**: ESBuild for server, Vite for client

## Where things live

```
artifacts/auction-hub/   ← React frontend (preview path: /)
artifacts/api-server/    ← Express API + Socket.io (preview path: /api)
lib/api-spec/            ← openapi.yaml — source of truth for API contracts
lib/api-zod/             ← Generated Zod request/response validators
lib/api-client-react/    ← Generated React Query hooks
lib/db/src/schema/       ← Drizzle table definitions (users, auctions, bids, categories)
```

## Architecture decisions

- **Socket.io for realtime**: Bids emit `bid:new`; accepting a winner emits `auction:sold` globally so all buyer dashboards instantly remove the sold item without polling.
- **Sold items separation**: `GET /auctions` always defaults to `status=live` — sold items never appear in the buyer homepage. `/seller/sold-items` is a dedicated endpoint for the seller's sales history.
- **Object Storage for images**: Sellers upload images directly from their device. Frontend requests a presigned GCS URL, uploads the file directly to GCS via PUT, then stores the serve URL (`/api/storage/objects/...`) in the database.
- **JWT in localStorage**: Auth token stored client-side, sent as `Authorization: Bearer <token>`. The `setAuthTokenGetter` from api-client-react injects it on every request.
- **No Supabase/Clerk**: Uses Replit's built-in PostgreSQL + Object Storage + custom JWT auth.

## Product

- **Landing page**: Live stats (active auctions, total bids, total value) + recent activity feed
- **Buyer flow**: Browse LIVE-only auctions → Bid with real-time countdown → Auction disappears instantly when sold → Track bids → View won auctions
- **Seller flow**: Create auction with drag-and-drop image upload → Live dashboard → Accept winner → Item moves to Sold Items page
- **Sold Items page** (`/seller/sold-items`): Shows buyer name, sold price, sold date, shipping info
- **Realtime**: Every bid triggers Socket.io `bid:new`; accepting a winner triggers `auction:sold` — buyer page shows SOLD overlay and disables bidding

## User preferences

- Futuristic dark UI: deep black/dark-gray backgrounds, red primary accent, glassmorphism cards
- No Supabase or Clerk — use native Replit infrastructure
- All bids must persist in PostgreSQL — no frontend-only state

## Gotchas

- Socket.io path is `/api/socket.io` — must match both server (`path: "/api/socket.io"`) and client
- After changing `openapi.yaml`, always run codegen before touching routes/frontend
- `lib/api-zod/src/index.ts` exports only `./generated/api` (no `.schemas` file)
- Workflows require `export PORT=XXXX BASE_PATH=/` prefix in the command string

## Pointers

- DB schema: `lib/db/src/schema/`
- API routes: `artifacts/api-server/src/routes/`
- Frontend pages: `artifacts/auction-hub/src/pages/`
- Image uploader component: `artifacts/auction-hub/src/components/image-uploader.tsx`
- Storage routes: `artifacts/api-server/src/routes/storage.ts`
