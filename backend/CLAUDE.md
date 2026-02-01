# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
pnpm install              # Install dependencies
pnpm start:dev            # Run dev server with watch mode (port 3001)
pnpm build                # Compile (nest build)
pnpm lint                 # ESLint with auto-fix
pnpm test                 # Unit tests (Jest)
pnpm test -- --testPathPattern=<pattern>  # Run a single test
pnpm test:e2e             # E2E tests
pnpm generate:swagger     # Generate swagger.json (disables Telegram bot)
```

Prisma commands:
```bash
npx prisma migrate dev    # Create/apply migrations
npx prisma generate       # Regenerate Prisma client (output: generated/prisma/)
```

## Architecture

NestJS backend for a debt/loan tracking app with Telegram bot integration.

**Module structure** — each feature is a self-contained NestJS module under `src/`:
- `auth/` — JWT + Telegram Web App authentication (via `@tma.js/init-data-node`)
- `transactions/` — Topup, withdraw, cancel (soft delete), edit operations
- `contacts/` — Contact CRUD with per-currency balance tracking
- `currency/` — Currency management
- `telegram-bot/` — Telegraf-based bot (`nestjs-telegraf`) with session middleware
- `prisma/` — Prisma service wrapper (global module)
- `i18n/` — Internationalization service

**Database**: PostgreSQL (production), SQLite (dev). ORM is Prisma — schema at `prisma/schema.prisma`. Generated client lives in `generated/prisma/`. DTO classes are also generated from Prisma models via `prisma-class-generator`.

**Key design patterns**:
- P2P debt tracking: contacts can reference another user (`ref_user_id`), enabling bidirectional transaction mirroring
- Draft transactions: `draftId` field supports offline/optimistic creation
- Soft deletes on transactions (`deletedAt`)
- Prisma transactions for atomic balance updates

**Auth flow**: JWT bearer tokens. Two entry points — email/password signup/signin and Telegram Web App init data validation. Routes protected with `JwtAuthGuard`.

## Environment Variables

`DATABASE_URL`, `PORT` (default 3001), `JWT_SECRET`, `TELEGRAM_BOT_API_KEY`, `TELEGRAM_DISABLED` (set `true` to skip bot initialization).

## Code Style

- Prettier: single quotes, trailing commas
- ESLint: `@typescript-eslint/no-explicit-any` is off; floating promises and unsafe arguments are warnings
- NestJS Swagger plugin enabled in `nest-cli.json` (auto-generates API metadata from types)
