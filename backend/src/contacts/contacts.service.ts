import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

/**
 * A balance is not stored data — it is the sum of a contact's live
 * transactions per currency. `contact_id IS NOT NULL` is what excludes
 * drafts: `createDraft` writes `contact_id: null`, `finalizeDraft` sets it.
 */
export type ContactBalance = {
  currency_id: number;
  contact_id: number;
  amount: number;
  updatedAt: Date;
  currency: {
    id: number;
    name: string;
    symbol: string;
  };
};

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, name: string, refUserId: number | null) {
    return this.prisma.contact.create({
      data: {
        user_id: userId,
        name,
        ref_user_id: refUserId,
      },
    });
  }

  /**
   * Attaches each contact's computed balances, preserving the `Balance`
   * property shape the API contract publishes. Contacts with no live
   * transactions get `[]`, never undefined — the Mini App reads `.length`
   * unguarded.
   */
  private async attachBalances<T extends { id: number }>(
    contacts: T[],
    userId: number,
  ): Promise<Array<T & { Balance: ContactBalance[] }>> {
    if (contacts.length === 0) {
      return [];
    }

    // One query: the grouped sum, the newest live transaction, and the
    // joined currency all come back together. `Prisma.sql` keeps userId a
    // bound parameter.
    const rows = await this.prisma.$queryRaw<
      Array<{
        contact_id: number | null;
        currency_id: number;
        amount: number | null;
        updatedAt: Date;
        currency_name: string;
        currency_symbol: string;
      }>
    >(Prisma.sql`
      SELECT t."contact_id",
             t."currency_id",
             SUM(t."amount")::float8 AS "amount",
             MAX(t."updatedAt")    AS "updatedAt",
             c."name"              AS "currency_name",
             c."symbol"            AS "currency_symbol"
        FROM "Transaction" t
        JOIN "Currency" c ON c."id" = t."currency_id"
       WHERE t."user_id" = ${userId}
         AND t."contact_id" IS NOT NULL
         AND t."deletedAt" IS NULL
       GROUP BY t."contact_id", t."currency_id", c."name", c."symbol"
       ORDER BY t."contact_id", t."currency_id"
    `);

    const byContact = new Map<number, ContactBalance[]>();
    for (const row of rows) {
      if (row.contact_id === null) continue;

      const list = byContact.get(row.contact_id) ?? [];
      list.push({
        currency_id: row.currency_id,
        contact_id: row.contact_id,
        amount: row.amount ?? 0,
        updatedAt: row.updatedAt,
        currency: {
          id: row.currency_id,
          name: row.currency_name,
          symbol: row.currency_symbol,
        },
      });
      byContact.set(row.contact_id, list);
    }

    // The SQL orders by currency_id, but rows for one contact are not
    // guaranteed contiguous — sort so responses do not churn between reads.
    for (const list of byContact.values()) {
      list.sort((a, b) => a.currency_id - b.currency_id);
    }

    return contacts.map((contact) => ({
      ...contact,
      Balance: byContact.get(contact.id) ?? [],
    }));
  }

  async findAll(userId: number) {
    const contacts = await this.prisma.contact.findMany({
      where: {
        user_id: userId,
      },
    });

    return this.attachBalances(contacts, userId);
  }

  async findOne(id: number, userId: number) {
    const contact = await this.prisma.contact.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    const [withBalance] = await this.attachBalances([contact], userId);
    return withBalance;
  }

  async update(
    id: number,
    userId: number,
    name: string,
    refUserId: number | null,
  ) {
    await this.findOne(id, userId); // Ensure contact exists and belongs to user

    return this.prisma.contact.update({
      where: {
        id,
        user_id: userId,
      },
      data: {
        name,
        ref_user_id: refUserId,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId); // Ensure contact exists and belongs to user

    return this.prisma.contact.delete({
      where: {
        id,
        user_id: userId,
      },
    });
  }

  async getContactForUserId(userId: number, ownerId: number, name?: string) {
    let contact = await this.prisma.contact.findFirst({
      where: {
        ref_user_id: userId,
        user_id: ownerId,
      },
    });

    if (!contact) {
      contact = await this.prisma.contact.create({
        data: {
          user_id: ownerId,
          ref_user_id: userId,
          name,
        },
      });
    }

    if (!contact.name && name) {
      contact = await this.prisma.contact.update({
        where: {
          id: contact.id,
        },
        data: {
          name,
        },
      });
    }

    if (!contact.name && contact.ref_user_id) {
      const user = await this.prisma.user.findFirst({
        where: {
          telegram_id: contact.ref_user_id.toString(),
        },
      });

      if (user?.name) {
        contact = await this.prisma.contact.update({
          where: {
            id: contact.id,
          },
          data: {
            name: user.name,
          },
        });
      }
    }

    return contact;
  }

  async getContactByName(ownerId: number, name?: string) {
    const contact = await this.prisma.contact.findFirst({
      where: {
        user_id: ownerId,
        name: { contains: name },
      },
    });

    return contact;
  }

  async getRecentContacts(userId: number, limit: number, offset: number) {
    const transactions = await this.prisma.transaction.findMany({
      distinct: ['contact_id'],
      take: limit,
      where: {
        contact: {
          user_id: userId,
        },
      },
      skip: offset,
      include: {
        contact: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return this.attachBalances(
      transactions
        .map((item) => item.contact)
        .filter(
          (contact): contact is NonNullable<typeof contact> => contact !== null,
        ),
      userId,
    );
  }
}
