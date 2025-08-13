/*
  Warnings:

  - You are about to drop the column `user_id` on the `Currency` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Currency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Currency" ("createdAt", "id", "name", "symbol") SELECT "createdAt", "id", "name", "symbol" FROM "Currency";
DROP TABLE "Currency";
ALTER TABLE "new_Currency" RENAME TO "Currency";
CREATE UNIQUE INDEX "Currency_name_key" ON "Currency"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
