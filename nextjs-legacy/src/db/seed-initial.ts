import { db } from './db';
import { currencyTable } from './schema';

await db.insert(currencyTable).values([
  { name: 'So\'m', symbol: 'UZS' },
]);
