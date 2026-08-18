"use client";

import { useState } from "react";
import { deleteUserAccount } from "@/lib/actions/account";

export function DeleteAccountSection() {
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
          if (
            !confirm(
              "Delete your account and all of its data permanently? This cannot be undone.",
            )
          )
            return;
          setPending(true);
          await deleteUserAccount();
        }}
        className="self-start px-4 py-2 rounded-full text-sm font-medium border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete my account"}
      </button>
    </section>
  );
}
