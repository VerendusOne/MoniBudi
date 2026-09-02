import { RecurrenceFrequency, PayFrequency } from "@/generated/prisma/enums";
import { periodsPerMonth } from "@/lib/calculations/income";

const WEEKS_PER_MONTH = 52 / 12;

/**
 * Converts a recurring amount at the given frequency into its monthly
 * equivalent. PER_PAYCHECK needs the account's actual pay frequency to know
 * how many paychecks happen per month; if it's not set yet, falls back to
 * treating it as once a month.
 */
export function normalizeToMonthly(
  amount: number,
  frequency: RecurrenceFrequency,
  payFrequency: PayFrequency | null = null,
): number {
  switch (frequency) {
    case "DAILY":
      return amount * (365 / 12);
    case "WEEKLY":
      return amount * WEEKS_PER_MONTH;
    case "BIWEEKLY":
      return amount * (WEEKS_PER_MONTH / 2);
    case "SEMI_MONTHLY":
      return amount * 2;
    case "MONTHLY":
      return amount;
    case "YEARLY":
      return amount / 12;
    case "PER_PAYCHECK":
      return amount * (payFrequency ? periodsPerMonth(payFrequency) : 1);
  }
}

export type AmountTypeItemInput = {
  amountType: "FLAT" | "PERCENT_OF_GROSS";
  flatAmount: number | null;
  percent: number | null;
  frequency: RecurrenceFrequency;
};

/**
 * Monthly amount for an expense or savings item. Percent-based items (e.g.
 * a 401k contribution %, or an expense that scales with income) are
 * computed directly against monthly gross income, regardless of the stored
 * frequency — the percentage already scales with however often you're paid.
 */
export function computeAmountMonthly(
  item: AmountTypeItemInput,
  monthlyGross: number,
  payFrequency: PayFrequency | null = null,
): number {
  if (item.amountType === "PERCENT_OF_GROSS") {
    return ((item.percent ?? 0) / 100) * monthlyGross;
  }
  return normalizeToMonthly(item.flatAmount ?? 0, item.frequency, payFrequency);
}
