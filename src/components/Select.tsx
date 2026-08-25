import { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}
