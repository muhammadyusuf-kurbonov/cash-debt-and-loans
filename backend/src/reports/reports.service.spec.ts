import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: { balance: { findMany: jest.Mock }; transaction: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      balance: { findMany: jest.fn() },
      transaction: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  describe('getSummary', () => {
    it('should sum positive balances as owedToMe and negative as iOwe', async () => {
      prisma.balance.findMany.mockResolvedValue([
        { amount: 100 },
        { amount: 50 },
        { amount: -30 },
        { amount: -20 },
      ]);

      const result = await service.getSummary(1);

      expect(result).toEqual({
        owedToMe: 150,
        iOwe: 50,
        netBalance: 100,
      });
    });

    it('should return zeros when no balances exist', async () => {
      prisma.balance.findMany.mockResolvedValue([]);

      const result = await service.getSummary(1);

      expect(result).toEqual({ owedToMe: 0, iOwe: 0, netBalance: 0 });
    });

    it('should handle only negative balances', async () => {
      prisma.balance.findMany.mockResolvedValue([
        { amount: -100 },
        { amount: -50 },
      ]);

      const result = await service.getSummary(1);

      expect(result).toEqual({ owedToMe: 0, iOwe: 150, netBalance: -150 });
    });

    it('should ignore zero balances (neither owed nor owing)', async () => {
      prisma.balance.findMany.mockResolvedValue([
        { amount: 0 },
        { amount: 100 },
      ]);

      const result = await service.getSummary(1);

      expect(result).toEqual({ owedToMe: 100, iOwe: 0, netBalance: 100 });
    });

    it('should use transactions when date range is provided', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        { amount: 200 },
        { amount: -80 },
      ]);

      const result = await service.getSummary(1, '2024-01-01', '2024-12-31');

      expect(result).toEqual({ owedToMe: 200, iOwe: 80, netBalance: 120 });
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 1,
          deletedAt: null,
          createdAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
      });
    });
  });

  describe('getCurrencyBreakdown', () => {
    it('should group balances by currency', async () => {
      prisma.balance.findMany.mockResolvedValue([
        { currency_id: 1, amount: 100, currency: { symbol: 'USD' } },
        { currency_id: 1, amount: -30, currency: { symbol: 'USD' } },
        { currency_id: 2, amount: 50, currency: { symbol: 'EUR' } },
      ]);

      const result = await service.getCurrencyBreakdown(1);

      expect(result).toEqual([
        { currencyId: 1, symbol: 'USD', owed: 100, iOwe: 30, net: 70 },
        { currencyId: 2, symbol: 'EUR', owed: 50, iOwe: 0, net: 50 },
      ]);
    });
  });

  describe('getTopDebtors', () => {
    it('should return contacts with positive balances sorted desc', async () => {
      prisma.balance.findMany.mockResolvedValue([
        { contact_id: 1, amount: 200, contact: { name: 'Alice' }, currency: { symbol: 'USD' } },
        { contact_id: 2, amount: 100, contact: { name: 'Bob' }, currency: { symbol: 'USD' } },
      ]);

      const result = await service.getTopDebtors(1);

      expect(result).toEqual([
        { contactId: 1, contactName: 'Alice', amount: 200, currencySymbol: 'USD' },
        { contactId: 2, contactName: 'Bob', amount: 100, currencySymbol: 'USD' },
      ]);
    });
  });

  describe('getTopCreditors', () => {
    it('should return absolute amounts for negative balances', async () => {
      prisma.balance.findMany.mockResolvedValue([
        { contact_id: 1, amount: -150, contact: { name: 'Charlie' }, currency: { symbol: 'USD' } },
      ]);

      const result = await service.getTopCreditors(1);

      expect(result).toEqual([
        { contactId: 1, contactName: 'Charlie', amount: 150, currencySymbol: 'USD' },
      ]);
    });
  });
});
