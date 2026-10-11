/*
  Warnings:

  - A unique constraint covering the columns `[user_id,ref_user_id]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Balance" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Contact_user_id_ref_user_id_key" ON "Contact"("user_id", "ref_user_id");
