"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DangerZone({
  label,
  itemName,
  onDelete,
  redirectTo,
}: {
  label: string;
  itemName: string;
  onDelete: () => Promise<void>;
  redirectTo: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-2 text-xs text-muted-foreground">
      <span>Permanently delete this {label} and all of its data.</span>
      <button
        disabled={pending}
        onClick={async () => {
          if (!confirm(`Delete the ${label} "${itemName}"? This cannot be undone.`)) return;
          setPending(true);
          await onDelete();
          router.push(redirectTo);
          router.refresh();
        }}
        className="shrink-0 text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
      >
        {pending ? "Deleting…" : `Delete ${label}`}
      </button>
    </div>
  );
}
