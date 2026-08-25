import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  upsertPaySettings,
  upsertOvertimeRule,
  createPayPeriodEntry,
  updatePayPeriodEntry,
  deletePayPeriodEntry,
  createExtraIncomeItem,
  updateExtraIncomeItem,
  deleteExtraIncomeItem,
} from "@/lib/actions/income";
import { upsertTaxSettings } from "@/lib/actions/taxes";
import {
  createExpenseCategory,
  deleteExpenseCategory,
  createExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
  createSavingsItem,
  updateSavingsItem,
  deleteSavingsItem,
} from "@/lib/actions/expenses";
import { computeMonthlyGross } from "@/lib/calculations/income";
import { estimateMonthlyTaxes } from "@/lib/calculations/taxes";
import { normalizeToMonthly, computeSavingsMonthly } from "@/lib/calculations/expenses";
import { saveCurrentMonthSnapshot } from "@/lib/history";
import { US_STATES } from "@/lib/data/stateTax";
import { formatCurrency } from "@/lib/format";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { SubmitButton } from "@/components/SubmitButton";
import { TabsShell } from "@/components/dashboard/TabsShell";
import { DangerZone } from "@/components/dashboard/DangerZone";
import { PaySettingsForm } from "@/components/dashboard/PaySettingsForm";
import { OvertimeRuleForm } from "@/components/dashboard/OvertimeRuleForm";
import { deletePayAccount } from "@/lib/actions/payAccounts";
import { PayPeriodEntryRow } from "@/components/dashboard/PayPeriodEntryRow";
import { ExtraIncomeRow } from "@/components/dashboard/ExtraIncomeRow";
import { ExpenseItemRow, FrequencyOptions } from "@/components/dashboard/ExpenseItemRow";
import { CategoryCombobox } from "@/components/dashboard/CategoryCombobox";
import { CategoryChips } from "@/components/dashboard/CategoryChips";
import { ExpandableAdd } from "@/components/dashboard/ExpandableAdd";
import { TaxSettingsForm } from "@/components/dashboard/TaxSettingsForm";
import { SavingsItemRow } from "@/components/dashboard/SavingsItemRow";
import { HistoryTable } from "@/components/dashboard/HistoryTable";

export default async function PayAccountPage({
  params,
}: {
  params: Promise<{ profileId: string; accountId: string }>;
}) {
  const { profileId, accountId } = await params;
  const session = await auth();

  const account = await prisma.payAccount.findFirst({
    where: {
      id: accountId,
      profileId,
      profile: { userId: session!.user!.id },
    },
    include: {
      profile: true,
      paySettings: true,
      overtimeRule: { include: { tiers: true } },
      payPeriodEntries: { orderBy: { periodStart: "desc" }, take: 10 },
      extraIncomeItems: { orderBy: { date: "desc" }, take: 10 },
      taxSettings: true,
      expenseItems: { include: { category: true }, orderBy: { createdAt: "asc" } },
      savingsItems: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!account) notFound();

  const categories = await prisma.expenseCategory.findMany({
    where: { OR: [{ payAccountId: null }, { payAccountId: accountId }] },
    orderBy: [{ isPreset: "desc" }, { name: "asc" }],
  });

  const paySettings = account.paySettings;
  const overtimeRule = account.overtimeRule;
  const tier2 = overtimeRule?.tiers[0];

  const monthlyGross = paySettings
    ? computeMonthlyGross(
        account.payPeriodEntries.map((e) => ({
          periodStart: e.periodStart,
          periodEnd: e.periodEnd,
          hoursWorked: Number(e.hoursWorked),
          hoursWorkedWeek2: e.hoursWorkedWeek2 ? Number(e.hoursWorkedWeek2) : null,
        })),
        paySettings.payFrequency,
        Number(paySettings.defaultHoursPerWeek),
        Number(paySettings.hourlyRate),
        overtimeRule
          ? {
              thresholdHours: Number(overtimeRule.thresholdHours),
              multiplier: Number(overtimeRule.multiplier),
              tier2ThresholdHours: tier2 ? Number(tier2.thresholdHours) : null,
              tier2Multiplier: tier2 ? Number(tier2.multiplier) : null,
            }
          : null,
      )
    : null;

  const now = new Date();
  const extraIncomeThisMonth = account.extraIncomeItems
    .filter(
      (item) =>
        // item.date is stored as UTC midnight (see parseDateInput); compare
        // against the user's current local year/month, which is what "this
        // month" means to them.
        item.date.getUTCFullYear() === now.getFullYear() &&
        item.date.getUTCMonth() === now.getMonth(),
    )
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalGross = (monthlyGross?.amount ?? 0) + extraIncomeThisMonth;

  const taxSettings = account.taxSettings;
  const taxEstimate = taxSettings
    ? estimateMonthlyTaxes(totalGross, taxSettings.state)
    : null;

  const incomeAfterTaxes = taxEstimate ? taxEstimate.netMonthly : totalGross;

  const payFrequency = paySettings?.payFrequency ?? null;

  const expenseItemsMonthly = account.expenseItems.map((item) => ({
    ...item,
    monthlyAmount: normalizeToMonthly(Number(item.amount), item.frequency, payFrequency),
  }));
  const totalExpensesMonthly = expenseItemsMonthly.reduce((sum, i) => sum + i.monthlyAmount, 0);

  const categoryTotals = Object.values(
    expenseItemsMonthly.reduce<Record<string, { name: string; amount: number }>>((acc, item) => {
      const key = item.categoryId;
      if (!acc[key]) acc[key] = { name: item.category.name, amount: 0 };
      acc[key].amount += item.monthlyAmount;
      return acc;
    }, {}),
  ).sort((a, b) => b.amount - a.amount);

  const savingsItemsMonthly = account.savingsItems.map((item) => ({
    ...item,
    monthlyAmount: computeSavingsMonthly(
      {
        amountType: item.amountType,
        flatAmount: item.flatAmount ? Number(item.flatAmount) : null,
        percent: item.percent ? Number(item.percent) : null,
        frequency: item.frequency,
      },
      totalGross,
      payFrequency,
    ),
  }));
  const totalSavingsMonthly = savingsItemsMonthly.reduce((sum, i) => sum + i.monthlyAmount, 0);

  const leftOver = incomeAfterTaxes - totalExpensesMonthly - totalSavingsMonthly;

  if (paySettings) {
    await saveCurrentMonthSnapshot(accountId, {
      grossIncome: totalGross,
      estimatedTaxes: taxEstimate?.totalTax ?? 0,
      netIncome: incomeAfterTaxes,
      totalExpenses: totalExpensesMonthly,
      totalSavings: totalSavingsMonthly,
      leftOver,
    });
  }

  const pastSnapshots = await prisma.monthlySnapshot.findMany({
    where: { payAccountId: accountId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: 24,
  });

  const boundUpsertPaySettings = upsertPaySettings.bind(null, profileId, accountId);
  const boundUpsertOvertimeRule = upsertOvertimeRule.bind(null, profileId, accountId);
  const boundCreateEntry = createPayPeriodEntry.bind(null, profileId, accountId);
  const boundCreateExtraIncome = createExtraIncomeItem.bind(null, profileId, accountId);
  const boundUpsertTaxSettings = upsertTaxSettings.bind(null, profileId, accountId);
  const boundCreateExpenseCategory = createExpenseCategory.bind(null, profileId, accountId);
  const boundDeleteExpenseCategory = deleteExpenseCategory.bind(null, profileId, accountId);
  const boundCreateExpenseItem = createExpenseItem.bind(null, profileId, accountId);
  const boundCreateSavingsItem = createSavingsItem.bind(null, profileId, accountId);

  const homeTab = (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {monthlyGross && (
        <div className="relative text-center py-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
          >
            <div className="h-56 w-56 rounded-full bg-accent/35 blur-[64px]" />
          </div>
          <p className="label-caps text-muted-foreground mb-2">
            Left over this month
          </p>
          <p
            className="text-6xl tracking-tight tabular-nums text-foreground drop-shadow-[0_0_36px_var(--accent)]"
            style={{ fontFamily: "var(--font-audiowide)" }}
          >
            {formatCurrency(leftOver)}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            {formatCurrency(monthlyGross.amount)} from pay
            {extraIncomeThisMonth > 0 &&
              ` + ${formatCurrency(extraIncomeThisMonth)} extra income`}
            {taxEstimate && ` − ${formatCurrency(taxEstimate.totalTax)} taxes (est.)`}
            {totalExpensesMonthly > 0 && ` − ${formatCurrency(totalExpensesMonthly)} expenses`}
            {totalSavingsMonthly > 0 && ` − ${formatCurrency(totalSavingsMonthly)} savings`}
          </p>
          {!taxEstimate && (
            <p className="text-xs text-muted-foreground mt-1">
              Set your state under the Taxes tab to include estimated taxes.
            </p>
          )}
        </div>
      )}

      {/* Pay Settings */}
      <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold">Pay Settings</h2>
        <PaySettingsForm
          paySettings={
            paySettings
              ? {
                  hourlyRate: Number(paySettings.hourlyRate),
                  defaultHoursPerWeek: Number(paySettings.defaultHoursPerWeek),
                  payFrequency: paySettings.payFrequency,
                }
              : null
          }
          onSave={boundUpsertPaySettings}
        />
      </section>

      {/* Overtime Rule */}
      <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold">Overtime Rule</h2>
        <OvertimeRuleForm
          overtimeRule={
            overtimeRule
              ? {
                  thresholdHours: Number(overtimeRule.thresholdHours),
                  multiplier: Number(overtimeRule.multiplier),
                }
              : null
          }
          tier2={
            tier2 ? { thresholdHours: Number(tier2.thresholdHours), multiplier: Number(tier2.multiplier) } : null
          }
          onSave={boundUpsertOvertimeRule}
        />
      </section>

      {/* Pay Period Entries */}
      <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold">Logged Pay Periods</h2>
        <p className="text-xs text-muted-foreground -mt-2">
          Days covered by a logged period use its actual pay; the rest of
          the month still uses your projected average.
          {paySettings?.payFrequency === "BIWEEKLY"
            ? " Overtime is calculated separately for each week, since that's how it actually works."
            : paySettings?.payFrequency === "SEMI_MONTHLY" ||
                paySettings?.payFrequency === "MONTHLY"
              ? " Overtime on periods this long is an approximation — true weekly overtime needs whole weeks to calculate exactly."
              : ""}
        </p>

        <div className="flex flex-col gap-2">
          {[...account.payPeriodEntries].reverse().map((entry) => (
            <PayPeriodEntryRow
              key={entry.id}
              entry={{
                id: entry.id,
                periodStart: entry.periodStart,
                periodEnd: entry.periodEnd,
                hoursWorked: Number(entry.hoursWorked),
                hoursWorkedWeek2: entry.hoursWorkedWeek2 ? Number(entry.hoursWorkedWeek2) : null,
              }}
              isBiweekly={paySettings?.payFrequency === "BIWEEKLY"}
              onUpdate={updatePayPeriodEntry.bind(null, profileId, accountId, entry.id)}
              onDelete={deletePayPeriodEntry.bind(null, profileId, accountId, entry.id)}
            />
          ))}
          {account.payPeriodEntries.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No pay periods logged yet.
            </p>
          )}
        </div>

        <form action={boundCreateEntry} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="text-sm text-muted-foreground flex-1">
              Period start
              <Input name="periodStart" type="date" required className="mt-1" />
            </label>
            <label className="text-sm text-muted-foreground flex-1">
              Period end
              <Input name="periodEnd" type="date" required className="mt-1" />
            </label>
          </div>
          {paySettings?.payFrequency === "BIWEEKLY" ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="text-sm text-muted-foreground flex-1">
                Week 1 hours
                <Input
                  name="hoursWorked"
                  type="number"
                  step="0.25"
                  min="0"
                  required
                  className="mt-1"
                />
              </label>
              <label className="text-sm text-muted-foreground flex-1">
                Week 2 hours
                <Input
                  name="hoursWorkedWeek2"
                  type="number"
                  step="0.25"
                  min="0"
                  required
                  className="mt-1"
                />
              </label>
            </div>
          ) : (
            <label className="text-sm text-muted-foreground">
              Hours worked
              <Input
                name="hoursWorked"
                type="number"
                step="0.25"
                min="0"
                required
                className="mt-1"
              />
            </label>
          )}
          <SubmitButton className="self-start">
            Log Pay Period
          </SubmitButton>
        </form>
      </section>

      {/* Extra Income */}
      <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold">Extra Income</h2>
        <p className="text-xs text-muted-foreground -mt-2">
          One-off money that isn&apos;t part of your regular pay — bonuses,
          insurance reimbursements, tax refunds, etc. Added on top of the
          gross income above for the month it falls in.
        </p>

        <div className="flex flex-col gap-2">
          {[...account.extraIncomeItems].reverse().map((item) => (
            <ExtraIncomeRow
              key={item.id}
              item={{
                id: item.id,
                name: item.name,
                amount: Number(item.amount),
                date: item.date,
              }}
              onUpdate={updateExtraIncomeItem.bind(null, profileId, accountId, item.id)}
              onDelete={deleteExtraIncomeItem.bind(null, profileId, accountId, item.id)}
            />
          ))}
          {account.extraIncomeItems.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No extra income logged yet.
            </p>
          )}
        </div>

        <form action={boundCreateExtraIncome} className="flex flex-col gap-3">
          <label className="text-sm text-muted-foreground">
            Description
            <Input
              name="name"
              placeholder="e.g. Insurance reimbursement"
              required
              className="mt-1"
            />
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="text-sm text-muted-foreground flex-1">
              Amount
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                className="mt-1"
              />
            </label>
            <label className="text-sm text-muted-foreground flex-1">
              Date received
              <Input name="date" type="date" required className="mt-1" />
            </label>
          </div>
          <SubmitButton className="self-start">
            Add Extra Income
          </SubmitButton>
        </form>
      </section>

      {/* Expenses & Savings summary */}
      {(expenseItemsMonthly.length > 0 || savingsItemsMonthly.length > 0) && (
        <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-3">
          <h2 className="text-base font-semibold">Expenses &amp; Savings This Month</h2>
          <p className="text-xs text-muted-foreground -mt-1">
            Manage individual items in the Expenses tab.
          </p>
          <div className="flex flex-col divide-y divide-border text-sm">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Total expenses</span>
              <span>{formatCurrency(totalExpensesMonthly)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Total savings</span>
              <span>{formatCurrency(totalSavingsMonthly)}</span>
            </div>
          </div>
        </section>
      )}

      {/* Spending by Category */}
      {categoryTotals.length > 0 && (
        <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-2">
          <h2 className="text-base font-semibold">Spending by Category</h2>
          <div className="flex flex-col divide-y divide-border text-sm">
            {categoryTotals.map((c) => (
              <div key={c.name} className="flex justify-between py-1.5">
                <span className="text-muted-foreground">{c.name}</span>
                <span>{formatCurrency(c.amount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const taxesTab = (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold">Taxes</h2>

        <TaxSettingsForm
          state={taxSettings?.state ?? null}
          city={taxSettings?.city ?? null}
          states={US_STATES}
          onSave={boundUpsertTaxSettings}
        />

        {taxEstimate ? (
          <>
            <p className="text-xs text-muted-foreground -mt-1">
              Rough estimate only — single filer, standard deduction,
              simplified state rates. Not a substitute for an actual
              paystub.
            </p>
            <div className="flex flex-col divide-y divide-border text-sm">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Gross income</span>
                <span>{formatCurrency(taxEstimate.grossMonthly)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Federal income tax</span>
                <span>−{formatCurrency(taxEstimate.federal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">State income tax</span>
                <span>−{formatCurrency(taxEstimate.state)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Social Security</span>
                <span>−{formatCurrency(taxEstimate.socialSecurity)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Medicare</span>
                <span>−{formatCurrency(taxEstimate.medicare)}</span>
              </div>
              <div className="flex justify-between py-2 font-medium">
                <span>Net income</span>
                <span>{formatCurrency(taxEstimate.netMonthly)}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a state above to see an estimated tax breakdown.
          </p>
        )}
      </section>
    </div>
  );

  const expensesTab = (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Expenses */}
      <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Expenses</h2>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(totalExpensesMonthly)}/mo
          </span>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Any recurring cost — daily, weekly, biweekly, semi-monthly, monthly,
          yearly, or tied to a paycheck. Everything is converted to a monthly
          amount automatically.
        </p>

        <div className="flex flex-col gap-2">
          {expenseItemsMonthly.map((item) => (
            <ExpenseItemRow
              key={item.id}
              item={{
                id: item.id,
                name: item.name,
                amount: Number(item.amount),
                frequency: item.frequency,
                categoryId: item.categoryId,
                categoryName: item.category.name,
              }}
              categories={categories}
              onUpdate={updateExpenseItem.bind(null, profileId, accountId, item.id)}
              onDelete={deleteExpenseItem.bind(null, profileId, accountId, item.id)}
            />
          ))}
          {expenseItemsMonthly.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No expenses added yet.
            </p>
          )}
        </div>

        <ExpandableAdd label="Add Expense" action={boundCreateExpenseItem}>
          <label className="text-sm text-muted-foreground">
            Name
            <Input name="name" placeholder="e.g. Rent" required className="mt-1" />
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="text-sm text-muted-foreground flex-1">
              Amount
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                className="mt-1"
              />
            </label>
            <label className="text-sm text-muted-foreground flex-1">
              Frequency
              <Select name="frequency" defaultValue="MONTHLY" className="mt-1">
                <FrequencyOptions />
              </Select>
            </label>
          </div>
          <label className="text-sm text-muted-foreground">
            Category
            <CategoryCombobox name="categoryId" categories={categories} />
          </label>
        </ExpandableAdd>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Your categories</p>
          <CategoryChips
            categories={categories.filter((c) => c.payAccountId === accountId)}
            onDelete={boundDeleteExpenseCategory}
          />
        </div>

        <ExpandableAdd label="New category" action={boundCreateExpenseCategory}>
          <label className="text-sm text-muted-foreground">
            Name
            <Input name="name" placeholder="Category name" required className="mt-1" />
          </label>
        </ExpandableAdd>
      </section>

      {/* Savings */}
      <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Savings</h2>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(totalSavingsMonthly)}/mo
          </span>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Money set aside rather than spent — 401k, HSA, a savings transfer,
          etc. Use a flat amount or a percentage of gross pay (e.g. a 401k
          contribution %, which recalculates automatically as your income
          changes). Shown separately from expenses, and still subtracted from
          your left-over total above.
        </p>

        <div className="flex flex-col gap-2">
          {savingsItemsMonthly.map((item) => (
            <SavingsItemRow
              key={item.id}
              item={{
                id: item.id,
                name: item.name,
                amountType: item.amountType,
                flatAmount: item.flatAmount ? Number(item.flatAmount) : null,
                percent: item.percent ? Number(item.percent) : null,
                frequency: item.frequency,
                monthlyAmount: item.monthlyAmount,
              }}
              onUpdate={updateSavingsItem.bind(null, profileId, accountId, item.id)}
              onDelete={deleteSavingsItem.bind(null, profileId, accountId, item.id)}
            />
          ))}
          {savingsItemsMonthly.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No savings items added yet.
            </p>
          )}
        </div>

        <ExpandableAdd label="Add Savings Item" action={boundCreateSavingsItem}>
          <label className="text-sm text-muted-foreground">
            Name
            <Input name="name" placeholder="e.g. 401k" required className="mt-1" />
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="text-sm text-muted-foreground flex-1">
              Type
              <Select name="amountType" defaultValue="FLAT" className="mt-1">
                <option value="FLAT">Flat amount</option>
                <option value="PERCENT_OF_GROSS">% of gross pay</option>
              </Select>
            </label>
            <label className="text-sm text-muted-foreground flex-1">
              Amount
              <Input
                name="flatAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Flat $ amount"
                className="mt-1"
              />
            </label>
            <label className="text-sm text-muted-foreground flex-1">
              Percent
              <Input
                name="percent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="% of gross"
                className="mt-1"
              />
            </label>
          </div>
          <label className="text-sm text-muted-foreground">
            Frequency <span className="text-xs">(only applies to a flat amount)</span>
            <Select name="frequency" defaultValue="PER_PAYCHECK" className="mt-1">
              <FrequencyOptions />
            </Select>
          </label>
        </ExpandableAdd>
      </section>
    </div>
  );

  const historyTab = (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <section className="bg-card border border-border/60 rounded-2xl card-shadow p-6 flex flex-col gap-2">
        <h2 className="text-base font-semibold">History</h2>
        <p className="text-xs text-muted-foreground -mt-1 mb-2">
          A snapshot of this job&apos;s numbers is saved automatically
          each month. The bar shows left-over relative to the biggest month
          in view; ▲/▼ compares to the month before it.
        </p>
        <HistoryTable
          snapshots={pastSnapshots.map((s) => ({
            id: s.id,
            year: s.year,
            month: s.month,
            netIncome: Number(s.netIncome),
            totalExpenses: Number(s.totalExpenses),
            totalSavings: Number(s.totalSavings),
            leftOver: Number(s.leftOver),
          }))}
        />
      </section>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <a href={`/dashboard/${profileId}`} className="text-sm text-accent">
          ← {account.profile.name}
        </a>
        <h1 className="text-2xl font-semibold mt-1">{account.name}</h1>
      </div>

      <TabsShell
        tabs={[
          { key: "home", label: "Home", content: homeTab },
          { key: "expenses", label: "Expenses", content: expensesTab },
          { key: "history", label: "History", content: historyTab },
          { key: "taxes", label: "Taxes", content: taxesTab },
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <DangerZone
          label="job"
          itemName={account.name}
          onDelete={deletePayAccount.bind(null, profileId, accountId)}
          redirectTo={`/dashboard/${profileId}`}
        />
      </div>
    </div>
  );
}
