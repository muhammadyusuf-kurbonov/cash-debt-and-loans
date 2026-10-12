import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaService } from 'src/prisma/prisma.service';
import type { Contact, Transaction } from 'src/generated/prisma/client';

/**
 * A `mockDeep<PrismaService>` proxy: every delegate and every delegate method
 * resolves to a Vitest mock typed against Prisma's own signatures, so
 * `prisma.contact.findMany(...)` is checked against the real argument type and
 * `mockResolvedValue` demands a complete `Contact` row.
 *
 * Deep mocks are *permissive*: an unstubbed delegate resolves to `undefined`
 * instead of throwing. A mistyped delegate is caught by the compiler, not at
 * runtime.
 */
export type MockPrismaService = DeepMockProxy<PrismaService>;

/**
 * The partial-implementation type `mockDeep` accepts. Derived from the library's
 * own signature rather than imported from `ts-essentials`, which is only a
 * transitive dependency.
 */
type PrismaMockImpl = Parameters<typeof mockDeep<PrismaService>>[0];

export function createMockPrismaService(
  impl?: PrismaMockImpl,
): MockPrismaService {
  return mockDeep<PrismaService>(impl);
}

/**
 * A `mockResolvedValue` target must be a *complete* model row, so these fill in
 * every field rather than leaving the test to cast. Types come from the
 * generated client, so a schema change breaks the builders instead of silently
 * making a fixture wrong.
 */

const EPOCH = new Date('2026-01-01T00:00:00.000Z');

export function buildContact(over: Partial<Contact> = {}): Contact {
  return { id: 1, name: null, user_id: 1, ref_user_id: null, ...over };
}

export function buildTransaction(over: Partial<Transaction> = {}): Transaction {
  return {
    id: 1,
    contact_id: null,
    currency_id: 1,
    user_id: 1,
    amount: 0,
    note: null,
    draftId: null,
    createdAt: EPOCH,
    updatedAt: EPOCH,
    deletedAt: null,
    ...over,
  };
}
