import { desc, eq, ne, relations, sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text, view, } from 'drizzle-orm/sqlite-core';

export const transactionsTable = sqliteTable('transactions', {
  id: integer().primaryKey({ autoIncrement: true }),
  amount: real().notNull(),
  currencyId: integer().references(() => currencyTable.id).notNull(),
  description: text(),
  contact: integer().references(() => contactTable.id),
  createdAt: integer({ mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp_ms' }).notNull().$onUpdateFn(() => new Date()),
  cancelled: integer({ mode: 'boolean' }).default(false).notNull(),
});

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  currency: one(currencyTable, { fields: [transactionsTable.currencyId], references: [currencyTable.id] }),
}));

export const currencyTable = sqliteTable('currency', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  symbol: text().notNull(),
  createdAt: integer({ mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp_ms' }).notNull().$onUpdateFn(() => new Date()),
});

export const contactTable = sqliteTable('contact', {
  id: integer().primaryKey({ autoIncrement: true }),
  fullName: text().notNull(),
  email: text(),
  phone: text(),
  createdAt: integer({ mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp_ms' }).notNull().$onUpdateFn(() => new Date()),
  deleted: integer({ mode: 'boolean' }).default(false).notNull(),
});

export const contactsWithBalanceView = view('contact_with_balance').as((qb) => qb.select({
  id: sql<number>`${contactTable.id}`.mapWith(Number).as('id'),
  contact: sql<number>`${transactionsTable.contact}`.mapWith(Number).as('contact'),
  currencyId: sql<number>`${transactionsTable.currencyId}`.mapWith(Number).as('currencyId'),
  fullName: contactTable.fullName,
  email: contactTable.email,
  phone: contactTable.phone,
  deleted: contactTable.deleted,
  createdAt: contactTable.createdAt,
  updatedAt: contactTable.updatedAt,
  currencyName: sql`${currencyTable.name}`.as('currencyName'),
  balance: sql<number>`sum(${transactionsTable.amount})`.mapWith(Number).as('balance'),
}).from(transactionsTable)
  .where(ne(transactionsTable.cancelled, true))
  .orderBy(desc(transactionsTable.updatedAt))
  .groupBy(transactionsTable.contact, transactionsTable.currencyId)
  .leftJoin(contactTable, eq(contactTable.id, transactionsTable.contact))
  .leftJoin(currencyTable, eq(currencyTable.id, transactionsTable.currencyId)));
