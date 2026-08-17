"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { formatCurrency } from "@/lib/format";

type Category = { id: string; name: string };

type Item = {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  categoryId: string;
  categoryName: string;
};

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  BIWEEKLY: "Biweekly",
  SEMI_MONTHLY: "Semi-monthly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
  PER_PAYCHECK: "Per paycheck",
};

export function FrequencyOptions() {
  return (
    <>
      {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </>
  );
}

export function ExpenseItemRow({
  item,
  categories,
  onUpdate,
  onDelete,
}: {
  item: Item;
  categories: Category[];
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData: FormData) => {
          await onUpdate(formData);
          setEditing(false);
        }}
        className="flex flex-wrap items-center gap-2 bg-background border border-border rounded-xl px-4 py-2"
      >
        <Input name="name" required defaultValue={item.name} className="py-1 flex-1 min-w-[120px]" />
        <Input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={item.amount}
          className="py-1 w-24"
        />
        <Select name="frequency" defaultValue={item.frequency} className="py-1 w-36">
          <FrequencyOptions />
        </Select>
        <Select name="categoryId" defaultValue={item.categoryId} className="py-1 w-36">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Button type="submit" className="px-3 py-1 text-xs shrink-0">
          Save
        </Button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between text-sm bg-background border border-border rounded-xl px-4 py-2">
      <div className="flex-1">
        <span>{item.name}</span>
        <span className="text-muted-foreground ml-2 text-xs">{item.categoryName}</span>
      </div>
      <span className="text-muted-foreground w-32 text-right">
        {formatCurrency(item.amount)} / {FREQUENCY_LABELS[item.frequency]?.toLowerCase()}
      </span>
      <div className="flex items-center gap-3 pl-4">
        <button
          onClick={() => setEditing(true)}
          className="text-muted-foreground hover:text-accent transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${item.name}"?`)) onDelete();
          }}
          className="text-muted-foreground hover:text-red-500 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
