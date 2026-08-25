"use client";

import { useState } from "react";

type Category = { id: string; name: string };

export function CategoryChips({
  categories,
  onDelete,
}: {
  categories: Category[];
  onDelete: (categoryId: string) => Promise<void>;
}) {
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
                if (!confirm(`Delete category "${c.name}"?`)) return;
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
              className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {pendingId === c.id ? "…" : "✕"}
            </button>
          </span>
        ))}
        {categories.length === 0 && (
          <p className="text-muted-foreground text-sm">No custom categories yet.</p>
        )}
      </div>
    </div>
  );
}
