import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type SummaryEntry = {
  currencyId: number;
  currencySymbol: string;
  owedToMe: number;
  iOwe: number;
};

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(
    userId: number,
    from?: string,
    to?: string,
    currencyId?: number,
  ) {
    if (from || to) {
      return this.getSummaryFromTransactions(userId, from, to, currencyId);
    }

    const currencyFilter = currencyId
      ? Prisma.sql`AND t."currency_id" = ${currencyId}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      Array<{
        contact_id: number | null;
        currency_id: number;
        amount: number | null;
        currency_name: string;
        currency_symbol: string;
      }>
    >(Prisma.sql`
      SELECT t."contact_id",
             t."currency_id",
             SUM(t."amount")::float8    AS "amount",
             c."name"                   AS "currency_name",
             c."symbol"                 AS "currency_symbol"
        FROM "Transaction" t
        JOIN "Currency" c ON c."id" = t."currency_id"
       WHERE t."user_id" = ${userId}
         AND t."contact_id" IS NOT NULL
         AND t."deletedAt" IS NULL
       ${currencyFilter}
       GROUP BY t."contact_id", t."currency_id", c."name", c."symbol"
       ORDER BY t."currency_id", t."contact_id"
    `);

    const summaryMap = new Map<number, SummaryEntry>();

    // Fold per CONTACT, never per currency: a contact's net is classified
    // before it is added to its currency's totals. Summing first would turn
    // (+100, -30) into a single +70 and report owedToMe: 70 instead of 100.
    for (const row of rows) {
      if (row.contact_id === null) continue;

      const amount = row.amount ?? 0;
      let entry = summaryMap.get(row.currency_id);
      if (!entry) {
        entry = {
          currencyId: row.currency_id,
          currencySymbol: row.currency_symbol,
          owedToMe: 0,
          iOwe: 0,
        };
        summaryMap.set(row.currency_id, entry);
      }

      if (amount > 0) entry.owedToMe += amount;
      else entry.iOwe += Math.abs(amount);
    }

    return Array.from(summaryMap.values()).map((s) => ({
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
      include: { currency: true },
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

    return Array.from(summaryMap.values()).map((s) => ({
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
