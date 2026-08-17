import { STATE_TAX_TABLE } from "@/lib/data/stateTax";

/**
 * Rough, budgeting-grade tax estimates — not payroll-accurate (see
 * SPEC.md 3.3). Single filer, standard deduction, approximate 2024 figures.
 * These will drift from current law over time and should be revisited
 * periodically rather than treated as exact.
 */

const STANDARD_DEDUCTION_SINGLE = 14600;

// 2024 single-filer federal brackets: [rate, incomeAbove]
const FEDERAL_BRACKETS_SINGLE: { rate: number; upTo: number }[] = [
  { rate: 0.1, upTo: 11600 },
  { rate: 0.12, upTo: 47150 },
  { rate: 0.22, upTo: 100525 },
  { rate: 0.24, upTo: 191950 },
  { rate: 0.32, upTo: 243725 },
  { rate: 0.35, upTo: 609350 },
  { rate: 0.37, upTo: Infinity },
];

const SOCIAL_SECURITY_RATE = 0.062;
const SOCIAL_SECURITY_WAGE_BASE = 168600; // 2024

const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const ADDITIONAL_MEDICARE_THRESHOLD_SINGLE = 200000;

function calculateFederalTax(annualGross: number): number {
  const taxableIncome = Math.max(0, annualGross - STANDARD_DEDUCTION_SINGLE);
  let tax = 0;
  let lowerBound = 0;

  for (const bracket of FEDERAL_BRACKETS_SINGLE) {
    if (taxableIncome <= lowerBound) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.upTo) - lowerBound;
    tax += taxableInBracket * bracket.rate;
    lowerBound = bracket.upTo;
  }

  return tax;
}

function calculateFICA(annualGross: number): {
  socialSecurity: number;
  medicare: number;
} {
  const socialSecurity = Math.min(annualGross, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE;

  let medicare = annualGross * MEDICARE_RATE;
  if (annualGross > ADDITIONAL_MEDICARE_THRESHOLD_SINGLE) {
    medicare += (annualGross - ADDITIONAL_MEDICARE_THRESHOLD_SINGLE) * ADDITIONAL_MEDICARE_RATE;
  }

  return { socialSecurity, medicare };
}

function calculateStateTax(annualGross: number, state: string | null): number {
  if (!state) return 0;
  const rule = STATE_TAX_TABLE[state];
  if (!rule || rule.type === "none") return 0;
  return annualGross * rule.rate;
}

export type TaxEstimate = {
  grossAnnual: number;
  federal: number;
  state: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
  netAnnual: number;
};

export function estimateAnnualTaxes(annualGross: number, state: string | null): TaxEstimate {
  const federal = calculateFederalTax(annualGross);
  const state_ = calculateStateTax(annualGross, state);
  const { socialSecurity, medicare } = calculateFICA(annualGross);
  const totalTax = federal + state_ + socialSecurity + medicare;

  return {
    grossAnnual: annualGross,
    federal,
    state: state_,
    socialSecurity,
    medicare,
    totalTax,
    netAnnual: annualGross - totalTax,
  };
}

export type MonthlyTaxEstimate = {
  grossMonthly: number;
  federal: number;
  state: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
  netMonthly: number;
};

/** Annualizes the given month's gross, estimates taxes, then scales back down to monthly. */
export function estimateMonthlyTaxes(monthlyGross: number, state: string | null): MonthlyTaxEstimate {
  const annual = estimateAnnualTaxes(monthlyGross * 12, state);
  return {
    grossMonthly: monthlyGross,
    federal: annual.federal / 12,
    state: annual.state / 12,
    socialSecurity: annual.socialSecurity / 12,
    medicare: annual.medicare / 12,
    totalTax: annual.totalTax / 12,
    netMonthly: annual.netAnnual / 12,
  };
}
