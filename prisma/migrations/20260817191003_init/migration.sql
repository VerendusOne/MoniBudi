-- CreateEnum
CREATE TYPE "PayFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'SEMI_MONTHLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'YEARLY', 'PER_PAYCHECK');

-- CreateEnum
CREATE TYPE "SavingsAmountType" AS ENUM ('FLAT', 'PERCENT_OF_GROSS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaySettings" (
    "id" TEXT NOT NULL,
    "payAccountId" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "defaultHoursPerWeek" DECIMAL(6,2) NOT NULL,
    "payFrequency" "PayFrequency" NOT NULL DEFAULT 'BIWEEKLY',

    CONSTRAINT "PaySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeRule" (
    "id" TEXT NOT NULL,
    "payAccountId" TEXT NOT NULL,
    "thresholdHours" DECIMAL(6,2) NOT NULL DEFAULT 40,
    "multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.5,

    CONSTRAINT "OvertimeRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeTier" (
    "id" TEXT NOT NULL,
    "overtimeRuleId" TEXT NOT NULL,
    "thresholdHours" DECIMAL(6,2) NOT NULL,
    "multiplier" DECIMAL(4,2) NOT NULL,

    CONSTRAINT "OvertimeTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayPeriodEntry" (
    "id" TEXT NOT NULL,
    "payAccountId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "hoursWorked" DECIMAL(6,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayPeriodEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxSettings" (
    "id" TEXT NOT NULL,
    "payAccountId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT,

    CONSTRAINT "TaxSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPreset" BOOLEAN NOT NULL DEFAULT false,
    "payAccountId" TEXT,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseItem" (
    "id" TEXT NOT NULL,
    "payAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsItem" (
    "id" TEXT NOT NULL,
    "payAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountType" "SavingsAmountType" NOT NULL,
    "flatAmount" DECIMAL(10,2),
    "percent" DECIMAL(5,2),
    "frequency" "RecurrenceFrequency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySnapshot" (
    "id" TEXT NOT NULL,
    "payAccountId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "grossIncome" DECIMAL(12,2) NOT NULL,
    "estimatedTaxes" DECIMAL(12,2) NOT NULL,
    "netIncome" DECIMAL(12,2) NOT NULL,
    "totalExpenses" DECIMAL(12,2) NOT NULL,
    "totalSavings" DECIMAL(12,2) NOT NULL,
    "leftOver" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PaySettings_payAccountId_key" ON "PaySettings"("payAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "OvertimeRule_payAccountId_key" ON "OvertimeRule"("payAccountId");

-- CreateIndex
CREATE INDEX "PayPeriodEntry_payAccountId_periodStart_idx" ON "PayPeriodEntry"("payAccountId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "TaxSettings_payAccountId_key" ON "TaxSettings"("payAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_payAccountId_name_key" ON "ExpenseCategory"("payAccountId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySnapshot_payAccountId_year_month_key" ON "MonthlySnapshot"("payAccountId", "year", "month");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayAccount" ADD CONSTRAINT "PayAccount_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaySettings" ADD CONSTRAINT "PaySettings_payAccountId_fkey" FOREIGN KEY ("payAccountId") REFERENCES "PayAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeRule" ADD CONSTRAINT "OvertimeRule_payAccountId_fkey" FOREIGN KEY ("payAccountId") REFERENCES "PayAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeTier" ADD CONSTRAINT "OvertimeTier_overtimeRuleId_fkey" FOREIGN KEY ("overtimeRuleId") REFERENCES "OvertimeRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayPeriodEntry" ADD CONSTRAINT "PayPeriodEntry_payAccountId_fkey" FOREIGN KEY ("payAccountId") REFERENCES "PayAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxSettings" ADD CONSTRAINT "TaxSettings_payAccountId_fkey" FOREIGN KEY ("payAccountId") REFERENCES "PayAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_payAccountId_fkey" FOREIGN KEY ("payAccountId") REFERENCES "PayAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseItem" ADD CONSTRAINT "ExpenseItem_payAccountId_fkey" FOREIGN KEY ("payAccountId") REFERENCES "PayAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseItem" ADD CONSTRAINT "ExpenseItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsItem" ADD CONSTRAINT "SavingsItem_payAccountId_fkey" FOREIGN KEY ("payAccountId") REFERENCES "PayAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySnapshot" ADD CONSTRAINT "MonthlySnapshot_payAccountId_fkey" FOREIGN KEY ("payAccountId") REFERENCES "PayAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
