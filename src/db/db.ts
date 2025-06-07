import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export const db = drizzle({
  connection: 'file:./db.sqlite',
  schema: schema,
});

if ((await db.select().from(schema.currencyTable)).length === 0) {
  await db.insert(schema.currencyTable).values([
    { name: 'So\'m', symbol: 'UZS' },
  ]);
}
