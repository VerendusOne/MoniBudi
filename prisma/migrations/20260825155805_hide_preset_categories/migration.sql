-- CreateTable
CREATE TABLE "HiddenExpenseCategory" (
    "id" TEXT NOT NULL,
    "payAccountId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "HiddenExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HiddenExpenseCategory_payAccountId_categoryId_key" ON "HiddenExpenseCategory"("payAccountId", "categoryId");

-- AddForeignKey
ALTER TABLE "HiddenExpenseCategory" ADD CONSTRAINT "HiddenExpenseCategory_payAccountId_fkey" FOREIGN KEY ("payAccountId") REFERENCES "PayAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenExpenseCategory" ADD CONSTRAINT "HiddenExpenseCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
