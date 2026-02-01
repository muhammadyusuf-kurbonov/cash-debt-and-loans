# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Telegram Mini App for managing cash, debts, and loans. React frontend that pairs with a NestJS backend at `../backend`. Users track financial relationships with contacts, record transactions in multiple currencies, and view balances.

## Commands

```bash
pnpm run dev              # Dev server at http://localhost:5173
pnpm run build            # Production build
pnpm run start            # Serve production build (port 3000)
pnpm run typecheck        # Type checking (runs typegen first)
pnpm run generate:api-client  # Regenerate API client from app/api/swagger.json
```

No test framework is configured.

## Architecture

- **React 19 + React Router 7** (SPA mode, SSR disabled) with **Vite 7**
- **TanStack React Query** for server state — query keys like `['contacts']`, `['contact-transactions', contactId]`; mutations invalidate related queries
- **API client** auto-generated from Swagger spec (`app/api/api-client.ts`) using `swagger-typescript-api`. Access via `ApiClient.getOpenAPIClient()` singleton in `app/lib/api-client.ts`
- **JWT auth** stored in `localStorage` key `dl_auth_token`. Telegram login via `@tma.js/sdk-react`. Auth check: `isAuthenticated()` in `app/lib/telegram-auth.ts`
- **shadcn/ui** (new-york style, zinc base) on Radix UI primitives in `app/components/ui/`
- **Tailwind CSS 4** for styling; `cn()` utility in `app/lib/utils.ts`
- **Framer Motion** for animations, **Lucide React** for icons, **Sonner** for toasts

## Path Alias

`~/` maps to `./app/` (configured in tsconfig and vite)

## Routes

| Path | File | Description |
|------|------|-------------|
| `/` | `routes/welcome.tsx` | Login page (index) |
| `/home` | `routes/home.tsx` | Main dashboard with contacts/balances |
| `/transactions` | `routes/transactions.tsx` | Transaction details (query params: contactId, contactName) |
| `/profile` | `routes/profile.tsx` | User profile settings |

## Environment

`VITE_BACKEND_URL` — backend API base URL (default in `.env`: `https://senafa.kurbonov.net.uz`)

## API Client Regeneration

When the backend API changes, update `app/api/swagger.json` then run `pnpm run generate:api-client`. Do not manually edit `app/api/api-client.ts`.
