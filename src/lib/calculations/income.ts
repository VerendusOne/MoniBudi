import { PayFrequency } from "@/generated/prisma/enums";

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

/** Average number of weeks in one pay period of the given frequency. */
export function weeksInPeriod(frequency: PayFrequency): number {
  switch (frequency) {
    case "WEEKLY":
      return 1;
    case "BIWEEKLY":
      return 2;
    case "SEMI_MONTHLY":
      return WEEKS_PER_YEAR / 24; // 24 pay periods/year
    case "MONTHLY":
      return WEEKS_PER_YEAR / MONTHS_PER_YEAR;
  }
}

/** Number of pay periods of the given frequency in an average month. */
export function periodsPerMonth(frequency: PayFrequency): number {
  return WEEKS_PER_YEAR / MONTHS_PER_YEAR / weeksInPeriod(frequency);
}

export type OvertimeRuleInput = {
  thresholdHours: number;
  multiplier: number;
  tier2ThresholdHours?: number | null;
  tier2Multiplier?: number | null;
} | null;

/**
 * Computes gross pay for a given number of hours worked in a period of
 * `periodWeeks` weeks. The overtime rule's thresholdHours is defined on a
 * weekly basis and scaled by periodWeeks so the same rule applies whether
 * hours are logged weekly, biweekly, semi-monthly, or monthly.
 */
export function computeGrossForHours(
  hours: number,
  periodWeeks: number,
  hourlyRate: number,
  overtimeRule: OvertimeRuleInput,
): number {
  if (!overtimeRule || hours <= 0) return hours * hourlyRate;

  const threshold = overtimeRule.thresholdHours * periodWeeks;
  if (hours <= threshold) return hours * hourlyRate;

  const tier2Threshold = overtimeRule.tier2ThresholdHours
    ? overtimeRule.tier2ThresholdHours * periodWeeks
    : null;

  const regularPay = threshold * hourlyRate;

  if (tier2Threshold && hours > tier2Threshold) {
    const otHours = tier2Threshold - threshold;
    const tier2Hours = hours - tier2Threshold;
    return (
      regularPay +
      otHours * hourlyRate * overtimeRule.multiplier +
      tier2Hours * hourlyRate * (overtimeRule.tier2Multiplier ?? overtimeRule.multiplier)
    );
  }

  const otHours = hours - threshold;
  return regularPay + otHours * hourlyRate * overtimeRule.multiplier;
}

/** Projects monthly gross income from a default weekly hours/rate schedule. */
export function projectMonthlyGross(
  defaultHoursPerWeek: number,
  hourlyRate: number,
  overtimeRule: OvertimeRuleInput,
): number {
  const weeklyGross = computeGrossForHours(defaultHoursPerWeek, 1, hourlyRate, overtimeRule);
  return weeklyGross * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);
}

export type PayPeriodEntryInput = {
  periodStart: Date;
  periodEnd: Date;
  hoursWorked: number;
  /** Week 2 hours for a BIWEEKLY entry — see computeEntryGross. */
  hoursWorkedWeek2?: number | null;
};

/**
 * Gross pay for one logged pay period. For BIWEEKLY entries with a week 2
 * value, overtime is computed separately for each week and summed — this
 * matches how overtime actually works (FLSA is per-workweek, not per pay
 * period), so a heavy week 1 can't be masked by a light week 2. Other
 * frequencies fall back to scaling the threshold across the whole period,
 * which is an approximation (weeks don't divide evenly for semi-monthly/
 * monthly, so true per-week accuracy isn't achievable there anyway).
 */
export function computeEntryGross(
  entry: PayPeriodEntryInput,
  frequency: PayFrequency,
  hourlyRate: number,
  overtimeRule: OvertimeRuleInput,
): number {
  if (frequency === "BIWEEKLY" && entry.hoursWorkedWeek2 != null) {
    return (
      computeGrossForHours(entry.hoursWorked, 1, hourlyRate, overtimeRule) +
      computeGrossForHours(entry.hoursWorkedWeek2, 1, hourlyRate, overtimeRule)
    );
  }
  return computeGrossForHours(entry.hoursWorked, weeksInPeriod(frequency), hourlyRate, overtimeRule);
}

export type MonthlyGrossResult = {
  amount: number;
  source: "logged" | "projected" | "blended";
  loggedDays: number;
  totalDays: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** Whole days of overlap (inclusive) between [aStart, aEnd] and [bStart, bEnd]. */
function overlapDays(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): number {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  if (end < start) return 0;
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

/**
 * Current month's gross income, blended: days covered by a logged pay
 * period use that period's actual computed gross (prorated to the days
 * that fall in this month), and any remaining, uncovered days fall back to
 * the default-schedule's average daily rate. This way logging one pay
 * period nudges the month's total rather than replacing it outright.
 */
export function computeMonthlyGross(
  entries: PayPeriodEntryInput[],
  frequency: PayFrequency,
  defaultHoursPerWeek: number,
  hourlyRate: number,
  overtimeRule: OvertimeRuleInput,
  now: Date = new Date(),
): MonthlyGrossResult {
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = daysInMonth(year, month);
  // Stored period dates are UTC midnight (see parseDateInput), so the month
  // boundaries need to be in UTC too, or entries near the start/end of the
  // month can be miscounted depending on the server's local timezone.
  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month, totalDays));

  const monthEntries = entries.filter(
    (e) => overlapDays(e.periodStart, e.periodEnd, monthStart, monthEnd) > 0,
  );

  const projectedMonthly = projectMonthlyGross(defaultHoursPerWeek, hourlyRate, overtimeRule);
  const projectedDailyRate = projectedMonthly / totalDays;

  if (monthEntries.length === 0) {
    return { amount: projectedMonthly, source: "projected", loggedDays: 0, totalDays };
  }

  let loggedGross = 0;
  let loggedDays = 0;

  for (const entry of monthEntries) {
    const entryTotalDays =
      Math.round((entry.periodEnd.getTime() - entry.periodStart.getTime()) / MS_PER_DAY) + 1;
    const overlap = overlapDays(entry.periodStart, entry.periodEnd, monthStart, monthEnd);
    const entryGross = computeEntryGross(entry, frequency, hourlyRate, overtimeRule);

    loggedGross += entryGross * (overlap / entryTotalDays);
    loggedDays += overlap;
  }

  loggedDays = Math.min(loggedDays, totalDays);
  const remainingDays = Math.max(0, totalDays - loggedDays);
  const amount = loggedGross + remainingDays * projectedDailyRate;

  return {
    amount,
    source: remainingDays === 0 ? "logged" : "blended",
    loggedDays,
    totalDays,
  };
}
