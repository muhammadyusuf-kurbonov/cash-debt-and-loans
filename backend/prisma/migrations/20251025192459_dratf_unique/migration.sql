/*
  Warnings:

  - A unique constraint covering the columns `[draftId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transaction_draftId_key" ON "Transaction"("draftId");
