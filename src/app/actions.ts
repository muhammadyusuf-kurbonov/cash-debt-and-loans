'use server'
import { db } from '@/db/db';
import { contactsWithBalanceView, contactTable, currencyTable, transactionsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getContacts() {
  return await db.select().from(contactsWithBalanceView).execute();
}

export async function getContact(contactId: number) {
  return (await db.select().from(contactTable).where(eq(contactTable.id, contactId)).execute())[0];
}

export async function addNewContact(newContact: typeof contactTable.$inferInsert & { balance: number }) {
  const contactInsertResult = await db.insert(contactTable).values(newContact).execute();
  const contactNew = await db.select().from(contactTable).where(eq(contactTable.id, parseInt((contactInsertResult.lastInsertRowid as bigint).toString()))).execute();

  await db.insert(transactionsTable).values({
    amount: newContact.balance,
    currencyId: 1,
    contact: contactNew[0].id,
    description: 'Initial balance',
  });

  return contactNew[0];
}

export async function getTransactions(contactId: number) {
  const transactionsResult = await db.query.transactionsTable.findMany({
    where: eq(transactionsTable.contact, contactId),
    with: {
      currency: true,
    },
  }).execute();
  return JSON.parse(JSON.stringify(transactionsResult));
}
export async function addTransaction(contactId: number, transaction: typeof transactionsTable.$inferInsert) {
  const transactionsResult = await db.insert(transactionsTable).values({
    ...transaction,
    contact: contactId
  }).execute();
    
  return JSON.parse(JSON.stringify(transactionsResult));
}
export async function cancelTransaction(transactionId: number) {
  await db.update(transactionsTable).set({cancelled: true}).where(eq(transactionsTable.id, transactionId)).execute();
}

export async function getCurrencies(): Promise<typeof currencyTable.$inferSelect[]> {
  const currencies = await db.select().from(currencyTable).where(eq(currencyTable.enabled, true));
  return JSON.parse(JSON.stringify(currencies));
}

export async function addCurrency(name: string, symbol: string) {
  await db.insert(currencyTable).values({ name, symbol }).execute();
}

export async function updateCurrency(id: number, name: string, symbol: string) {
  await db.update(currencyTable).set({name, symbol}).where(eq(currencyTable.id, id));
}

export async function disableCurrency(id: number) {
  await db.update(currencyTable).set({enabled: false}).where(eq(currencyTable.id, id));
}
