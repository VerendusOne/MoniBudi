"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createProfile, deleteProfile } from "@/lib/actions/profiles";
import { createPayAccount, deletePayAccount } from "@/lib/actions/payAccounts";

type SidebarProfile = {
  id: string;
  name: string;
  payAccounts: { id: string; name: string }[];
};

export function Sidebar({ profiles }: { profiles: SidebarProfile[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newAccountFor, setNewAccountFor] = useState<string | null>(null);
  const [addingProfile, setAddingProfile] = useState(false);

  return (
    <nav className="w-64 shrink-0 border-r border-border p-4 flex flex-col gap-5 overflow-y-auto">
      {profiles.map((profile) => {
        const isActiveProfile = pathname.startsWith(`/dashboard/${profile.id}`);
        return (
          <div key={profile.id}>
            <div className="flex items-center justify-between group">
              <a
                href={`/dashboard/${profile.id}`}
                className={`text-sm font-semibold ${
                  isActiveProfile ? "text-accent" : "text-foreground"
                }`}
              >
                {profile.name}
              </a>
              <button
                onClick={async () => {
                  if (!confirm(`Delete profile "${profile.name}" and all its accounts?`))
                    return;
                  await deleteProfile(profile.id);
                  router.push("/dashboard");
                  router.refresh();
                }}
                className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
              >
                ✕
              </button>
            </div>

            <div className="mt-1.5 flex flex-col gap-0.5">
              {profile.payAccounts.map((account) => {
                const isActiveAccount = pathname === `/dashboard/${profile.id}/${account.id}`;
                return (
                  <div key={account.id} className="flex items-center justify-between group">
                    <a
                      href={`/dashboard/${profile.id}/${account.id}`}
                      className={`flex-1 text-sm px-2 py-1.5 rounded-lg transition-colors ${
                        isActiveAccount
                          ? "bg-accent/10 text-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {account.name}
                    </a>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete account "${account.name}"?`)) return;
                        await deletePayAccount(profile.id, account.id);
                        router.push(`/dashboard/${profile.id}`);
                        router.refresh();
                      }}
                      className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity px-1"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              {newAccountFor === profile.id ? (
                <form
                  action={async (formData: FormData) => {
                    await createPayAccount(profile.id, formData);
                    setNewAccountFor(null);
                    router.refresh();
                  }}
                  className="flex gap-1 mt-1"
                >
                  <input
                    name="name"
                    autoFocus
                    placeholder="Account name"
                    className="min-w-0 flex-1 px-2 py-1 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-accent"
                  />
                  <button type="submit" className="text-xs text-accent px-1">
                    Add
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setNewAccountFor(profile.id)}
                  className="text-left text-xs text-muted-foreground hover:text-accent px-2 py-1 transition-colors"
                >
                  + Add account
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div className="pt-2 border-t border-border">
        {addingProfile ? (
          <form
            action={async (formData: FormData) => {
              await createProfile(formData);
              setAddingProfile(false);
              router.refresh();
            }}
            className="flex gap-1"
          >
            <input
              name="name"
              autoFocus
              placeholder="Profile name"
              className="min-w-0 flex-1 px-2 py-1 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-accent"
            />
            <button type="submit" className="text-xs text-accent px-1">
              Add
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAddingProfile(true)}
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            + New Profile
          </button>
        )}
      </div>
    </nav>
  );
}
