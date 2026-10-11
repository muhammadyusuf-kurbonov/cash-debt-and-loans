import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactsService } from 'src/contacts/contacts.service';
import { PrismaService } from '../prisma/prisma.service';
import { Contact, Prisma } from 'src/generated/prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private contacts: ContactsService,
  ) {}

  async create(
    contactId: number | null,
    currencyId: number,
    amount: number,
    note: string | null,
    draftId: string | null = null,
    userId: number,
    internal?: boolean,
  ) {
    // Get contact to check for ref_user_id
    let contact: Contact | null = null;
    if (contactId) {
      contact = await this.prisma.contact.findUnique({
        where: { id: contactId },
      });
    }

    if (contactId && !contact) {
      console.error(`Contact with ID ${contactId} not found`);
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        contact_id: contactId || null,
        currency_id: currencyId,
        amount,
        note: note || null,
        draftId,
        user_id: userId,
      },
    });

    if (draftId) {
      return;
    }

    if (internal) {
      return;
    }

    // If contact has ref_user_id and it's not a draft, create reverse transaction for referenced user
    if (contact && contact.ref_user_id) {
      // Find or create a reverse contact for the referenced user
      const reverseContact = await this.contacts.getContactForUserId(
        contact.user_id,
        contact.ref_user_id,
      );

      await this.create(
        reverseContact.id,
        currencyId,
        -amount,
        note,
        null,
        contact.ref_user_id,
        true,
      );
    }

    return transaction;
  }

  async createDraft(
    draftId: string,
    currencyId: number,
    amount: number,
    user_id: number,
    note?: string,
  ) {
    return this.create(
      null,
      currencyId,
      amount,
      note ?? null,
      draftId,
      user_id,
      false,
    );
  }

  async getDraft(draftId: string) {
    return this.prisma.transaction.findUnique({
      where: {
        draftId,
      },
    });
  }

  async deleteDraft(draftId: string) {
    return await this.prisma.transaction.delete({
      where: {
        draftId,
      },
    });
  }

  async finalizeDraft(draftId: string, contactId: number) {
    // Get the draft transaction
    const draftTransaction = await this.prisma.transaction.findUnique({
      where: { draftId },
    });

    if (!draftTransaction) {
      throw new NotFoundException(
        `Draft transaction with for ${draftId} not found`,
      );
    }

    // Clear the draft marker and attach the contact in one update: the row is
    // the only write, so there is nothing to keep atomic with.
    const completedTransaction = await this.prisma.transaction.update({
      where: { draftId },
      data: {
        contact_id: contactId,
        draftId: null,
      },
      include: {
        currency: true,
      },
    });

    // Get the contact to check for ref_user_id and create reverse transaction
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (contact && contact.ref_user_id) {
      // Find or create a reverse contact for the referenced user
      const reverseContact = await this.contacts.getContactForUserId(
        contact.user_id,
        contact.ref_user_id,
      );

      await this.create(
        reverseContact.id,
        draftTransaction.currency_id,
        -draftTransaction.amount,
        draftTransaction.note,
        null,
        contact.ref_user_id,
        true,
      );
    }

    return completedTransaction;
  }

  async findAll(userId: number) {
    return this.prisma.transaction.findMany({
      where: {
        contact: {
          user_id: userId,
        },
        deletedAt: null,
      },
      include: {
        contact: true,
        currency: true,
      },
    });
  }

  async findOne(id: number, userId: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        contact: {
          user_id: userId,
        },
        deletedAt: null,
      },
      include: {
        contact: true,
        currency: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async remove(id: number, userId: number) {
    const transaction = await this.findOne(id, userId);

    const contact_id = transaction.contact_id;
    if (contact_id === null) {
      return;
    }

    // Get the contact to check for ref_user_id
    const contact = await this.prisma.contact.findUnique({
      where: { id: contact_id },
    });

    if (!contact) {
      throw new NotFoundException(`Contact not found for transaction ${id}`);
    }

    // Soft delete the main transaction
    const deletedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // If contact has ref_user_id, handle reverse transaction
    if (contact.ref_user_id) {
      // Find reverse contact
      const reverseContact = await this.prisma.contact.findFirst({
        where: {
          user_id: contact.ref_user_id,
          ref_user_id: contact.user_id,
        },
      });

      if (reverseContact) {
        // Find reverse transaction
        const reverseTransaction = await this.prisma.transaction.findFirst({
          where: {
            contact_id: reverseContact.id,
            currency_id: transaction.currency_id,
            amount: -transaction.amount,
            deletedAt: null,
          },
        });

        if (reverseTransaction) {
          // Soft delete reverse transaction
          await this.prisma.transaction.update({
            where: { id: reverseTransaction.id },
            data: {
              deletedAt: new Date(),
            },
          });
        }
      }
    }

    return deletedTransaction;
  }

  /**
   * Per-currency NET across all a user's contacts. Grouped by currency only —
   * a negative and a positive in the same currency cancel, which is the point:
   * this is what the user is owed overall, not per contact. Compare
   * `ReportsService.getSummary`, which classifies each contact's net before
   * folding into currency totals.
   */
  async getNetBalanceOfUser(userId: number) {
    const rows = await this.prisma.$queryRaw<
      Array<{ currency_id: number; amount: number | null }>
    >(Prisma.sql`
      SELECT t."currency_id",
             SUM(t."amount")::float8 AS "amount"
        FROM "Transaction" t
       WHERE t."user_id" = ${userId}
         AND t."contact_id" IS NOT NULL
         AND t."deletedAt" IS NULL
       GROUP BY t."currency_id"
       ORDER BY t."currency_id"
    `);

    return rows.map((row) => ({
      currency_id: row.currency_id,
      amount: row.amount ?? 0,
    }));
  }

  async getRecentOperations(
    contactId: number,
    userId: number,
    limit: number,
    offset?: number,
  ) {
    return await this.prisma.transaction.findMany({
      take: limit,
      where: {
        contact: {
          user_id: userId,
          id: contactId,
        },
        deletedAt: null,
      },
      skip: offset,
      include: {
        currency: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getAllTransactionsOfContact(
    contact_id: number,
    currency_id?: number,
    includeDeleted = false,
  ) {
    const whereClause: Prisma.TransactionFindManyArgs['where'] = {
      contact_id,
      ...(currency_id ? { currency_id } : {}),
    };

    if (!includeDeleted) {
      whereClause.deletedAt = null;
    }

    return await this.prisma.transaction.findMany({
      where: whereClause,
      include: {
        currency: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async update(id: number, userId: number, data: { note?: string | null }) {
    // First verify that the transaction belongs to the user
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        contact: {
          user_id: userId,
        },
        deletedAt: null,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    // Update the transaction with the provided data
    return this.prisma.transaction.update({
      where: { id },
      data: {
        note: data.note,
        updatedAt: new Date(),
      },
    });
  }
}
