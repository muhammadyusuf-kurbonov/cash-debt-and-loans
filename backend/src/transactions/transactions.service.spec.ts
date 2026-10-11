import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { TransactionsService } from './transactions.service';
import type { ContactsService } from '../contacts/contacts.service';
import type { PrismaService } from '../prisma/prisma.service';
describe('TransactionsService.getNetBalanceOfUser', () => {
  let queryRaw: Mock;
  let service: TransactionsService;

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

    // Partial doubles: only $queryRaw is read by this method, and
    // ContactsService is unused here but required by the constructor.
    // @ts-expect-error partial PrismaService double
    service = new TransactionsService(
      prisma as PrismaService,
      {} as ContactsService,
    );
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

/**
 * The write path, after the Balance table was dropped.
 *
 * These tests pin two things: the transaction row is still written correctly,
 * and NO balance bookkeeping happens anywhere — `prisma.balance` does not
 * exist any more, so a stray call would throw at runtime, not just drift.
 */
describe('TransactionsService write path', () => {
  let prisma: {
    transaction: {
      create: Mock;
      update: Mock;
      findFirst: Mock;
      findUnique: Mock;
    };
    contact: { findUnique: Mock; findFirst: Mock };
  };
  let contacts: { getContactForUserId: Mock };
  let service: TransactionsService;

  beforeEach(() => {
    prisma = {
      transaction: {
        create: vi.fn().mockResolvedValue({ id: 10 }),
        update: vi.fn().mockResolvedValue({ id: 10 }),
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      contact: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      // `balance` is deliberately absent: any surviving balance write throws
      // "Cannot read properties of undefined" and fails loudly.
    };

    contacts = {
      getContactForUserId: vi.fn().mockResolvedValue({ id: 99 }),
    };

    service = new TransactionsService(
      // @ts-expect-error partial PrismaService double — `balance` deliberately absent
      prisma as PrismaService,
      // @ts-expect-error partial PrismaService double — `balance` deliberately absent
      contacts as ContactsService,
    );
  });

  describe('create', () => {
    it('writes the transaction row without any balance bookkeeping', async () => {
      prisma.contact.findUnique.mockResolvedValue({
        id: 5,
        user_id: 1,
        ref_user_id: null,
      });

      await service.create(5, 1, 100, 'lunch', null, 1);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          contact_id: 5,
          currency_id: 1,
          amount: 100,
          note: 'lunch',
          draftId: null,
          user_id: 1,
        },
      });
    });

    it('writes exactly one row when the contact is not mirrored', async () => {
      prisma.contact.findUnique.mockResolvedValue({
        id: 5,
        user_id: 1,
        ref_user_id: null,
      });

      await service.create(5, 1, 100, null, null, 1);

      expect(prisma.transaction.create).toHaveBeenCalledTimes(1);
    });

    it('normalises a null note to null', async () => {
      prisma.contact.findUnique.mockResolvedValue({
        id: 5,
        user_id: 1,
        ref_user_id: null,
      });

      await service.create(5, 1, 50, undefined, null, 1);

      expect(prisma.transaction.create.mock.calls[0][0].data.note).toBeNull();
    });

    it('stores a draft with a null contact_id', async () => {
      await service.create(null, 1, 100, null, 'draft-1', 1);

      expect(prisma.transaction.create.mock.calls[0][0].data).toMatchObject({
        contact_id: null,
        draftId: 'draft-1',
      });
    });

    it('returns undefined for a draft', async () => {
      await expect(
        service.create(null, 1, 100, null, 'draft-1', 1),
      ).resolves.toBeUndefined();
    });

    it('creates a mirrored transaction when the contact references a user', async () => {
      prisma.contact.findUnique.mockResolvedValue({
        id: 5,
        user_id: 1,
        ref_user_id: 2,
      });

      await service.create(5, 1, 100, null, null, 1);

      expect(contacts.getContactForUserId).toHaveBeenCalledWith(1, 2);
      expect(prisma.transaction.create).toHaveBeenCalledTimes(2);
      // The mirror is the negated amount against the referenced user.
      expect(prisma.transaction.create.mock.calls[1][0].data).toMatchObject({
        contact_id: 99,
        amount: -100,
        user_id: 2,
      });
    });

    it('throws when the contact does not exist', async () => {
      prisma.contact.findUnique.mockResolvedValue(null);

      await expect(service.create(404, 1, 100, null, null, 1)).rejects.toThrow(
        'Contact with ID 404 not found',
      );
    });

    it('skips the contact lookup for a draft', async () => {
      await service.create(null, 1, 100, null, 'draft-1', 1);

      expect(prisma.contact.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('finalizeDraft', () => {
    const draft = {
      id: 7,
      currency_id: 1,
      amount: 100,
      note: 'draft note',
      draftId: 'draft-1',
    };

    beforeEach(() => {
      prisma.transaction.findUnique.mockResolvedValue(draft);
      prisma.contact.findUnique.mockResolvedValue({
        id: 5,
        user_id: 1,
        ref_user_id: null,
      });
    });

    it('throws when the draft does not exist', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(service.finalizeDraft('nope', 5)).rejects.toThrow(
        'Draft transaction with for nope not found',
      );
    });

    it('attaches the contact and clears the draft marker', async () => {
      await service.finalizeDraft('draft-1', 5);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { draftId: 'draft-1' },
        data: { contact_id: 5, draftId: null },
        include: { currency: true },
      });
    });

    it('writes only the draft update — no balance upsert', async () => {
      await service.finalizeDraft('draft-1', 5);

      expect(prisma.transaction.update).toHaveBeenCalledTimes(1);
    });

    it('mirrors the finalized amount to the referenced user', async () => {
      prisma.contact.findUnique.mockResolvedValue({
        id: 5,
        user_id: 1,
        ref_user_id: 2,
      });

      await service.finalizeDraft('draft-1', 5);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          contact_id: 99,
          currency_id: 1,
          amount: -100,
          note: 'draft note',
          draftId: null,
          user_id: 2,
        },
      });
    });
  });

  describe('remove', () => {
    const owned = { id: 10, contact_id: 5, currency_id: 1, amount: 100 };

    beforeEach(() => {
      prisma.transaction.findFirst.mockResolvedValue(owned);
      prisma.contact.findUnique.mockResolvedValue({
        id: 5,
        user_id: 1,
        ref_user_id: null,
      });
    });

    it('soft-deletes the transaction', async () => {
      await service.remove(10, 1);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('writes only the soft delete — the old code updated three balances', async () => {
      await service.remove(10, 1);

      expect(prisma.transaction.update).toHaveBeenCalledTimes(1);
    });

    it('throws when the contact referenced by the transaction is gone', async () => {
      prisma.contact.findUnique.mockResolvedValue(null);

      await expect(service.remove(10, 1)).rejects.toThrow(
        'Contact not found for transaction 10',
      );
    });

    it('soft-deletes the mirrored transaction when one matches', async () => {
      prisma.transaction.findFirst
        .mockResolvedValueOnce(owned)
        .mockResolvedValueOnce({ id: 11 });
      prisma.contact.findUnique.mockResolvedValue({
        id: 5,
        user_id: 1,
        ref_user_id: 2,
      });
      prisma.contact.findFirst.mockResolvedValue({ id: 99 });

      await service.remove(10, 1);

      expect(prisma.transaction.update).toHaveBeenCalledTimes(2);
      expect(prisma.transaction.update.mock.calls[1][0]).toEqual({
        where: { id: 11 },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('does nothing when the transaction has no contact', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...owned,
        contact_id: null,
      });

      await expect(service.remove(10, 1)).resolves.toBeUndefined();
      expect(prisma.transaction.update).not.toHaveBeenCalled();
    });

    it('throws when the transaction is not owned by the user', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.remove(10, 1)).rejects.toThrow(
        'Transaction with ID 10 not found',
      );
    });
  });
});