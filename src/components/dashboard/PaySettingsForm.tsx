"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";

type PaySettings = {
  hourlyRate: number;
  defaultHoursPerWeek: number;
  payFrequency: string;
} | null;

export function PaySettingsForm({
  paySettings,
  onSave,
}: {
  paySettings: PaySettings;
  onSave: (formData: FormData) => Promise<void>;
}) {
  // Controlled inputs, and submitted via onSubmit rather than the <form
  // action> prop: React's built-in action-reset behavior resets a <select>
  // to whatever option was marked `selected` in the ORIGINAL server-rendered
  // HTML, at the DOM level, bypassing React's controlled `value` tracking
  // entirely (no re-render follows to correct it) - so the dropdown could
  // silently snap back to the pre-edit choice a moment after a successful
  // save. Handling submission manually avoids that reset path altogether.
  const [hourlyRate, setHourlyRate] = useState(paySettings ? String(paySettings.hourlyRate) : "");
  const [defaultHoursPerWeek, setDefaultHoursPerWeek] = useState(
    paySettings ? String(paySettings.defaultHoursPerWeek) : "",
  );
  const [payFrequency, setPayFrequency] = useState(paySettings?.payFrequency ?? "BIWEEKLY");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPending(true);
    try {
      await onSave(formData);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm text-muted-foreground">
        Hourly rate
        <Input
          name="hourlyRate"
          type="number"
          step="0.01"
          min="0"
          required
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          className="mt-1"
        />
      </label>
      <label className="text-sm text-muted-foreground">
        Default hours per week
        <Input
          name="defaultHoursPerWeek"
          type="number"
          step="0.5"
          min="0"
          required
          value={defaultHoursPerWeek}
          onChange={(e) => setDefaultHoursPerWeek(e.target.value)}
          className="mt-1"
        />
      </label>
      <label className="text-sm text-muted-foreground">
        Pay frequency
        <Select
          name="payFrequency"
          value={payFrequency}
          onChange={(e) => setPayFrequency(e.target.value)}
          className="mt-1"
        >
          <option value="WEEKLY">Weekly</option>
          <option value="BIWEEKLY">Biweekly</option>
          <option value="SEMI_MONTHLY">Semi-monthly</option>
          <option value="MONTHLY">Monthly</option>
        </Select>
      </label>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save Pay Settings"}
      </Button>
    </form>
  );
}
