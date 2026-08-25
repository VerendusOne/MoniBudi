"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid rendering theme-dependent UI until mounted, since the server
  // can't know the user's stored preference (next-themes reads it from
  // localStorage on the client only).
  useEffect(() => setMounted(true), []);

  return (
    <div className="inline-flex rounded-full bg-muted p-1 gap-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`px-4 py-1.5 rounded-full text-sm transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            mounted && theme === opt.value
              ? "bg-accent text-accent-foreground glow-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
