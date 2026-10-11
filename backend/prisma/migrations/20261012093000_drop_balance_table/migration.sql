-- DropIndex / DropTable: the Balance table is fully reconstructible from
-- Transaction as SUM(amount) GROUP BY (contact_id, currency_id) over rows
-- with deletedAt IS NULL AND contact_id IS NOT NULL, so no data is lost that
-- cannot be recomputed.

DROP TABLE "Balance";

-- CreateIndex: the balance aggregates replaced the table's point lookups.
CREATE INDEX "Transaction_user_id_contact_id_currency_id_idx" ON "Transaction"("user_id", "contact_id", "currency_id");

-- CreateIndex
CREATE INDEX "Transaction_contact_id_currency_id_idx" ON "Transaction"("contact_id", "currency_id");