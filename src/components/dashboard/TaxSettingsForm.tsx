"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { SubmitButton } from "@/components/SubmitButton";

type State = { code: string; name: string };

export function TaxSettingsForm({
  state,
  city,
  states,
  onSave,
}: {
  state: string | null;
  city: string | null;
  states: State[];
  onSave: (formData: FormData) => Promise<void>;
}) {
  const [editing, setEditing] = useState(!state);
  const stateName = states.find((s) => s.code === state)?.name;

  if (!editing) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span>
          {stateName}
          {city && <span className="text-muted-foreground"> · {city}</span>}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="text-accent hover:opacity-80 transition-opacity"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form
      action={async (formData: FormData) => {
        await onSave(formData);
        setEditing(false);
      }}
      className="flex flex-col gap-3"
    >
      <label className="text-sm text-muted-foreground">
        State
        <Select name="state" required defaultValue={state ?? ""} className="mt-1">
          <option value="" disabled>
            Select a state
          </option>
          {states.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="text-sm text-muted-foreground">
        City <span className="text-xs">(optional, not yet used in the estimate)</span>
        <Input name="city" defaultValue={city ?? ""} placeholder="e.g. New York" className="mt-1" />
      </label>
      <div className="flex gap-3 items-center">
        <SubmitButton>Save</SubmitButton>
        {state && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
