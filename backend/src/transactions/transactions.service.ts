import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactsService } from 'src/contacts/contacts.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private contacts: ContactsService,
  ) {}

  async create(
    contactId: number,
    currencyId: number,
    amount: number,
    internal?: boolean,
  ) {
    // Get contact to check for ref_user_id
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    // Create the transaction and update balance in a transaction
    const transaction = await this.prisma.$transaction(async (prisma) => {
      // Create the main transaction
      const transaction = await prisma.transaction.create({
        data: {
          contact_id: contactId,
          currency_id: currencyId,
          amount,
        },
      });

      // Get or create balance for the main contact
      let balance = await prisma.balance.findUnique({
        where: {
          currency_id_contact_id: {
            currency_id: currencyId,
            contact_id: contactId,
          },
        },
      });

      if (!balance) {
        balance = await prisma.balance.create({
          data: {
            currency_id: currencyId,
            contact_id: contactId,
            amount: 0,
          },
        });
      }

      // Update balance for the main contact
      await prisma.balance.update({
        where: {
          currency_id_contact_id: {
            currency_id: currencyId,
            contact_id: contactId,
          },
        },
        data: {
          amount: {
            increment: amount,
          },
        },
      });

      return transaction;
    });

    // If contact has ref_user_id, create reverse transaction for referenced user
    if (contact.ref_user_id && !internal) {
      // Find or create a reverse contact for the referenced user
      const reverseContact = await this.contacts.getContactForUserId(
        contact.user_id,
        contact.ref_user_id,
      );

      await this.create(reverseContact.id, currencyId, -amount, true);
    }

    return transaction;
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

    // Soft delete transaction and update balance in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Get the contact to check for ref_user_id
      const contact = await prisma.contact.findUnique({
        where: { id: transaction.contact_id },
      });

      if (!contact) {
        throw new NotFoundException(`Contact not found for transaction ${id}`);
      }

      // Soft delete the main transaction
      const deletedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      // Update main balance
      await prisma.balance.update({
        where: {
          currency_id_contact_id: {
            currency_id: transaction.currency_id,
            contact_id: transaction.contact_id,
          },
        },
        data: {
          amount: {
            decrement: transaction.amount,
          },
        },
      });

      // If contact has ref_user_id, handle reverse transaction
      if (contact.ref_user_id) {
        // Find reverse contact
        const reverseContact = await prisma.contact.findFirst({
          where: {
            user_id: contact.ref_user_id,
            ref_user_id: contact.user_id,
          },
        });

        if (reverseContact) {
          // Find reverse transaction
          const reverseTransaction = await prisma.transaction.findFirst({
            where: {
              contact_id: reverseContact.id,
              currency_id: transaction.currency_id,
              amount: -transaction.amount,
              deletedAt: null,
            },
          });

          if (reverseTransaction) {
            // Soft delete reverse transaction
            await prisma.transaction.update({
              where: { id: reverseTransaction.id },
              data: {
                deletedAt: new Date(),
              },
            });

            // Update reverse balance
            await prisma.balance.update({
              where: {
                currency_id_contact_id: {
                  currency_id: transaction.currency_id,
                  contact_id: reverseContact.id,
                },
              },
              data: {
                amount: {
                  increment: -transaction.amount, // Add back the negative amount
                },
              },
            });
          }
        }
      }

      return deletedTransaction;
    });
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
}
