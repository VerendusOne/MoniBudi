"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { SubmitButton } from "@/components/SubmitButton";
import { useConfirm } from "@/components/ConfirmDialog";
import { editButtonClass, deleteButtonClass } from "@/components/dashboard/rowActionStyles";
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
  const confirmDialog = useConfirm();
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
        <span className="text-muted-foreground">{formatDate(item.date)}</span>
        <span>{formatCurrency(item.amount)}</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(true)} className={editButtonClass}>
            Edit
          </button>
          <button
            onClick={async () => {
              const ok = await confirmDialog({
                title: "Delete extra income?",
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
