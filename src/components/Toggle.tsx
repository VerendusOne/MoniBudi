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
        className="sr-only"
      />
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-accent glow-accent" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      {label}
    </label>
  );
}
