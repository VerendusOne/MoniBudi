"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/Input";
import { Toggle } from "@/components/Toggle";
import { Button } from "@/components/Button";

type OvertimeRule = { thresholdHours: number; multiplier: number } | null;
type Tier2 = { thresholdHours: number; multiplier: number } | null;

export function OvertimeRuleForm({
  overtimeRule,
  tier2,
  onSave,
}: {
  overtimeRule: OvertimeRule;
  tier2: Tier2;
  onSave: (formData: FormData) => Promise<void>;
}) {
  // Controlled inputs submitted via onSubmit rather than the <form action>
  // prop — see the comment in PaySettingsForm for why: React's built-in
  // action-reset can silently revert a controlled field (select, checkbox)
  // back to what the server originally rendered, bypassing React state,
  // with no re-render to fix it. onSubmit avoids that reset path entirely.
  const [thresholdHours, setThresholdHours] = useState(
    overtimeRule ? String(overtimeRule.thresholdHours) : "40",
  );
  const [multiplier, setMultiplier] = useState(overtimeRule ? String(overtimeRule.multiplier) : "1.5");
  const [tier2ThresholdHours, setTier2ThresholdHours] = useState(
    tier2 ? String(tier2.thresholdHours) : "",
  );
  const [tier2Multiplier, setTier2Multiplier] = useState(tier2 ? String(tier2.multiplier) : "");
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
      <Toggle name="enabled" defaultChecked={!!overtimeRule} label="Apply overtime rules to this job" />
      <label className="text-sm text-muted-foreground">
        Overtime starts after this many hours in a week
        <Input
          name="thresholdHours"
          type="number"
          step="0.5"
          min="0"
          value={thresholdHours}
          onChange={(e) => setThresholdHours(e.target.value)}
          className="mt-1"
        />
        <span className="block text-xs mt-1">
          e.g. 40 — work 40 hours or fewer and every hour is paid at your normal rate.
        </span>
      </label>
      <label className="text-sm text-muted-foreground">
        Overtime pay rate
        <Input
          name="multiplier"
          type="number"
          step="0.1"
          min="1"
          value={multiplier}
          onChange={(e) => setMultiplier(e.target.value)}
          className="mt-1"
        />
        <span className="block text-xs mt-1">
          e.g. 1.5 = &quot;time-and-a-half.&quot; Hours past the threshold above get
          paid at your hourly rate × this number.
        </span>
      </label>
      <p className="text-xs text-muted-foreground pt-1">
        Optional: a second, higher tier for extreme hours (e.g. double-time
        after 60 hrs/week). Leave blank if this doesn&apos;t apply to you.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="text-sm text-muted-foreground flex-1">
          Second tier starts after
          <Input
            name="tier2ThresholdHours"
            type="number"
            step="0.5"
            min="0"
            value={tier2ThresholdHours}
            onChange={(e) => setTier2ThresholdHours(e.target.value)}
            className="mt-1"
          />
          <span className="block text-xs mt-1">Hours per week, e.g. 60.</span>
        </label>
        <label className="text-sm text-muted-foreground flex-1">
          Second tier pay rate
          <Input
            name="tier2Multiplier"
            type="number"
            step="0.1"
            min="1"
            value={tier2Multiplier}
            onChange={(e) => setTier2Multiplier(e.target.value)}
            className="mt-1"
          />
          <span className="block text-xs mt-1">e.g. 2.0 = double-time.</span>
        </label>
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save Overtime Rule"}
      </Button>
    </form>
  );
}
