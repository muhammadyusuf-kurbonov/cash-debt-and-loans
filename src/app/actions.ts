'use server'
import { db } from '@/db/db';
import { contactTable, transactionsTable } from '@/db/schema';
import { desc, eq, ne, sql } from 'drizzle-orm';

export async function getContacts() {
  return await db.select().from(contactTable).where(ne(contactTable.deleted, true)).orderBy(desc(contactTable.updatedAt)).execute();
}

export async function getContact(contactId: number) {
  return (await db.select().from(contactTable).where(eq(contactTable.id, contactId)).execute())[0];
}

export async function addNewContact(newContact: typeof contactTable.$inferInsert) {
  const contactInsertResult = await db.insert(contactTable).values(newContact).execute();
  const contactNew = await db.select().from(contactTable).where(eq(contactTable.id, parseInt((contactInsertResult.lastInsertRowid as bigint).toString()))).execute();
  if (newContact.balance){
    await db.insert(transactionsTable).values({
      amount: newContact.balance,
      currencyId: 1,
      contact: contactNew[0].id,
      description: 'Initial balance',
    });
  }
  return contactNew[0];
}

export async function getTransactions(contactId: number) {
  const transactionsResult = await db.select().from(transactionsTable).where(eq(transactionsTable.contact, contactId)).orderBy(desc(transactionsTable.updatedAt)).execute();
    
  return JSON.parse(JSON.stringify(transactionsResult));
}
export async function addTransaction(contactId: number, transaction: typeof transactionsTable.$inferInsert, ignoreBalance: boolean = false) {
  const transactionsResult = await db.insert(transactionsTable).values({
    ...transaction,
    contact: contactId
  }).execute();

  if (!ignoreBalance) {
    await db.update(contactTable)
      .set({ balance: sql`${contactTable.balance} + ${transaction.amount}` })
      .where(eq(contactTable.id, contactId))
      .execute();
  }
    
  return JSON.parse(JSON.stringify(transactionsResult));
}
