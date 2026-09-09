"use client";

import { useState, useRef, FormEvent } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { CategoryCombobox } from "@/components/dashboard/CategoryCombobox";
import { FrequencyOptions } from "@/components/dashboard/ExpenseItemRow";

type Category = { id: string; name: string };
type Kind = "expense" | "savings";
type AmountType = "FLAT" | "PERCENT_OF_GROSS";

export function AddExpenseOrSavings({
  categories,
  onAddExpense,
  onAddSavings,
}: {
  categories: Category[];
  onAddExpense: (formData: FormData) => Promise<void>;
  onAddSavings: (formData: FormData) => Promise<void>;
}) {
  const [kind, setKind] = useState<Kind>("expense");
  const [amountType, setAmountType] = useState<AmountType>("FLAT");
  const [comboKey, setComboKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function selectKind(next: Kind) {
    setKind(next);
    setAmountType("FLAT");
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    setPending(true);
    try {
      if (kind === "expense") {
        await onAddExpense(formData);
      } else {
        await onAddSavings(formData);
      }
      formRef.current?.reset();
      setAmountType("FLAT");
      setComboKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="bg-card border border-border/60 scroll-reveal rounded-2xl card-shadow p-6 lg:p-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base lg:text-lg font-semibold">Add</h2>
        <div className="inline-flex rounded-full bg-muted p-1 gap-1">
          {(["expense", "savings"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => selectKind(k)}
              className={`px-4 py-1.5 rounded-full text-sm transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                kind === k
                  ? "gradient-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {k === "expense" ? "Expense" : "Savings"}
            </button>
          ))}
        </div>
      </div>

      <form key={kind} ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="text-sm text-muted-foreground">
          Name
          <Input
            name="name"
            placeholder={kind === "expense" ? "e.g. Rent" : "e.g. 401k"}
            required
            className="mt-1"
          />
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="text-sm text-muted-foreground flex-1">
            Type
            <Select
              name="amountType"
              value={amountType}
              onChange={(e) => setAmountType(e.target.value as AmountType)}
              className="mt-1"
            >
              <option value="FLAT">Flat amount</option>
              <option value="PERCENT_OF_GROSS">% of gross pay</option>
            </Select>
          </label>
          <label className="text-sm text-muted-foreground flex-1">
            Amount
            <Input
              name="flatAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Flat $ amount"
              className="mt-1"
            />
          </label>
          <label className="text-sm text-muted-foreground flex-1">
            Percent
            <Input
              name="percent"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="% of gross"
              className="mt-1"
            />
          </label>
        </div>
        <label className="text-sm text-muted-foreground">
          Frequency <span className="text-xs">(only applies to a flat amount)</span>
          <Select name="frequency" defaultValue={kind === "expense" ? "MONTHLY" : "PER_PAYCHECK"} className="mt-1">
            <FrequencyOptions />
          </Select>
        </label>
        {kind === "expense" && (
          <label className="text-sm text-muted-foreground">
            Category
            <CategoryCombobox key={comboKey} name="categoryId" categories={categories} />
          </label>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Saving…" : `Add ${kind === "expense" ? "Expense" : "Savings Item"}`}
        </Button>
      </form>
    </section>
  );
}
