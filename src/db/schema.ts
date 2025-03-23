import { integer, real, sqliteTable, text, } from 'drizzle-orm/sqlite-core';

export const transactionsTable = sqliteTable('transactions', {
  id: integer().primaryKey({ autoIncrement: true }),
  amount: real().notNull(),
  currencyId: integer().references(() => currencyTable.id),
  description: text(),
  contact: integer().references(() => contactTable.id),
  createdAt: integer({ mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp_ms' }).notNull().$onUpdateFn(() => new Date()),
  cancelled: integer({ mode: 'boolean' }).default(false).notNull(),
});

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
  balance: real().default(0).notNull(),
});
