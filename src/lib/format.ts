export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Same as formatCurrency, but always shows cents — for exact per-item amounts. */
export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Parses a "YYYY-MM-DD" value from a <input type="date"> as a UTC midnight
 * Date, matching how it round-trips through Prisma's DateTime column. Using
 * `new Date(value)` directly also parses as UTC, but reading it back with
 * local-timezone formatting (toLocaleDateString, toISOString-based inputs,
 * etc.) shifts the displayed day for any non-UTC user — so every date in
 * this app is read/written/displayed in UTC to stay consistent.
 */
export function parseDateInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Formats a Date back into "YYYY-MM-DD" for a <input type="date"> defaultValue. */
export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** month is 1-12, matching MonthlySnapshot's stored value. */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}
