"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/ConfirmDialog";

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
  const confirmDialog = useConfirm();
  const [pending, setPending] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-2 text-xs text-muted-foreground">
      <span>Permanently delete this {label} and all of its data.</span>
      <button
        disabled={pending}
        onClick={async () => {
          const ok = await confirmDialog({
            title: `Delete ${label}?`,
            description: `"${itemName}" and everything attached to it will be permanently deleted. This cannot be undone.`,
            confirmLabel: `Delete ${label}`,
            destructive: true,
          });
          if (!ok) return;
          setPending(true);
          await onDelete();
          router.push(redirectTo);
          router.refresh();
        }}
        className="shrink-0 rounded-md px-1.5 py-0.5 text-red-500 transition-[color,transform] duration-150 ease-[var(--ease-out)] hover:text-red-400 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none"
      >
        {pending ? "Deleting…" : `Delete ${label}`}
      </button>
    </div>
  );
}
