"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/Select";
import { ExpenseItemRow } from "@/components/dashboard/ExpenseItemRow";

type Category = { id: string; name: string };

type Item = {
  id: string;
  name: string;
  amountType: "FLAT" | "PERCENT_OF_GROSS";
  flatAmount: number | null;
  percent: number | null;
  frequency: string;
  categoryId: string;
  categoryName: string;
  monthlyAmount: number;
};

type Row = {
  item: Item;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
};

const FREQUENCY_ORDER = ["DAILY", "WEEKLY", "BIWEEKLY", "SEMI_MONTHLY", "MONTHLY", "YEARLY", "PER_PAYCHECK"];

const SORT_OPTIONS = [
  { value: "added", label: "Date added" },
  { value: "highest", label: "Highest cost" },
  { value: "lowest", label: "Lowest cost" },
  { value: "category", label: "Category" },
  { value: "frequency", label: "Frequency" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

function sortRows(rows: Row[], sort: SortKey): Row[] {
  const sorted = [...rows];
  switch (sort) {
    case "highest":
      sorted.sort((a, b) => b.item.monthlyAmount - a.item.monthlyAmount);
      break;
    case "lowest":
      sorted.sort((a, b) => a.item.monthlyAmount - b.item.monthlyAmount);
      break;
    case "category":
      sorted.sort(
        (a, b) =>
          a.item.categoryName.localeCompare(b.item.categoryName) ||
          a.item.name.localeCompare(b.item.name),
      );
      break;
    case "frequency":
      sorted.sort(
        (a, b) => FREQUENCY_ORDER.indexOf(a.item.frequency) - FREQUENCY_ORDER.indexOf(b.item.frequency),
      );
      break;
    case "added":
      break;
  }
  return sorted;
}

export function ExpensesList({ rows, categories }: { rows: Row[]; categories: Category[] }) {
  const [sort, setSort] = useState<SortKey>("added");
  const sorted = useMemo(() => sortRows(rows, sort), [rows, sort]);

  return (
    <div className="flex flex-col gap-2">
      {rows.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="expense-sort">
            Sort by
          </label>
          <Select
            id="expense-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-auto py-1 text-xs"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      )}
      {sorted.map((row) => (
        <ExpenseItemRow
          key={row.item.id}
          item={row.item}
          categories={categories}
          onUpdate={row.onUpdate}
          onDelete={row.onDelete}
        />
      ))}
      {rows.length === 0 && (
        <p className="text-muted-foreground text-sm">No expenses added yet.</p>
      )}
    </div>
  );
}
