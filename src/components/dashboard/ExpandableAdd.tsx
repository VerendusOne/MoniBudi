"use client";

import { useEffect, useState, ReactNode } from "react";
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
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="self-start rounded-md text-sm text-accent transition-[opacity,transform] duration-150 ease-[var(--ease-out)] hover:opacity-80 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
      className="rise-in flex flex-col gap-3"
      {...(!entered ? { "data-closed": true } : {})}
    >
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3 items-center">
        <SubmitButton>Save</SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-1 py-0.5 text-sm text-muted-foreground transition-[color,transform] duration-150 ease-[var(--ease-out)] hover:text-foreground active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
