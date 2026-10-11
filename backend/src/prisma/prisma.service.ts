import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    super({
      adapter: new PrismaPg({
        connectionString,
        // Prisma 7 uses node-pg and rejects invalid SSL certificates by default;
        // v6 ignored them. This keeps the previous behaviour. To tighten later,
        // remove this option and supply NODE_EXTRA_CA_CERTS instead.
        ssl: { rejectUnauthorized: false },
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
