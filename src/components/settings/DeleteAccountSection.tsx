"use client";

import { useState } from "react";
import { deleteUserAccount } from "@/lib/actions/account";
import { useConfirm } from "@/components/ConfirmDialog";

export function DeleteAccountSection() {
  const confirmDialog = useConfirm();
  const [pending, setPending] = useState(false);

  return (
    <section className="border border-red-500/30 rounded-2xl p-6 flex flex-col gap-3">
      <h2 className="font-medium text-red-500">Delete Account</h2>
      <p className="text-sm text-muted-foreground">
        Permanently deletes your login and every profile, job, and record of
        data attached to it. This cannot be undone.
      </p>
      <button
        disabled={pending}
        onClick={async () => {
          const ok = await confirmDialog({
            title: "Delete your account?",
            description:
              "This permanently deletes your login and every profile, job, and record of data attached to it. This cannot be undone.",
            confirmLabel: "Delete my account",
            destructive: true,
          });
          if (!ok) return;
          setPending(true);
          await deleteUserAccount();
        }}
        className="self-start px-4 py-2 rounded-full text-sm font-medium border border-red-500 text-red-500 transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] hover:bg-red-500 hover:text-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none"
      >
        {pending ? "Deleting…" : "Delete my account"}
      </button>
    </section>
  );
}
