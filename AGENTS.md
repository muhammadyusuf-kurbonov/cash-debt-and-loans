# AGENTS.md — Agentic Coding Agent Rules for cash-debt-and-loans

## 1. Build & Test Commands

### Backend (NestJS)

```bash
pnpm install                    # Install dependencies
pnpm build                      # Compile TypeScript to dist/
pnpm start:dev                  # Run dev server with watch mode (port 3001)
pnpm lint                       # ESLint auto-fix on src/**/*.ts, test/**/*.ts
npm run test                   # Unit tests using Jest
npm run test -- <test-path>    # Run single test or regex pattern
npm run test:cov               # Tests with coverage report
npm run build                  # Production build output to dist/
```

### Run Single Test (Backend)

Use Jest's test path pattern:

```bash
pnpm test -- backend/jest.config.js -t "<test-description>"
```

Or with Jest CLI directly:

```bash
npx jest backend/jest.config.js -t "<test-description>"
```

Example:
```bash
pnpm test -- backend/jest.config.js -t "should create user"
```

### E2E Tests (Backend)

```bash
pnpm test:e2e                           # Run end-to-end tests
pnpm test:e2e -c ./test/jest-e2e.json
npx jest -c ./test/jest-e2e.json
```

### Frontend (Telegram Web App)

```bash
npm run dev                            # Start dev server
npm run build                          # Production build to dist/
npm run lint                           # ESLint auto-fix
```

### TypeScript Compiler Flags (Backend)

```json
{
  "strictNullChecks": true,
  "noImplicitAny": false,
  "sourceMap": true,
  "module": "commonjs"
}
```

## 2. Code Style Guidelines

### Import Organization

**Within package**:
```ts
import { CreateUserDto } from './create-user.dto';
import { UserService } from './user.service';
```

**Different modules/packages in same project**:
```ts
import { JwtService } from '@nestjs/passport'; // NestJS packages
import { PrismaService } from 'prisma-client'; // Third-party libraries
```

**Types only**, not needed at runtime:
```ts
import { UserDto } from 'src/user/dto';  // Not valid - types can't be imported!
```

Use type-only imports for types not otherwise used:
```ts
type MyType = string;
declare const x: MyType;                 // Valid - TypeScript uses the type only
```

### File Structure (Backend Modules)

Standard NestJS module structure under `src/<feature>/`:

```
src/auth/
├── dto/              # DTO files for input validation
├── guards/           # Authentication decorators/guards
├── interceptors/     # Response transformation, error formatting
├── module.ts         # Module registration & configuration
├── services/         # Business logic with dependencies from ./providers
├── utils/            # Shared utilities & helper functions
├── providers/        # Domain-specific business logic (optional)
├── exceptions/       # Custom exception handlers
└── index.ts          # Re-export module exports
```

### Error Handling Patterns

- **Custom exceptions**: Extend `HttpException`, not plain Errors. Include `{ message, statusCode }` at minimum plus `status`.
- **Validation**: Use `class-validator` decorators (`@MinLength`, `@IsEmail`). Invalid data throws `ValidationErrorException`.
- **Async errors**: Always await promises; use `@Catch(exception)` for global handlers:
  ```ts
  @Catch(Exception)
  public handleAllExceptions(@Catch() exception: Exception) {
    return this.exceptionFilter.process(exception, this.request);
  }
  ```

### Formatting & Style Rules

**Prettier**:
```json
{ "singleQuote": true, "trailingComma": "all" }
```

**ESLint**:
- `@typescript-eslint/no-explicit-any` OFF in project (any type allowed but discouraged)
- `@typescript-eslint/no-floating-promises` WARN
- Floating promises should be handled: await or use Promise.all()
- `@typescript-eslint/no-unsafe-argument` and `@typescript-eslint/no-unsafe-call` warnings for unsafe arguments/calls

### Type Usage Patterns

```ts
interface UserDto {
  id: number;
  email: string;
}

// Explicit typing with interfaces/types
const createUser: (data: CreateUserDto) => Promise<User> = async (dto) => { /* ... */ };

// TypeScript uses explicit typing over 'any' by default when possible
```

### Naming Conventions

| Component          | Convention         | Example                      |
| ------------------ | ------------------ |------------------------------|
| Files/Modules      | kebab-case         | `auth.module.ts`             |
| Classes            | PascalCase        | `UserService`, `AuthGuard`   |
| Constants/functions| camelCase          | `maxAge`, `calculateTotal()` |
| Variables          | camelCase          | `userCount`, `isActive`      |
| Type parameters    | CamelCase/PascalCase | `T`, `ItemDto`               |
| Test names         | camelCase + verb   | `shouldCreateUserWithValidData()` |

### Prisma Client Usage

**Import paths**:
```ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

**Use typed client methods and DTO interfaces**:
```ts
// Using generated types from PRISMA_CLASS_GENERATOR
import { CreateUserDto } from 'generated/prisma/index.js';
```

### Database Transactions (Backend)

Atomic multi-update using Prisma `prisma$transaction`:
```ts
@PrismaService()
export class Wallet {
  async topup(userId: string, amount: number): Promise<void> {
    await this.prisma.$transaction([
      // Update wallet balance and other entities atomically
      this.wallet.updateMany({
        where: { userId },
        data: { balance: Increment(amount) }
      }),
      // ... more operations
    ]);
  }
}
```

### Telegram Web App Integration (Frontend)

**Init Data Access**: Use `@tma.js/init-data-node` for Telegram Web App session data.
```ts
import tma from 'telegraf';
import { InitDataService } from '@tma.js/init-data-node';
```

**Handle Telegram session errors gracefully**, with fallback:
```ts
try {
  const initData = await InitDataService.initData();
} catch (error) {
  // Return sensible defaults if init data unavailable
}
```

## 3. CI & Validation Scripts

### Repository-wide validation:

```bash
# Run backend tests only
cd backend && pnpm test

# Run frontend build and lint
cd telegram-web-app && npm run lint && npm run build

# Full validation:
pnpm install && cd backend && pnpm lint && pnpm build
```

## 4. Repository Layout Reference

**Root**:
- `backend/` — NestJS backend API
- `telegram-web-app/` — Telegram Web App client

**Backend Architecture**:
- Module structure: `src/<feature>/module.ts`
- Global modules: `prisma.module.ts`, `i18n.module.ts`, `auth.module.ts`
- Generated types: `generated/prisma/index.js`

## 5. Common Pitfalls to Avoid

1. **Importing types only** doesn't work when you need the type at runtime. Use type-only imports with `import type { MyType } from '...'` if needed.
2. **Never throw generic Errors**. Extend custom exceptions and include `{ message, statusCode }`.
3. **Don't forget to await promises**. Floating unresolved promises are violations unless intentional async operations documented.
4. **Avoid hardcoding database types** from Prisma client — use generated DTO interfaces.
