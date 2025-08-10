import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, name: string, symbol: string) {
    return this.prisma.currency.create({
      data: {
        user_id: userId,
        name,
        symbol,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.currency.findMany({
      where: {
        user_id: userId,
      },
    });
  }

  findOne(id: number, userId: number) {
    return this.prisma.currency.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });
  }

  update(id: number, userId: number, name?: string, symbol?: string) {
    return this.prisma.currency.update({
      where: {
        id,
        user_id: userId,
      },
      data: {
        name,
        symbol,
      },
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.currency.delete({
      where: {
        id,
        user_id: userId,
      },
    });
  }
}
