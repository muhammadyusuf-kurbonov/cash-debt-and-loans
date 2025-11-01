/*
  Warnings:

  - Added the required column `updatedAt` to the `Balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Balance" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "user_id" DROP NOT NULL;
