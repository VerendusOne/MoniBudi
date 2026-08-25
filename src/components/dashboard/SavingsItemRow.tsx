"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { SubmitButton } from "@/components/SubmitButton";
import { useConfirm } from "@/components/ConfirmDialog";
import { formatCurrency } from "@/lib/format";
import { FrequencyOptions } from "@/components/dashboard/ExpenseItemRow";
import { editButtonClass, deleteButtonClass } from "@/components/dashboard/rowActionStyles";

type Item = {
  id: string;
  name: string;
  amountType: "FLAT" | "PERCENT_OF_GROSS";
  flatAmount: number | null;
  percent: number | null;
  frequency: string;
  monthlyAmount: number;
};

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "daily",
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  SEMI_MONTHLY: "semi-monthly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
  PER_PAYCHECK: "per paycheck",
};

export function SavingsItemRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: Item;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const confirmDialog = useConfirm();
  const [editing, setEditing] = useState(false);
  const [amountType, setAmountType] = useState(item.amountType);

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
        <Select
          name="amountType"
          value={amountType}
          onChange={(e) => setAmountType(e.target.value as Item["amountType"])}
          className="py-1 w-40"
        >
          <option value="FLAT">Flat amount</option>
          <option value="PERCENT_OF_GROSS">% of gross pay</option>
        </Select>
        {amountType === "FLAT" ? (
          <Input
            name="flatAmount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={item.flatAmount ?? ""}
            className="py-1 w-24"
          />
        ) : (
          <Input
            name="percent"
            type="number"
            step="0.1"
            min="0"
            max="100"
            required
            defaultValue={item.percent ?? ""}
            className="py-1 w-20"
          />
        )}
        {amountType === "FLAT" && (
          <Select name="frequency" defaultValue={item.frequency} className="py-1 w-36">
            <FrequencyOptions />
          </Select>
        )}
        {amountType === "PERCENT_OF_GROSS" && (
          <input type="hidden" name="frequency" value="PER_PAYCHECK" />
        )}
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
      </form>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-sm bg-background border border-border rounded-xl px-4 py-2">
      <span>{item.name}</span>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:justify-end">
        <span className="text-muted-foreground">
          {item.amountType === "PERCENT_OF_GROSS"
            ? `${item.percent}% of gross`
            : `${formatCurrency(item.flatAmount ?? 0)} / ${FREQUENCY_LABELS[item.frequency]}`}
        </span>
        <span>{formatCurrency(item.monthlyAmount)}/mo</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(true)} className={editButtonClass}>
            Edit
          </button>
          <button
            onClick={async () => {
              const ok = await confirmDialog({
                title: "Delete savings item?",
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
