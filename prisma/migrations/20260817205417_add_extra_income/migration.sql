-- CreateTable
CREATE TABLE "ExtraIncomeItem" (
    "id" TEXT NOT NULL,
    "payAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtraIncomeItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExtraIncomeItem_payAccountId_date_idx" ON "ExtraIncomeItem"("payAccountId", "date");

-- AddForeignKey
ALTER TABLE "ExtraIncomeItem" ADD CONSTRAINT "ExtraIncomeItem_payAccountId_fkey" FOREIGN KEY ("payAccountId") REFERENCES "PayAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
