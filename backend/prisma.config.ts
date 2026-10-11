import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7 removed `url` from the schema datasource; it lives here instead.
// A default is supplied deliberately: `env()` throws while the config loads, which
// would break `prisma generate` in Docker/CI where no DATABASE_URL is present —
// and generate never touches the database. PrismaPg validates the real value at
// runtime, and PrismaService throws a clear error when it is absent.
process.env.DATABASE_URL ??= 'postgresql://localhost:5432/postgres';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
