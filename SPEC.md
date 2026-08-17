# Budget App — Product Spec

## 1. Concept

A paycheck-first budgeting app. Instead of importing bank transactions, you build
your budget from the ground up: hours worked and pay rate → gross income →
taxes/deductions → expenses → savings → what's actually left over. The app
tracks income the way it's actually earned (hourly, with overtime rules) and
breaks spending into "real expenses" vs. "savings" (401k, etc.) rather than
lumping them together.

## 2. Structure: Profiles & Accounts

- **Login (1)** → can contain **multiple Profiles**.
  - Example: one login, but a "Household" profile and a "Just Me" profile,
    or profiles for different scenarios you want to model separately.
- **Profile** → contains **multiple Accounts**.
  - Example: a "Me" profile has a "Main Job" account and a "Side Gig" account.
    A "Partner" profile could have its own accounts, tracked separately but
    still under the same login.
- **Account** = the unit that holds a pay setup (hourly rate, hours, overtime
  rule, tax settings) and its own expenses/savings. Each account produces its
  own monthly numbers; a Profile can optionally show a combined total across
  its accounts.

## 3. Core Features

### 3.1 Income & Hours
- Two entry modes, usable together:
  - **Default schedule**: set standard hours/week + hourly rate once; app
    projects monthly income automatically.
  - **Per pay-period entry**: log actual hours for a given period (weekly,
    biweekly, etc.) to override/correct the projection for real weeks.
- Pay period frequency is configurable per account (weekly, biweekly,
  semi-monthly, monthly).

### 3.2 Overtime
- Configurable **per account**, since companies calculate this differently.
- Config includes: weekly hour threshold (e.g. 40 hrs), multiplier
  (e.g. 1.5x), and support for additional tiers (e.g. double-time past 60 hrs)
  if needed.
- Applied automatically to hours logged above threshold.

### 3.3 Taxes & Deductions
- Location-based: user selects **state and city** to apply relevant tax rules.
- **Rough-estimate** calculation (not paystub-exact): simplified federal
  bracket math, state income tax (where applicable), Social Security, and
  Medicare (FICA).
- Goal is "close enough for budgeting," not payroll accuracy. Clearly labeled
  as an estimate in the UI.
- **All 50 states** supported at launch (including no-income-tax states),
  using simplified rules per state rather than one state built out in full
  detail first.
- Estimated taxes/deductions are subtracted from gross to produce net income.

### 3.4 Expenses
- User adds arbitrary expense items, each with:
  - Name, amount, **frequency** (weekly, biweekly, monthly, yearly, etc.)
  - Category — **preset categories provided**: Housing, Utilities,
    Subscriptions, Food/Groceries, Transportation, Insurance, Debt Payments,
    Personal/Misc. Users can add/rename/delete custom categories on top of
    these.
- All expenses are **normalized to a monthly equivalent** for the overview
  (e.g. a weekly $50 expense → ~$217/month), regardless of entry frequency.

### 3.5 Savings
- Separate from expenses conceptually, even though both reduce spendable
  income. Examples: 401k, HSA, personal savings transfers.
- Each savings item can be defined as:
  - A **flat dollar amount**, or
  - A **percentage of gross pay** (recalculates automatically as income
    changes, e.g. 401k contribution %).
- Savings **are subtracted** from the "left over" spendable total (since that
  money isn't actually in-hand), but are shown as their own distinct
  line/category — never merged into "expenses" in the UI.

### 3.6 Overview Dashboard
- **Waterfall layout** as the primary view:
  ```
  Gross Monthly Income
    − Taxes & Deductions (est.)
    = Net Income
    − Expenses (monthly-normalized)
    − Savings
    ─────────────────────────
    = Left Over
  ```
- Each line is expandable to show its underlying breakdown (per-category
  expenses, per-account income, etc.).
- v1 shows **per-account numbers**. Combined/rolled-up totals across all of a
  profile's accounts are deferred to a later pass — you drill into one
  account at a time for now.

### 3.7 History & Trends
- Every month's numbers are saved, not just live/current.
- Ability to look back at past months and compare month-over-month.
- Trend charts over time (income, expenses, savings, left-over amount).

## 4. Non-Goals (v1)

- No bank account linking / transaction import.
- No paystub-exact tax accuracy — estimates only.
- No bill-pay or transaction execution — this is a planning/tracking tool,
  not a payments tool.

## 5. Data Model (high-level sketch)

```
User (login)
 └── Profile (1..n)
      └── Account (1..n)
           ├── PaySettings (default hours/week, hourly rate, pay frequency)
           ├── OvertimeRule (threshold, multiplier, tiers)
           ├── PayPeriodEntry (1..n) — actual logged hours, overrides projection
           ├── TaxSettings (state, city)
           ├── ExpenseItem (1..n) — name, amount, frequency, category
           └── SavingsItem (1..n) — name, flat amount OR % of gross, frequency

MonthlySnapshot (per Account, per month) — stored computed results for history/trends
```

## 6. Recommended Tech Stack

Given: multi-user web app, real auth, moderate data modeling, charts/history,
solo-developer-friendly.

- **Frontend + Backend**: Next.js (React + TypeScript) — one framework for UI
  and API routes, minimizes moving parts for a solo project.
- **Database**: PostgreSQL, accessed via **Prisma** ORM — good fit for the
  relational Profile → Account → Items structure above.
- **Auth**: NextAuth.js (or Clerk if you want less setup) — handles login,
  sessions, multi-user isolation.
- **Charts**: Recharts — for the history/trends views.
- **Hosting**: Vercel (app) + Neon or Supabase (managed Postgres) — both have
  generous free tiers suitable for a personal-scale app.

This stack is a recommendation, not a commitment — open to revisiting once
we scope the build.

## 7. Visual Design Direction

Reference: "Greenlight UI Kit" — dark navy/teal background, glowing cyan
accent color, pill-shaped buttons/toggles, rounded cards. Overall feel should
read as **Apple/Tesla simplicity** wearing that color palette — restrained,
not a busy "UI kit demo."

- **Theme**: Follows system light/dark preference by default, with a manual
  toggle available. Dark mode uses the navy/teal palette from the reference;
  light mode should carry the same cyan accent and rounded-pill component
  language onto a light background.
- **Glow/neon effects**: Accent-only. Reserved for primary buttons, active
  toggle states, the "Left Over" headline number, and similar key focal
  points. The rest of the UI (cards, text, backgrounds) stays flat and clean
  — no glow on every border/panel.
- **Density**: Dashboard-style. The Overview page in particular should show
  multiple stats/cards at once (income, taxes, expenses, savings, left-over)
  without requiring much scrolling or tapping — closer to a Tesla app screen
  than a single-focus Apple onboarding flow.
- **Typography**: **Inter** — modern, highly legible at small sizes, wide
  weight range, free. Used throughout in place of the OS system font.
- **Component language**: Pill-shaped buttons and toggles, rounded cards,
  segmented sliders (as in the reference) for things like hour/percentage
  inputs where useful.

## 8. Status

All open decisions for the initial spec are resolved. Ready to move into
build planning.
