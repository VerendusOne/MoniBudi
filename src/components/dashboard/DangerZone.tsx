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
    <section className="border border-red-500/30 rounded-2xl p-6 flex flex-col gap-3">
      <h2 className="font-medium text-red-500">Danger Zone</h2>
      <p className="text-sm text-muted-foreground">
        Deleting the {label} &quot;{itemName}&quot; removes all of its data
        permanently. This can&apos;t be undone.
      </p>
      <button
        disabled={pending}
        onClick={async () => {
          if (!confirm(`Delete the ${label} "${itemName}"? This cannot be undone.`)) return;
          setPending(true);
          await onDelete();
          router.push(redirectTo);
          router.refresh();
        }}
        className="self-start px-4 py-2 rounded-full text-sm font-medium border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
      >
        {pending ? "Deleting…" : `Delete this ${label}`}
      </button>
    </section>
  );
}
