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

  it('refuses to construct without DATABASE_URL', () => {
    // Constructing a real client requires the pg driver to probe the adapter,
    // which recurses past the stack limit here. Asserting the guard is the
    // part that belongs in a unit test; connecting is `test:e2e`'s job.
    delete process.env.DATABASE_URL;

    expect(() => new PrismaService()).toThrow('DATABASE_URL is not set');
  });
});