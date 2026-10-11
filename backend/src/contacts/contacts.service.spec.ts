import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { ContactsService } from './contacts.service';
import type { PrismaService } from '../prisma/prisma.service';

/**
 * A row from the single aggregate query: the grouped sum, the newest live
 * transaction timestamp, and the joined currency's fields.
 */
type Row = {
  contact_id: number | null;
  currency_id: number;
  amount: number | null;
  updatedAt: Date;
  currency_name: string;
  currency_symbol: string;
};

describe('ContactsService balance aggregation', () => {
  const usd = { id: 1, name: 'USD', symbol: '$' };
  const eur = { id: 2, name: 'EUR', symbol: '€' };

  let queryRaw: Mock;
  let contactFindMany: Mock;
  let contactFindFirst: Mock;
  let transactionFindMany: Mock;
  let service: ContactsService;

  const row = (over: Partial<Row> = {}): Row => ({
    contact_id: 1,
    currency_id: 1,
    amount: 100,
    updatedAt: new Date('2026-10-01T10:00:00Z'),
    currency_name: usd.name,
    currency_symbol: usd.symbol,
    ...over,
  });

  /** The SQL text Prisma.sql built, for assertions. */
  const sqlOf = (call = 0): string =>
    (queryRaw.mock.calls[call][0] as { sql: string }).sql;
  const valuesOf = (call = 0): unknown[] =>
    (queryRaw.mock.calls[call][0] as { values: unknown[] }).values;

  beforeEach(() => {
    queryRaw = vi.fn().mockResolvedValue([]);
    contactFindMany = vi.fn().mockResolvedValue([]);
    contactFindFirst = vi.fn().mockResolvedValue(null);
    transactionFindMany = vi.fn().mockResolvedValue([]);

    const prisma = {
      $queryRaw: queryRaw,
      contact: { findMany: contactFindMany, findFirst: contactFindFirst },
      transaction: { findMany: transactionFindMany },
      user: { findFirst: vi.fn() },
    };

    // Partial double. Only the methods `ContactsService` calls are stubbed;
    // anything else throws "is not a function" instead of silently returning
    // undefined. Suppressed rather than typed, because `PrismaService extends
    // PrismaClient` — spelling out its ~200 models to satisfy the compiler
    // would drown the test in noise it does not care about.
    // @ts-expect-error partial PrismaService double
    service = new ContactsService(prisma as PrismaService);
  });

  describe('query shape', () => {
    beforeEach(() => {
      // One contact, so the aggregate actually runs and the SQL is inspectable.
      contactFindMany.mockResolvedValue([{ id: 1 }]);
    });

    it('computes balances in a single query, with no second currency lookup', async () => {
      queryRaw.mockResolvedValue([row()]);

      await service.findAll(9);

      expect(queryRaw).toHaveBeenCalledTimes(1);
      // No separate currency round-trip: the currency is joined in.
      expect(sqlOf()).toContain('JOIN "Currency"');
    });

    it('joins Currency and groups by contact and currency', async () => {
      await service.findAll(9);

      expect(sqlOf()).toContain('JOIN "Currency"');
      expect(sqlOf()).toContain('GROUP BY');
      expect(sqlOf()).toContain('SUM(');
      expect(sqlOf()).toContain('MAX(');
    });

    it('excludes drafts via contact_id IS NOT NULL', async () => {
      await service.findAll(9);

      expect(sqlOf()).toMatch(/contact_id" IS NOT NULL/i);
    });

    it('excludes soft-deleted transactions via deletedAt IS NULL', async () => {
      await service.findAll(9);

      expect(sqlOf()).toMatch(/deletedAt" IS NULL/i);
    });

    it('scopes by Transaction.user_id, passing it as a bound parameter', async () => {
      await service.findAll(9);

      expect(sqlOf()).toMatch(/user_id" = \?/);
      expect(valuesOf()).toContain(9);
    });

    it('orders by contact then currency for a stable response', async () => {
      await service.findAll(9);

      expect(sqlOf()).toMatch(/ORDER BY/i);
    });
  });

  describe('findAll', () => {
    it('returns Balance: [] for a contact with no live transactions', async () => {
      queryRaw.mockResolvedValue([
        row({ contact_id: 1, amount: 100 }),
        row({ contact_id: 2, amount: 50 }),
      ]);
      contactFindMany.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

      const result = await service.findAll(9);

      expect(result[2].Balance).toEqual([]);
    });

    it('keeps a zero-sum contact as a row with amount 0', async () => {
      const updatedAt = new Date('2026-10-01T10:00:00Z');
      queryRaw.mockResolvedValue([row({ amount: 0, updatedAt })]);
      contactFindMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.findAll(9);

      expect(result[0].Balance).toEqual([
        { currency_id: 1, contact_id: 1, amount: 0, updatedAt, currency: usd },
      ]);
    });

    it('derives updatedAt from the newest live transaction only', async () => {
      // A soft-deleted row newer than any live row is absent from the
      // aggregate entirely, so it cannot win the MAX.
      const newestLive = new Date('2026-10-05T12:00:00Z');
      queryRaw.mockResolvedValue([
        row({
          currency_id: 1,
          amount: 40,
          updatedAt: new Date('2026-09-01T00:00:00Z'),
        }),
        row({
          currency_id: 2,
          amount: 60,
          updatedAt: newestLive,
          currency_name: eur.name,
          currency_symbol: eur.symbol,
        }),
      ]);
      contactFindMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.findAll(9);

      const byCurrency = new Map(
        result[0].Balance.map((b) => [b.currency_id, b]),
      );
      expect(byCurrency.get(1)!.updatedAt).toEqual(
        new Date('2026-09-01T00:00:00Z'),
      );
      expect(byCurrency.get(2)!.updatedAt).toEqual(newestLive);
    });

    it('orders balances by ascending currency_id', async () => {
      queryRaw.mockResolvedValue([
        row({
          currency_id: 2,
          amount: 5,
          currency_name: eur.name,
          currency_symbol: eur.symbol,
        }),
        row({ currency_id: 1, amount: 7 }),
      ]);
      contactFindMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.findAll(9);

      expect(result[0].Balance.map((b) => b.currency_id)).toEqual([1, 2]);
    });

    it('coalesces a null SUM to 0', async () => {
      queryRaw.mockResolvedValue([row({ amount: null })]);
      contactFindMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.findAll(9);

      expect(result[0].Balance[0].amount).toBe(0);
    });

    it('skips the aggregate entirely when there are no contacts', async () => {
      contactFindMany.mockResolvedValue([]);

      const result = await service.findAll(9);

      expect(result).toEqual([]);
      expect(queryRaw).not.toHaveBeenCalled();
    });

    it('ignores a row whose contact_id is null', async () => {
      queryRaw.mockResolvedValue([row({ contact_id: null })]);
      contactFindMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.findAll(9);

      expect(result[0].Balance).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('attaches balances', async () => {
      const updatedAt = new Date('2026-10-01T10:00:00Z');
      queryRaw.mockResolvedValue([row({ amount: 250, updatedAt })]);
      contactFindFirst.mockResolvedValue({ id: 1 });

      const contact = await service.findOne(1, 9);

      expect(contact.Balance).toEqual([
        {
          currency_id: 1,
          contact_id: 1,
          amount: 250,
          updatedAt,
          currency: usd,
        },
      ]);
    });

    it('still throws NotFoundException before querying balances', async () => {
      contactFindFirst.mockResolvedValue(null);

      await expect(service.findOne(404, 9)).rejects.toThrow(
        'Contact with ID 404 not found',
      );
      expect(queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('getRecentContacts', () => {
    it('attaches balances to the deduplicated contacts', async () => {
      const updatedAt = new Date('2026-10-02T08:00:00Z');
      queryRaw.mockResolvedValue([row({ amount: -80, updatedAt })]);
      transactionFindMany.mockResolvedValue([{ contact: { id: 1 } }]);

      const result = await service.getRecentContacts(9, 10, 0);

      expect(result).toEqual([
        {
          id: 1,
          Balance: [
            {
              currency_id: 1,
              contact_id: 1,
              amount: -80,
              updatedAt,
              currency: usd,
            },
          ],
        },
      ]);
    });
  });
});
