"use client";

import { useState } from "react";

export function Toggle({
  name,
  defaultChecked = false,
  label,
}: {
  name: string;
  defaultChecked?: boolean;
  label: string;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className="flex items-center gap-3 text-sm cursor-pointer select-none w-fit">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background ${
          checked ? "bg-accent glow-accent" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform duration-150 ease-[var(--ease-out)] ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      {label}
    </label>
  );
}
