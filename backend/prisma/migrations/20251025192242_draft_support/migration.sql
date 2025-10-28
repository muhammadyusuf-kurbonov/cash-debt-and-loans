/*
  Warnings:

  - Added the required column `user_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" 
    ADD COLUMN "draftId" TEXT,
    ADD COLUMN "user_id" INTEGER;

-- 2. Data Update: Set the default 'user_id' (1) for all existing transactions.
UPDATE "Transaction" 
    SET "user_id" = 1 
    WHERE "user_id" IS NULL;

-- 3. AlterTable: Make 'contact_id' nullable (as per original request).
ALTER TABLE "Transaction" 
    ALTER COLUMN "contact_id" DROP NOT NULL;

-- 4. Enforce NOT NULL: Now that all existing rows have a value, make the column NOT NULL.
ALTER TABLE "Transaction" 
    ALTER COLUMN "user_id" SET NOT NULL;

-- 5. AddForeignKey: Establish the foreign key constraint.
ALTER TABLE "Transaction" 
    ADD CONSTRAINT "Transaction_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "User"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
