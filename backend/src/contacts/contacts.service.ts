import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, name?: string, refUserId?: number) {
    return this.prisma.contact.create({
      data: {
        user_id: userId,
        name,
        ref_user_id: refUserId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.contact.findMany({
      where: {
        user_id: userId,
      },
      include: {
        Balance: {
          include: {
            currency: true,
          },
        },
      },
    });
  }

  async findOne(id: number, userId: number) {
    const contact = await this.prisma.contact.findFirst({
      where: {
        id,
        user_id: userId,
      },
      include: {
        Balance: {
          include: {
            currency: true,
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  async update(id: number, userId: number, name?: string, refUserId?: number) {
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

  async getBalance(contactId: number, userId: number, currencyId?: number) {
    // First verify the contact belongs to the user
    const contact = await this.prisma.contact.findFirst({
      where: {
        id: contactId,
        user_id: userId,
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    // Get balances
    const balances = await this.prisma.balance.findMany({
      where: {
        contact_id: contactId,
        ...(currencyId ? { currency_id: currencyId } : {}),
      },
      include: {
        currency: true,
      },
    });

    return balances;
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

    return contact;
  }

  async getRecentContacts(userId: number, limit: number, offset: number) {
    return await this.prisma.transaction
      .findMany({
        distinct: ['contact_id'],
        take: limit,
        where: {
          contact: {
            user_id: userId,
          },
        },
        skip: offset,
        include: {
          contact: {
            include: {
              Balance: {
                include: {
                  currency: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
      .then((transactions) => transactions.map((item) => item.contact));
  }
}
