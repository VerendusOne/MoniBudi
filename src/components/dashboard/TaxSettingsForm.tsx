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
  // Mirrors the last-saved values locally so the collapsed view can update
  // the instant a save completes, instead of flashing stale/empty content
  // while waiting for the server round-trip's fresh props to land.
  const [savedState, setSavedState] = useState(state);
  const [savedCity, setSavedCity] = useState(city);
  const stateName = states.find((s) => s.code === savedState)?.name;

  if (!editing) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span>
          {stateName}
          {savedCity && <span className="text-muted-foreground"> · {savedCity}</span>}
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
        const newState = String(formData.get("state") ?? "");
        const newCity = String(formData.get("city") ?? "").trim();
        setSavedState(newState);
        setSavedCity(newCity || null);
        setEditing(false);
        await onSave(formData);
      }}
      className="flex flex-col gap-3"
    >
      <label className="text-sm text-muted-foreground">
        State
        <Select name="state" required defaultValue={savedState ?? ""} className="mt-1">
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
        <Input name="city" defaultValue={savedCity ?? ""} placeholder="e.g. New York" className="mt-1" />
      </label>
      <div className="flex gap-3 items-center">
        <SubmitButton>Save</SubmitButton>
        {savedState && (
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
