import { prisma } from "@/lib/prisma";

export type SnapshotValues = {
  grossIncome: number;
  estimatedTaxes: number;
  netIncome: number;
  totalExpenses: number;
  totalSavings: number;
  leftOver: number;
};

/**
 * Upserts this month's numbers into MonthlySnapshot every time the account
 * page is viewed. Since the page already recomputes live totals on every
 * load, this just persists the current month's snapshot as a side effect —
 * once the calendar moves to a new month, the prior month's row stops being
 * touched and becomes fixed history.
 */
export async function saveCurrentMonthSnapshot(
  payAccountId: string,
  values: SnapshotValues,
  now: Date = new Date(),
) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  await prisma.monthlySnapshot.upsert({
    where: { payAccountId_year_month: { payAccountId, year, month } },
    create: { payAccountId, year, month, ...values },
    update: { ...values },
  });
}
