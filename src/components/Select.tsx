import { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:border-accent transition-colors ${props.className ?? ""}`}
    />
  );
}
