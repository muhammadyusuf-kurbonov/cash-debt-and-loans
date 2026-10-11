# AGENTS.md — cash-debt-and-loans (Qarz.uz)

Debt/loan tracker. NestJS API + Telegram bot in `backend/`, Telegram Mini App in `telegram-web-app/`.

## Two independent packages, no root workspace

The backend and the Mini App share **no dependencies** and neither imports the other. The only thing
passing between them is `swagger.json` (generated → copied → compiled into an API client). So there is
deliberately **no root `package.json` and no monorepo tooling**:

| Directory | Package manager | Lockfile | Docker |
|---|---|---|---|
| `backend/` | **npm** | `package-lock.json` | `npm ci` |
| `telegram-web-app/` | **Yarn 4 (Modern)** | `yarn.lock` (berry, `__metadata` v8) | `yarn install --immutable` |

The Mini App uses Yarn 4, pinned by `packageManager` in `package.json` **and** by `yarnPath` in
`.yarnrc.yml` → `.yarn/releases/yarn-4.9.1.cjs`. The committed release is what makes `yarn` resolve to
4.9.1 on machines without corepack — keep it in git. `.yarnrc.yml` sets `nodeLinker: node-modules`;
without that Yarn 4 defaults to Plug'n'Play and Vite/@react-router/dev fail.

Cloudflare Pages builds this package with its bundled yarn, and that build image sets `CI=true`, which
makes yarn implicitly `--immutable`. If the lockfile is out of sync with `package.json`, the build dies
with `YN0028: The lockfile would have been modified by this install`. That is the expected failure for a
stale lockfile, not a flake — run `yarn install` locally and commit the result.

Both are built from separate Docker contexts in `docker-compose.yml`. Do **not** reintroduce a root
workspace, and do not run either package manager from the repo root — there is nothing there to install.

To regenerate the API contract across both:
```bash
./scripts/update-swagger.sh
```

## Commands

```bash
# Backend — all from backend/
npm test                                   # jest (config is inline in package.json, rootDir=src)
npx jest transactions.service              # single file (regex on path)
npm test -t "should create"                # single test by name — NO `--` before -t
npm run lint                               # eslint --fix; auto-rewrites files
npm run build
npm run test:e2e                           # test/jest-e2e.json, matches *.e2e-spec.ts
npx prisma generate                        # regenerate generated/prisma (gitignored)
npx prisma migrate dev
TELEGRAM_DISABLED=true npm run generate:swagger   # writes backend/swagger.json

# Frontend — all from telegram-web-app/ (Yarn 4)
yarn dev          # :5173
yarn dev:mock     # VITE_MOCK=true — MSW + fake JWT, no backend needed (see TEST.md)
yarn typecheck    # react-router typegen && tsc
yarn build
yarn generate:api-client
```

There is **no** `backend/jest.config.js` — jest config lives inline in `backend/package.json`
(`rootDir: src`, `testRegex: .*\.spec\.ts$`). `npm run test -- backend/jest.config.js` does not work.

## Baseline (re-measured on `3a6dcd0`, 2026-10-11)

Do not assume you broke the backend entries — but do fix them if your change touches them.
The frontend is **green**; it was not, until `9c1b425` fixed three Swagger decorator defects
that had been publishing a wrong API contract into the generated client.

| Command | State on `3a6dcd0` |
|---|---|
| `backend/ npm test` | **9 failed / 5 passed.** `reports.service.spec.ts`, `transactions.service.spec.ts` fail |
| `backend/ npm run lint` | **48 errors / 2 warnings** (mostly `no-unsafe-member-access`; `no-namespace` on generated `src/types/prisma/index.ts`) |
| `fe yarn typecheck` | **exit 0** |
| `backend/ npm run build` | passes |
| `fe yarn build` | passes — Vite/esbuild does **not** typecheck, so a green build hides type errors |

The lint count is 48, not the 45 this file previously claimed. The +3 is not a regression: a fresh
`npm install` resolves `^` ranges to newer packages (ESLint 9.39.5), which report more
`no-unsafe-member-access` hits on the same source.

**Always run `yarn typecheck` in `telegram-web-app/`** — `yarn build` will not catch type errors.
There is no frontend test framework, so `typecheck` + `build` *is* the entire frontend baseline.

## Backend architecture

Feature folders under `backend/src/`, flat (no `services/`, `providers/`, `exceptions/`, `index.ts`):

```
src/<feature>/
  <feature>.controller.ts   @ApiTags/@ApiOperation/@ApiResponse decorators
  <feature>.service.ts
  <feature>.module.ts
  dto/                      response + input DTOs
```

`auth/` (JWT + Telegram init-data), `contacts/`, `currency/`, `transactions/`, `reports/`, `users/`,
`prisma/` (global), `i18n/`, `telegram-bot/`, `types/`.

- **Imports are ambiguous on purpose**: `baseUrl: "./"` in tsconfig, so `src/prisma/prisma.service`,
  `generated/prisma`, and relative `../prisma/prisma.service` all resolve. Match the neighbouring file's style.
- **Prisma columns are snake_case in TS** (`currency_id`, `user_id`, `ref_user_id`, `deletedAt` aside);
  DTOs and API responses are camelCase. Controllers return raw Prisma objects, so the API is snake_case
  for those fields. Don't "fix" this.
- `generated/prisma` is gitignored (run `npx prisma generate`). `src/types/prisma/` **is committed** —
  it is `prisma-class-generator` output and is what Swagger uses for `extraModels`.
- Datasource is **PostgreSQL only**. `backend/prisma/dev.db` is a stale SQLite leftover.
- Balance model: `Balance` is a denormalized table keyed `(currency_id, contact_id)`, kept in sync inside
  `prisma.$transaction`. `TransactionsService.recalculateBalancesForContact` recomputes from transactions.
- Bidirectional debt: a `Contact.ref_user_id` causes `create`/`finalizeDraft` to recursively create a
  mirrored transaction with negated `amount` for the referenced user. Soft delete via `deletedAt`.
- Drafts: `createDraft` stores a transaction with `draftId` and **no** balance update;
  `finalizeDraft` attaches `contact_id`, nulls `draftId`, and applies the balance.
- `main.ts` listens on `process.env.PORT ?? 3000` (`.env` sets 3001); Swagger UI at `/api`.
- Telegram bot is conditionally registered: `TelegramBotModule.register(!process.env.TELEGRAM_DISABLED)`.
  Any non-empty `TELEGRAM_DISABLED` disables it — this is what makes swagger generation work offline.

**There is no global exception filter and no `ValidationErrorException`.** Services throw Nest built-ins
(`NotFoundException`, `BadRequestException`, `ForbiddenException`); `main.ts` only sets a `ValidationPipe`.

## API contract is generated and committed — keep it in sync

`backend/swagger.json` and `telegram-web-app/app/api/swagger.json` are **committed and byte-identical**,
and `telegram-web-app/app/api/api-client.ts` is generated from the latter by `swagger-typescript-api`.

After any backend API change:

```bash
./scripts/update-swagger.sh
```

That runs `generate:swagger` (npm, in `backend/`), copies the contract, then `generate:api-client`
(yarn, in `telegram-web-app/`). `nest-cli.json` enables the `@nestjs/swagger` plugin, so DTO type changes
silently change the generated client. **Never hand-edit `api-client.ts`.**

## Frontend architecture

React 19 + React Router 7 **SPA mode** (`react-router.config.ts` → `ssr: false`) + Vite 7 + Tailwind 4 +
shadcn/ui (`app/components/ui/`, new-york). Path alias `~/` → `./app/`.

- Routes are file-config based (`app/routes.ts`), not filesystem routing. Adding a route = edit `routes.ts`.
- Server state: TanStack React Query. Access the client via `useAPI()` (`app/api/use-api.ts`) or
  `ApiClient.getOpenAPIClient()` (`app/lib/api-client.ts`). Mutate with `useMutation` + `queryClient.invalidateQueries`.
- Auth: JWT in `sessionStorage` under `dl_auth_token` (`app/lib/telegram-auth.ts`). `isAuthenticated()`
  decodes and checks `exp`/`nbf` client-side. `app/routes/welcome.tsx` auto-signs-in via Telegram `initDataRaw`.
- `VITE_MOCK=true` starts MSW (`app/mocks/`) **and injects a fake JWT** so you land on `/home` with no backend.
- `yarn dev:mock` is the fastest way to iterate on UI. `telegram-web-app/TEST.md` documents the mock layer.
- No test framework, no ESLint config on the frontend.
- **`@tma.js/sdk` is pinned to 2.x on purpose. Do not upgrade to 3.x.** v3 is a rewrite, not a version bump:
  `retrieveLaunchParams()` stops returning a plain object (the basis of `app/lib/useTelegramData.ts`'s graceful
  non-Telegram fallback, which is what keeps `dev:mock` and browser preview working), `init()` is replaced by an
  explicit `mount()` lifecycle, and `shareMessage.isAvailable` becomes a signal. With no frontend tests and a
  build that does not typecheck, a mistake here breaks login *only* inside the real Telegram client.
- **`yarn start` is broken.** It serves `./build/server/index.js`, which SPA mode deletes at the end of every
  build. Serve `build/client/` statically instead.

### Known stale areas

- **Orphaned reports endpoints.** `/reports/trends`, `/top-debtors`, `/top-creditors`, `/currency-breakdown` were
  removed from the UI in `551abde`, but the backend still implements them, `app/mocks/data.ts` still imports
  `TrendItemDto`/`DebtorCreditorDto`/`CurrencyBreakdownDto`, and `app/mocks/handlers.ts` still mocks
  `/reports/trends`. Either wire them back up or delete them end-to-end.
- **Unconfirmed security finding.** `getAllTransactionsOfContact` is called from `contacts.controller.ts:209`
  with only `+contactId` and no ownership check; `getDraft`/`deleteDraft`/`finalizeDraft` likewise take no
  `userId`. Not confirmed exploitable end-to-end — verify before treating as a bug report.
- `docker-compose.override.yml` exists locally but is gitignored via the user's **global** `~/.gitignore`, so
  other clones never see the `db` service. Not a repo bug, but it will confuse anyone cloning fresh.

### Deployment gotcha

`VITE_BACKEND_URL` is inlined at **build** time (`app/lib/api-client.ts`). The `docker-compose.yml`
`frontend` service passes it as a **runtime** env var to the nginx container, which serves prebuilt
assets — so it has no effect there. Changing the backend URL requires a frontend rebuild.

## Money formatting — one convention, three places

`backend/src/utils.ts` (`formatCurrency`, `formatBalance`), `telegram-web-app/app/components/money.tsx`,
and the bot's `text-format.ts` all use `toLocaleString('ru', { signDisplay: 'always' })`.
Positive = they owe you, negative = you owe them. Match this when adding amounts.

`I18nService` (`backend/src/i18n/{en,ru,uz}.json`) is used by the **bot only**; the web app hardcodes Russian UI strings.

## Env

- `backend/.env` — gitignored, holds `DATABASE_URL`, `PORT`, `TELEGRAM_BOT_API_KEY` (contains a live bot token —
  don't echo it into logs or commit it anywhere new).
- `telegram-web-app/.env` — **committed**; `VITE_BACKEND_URL=https://senafa.kurbonov.net.uz`.
- `.env.example` is the template for deploy. `dokploy.config.json` drives Dokploy from `docker-compose.yml`.

`docker-compose.override.yml` (postgres 16 + port mappings) exists locally but is **gitignored** via the
user's global `~/.gitignore` — other clones get only the base compose file, which has no `db` service.

## Style

Prettier (`backend/.prettierrc`): `singleQuote: true`, `trailingComma: "all"`. Backend uses single quotes;
the frontend mixes single and double — match the file you're editing.
Backend tsconfig: `strictNullChecks: true`, `noImplicitAny: false`. ESLint turns off `no-explicit-any`,
warns on floating promises / unsafe arguments.