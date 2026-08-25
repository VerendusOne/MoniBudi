"use client";

import { useState } from "react";
import { useConfirm } from "@/components/ConfirmDialog";

type Category = { id: string; name: string };

export function CategoryChips({
  categories,
  onDelete,
}: {
  categories: Category[];
  onDelete: (categoryId: string) => Promise<void>;
}) {
  const confirmDialog = useConfirm();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <span
            key={c.id}
            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-muted text-sm"
          >
            {c.name}
            <button
              type="button"
              disabled={pendingId === c.id}
              aria-label={`Delete ${c.name}`}
              onClick={async () => {
                const ok = await confirmDialog({
                  title: "Delete category?",
                  description: `"${c.name}" will be removed from your categories.`,
                  confirmLabel: "Delete",
                  destructive: true,
                });
                if (!ok) return;
                setError(null);
                setPendingId(c.id);
                try {
                  await onDelete(c.id);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Could not delete category.");
                } finally {
                  setPendingId(null);
                }
              }}
              className="rounded-full text-muted-foreground transition-[color,transform] duration-150 ease-[var(--ease-out)] hover:text-red-500 active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none"
            >
              {pendingId === c.id ? "…" : "✕"}
            </button>
          </span>
        ))}
        {categories.length === 0 && (
          <p className="text-muted-foreground text-sm">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
