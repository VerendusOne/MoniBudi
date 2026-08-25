"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { SubmitButton } from "@/components/SubmitButton";
import { useConfirm } from "@/components/ConfirmDialog";
import { editButtonClass, deleteButtonClass } from "@/components/dashboard/rowActionStyles";
import { formatDate, toDateInputValue } from "@/lib/format";

type Entry = {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  hoursWorked: number;
  hoursWorkedWeek2: number | null;
};

export function PayPeriodEntryRow({
  entry,
  isBiweekly,
  onUpdate,
  onDelete,
}: {
  entry: Entry;
  isBiweekly: boolean;
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
        <Input
          name="periodStart"
          type="date"
          required
          defaultValue={toDateInputValue(entry.periodStart)}
          className="py-1"
        />
        <Input
          name="periodEnd"
          type="date"
          required
          defaultValue={toDateInputValue(entry.periodEnd)}
          className="py-1"
        />
        {isBiweekly ? (
          <>
            <Input
              name="hoursWorked"
              type="number"
              step="0.25"
              min="0"
              required
              defaultValue={entry.hoursWorked}
              placeholder="Week 1"
              className="py-1 w-24"
            />
            <Input
              name="hoursWorkedWeek2"
              type="number"
              step="0.25"
              min="0"
              required
              defaultValue={entry.hoursWorkedWeek2 ?? ""}
              placeholder="Week 2"
              className="py-1 w-24"
            />
          </>
        ) : (
          <Input
            name="hoursWorked"
            type="number"
            step="0.25"
            min="0"
            required
            defaultValue={entry.hoursWorked}
            className="py-1 w-24"
          />
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
      <span>
        {formatDate(entry.periodStart)} – {formatDate(entry.periodEnd)}
      </span>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:justify-end">
        <span className="text-muted-foreground">
          {entry.hoursWorkedWeek2 != null
            ? `${entry.hoursWorked} + ${entry.hoursWorkedWeek2} hrs`
            : `${entry.hoursWorked} hrs`}
        </span>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(true)} className={editButtonClass}>
            Edit
          </button>
          <button
            onClick={async () => {
              const ok = await confirmDialog({
                title: "Delete pay period?",
                description: "This logged pay period will be removed. This cannot be undone.",
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
