/**
 * Tests for balance recalculation logic in TransactionsService.
 *
 * Since TransactionsService uses 'src/' path aliases that Jest doesn't
 * resolve by default, we test the recalculation logic by calling the
 * service method after properly mocking dependencies.
 */
import { Test, TestingModule } from '@nestjs/testing';

// Mock the absolute-path import before importing the service
jest.mock('src/contacts/contacts.service', () => ({
  ContactsService: class MockContactsService {},
}), { virtual: true });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TransactionsService } = require('./transactions.service');

describe('TransactionsService', () => {
  let service: InstanceType<typeof TransactionsService>;
  let mockGroupBy: jest.Mock;
  let mockBalanceFindMany: jest.Mock;
  let mockUpsert: jest.Mock;
  let mockUpdate: jest.Mock;

  beforeEach(async () => {
    mockGroupBy = jest.fn();
    mockBalanceFindMany = jest.fn();
    mockUpsert = jest.fn();
    mockUpdate = jest.fn();

    const prismaInTransaction = {
      transaction: { groupBy: mockGroupBy },
      balance: {
        findMany: mockBalanceFindMany,
        upsert: mockUpsert,
        update: mockUpdate,
      },
    };

    const mockPrisma = {
      $transaction: jest.fn(async (cb: any) => cb(prismaInTransaction)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: 'PrismaService', useValue: mockPrisma },
        { provide: 'ContactsService', useValue: {} },
      ],
    }).compile();

    service = module.get(TransactionsService);
  });

  describe('recalculateBalancesForContact', () => {
    it('should only consider non-deleted transactions (deletedAt: null)', async () => {
      mockGroupBy.mockResolvedValue([
        { currency_id: 1, _sum: { amount: 150 } },
      ]);
      mockBalanceFindMany.mockResolvedValue([]);
      mockUpsert.mockResolvedValue({});

      await service.recalculateBalancesForContact(10);

      expect(mockGroupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        }),
      );
    });

    it('should upsert balance with correct summed amounts per currency', async () => {
      mockGroupBy.mockResolvedValue([
        { currency_id: 1, _sum: { amount: 200 } },
        { currency_id: 2, _sum: { amount: -50 } },
      ]);
      mockBalanceFindMany.mockResolvedValue([]);

      await service.recalculateBalancesForContact(10);

      expect(mockUpsert).toHaveBeenCalledTimes(2);
      expect(mockUpsert).toHaveBeenCalledWith({
        where: { currency_id_contact_id: { currency_id: 1, contact_id: 10 } },
        create: { currency_id: 1, contact_id: 10, amount: 200 },
        update: { amount: 200 },
      });
      expect(mockUpsert).toHaveBeenCalledWith({
        where: { currency_id_contact_id: { currency_id: 2, contact_id: 10 } },
        create: { currency_id: 2, contact_id: 10, amount: -50 },
        update: { amount: -50 },
      });
    });

    it('should zero out balances for currencies with no remaining transactions', async () => {
      mockGroupBy.mockResolvedValue([]);
      mockBalanceFindMany.mockResolvedValue([
        { currency_id: 3, contact_id: 10, amount: 100 },
      ]);

      await service.recalculateBalancesForContact(10);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { currency_id_contact_id: { currency_id: 3, contact_id: 10 } },
        data: { amount: 0 },
      });
    });

    it('should not zero out currencies that still have transactions', async () => {
      mockGroupBy.mockResolvedValue([
        { currency_id: 1, _sum: { amount: 100 } },
      ]);
      mockBalanceFindMany.mockResolvedValue([
        { currency_id: 1, contact_id: 10, amount: 80 },
      ]);

      await service.recalculateBalancesForContact(10);

      expect(mockUpsert).toHaveBeenCalledTimes(1);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
