import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserByTGId(telegram_id: number): Promise<User> {
    let user = await this.prisma.user.findFirst({
      where: { telegram_id: telegram_id.toString() },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegram_id: telegram_id.toString(),
        },
      });
    }

    return user;
  }

  async getNetBalanceOfUser(userId: number) {
    const balances = await this.prisma.balance.groupBy({
      by: ['currency_id'],
      _sum: {
        amount: true,
      },
      where: {
        contact: {
          user_id: userId,
        },
      },
    });

    return balances;
  }
}
