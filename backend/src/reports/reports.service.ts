import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: number, from?: string, to?: string, currencyId?: number) {
    if (from || to) {
      return this.getSummaryFromTransactions(userId, from, to, currencyId);
    }

    const where: any = { contact: { user_id: userId } };
    if (currencyId) {
      where.currency_id = currencyId;
    }

    const balances = await this.prisma.balance.findMany({
      where,
      include: { currency: true },
    });

    const summaryMap = new Map<number, any>();

    for (const b of balances) {
      if (!summaryMap.has(b.currency_id)) {
        summaryMap.set(b.currency_id, {
          currencyId: b.currency_id,
          currencySymbol: b.currency.symbol,
          owedToMe: 0,
          iOwe: 0,
        });
      }
      const s = summaryMap.get(b.currency_id)!;
      if (b.amount > 0) s.owedToMe += b.amount;
      else s.iOwe += Math.abs(b.amount);
    }

    return Array.from(summaryMap.values()).map(s => ({
      ...s,
      netBalance: s.owedToMe - s.iOwe,
    }));
  }

  private async getSummaryFromTransactions(
    userId: number,
    from?: string,
    to?: string,
    currencyId?: number,
  ) {
    const where: any = {
      user_id: userId,
      deletedAt: null,
    };
    if (currencyId) {
      where.currency_id = currencyId;
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const transactions = await this.prisma.transaction.findMany({ 
      where,
      include: { currency: true }
    });

    const summaryMap = new Map<number, any>();

    for (const t of transactions) {
      if (!summaryMap.has(t.currency_id)) {
        summaryMap.set(t.currency_id, {
          currencyId: t.currency_id,
          currencySymbol: t.currency.symbol,
          owedToMe: 0,
          iOwe: 0,
        });
      }
      const s = summaryMap.get(t.currency_id)!;
      if (t.amount > 0) s.owedToMe += t.amount;
      else s.iOwe += Math.abs(t.amount);
    }

    return Array.from(summaryMap.values()).map(s => ({
      ...s,
      netBalance: s.owedToMe - s.iOwe,
    }));
  }

  async getTransactions(
    userId: number,
    from?: string,
    to?: string,
    currencyId?: number,
  ) {
    const where: any = {
      user_id: userId,
      deletedAt: null,
    };
    if (currencyId) {
      where.currency_id = currencyId;
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        contact: true,
        currency: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrends(
    userId: number,
    period: string = 'month',
    from?: string,
    to?: string,
    currencyId?: number,
  ) {
    const where: any = {
      user_id: userId,
      deletedAt: null,
    };
    if (currencyId) {
      where.currency_id = currencyId;
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    const buckets = new Map<
      string,
      { receivables: number; payables: number }
    >();

    for (const t of transactions) {
      const key = this.formatDateBucket(t.createdAt, period);
      if (!buckets.has(key)) buckets.set(key, { receivables: 0, payables: 0 });
      const bucket = buckets.get(key)!;
      if (t.amount > 0) bucket.receivables += t.amount;
      else bucket.payables += Math.abs(t.amount);
    }

    return Array.from(buckets.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async getTopDebtors(userId: number, limit: number = 5) {
    const balances = await this.prisma.balance.findMany({
      where: {
        contact: { user_id: userId },
        amount: { gt: 0 },
      },
      include: {
        contact: true,
        currency: true,
      },
      orderBy: { amount: 'desc' },
      take: limit,
    });

    return balances.map((b) => ({
      contactId: b.contact_id,
      contactName: b.contact.name ?? '',
      amount: b.amount,
      currencySymbol: b.currency.symbol,
    }));
  }

  async getTopCreditors(userId: number, limit: number = 5) {
    const balances = await this.prisma.balance.findMany({
      where: {
        contact: { user_id: userId },
        amount: { lt: 0 },
      },
      include: {
        contact: true,
        currency: true,
      },
      orderBy: { amount: 'asc' },
      take: limit,
    });

    return balances.map((b) => ({
      contactId: b.contact_id,
      contactName: b.contact.name ?? '',
      amount: Math.abs(b.amount),
      currencySymbol: b.currency.symbol,
    }));
  }

  async getCurrencyBreakdown(userId: number) {
    const balances = await this.prisma.balance.findMany({
      where: { contact: { user_id: userId } },
      include: { currency: true },
    });

    const map = new Map<
      number,
      { symbol: string; owed: number; iOwe: number }
    >();

    for (const b of balances) {
      if (!map.has(b.currency_id)) {
        map.set(b.currency_id, {
          symbol: b.currency.symbol,
          owed: 0,
          iOwe: 0,
        });
      }
      const entry = map.get(b.currency_id)!;
      if (b.amount > 0) entry.owed += b.amount;
      else entry.iOwe += Math.abs(b.amount);
    }

    return Array.from(map.entries()).map(([currencyId, data]) => ({
      currencyId,
      ...data,
      net: data.owed - data.iOwe,
    }));
  }

  private formatDateBucket(date: Date, period: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    switch (period) {
      case 'day':
        return `${year}-${month}-${day}`;
      case 'week': {
        const jan1 = new Date(year, 0, 1);
        const week = Math.ceil(
          ((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7,
        );
        return `${year}-W${String(week).padStart(2, '0')}`;
      }
      case 'year':
        return `${year}`;
      default:
        return `${year}-${month}`;
    }
  }
}
