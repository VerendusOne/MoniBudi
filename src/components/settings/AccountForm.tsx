"use client";

import { useActionState } from "react";
import { Input } from "@/components/Input";
import { SubmitButton } from "@/components/SubmitButton";
import { AvatarUpload } from "@/components/settings/AvatarUpload";
import { updateUserProfile } from "@/lib/actions/account";

type State = { error: string | null };

export function AccountForm({
  name,
  email,
  avatarUrl,
}: {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}) {
  const [state, formAction] = useActionState<State, FormData>(
    async (_prev, formData) => updateUserProfile(formData),
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <AvatarUpload avatarUrl={avatarUrl} name={name} email={email} />
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
