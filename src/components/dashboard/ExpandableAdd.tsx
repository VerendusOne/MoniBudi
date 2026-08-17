"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/Button";

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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start text-sm text-accent hover:opacity-80 transition-opacity"
      >
        + {label}
      </button>
    );
  }

  return (
    <form
      action={async (formData: FormData) => {
        await action(formData);
        setOpen(false);
      }}
      className="flex flex-col gap-3"
    >
      {children}
      <div className="flex gap-3 items-center">
        <Button type="submit">Save</Button>
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
