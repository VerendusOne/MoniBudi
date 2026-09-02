-- Rename the shared amount-type enum (was savings-only, now used by
-- ExpenseItem too) — a plain rename, so existing SavingsItem rows are
-- untouched.
ALTER TYPE "SavingsAmountType" RENAME TO "AmountType";

-- Give expenses the same flat-amount-or-percent-of-gross choice savings
-- items already have. Existing expenses all keep their current amount as a
-- FLAT amount (their existing behavior) — amount is renamed to flatAmount
-- to match SavingsItem's column naming, and made nullable since a
-- percent-of-gross expense has no flat amount.
ALTER TABLE "ExpenseItem" ADD COLUMN "amountType" "AmountType" NOT NULL DEFAULT 'FLAT';
ALTER TABLE "ExpenseItem" ADD COLUMN "percent" DECIMAL(5,2);
ALTER TABLE "ExpenseItem" RENAME COLUMN "amount" TO "flatAmount";
ALTER TABLE "ExpenseItem" ALTER COLUMN "flatAmount" DROP NOT NULL;
