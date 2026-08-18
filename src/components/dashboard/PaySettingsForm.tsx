"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { SubmitButton } from "@/components/SubmitButton";

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
  // Controlled inputs, deliberately not relying on defaultValue: React
  // resets uncontrolled <form action> fields to their pre-submit values
  // once the action completes (even on success), which made the form
  // visibly "revert" right after a successful save.
  const [hourlyRate, setHourlyRate] = useState(paySettings ? String(paySettings.hourlyRate) : "");
  const [defaultHoursPerWeek, setDefaultHoursPerWeek] = useState(
    paySettings ? String(paySettings.defaultHoursPerWeek) : "",
  );
  const [payFrequency, setPayFrequency] = useState(paySettings?.payFrequency ?? "BIWEEKLY");

  return (
    <form action={onSave} className="flex flex-col gap-3">
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
      <SubmitButton className="self-start">Save Pay Settings</SubmitButton>
    </form>
  );
}
