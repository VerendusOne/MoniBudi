"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/format";

type Item = {
  id: string;
  name: string;
  amount: number;
  date: Date;
};

export function ExtraIncomeRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: Item;
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
        className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-2"
      >
        <Input name="name" required defaultValue={item.name} className="py-1 flex-1" />
        <Input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={item.amount}
          className="py-1 w-28"
        />
        <Input
          name="date"
          type="date"
          required
          defaultValue={toDateInputValue(item.date)}
          className="py-1"
        />
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
      <span className="text-muted-foreground w-20 text-right">
        {formatDate(item.date)}
      </span>
      <span className="w-20 text-right">{formatCurrency(item.amount)}</span>
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
