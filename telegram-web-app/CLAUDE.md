# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Telegram Mini App for managing cash, debts, and loans. React frontend that pairs with a NestJS backend at `../backend`. Users track financial relationships with contacts, record transactions in multiple currencies, and view balances.

## Commands

This package uses **Yarn 4 (Modern)** (`yarn.lock` is the only lockfile, berry format). Do not use pnpm or npm here.

Yarn 4 is pinned twice: `packageManager` in `package.json`, and `yarnPath` in `.yarnrc.yml` pointing at
the committed `.yarn/releases/yarn-4.9.1.cjs`. That second pin is what lets `yarn` work without corepack
installed — keep the release file in git. `.yarnrc.yml` also sets `nodeLinker: node-modules`; Yarn 4 would
otherwise default to Plug'n'Play, which Vite and `@react-router/dev` do not support here.

```bash
yarn dev                 # Dev server at http://localhost:5173
yarn dev:mock            # MSW mock layer + fake JWT, no backend needed (VITE_MOCK=true)
yarn build               # Production build
yarn typecheck           # Type checking (runs react-router typegen first)
yarn generate:api-client # Regenerate API client from app/api/swagger.json
```

Installs are immutable in CI. Cloudflare Pages sets `CI=true`, so yarn implicitly runs `--immutable` and
fails with `YN0028` if `yarn.lock` disagrees with `package.json`. Regenerate and commit the lockfile.

No test framework is configured, so the verification baseline is `yarn typecheck` **and** `yarn build`.
A green build alone is not sufficient — Vite/esbuild does not typecheck.

Note: `yarn start` (`react-router-serve ./build/server/index.js`) is **broken** and should not be used. The
app runs in SPA mode (`ssr: false` in `react-router.config.ts`), so the build emits `build/client/` only and
deletes `build/server/` at the end of every build. Serve `build/client/` with any static server instead.

## Architecture

- **React 19 + React Router 7** (SPA mode, SSR disabled) with **Vite 7**
- **TanStack React Query** for server state — query keys like `['contacts']`, `['contact-transactions', contactId]`; mutations invalidate related queries
- **API client** auto-generated from Swagger spec (`app/api/api-client.ts`) using `swagger-typescript-api`. Access via `ApiClient.getOpenAPIClient()` singleton in `app/lib/api-client.ts`
- **JWT auth** stored in `sessionStorage` key `dl_auth_token`. Telegram login via `@tma.js/sdk-react`. Auth check: `isAuthenticated()` in `app/lib/telegram-auth.ts`
- **Telegram SDK is deliberately pinned to `@tma.js/sdk` 2.x.** Do not upgrade to 3.x. v3 is not a version bump — it drops the `retrieveLaunchParams()`-returns-object contract that `app/lib/useTelegramData.ts` relies on for its graceful non-Telegram fallback, replaces `init()` with an explicit `mount()` lifecycle, and turns `shareMessage.isAvailable` into a signal. The app has no frontend tests and `yarn build` does not typecheck, so a mistake here silently breaks login inside the real Telegram client only.
- **shadcn/ui** (new-york style) on Radix UI primitives in `app/components/ui/`
- **Tailwind CSS 4** for styling; `cn()` utility in `app/lib/utils.ts`
- **Primary color**: `#2481cc` (Telegram blue), backgrounds `#efeff4` light / `#1c1c1d` dark
- **Icons**: Google Material Symbols Outlined (via Google Fonts) + Lucide React
- **Framer Motion** for animations, **Sonner** for toasts
- **Layout**: Bottom tab navigation on mobile (`bottom-nav.tsx`), hidden on desktop. Cards use `rounded-2xl` with subtle borders.

## Path Alias

`~/` maps to `./app/` (configured in tsconfig and vite)

## Routes

| Path | File | Description |
|------|------|-------------|
| `/` | `routes/welcome.tsx` | Login page (index) |
| `/home` | `routes/home.tsx` | Dashboard: net balance hero, quick actions, owed/owing summaries, recent activity |
| `/contacts` | `routes/contacts.tsx` | Contacts list (People tab) with CRUD, transaction modal |
| `/transactions` | `routes/transactions.tsx` | Transaction details (query params: contactId, contactName) |
| `/reports` | `routes/reports.tsx` | Reports: period selector, per-currency summary cards, transaction history list. The trend chart, top-debtors/creditors and currency-breakdown sections were removed in commit 551abde; the backend endpoints still exist but are unused. |
| `/profile` | `routes/profile.tsx` | User profile settings |

## Environment

`VITE_BACKEND_URL` — backend API base URL (default in `.env`: `https://senafa.kurbonov.net.uz`)

## API Client Regeneration

When the backend API changes, update `app/api/swagger.json` then run `yarn generate:api-client`. Do not manually edit `app/api/api-client.ts`. The usual path is `../scripts/update-swagger.sh`, which regenerates the backend spec, copies it here, and regenerates this client.
