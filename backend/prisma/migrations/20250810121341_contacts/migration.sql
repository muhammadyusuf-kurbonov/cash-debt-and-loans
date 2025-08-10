/*
  Warnings:

  - The primary key for the `Balance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `Balance` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `contact_id` to the `Balance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Contact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "name" TEXT,
    "ref_user_id" INTEGER,
    CONSTRAINT "Contact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contact_ref_user_id_fkey" FOREIGN KEY ("ref_user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Balance" (
    "currency_id" INTEGER NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "contact_id" INTEGER NOT NULL,

    PRIMARY KEY ("currency_id", "contact_id"),
    CONSTRAINT "Balance_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "Currency" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Balance_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Balance" ("amount", "currency_id") SELECT "amount", "currency_id" FROM "Balance";
DROP TABLE "Balance";
ALTER TABLE "new_Balance" RENAME TO "Balance";
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contact_id" INTEGER NOT NULL,
    "currency_id" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "Transaction_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "Currency" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "currency_id", "id") SELECT "amount", "currency_id", "id" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
