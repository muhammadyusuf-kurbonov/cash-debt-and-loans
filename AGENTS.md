# AGENTS.md — cash-debt-and-loans (Qarz.uz)

Debt/loan tracker. NestJS API + Telegram bot in `backend/`, Telegram Mini App in `telegram-web-app/`.

## Two independent packages, no root workspace

The backend and the Mini App share **no dependencies** and neither imports the other. The only thing
passing between them is `swagger.json` (generated → copied → compiled into an API client). So there is
deliberately **no root `package.json` and no monorepo tooling**:

| Directory | Package manager | Lockfile | Docker |
|---|---|---|---|
| `backend/` | **npm** | `package-lock.json` | `npm ci` |
| `telegram-web-app/` | **yarn v1** | `yarn.lock` | `yarn install` |

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

# Frontend — all from telegram-web-app/
npm run dev          # :5173
npm run dev:mock     # VITE_MOCK=true — MSW + fake JWT, no backend needed (see TEST.md)
npm run typecheck    # react-router typegen && tsc
npm run build
npm run generate:api-client
```

There is **no** `backend/jest.config.js` — jest config lives inline in `backend/package.json`
(`rootDir: src`, `testRegex: .*\.spec\.ts$`). `npm run test -- backend/jest.config.js` does not work.

## Baseline is currently RED (on `main`, verified)

Do not assume you broke these — but do fix them if your change touches them.

| Command | State on `main` |
|---|---|
| `backend/ npm test` | **9 failed / 5 passed.** `reports.service.spec.ts`, `transactions.service.spec.ts` fail |
| `backend/ npm run lint` | **45 errors / 2 warnings** (mostly `no-unsafe-member-access`; `no-namespace` on generated `src/types/prisma/index.ts`) |
| `fe npm run typecheck` | **9 errors** (`app/mocks/data.ts`, `routes/profile.tsx`, `routes/reports.tsx`, `routes/welcome.tsx`) |
| `backend/ npm run build` | passes |
| `fe npm run build` | passes — Vite/esbuild does **not** typecheck, so a green build hides type errors |

**Always run `npm run typecheck` in `telegram-web-app/`** — `npm run build` will not catch type errors.

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
- `npm run dev:mock` is the fastest way to iterate on UI. `telegram-web-app/TEST.md` documents the mock layer.
- No test framework, no ESLint config on the frontend.

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