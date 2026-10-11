import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { ReportsService } from './reports.service';
import type { PrismaService } from '../prisma/prisma.service';

/** A per-contact, per-currency aggregate row from the summary query. */
type Row = {
  contact_id: number | null;
  currency_id: number;
  amount: number | null;
  currency_name: string;
  currency_symbol: string;
};

describe('ReportsService.getSummary', () => {
  let queryRaw: Mock;
  let transactionFindMany: Mock;
  let service: ReportsService;

  const usd = { name: 'USD', symbol: '$' };
  const eur = { name: 'EUR', symbol: '€' };

  const row = (over: Partial<Row> = {}): Row => ({
    contact_id: 1,
    currency_id: 1,
    amount: 100,
    currency_name: usd.name,
    currency_symbol: usd.symbol,
    ...over,
  });

  const sqlOf = (call = 0): string =>
    (queryRaw.mock.calls[call][0] as { sql: string }).sql;
  const valuesOf = (call = 0): unknown[] =>
    (queryRaw.mock.calls[call][0] as { values: unknown[] }).values;

  beforeEach(() => {
    queryRaw = vi.fn().mockResolvedValue([]);
    transactionFindMany = vi.fn().mockResolvedValue([]);

    const prisma = {
      $queryRaw: queryRaw,
      transaction: { findMany: transactionFindMany, groupBy: vi.fn() },
    };

    // Partial double: only the methods getSummary reads are stubbed.
    // @ts-expect-error partial PrismaService double
    service = new ReportsService(prisma as PrismaService);
  });

  describe('aggregate query', () => {
    it('reads balances from transactions, not a balance table', async () => {
      await service.getSummary(1);

      expect(queryRaw).toHaveBeenCalledTimes(1);
      expect(sqlOf()).toContain('FROM "Transaction"');
    });

    it('excludes drafts and soft-deleted rows', async () => {
      await service.getSummary(1);

      expect(sqlOf()).toMatch(/contact_id" IS NOT NULL/i);
      expect(sqlOf()).toMatch(/deletedAt" IS NULL/i);
    });

    it('scopes by Transaction.user_id as a bound parameter', async () => {
      await service.getSummary(1);

      expect(sqlOf()).toMatch(/user_id" = \?/);
      expect(valuesOf()).toContain(1);
    });

    it('groups by contact before currency', async () => {
      await service.getSummary(1);

      expect(sqlOf()).toMatch(/GROUP BY[\s\S]*contact_id[\s\S]*currency_id/i);
    });

    it('adds a currency filter only when one is supplied', async () => {
      await service.getSummary(1, undefined, undefined, 7);

      expect(sqlOf()).toMatch(/currency_id" = \?/);
      expect(valuesOf()).toContain(7);
    });

    it('omits the currency filter when none is supplied', async () => {
      await service.getSummary(1);

      expect(sqlOf()).not.toMatch(/currency_id" = \?/);
    });
  });

  describe('contact-then-currency folding', () => {
    it('splits signs per contact before folding into per-currency totals', async () => {
      queryRaw.mockResolvedValue([
        row({ contact_id: 1, amount: 100 }),
        row({ contact_id: 2, amount: -30 }),
      ]);

      expect(await service.getSummary(1)).toEqual([
        { currencyId: 1, currencySymbol: '$', owedToMe: 100, iOwe: 30, netBalance: 70 },
      ]);
    });

    it('sums positive balances as owedToMe', async () => {
      queryRaw.mockResolvedValue([
        row({ contact_id: 1, amount: 200 }),
        row({ contact_id: 2, amount: 50 }),
      ]);

      expect(await service.getSummary(1)).toEqual([
        { currencyId: 1, currencySymbol: '$', owedToMe: 250, iOwe: 0, netBalance: 250 },
      ]);
    });

    it('sums negative balances as iOwe by absolute value', async () => {
      queryRaw.mockResolvedValue([
        row({ contact_id: 1, amount: -80 }),
        row({ contact_id: 2, amount: -70 }),
      ]);

      expect(await service.getSummary(1)).toEqual([
        { currencyId: 1, currencySymbol: '$', owedToMe: 0, iOwe: 150, netBalance: -150 },
      ]);
    });

    it('treats a zero balance as neither owed nor owing', async () => {
      queryRaw.mockResolvedValue([
        row({ contact_id: 1, amount: 0 }),
        row({ contact_id: 2, amount: 100 }),
      ]);

      expect(await service.getSummary(1)).toEqual([
        { currencyId: 1, currencySymbol: '$', owedToMe: 100, iOwe: 0, netBalance: 100 },
      ]);
    });

    it('returns a zero-net entry for a currency whose contacts cancel out', async () => {
      queryRaw.mockResolvedValue([
        row({ contact_id: 1, amount: 60 }),
        row({ contact_id: 2, amount: -60 }),
      ]);

      expect(await service.getSummary(1)).toEqual([
        { currencyId: 1, currencySymbol: '$', owedToMe: 60, iOwe: 60, netBalance: 0 },
      ]);
    });

    it('coalesces a null SUM to 0', async () => {
      queryRaw.mockResolvedValue([row({ amount: null })]);

      expect(await service.getSummary(1)).toEqual([
        { currencyId: 1, currencySymbol: '$', owedToMe: 0, iOwe: 0, netBalance: 0 },
      ]);
    });

    it('ignores a row whose contact_id is null', async () => {
      queryRaw.mockResolvedValue([
        row({ contact_id: null, amount: 500 }),
        row({ contact_id: 1, amount: 100 }),
      ]);

      expect(await service.getSummary(1)).toEqual([
        { currencyId: 1, currencySymbol: '$', owedToMe: 100, iOwe: 0, netBalance: 100 },
      ]);
    });

    it('keeps currencies separate', async () => {
      queryRaw.mockResolvedValue([
        row({ currency_id: 1, contact_id: 1, amount: 100, currency_symbol: usd.symbol }),
        row({
          currency_id: 2,
          contact_id: 1,
          amount: 40,
          currency_name: eur.name,
          currency_symbol: eur.symbol,
        }),
      ]);

      expect(await service.getSummary(1)).toEqual([
        { currencyId: 1, currencySymbol: '$', owedToMe: 100, iOwe: 0, netBalance: 100 },
        { currencyId: 2, currencySymbol: '€', owedToMe: 40, iOwe: 0, netBalance: 40 },
      ]);
    });

    it('returns an empty array when the user has no transactions', async () => {
      queryRaw.mockResolvedValue([]);

      expect(await service.getSummary(1)).toEqual([]);
    });
  });

  describe('date range', () => {
    it('uses the transaction range query when from and to are given', async () => {
      transactionFindMany.mockResolvedValue([]);

      await service.getSummary(1, '2024-01-01', '2024-12-31');

      expect(transactionFindMany).toHaveBeenCalledWith({
        where: {
          user_id: 1,
          deletedAt: null,
          createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31'),
          },
        },
        include: { currency: true },
      });
      expect(queryRaw).not.toHaveBeenCalled();
    });

    it('folds a ranged result by sign', async () => {
      transactionFindMany.mockResolvedValue([
        { amount: 200, currency_id: 1, currency: { symbol: '$' } },
        { amount: -80, currency_id: 1, currency: { symbol: '$' } },
      ]);

      expect(await service.getSummary(1, '2024-01-01', '2024-12-31')).toEqual([
        { currencyId: 1, currencySymbol: '$', owedToMe: 200, iOwe: 80, netBalance: 120 },
      ]);
    });

    it('honours a currency filter on the ranged path', async () => {
      transactionFindMany.mockResolvedValue([]);

      await service.getSummary(1, '2024-01-01', '2024-12-31', 7);

      expect(transactionFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ currency_id: 7 }),
        }),
      );
    });

    it('uses the ranged query when only from is given', async () => {
      transactionFindMany.mockResolvedValue([]);

      await service.getSummary(1, '2024-01-01');

      // Any date bound selects the ranged path; only the fully unbounded
      // call takes the aggregate.
      expect(transactionFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: { gte: new Date('2024-01-01') },
          }),
        }),
      );
    });
  });
});