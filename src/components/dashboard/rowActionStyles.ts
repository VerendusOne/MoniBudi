// Shared Edit/Delete button styling for item rows (expenses, savings, extra
// income, pay periods) — kept in one place so press/focus states stay
// consistent across all four row components.
const base =
  "rounded-md px-1 py-0.5 transition-[color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const editButtonClass = `${base} text-muted-foreground hover:text-accent focus-visible:ring-accent`;
export const deleteButtonClass = `${base} text-muted-foreground hover:text-red-500 focus-visible:ring-red-500`;
