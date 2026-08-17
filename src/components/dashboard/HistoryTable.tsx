import { formatCurrency, formatMonthYear } from "@/lib/format";

type Snapshot = {
  id: string;
  year: number;
  month: number;
  netIncome: number;
  totalExpenses: number;
  totalSavings: number;
  leftOver: number;
};

export function HistoryTable({ snapshots }: { snapshots: Snapshot[] }) {
  if (snapshots.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No history yet — come back after this month closes out, or as you
        use the app across multiple months.
      </p>
    );
  }

  const maxLeftOver = Math.max(...snapshots.map((s) => Math.abs(s.leftOver)), 1);

  return (
    <div className="flex flex-col divide-y divide-border">
      {snapshots.map((s, i) => {
        const prev = snapshots[i + 1];
        const delta = prev ? s.leftOver - prev.leftOver : null;

        return (
          <div key={s.id} className="py-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{formatMonthYear(s.year, s.month)}</span>
              <span className="flex items-center gap-2">
                {delta !== null && (
                  <span
                    className={
                      delta === 0
                        ? "text-muted-foreground text-xs"
                        : delta > 0
                          ? "text-accent text-xs"
                          : "text-red-500 text-xs"
                    }
                  >
                    {delta === 0 ? "±$0" : `${delta > 0 ? "▲" : "▼"} ${formatCurrency(Math.abs(delta))}`}
                  </span>
                )}
                <span className="font-medium">{formatCurrency(s.leftOver)}</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-accent"
                style={{ width: `${Math.max(2, (Math.abs(s.leftOver) / maxLeftOver) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Net {formatCurrency(s.netIncome)}</span>
              <span>Expenses {formatCurrency(s.totalExpenses)}</span>
              <span>Savings {formatCurrency(s.totalSavings)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
