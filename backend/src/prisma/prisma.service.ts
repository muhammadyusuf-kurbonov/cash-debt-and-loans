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
        // Do not set `ssl` here. In node-pg a truthy `ssl` means TLS is
        // *required*, and there is no fallback to plaintext — so hardcoding
        // `{ rejectUnauthorized: false }` broke every query against a server
        // with `ssl = off` (e.g. the `postgres:16` service) with
        // "The server does not support SSL connections".
        //
        // Left unset, `pg` derives TLS from `sslmode` in the connection string:
        // absent or `sslmode=disable` -> plaintext, `sslmode=require` ->
        // verified TLS, `sslmode=no-verify` -> TLS without cert checks. That
        // covers plain and TLS-only hosts without hardcoding either.
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
