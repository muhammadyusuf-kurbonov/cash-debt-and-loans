import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { UsersService } from './users.service';
import type { PrismaService } from '../prisma/prisma.service';

type Row = { currency_id: number; amount: number | null };

describe('UsersService.getNetBalanceOfUser', () => {
  let queryRaw: Mock;
  let service: UsersService;

  const row = (over: Partial<Row> = {}): Row => ({
    currency_id: 1,
    amount: 100,
    ...over,
  });

  const sqlOf = (call = 0): string =>
    (queryRaw.mock.calls[call][0] as { sql: string }).sql;
  const valuesOf = (call = 0): unknown[] =>
    (queryRaw.mock.calls[call][0] as { values: unknown[] }).values;

  beforeEach(() => {
    queryRaw = vi.fn().mockResolvedValue([]);

    const prisma = { $queryRaw: queryRaw };

    // Partial double: only $queryRaw is read by this method.
    // @ts-expect-error partial PrismaService double
    service = new UsersService(prisma as PrismaService);
  });

  it('aggregates from transactions, not a balance table', async () => {
    await service.getNetBalanceOfUser(1);

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(sqlOf()).toContain('FROM "Transaction"');
  });

  it('excludes drafts and soft-deleted rows', async () => {
    await service.getNetBalanceOfUser(1);

    expect(sqlOf()).toMatch(/contact_id" IS NOT NULL/i);
    expect(sqlOf()).toMatch(/deletedAt" IS NULL/i);
  });

  it('scopes by Transaction.user_id as a bound parameter', async () => {
    await service.getNetBalanceOfUser(42);

    expect(sqlOf()).toMatch(/user_id" = \?/);
    expect(valuesOf()).toContain(42);
  });

  it('groups by currency only, not by contact', async () => {
    await service.getNetBalanceOfUser(1);

    expect(sqlOf()).toMatch(/GROUP BY[\s\S]*currency_id/i);
    expect(sqlOf()).not.toMatch(/GROUP BY[\s\S]*contact_id/i);
  });

  it('returns one net row per currency', async () => {
    queryRaw.mockResolvedValue([row(), row({ currency_id: 2, amount: -40 })]);

    expect(await service.getNetBalanceOfUser(1)).toEqual([
      { currency_id: 1, amount: 100 },
      { currency_id: 2, amount: -40 },
    ]);
  });

  it('coalesces a null SUM to 0', async () => {
    queryRaw.mockResolvedValue([row({ amount: null })]);

    expect(await service.getNetBalanceOfUser(1)).toEqual([
      { currency_id: 1, amount: 0 },
    ]);
  });

  it('returns an empty array when the user has no transactions', async () => {
    queryRaw.mockResolvedValue([]);

    expect(await service.getNetBalanceOfUser(1)).toEqual([]);
  });
});