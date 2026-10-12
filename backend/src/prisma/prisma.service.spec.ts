import { afterEach, describe, expect, it } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const originalUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalUrl;
    }
  });

  /**
   * The pool config handed to `@prisma/adapter-pg`, which passes it to `pg`.
   * Built by constructing the service directly rather than through
   * `Test.createTestingModule` — the DI path makes the pg driver probe the
   * adapter and recurses past the stack limit.
   */
  const poolConfigFor = (connectionString: string) => {
    process.env.DATABASE_URL = connectionString;
    const service = new PrismaService() as unknown as {
      _engineConfig: { adapter: { config: { ssl?: unknown } } };
    };
    return service._engineConfig.adapter.config;
  };

  it('refuses to construct without DATABASE_URL', () => {
    delete process.env.DATABASE_URL;

    expect(() => new PrismaService()).toThrow('DATABASE_URL is not set');
  });

  /**
   * Regression: PrismaService hardcoded `ssl: { rejectUnauthorized: false }`.
   * In node-pg a truthy `ssl` means TLS is *required* — it does not relax the
   * connection down to plaintext, and there is no fallback. Against a Postgres
   * with `ssl = off` (the `postgres:16` service in docker-compose) every query
   * then died with:
   *
   *   Error opening a TLS connection: The server does not support SSL connections
   *
   * Leaving `ssl` unset lets `pg` derive it from `sslmode` in the connection
   * string, which defaults to plaintext.
   */
  it('does not force TLS when the connection string does not ask for it', () => {
    expect(
      poolConfigFor('postgresql://user:pass@localhost:5432/db').ssl,
    ).toBeUndefined();
  });

  it('passes the connection string through so sslmode still reaches the driver', () => {
    const config = poolConfigFor(
      'postgresql://user:pass@localhost:5432/db?sslmode=require',
    ) as { connectionString: string };

    expect(config.connectionString).toContain('sslmode=require');
    expect(config.ssl).toBeUndefined();
  });
});
