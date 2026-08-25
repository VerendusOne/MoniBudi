"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export function InlineRenameHeading({
  name,
  onRename,
  headingClassName = "text-2xl font-semibold",
}: {
  name: string;
  onRename: (formData: FormData) => Promise<void>;
  headingClassName?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [pending, setPending] = useState(false);

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5">
        <h1 className={headingClassName}>{name}</h1>
        <button
          type="button"
          onClick={() => {
            setValue(name);
            setEditing(true);
          }}
          aria-label="Rename"
          className="p-1.5 rounded-lg text-muted-foreground transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] hover:bg-muted hover:text-foreground active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
          </svg>
        </button>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setPending(true);
    const formData = new FormData();
    formData.set("name", trimmed);
    try {
      await onRename(formData);
      setEditing(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        required
        className="text-2xl font-semibold py-1.5 px-3 w-auto max-w-xs"
      />
      <Button type="submit" disabled={pending} className="px-4 py-2 text-sm">
        {pending ? "Saving…" : "Save"}
      </Button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-[color,transform] duration-150 ease-[var(--ease-out)] hover:text-foreground active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Cancel
      </button>
    </form>
  );
}
