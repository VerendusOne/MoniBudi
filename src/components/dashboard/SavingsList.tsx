"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/Select";
import { SavingsItemRow } from "@/components/dashboard/SavingsItemRow";

type Item = {
  id: string;
  name: string;
  amountType: "FLAT" | "PERCENT_OF_GROSS";
  flatAmount: number | null;
  percent: number | null;
  frequency: string;
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

export function SavingsList({ rows }: { rows: Row[] }) {
  const [sort, setSort] = useState<SortKey>("added");
  const sorted = useMemo(() => sortRows(rows, sort), [rows, sort]);

  return (
    <div className="flex flex-col gap-2">
      {rows.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="savings-sort">
            Sort by
          </label>
          <Select
            id="savings-sort"
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
        <SavingsItemRow key={row.item.id} item={row.item} onUpdate={row.onUpdate} onDelete={row.onDelete} />
      ))}
      {rows.length === 0 && (
        <p className="text-muted-foreground text-sm">No savings items added yet.</p>
      )}
    </div>
  );
}
