"use client";

import { useActionState } from "react";
import { Input } from "@/components/Input";
import { SubmitButton } from "@/components/SubmitButton";
import { updateUserProfile } from "@/lib/actions/account";

type State = { error: string | null };

export function AccountForm({
  name,
  email,
}: {
  name: string | null;
  email: string | null;
}) {
  const [state, formAction] = useActionState<State, FormData>(
    async (_prev, formData) => updateUserProfile(formData),
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm text-muted-foreground">
        Name
        <Input name="name" defaultValue={name ?? ""} placeholder="Your name" className="mt-1" />
      </label>
      <label className="text-sm text-muted-foreground">
        Email
        <Input
          name="email"
          type="email"
          required
          defaultValue={email ?? ""}
          className="mt-1"
        />
      </label>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      <SubmitButton className="self-start" pendingLabel="Saving…">
        Save
      </SubmitButton>
    </form>
  );
}
