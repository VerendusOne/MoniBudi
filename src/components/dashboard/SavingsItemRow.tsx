"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { formatCurrency } from "@/lib/format";
import { FrequencyOptions } from "@/components/dashboard/ExpenseItemRow";

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
      <span className="flex-1">{item.name}</span>
      <span className="text-muted-foreground w-40 text-right">
        {item.amountType === "PERCENT_OF_GROSS"
          ? `${item.percent}% of gross`
          : `${formatCurrency(item.flatAmount ?? 0)} / ${FREQUENCY_LABELS[item.frequency]}`}
      </span>
      <span className="w-24 text-right">{formatCurrency(item.monthlyAmount)}/mo</span>
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
