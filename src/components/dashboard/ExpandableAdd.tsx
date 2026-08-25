"use client";

import { useState, ReactNode } from "react";
import { SubmitButton } from "@/components/SubmitButton";

export function ExpandableAdd({
  label,
  action,
  children,
}: {
  label: string;
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="self-start text-sm text-accent hover:opacity-80 transition-opacity"
      >
        + {label}
      </button>
    );
  }

  return (
    <form
      action={async (formData: FormData) => {
        try {
          await action(formData);
          setOpen(false);
        } catch {
          // A failed save (e.g. a transient database blip) used to crash
          // the whole page with no way to recover except a hard refresh.
          // Keep the form open with what was typed so nothing is lost,
          // and let the user retry.
          setError("Could not save — please try again.");
        }
      }}
      className="flex flex-col gap-3"
    >
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3 items-center">
        <SubmitButton>Save</SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
