"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { SubmitButton } from "@/components/SubmitButton";
import { CategoryCombobox } from "@/components/dashboard/CategoryCombobox";
import { useConfirm } from "@/components/ConfirmDialog";
import { editButtonClass, deleteButtonClass } from "@/components/dashboard/rowActionStyles";
import { formatCurrencyPrecise } from "@/lib/format";

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
  const confirmDialog = useConfirm();
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-sm bg-background border border-border rounded-xl px-4 py-2">
      <div>
        <span>{item.name}</span>
        <span className="text-muted-foreground ml-2 text-xs">{item.categoryName}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:justify-end">
        <span className="text-muted-foreground">
          {formatCurrencyPrecise(item.amount)} / {FREQUENCY_LABELS[item.frequency]?.toLowerCase()}
        </span>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(true)} className={editButtonClass}>
            Edit
          </button>
          <button
            onClick={async () => {
              const ok = await confirmDialog({
                title: "Delete expense?",
                description: `"${item.name}" will be removed. This cannot be undone.`,
                confirmLabel: "Delete",
                destructive: true,
              });
              if (ok) onDelete();
            }}
            className={deleteButtonClass}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
