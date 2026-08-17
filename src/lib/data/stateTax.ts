/**
 * Simplified state income tax estimates, single filer, approximate 2024
 * rates. This is intentionally a rough estimate (per SPEC.md 3.3), not a
 * precise bracket calculation:
 *  - "none" states have no wage income tax.
 *  - "flat" states use their actual statutory flat rate.
 *  - Progressive-bracket states are approximated with a single blended
 *    effective rate rather than their real multi-bracket schedule — exact
 *    bracket tables vary by year and are easy to get subtly wrong, and the
 *    goal here is budgeting guidance, not payroll accuracy.
 * Rates should be revisited periodically; they will drift from current law
 * over time.
 */

export type StateTaxRule = { type: "none" } | { type: "flat"; rate: number };

export const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const NONE: StateTaxRule = { type: "none" };
const flat = (rate: number): StateTaxRule => ({ type: "flat", rate });

export const STATE_TAX_TABLE: Record<string, StateTaxRule> = {
  AL: flat(0.05),
  AK: NONE,
  AZ: flat(0.025),
  AR: flat(0.044),
  CA: flat(0.06), // approximate blended rate; real brackets go much higher at high income
  CO: flat(0.044),
  CT: flat(0.05),
  DE: flat(0.055),
  DC: flat(0.07),
  FL: NONE,
  GA: flat(0.0539),
  HI: flat(0.06),
  ID: flat(0.058),
  IL: flat(0.0495),
  IN: flat(0.0305),
  IA: flat(0.038),
  KS: flat(0.052),
  KY: flat(0.04),
  LA: flat(0.03),
  ME: flat(0.065),
  MD: flat(0.05),
  MA: flat(0.05),
  MI: flat(0.0425),
  MN: flat(0.065),
  MS: flat(0.047),
  MO: flat(0.045),
  MT: flat(0.055),
  NE: flat(0.05),
  NV: NONE,
  NH: NONE, // wages not taxed; only interest/dividends, being phased out
  NJ: flat(0.05),
  NM: flat(0.045),
  NY: flat(0.055),
  NC: flat(0.045),
  ND: flat(0.02),
  OH: flat(0.03),
  OK: flat(0.04),
  OR: flat(0.07),
  PA: flat(0.0307),
  RI: flat(0.0475),
  SC: flat(0.055),
  SD: NONE,
  TN: NONE,
  TX: NONE,
  UT: flat(0.0465),
  VT: flat(0.055),
  VA: flat(0.05),
  WA: NONE,
  WV: flat(0.045),
  WI: flat(0.05),
  WY: NONE,
};
