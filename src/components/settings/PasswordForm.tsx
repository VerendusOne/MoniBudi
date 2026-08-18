"use client";

import { useActionState, useRef } from "react";
import { Input } from "@/components/Input";
import { SubmitButton } from "@/components/SubmitButton";
import { changePassword } from "@/lib/actions/account";

type State = { error: string | null; success?: boolean };

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<State, FormData>(async (_prev, formData) => {
    const result = await changePassword(formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, { error: null });

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <label className="text-sm text-muted-foreground">
        Current password
        <Input name="currentPassword" type="password" required className="mt-1" />
      </label>
      <label className="text-sm text-muted-foreground">
        New password
        <Input
          name="newPassword"
          type="password"
          required
          minLength={8}
          placeholder="Min. 8 characters"
          className="mt-1"
        />
      </label>
      <label className="text-sm text-muted-foreground">
        Confirm new password
        <Input name="confirmPassword" type="password" required className="mt-1" />
      </label>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state.success && <p className="text-sm text-accent">Password updated.</p>}
      <SubmitButton className="self-start" pendingLabel="Updating…">
        Update Password
      </SubmitButton>
    </form>
  );
}
