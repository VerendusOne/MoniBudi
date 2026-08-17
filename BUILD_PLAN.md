# Budget App — Build Plan

Companion to [SPEC.md](SPEC.md). Phases are ordered so each one produces
something runnable/visible, and later phases depend only on earlier ones.

## Phase 0 — Project Setup
- Init Next.js (TypeScript) project.
- Set up PostgreSQL (local for dev; Neon/Supabase for later deploy).
- Set up Prisma, connect to DB.
- Install Inter font, set up base Tailwind (or CSS) theme tokens: colors
  (navy/teal dark palette + light equivalent), spacing, radius (pill/rounded).
- Set up NextAuth with a basic email/password or magic-link provider.
- **Done when**: app runs locally, a logged-out visitor sees a placeholder
  home page, dark/light mode follows system preference.

## Phase 1 — Auth, Profiles & Accounts
- Login / signup flow.
- CRUD for Profiles (create/switch/rename/delete).
- CRUD for Accounts within a Profile.
- Basic nav shell: profile switcher, account switcher, empty dashboard page.
- **Done when**: a user can sign up, create a profile, add an account, and
  see it listed — no numbers yet.

## Phase 2 — Income & Hours
- PaySettings form per account (hourly rate, default hours/week, pay
  frequency).
- OvertimeRule config UI (threshold, multiplier, tiers) per account.
- PayPeriodEntry logging (actual hours per period), overriding the default
  projection.
- Compute gross income for the current month from schedule + overrides +
  overtime rules.
- **Done when**: setting a rate/hours produces a correct projected gross
  monthly number; logging a real pay period overrides it correctly,
  including overtime math.

## Phase 3 — Taxes & Deductions
- TaxSettings UI (state + city selection).
- Implement simplified tax estimate logic: federal brackets, FICA
  (SS + Medicare), state income tax by state (all 50, including no-tax
  states).
- Apply to gross income to produce net income.
- **Done when**: net income updates correctly when state changes, clearly
  labeled as an estimate.

## Phase 4 — Expenses & Savings
- ExpenseItem CRUD: name, amount, frequency, category (presets + custom).
- Frequency-to-monthly normalization logic (weekly/biweekly/yearly → monthly
  equivalent).
- SavingsItem CRUD: flat $ or % of gross, frequency.
- **Done when**: adding expenses/savings in any frequency correctly rolls up
  to monthly totals, and savings are tracked separately from expenses.

## Phase 5 — Overview Dashboard
- Waterfall component: Gross → Taxes → Net → Expenses → Savings → Left Over.
- Expandable breakdown per line (category-level detail).
- Dashboard-dense layout with accent-only glow styling per the design spec.
- **Done when**: the full pipeline (hours → gross → tax → net → expenses →
  savings → left over) is visible and correct on one screen, matching the
  visual direction.

## Phase 6 — History & Trends
- MonthlySnapshot generation (store computed results at month boundary or
  on-demand recompute for past months).
- History view: browse past months.
- Trend charts (Recharts) for income, expenses, savings, left-over over time.
- **Done when**: past months are browsable and at least one trend chart
  renders real data across 2+ months.

## Phase 7 — Polish
- Light/dark theme QA across all screens.
- Empty states, loading states, form validation/error handling.
- Responsive check (mobile/desktop).
- Deploy to Vercel + managed Postgres.
- **Done when**: app is deployed, usable end-to-end on both desktop and
  mobile, in both themes.

## Explicitly Deferred (post-v1)
- Combined Profile totals across multiple accounts.
- Any bank/transaction linking.
- Paystub-accurate tax calculation.

## Suggested Order of Attack
Phases 0–2 first (get real income numbers flowing), then 3–4 (get the full
subtraction pipeline working), then 5 (make it visible/usable as a
dashboard), then 6–7 (history, then polish/deploy). Each phase should be
independently testable before moving to the next.
