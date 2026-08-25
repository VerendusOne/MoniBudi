"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { SubmitButton } from "@/components/SubmitButton";
import { CategoryCombobox } from "@/components/dashboard/CategoryCombobox";
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
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <form
        action={async (formData: FormData) => {
          try {
            await onUpdate(formData);
            setEditing(false);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save.");
          }
        }}
        className="flex flex-wrap items-start gap-2 bg-background border border-border rounded-xl px-4 py-2"
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
        <div className="w-44">
          <CategoryCombobox
            name="categoryId"
            categories={categories}
            defaultCategoryId={item.categoryId}
            defaultCategoryName={item.categoryName}
          />
        </div>
        <SubmitButton className="px-3 py-1 text-xs shrink-0" pendingLabel="Saving…">
          Save
        </SubmitButton>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Cancel
        </button>
        {error && <p className="text-sm text-red-500 w-full">{error}</p>}
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
