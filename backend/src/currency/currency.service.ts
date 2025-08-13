import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}

  create(name: string, symbol: string) {
    return this.prisma.currency.create({
      data: {
        name,
        symbol,
      },
    });
  }

  findAll() {
    return this.prisma.currency.findMany();
  }

  findOne(id: number) {
    return this.prisma.currency.findFirst({
      where: {
        id,
      },
    });
  }

  update(id: number, name?: string, symbol?: string) {
    return this.prisma.currency.update({
      where: {
        id,
      },
      data: {
        name,
        symbol,
      },
    });
  }

  remove(id: number) {
    return this.prisma.currency.delete({
      where: {
        id,
      },
    });
  }
}
