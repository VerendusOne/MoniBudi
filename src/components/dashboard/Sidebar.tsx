"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createProfile } from "@/lib/actions/profiles";
import { createPayAccount } from "@/lib/actions/payAccounts";

type SidebarProfile = {
  id: string;
  name: string;
  payAccounts: { id: string; name: string }[];
};

export function Sidebar({
  profiles,
  onNavigate,
}: {
  profiles: SidebarProfile[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [newAccountFor, setNewAccountFor] = useState<string | null>(null);
  const [addingProfile, setAddingProfile] = useState(false);

  return (
    <nav className="w-64 h-full shrink-0 border-r border-border bg-background p-4 flex flex-col gap-5 overflow-y-auto">
      {profiles.map((profile) => {
        const isActiveProfile = pathname.startsWith(`/dashboard/${profile.id}`);
        return (
          <div key={profile.id}>
            <a
              href={`/dashboard/${profile.id}`}
              onClick={onNavigate}
              className={`text-sm font-semibold ${
                isActiveProfile ? "text-accent" : "text-foreground"
              }`}
            >
              {profile.name}
            </a>

            <div className="mt-1.5 flex flex-col gap-0.5">
              {profile.payAccounts.map((account) => {
                const isActiveAccount = pathname === `/dashboard/${profile.id}/${account.id}`;
                return (
                  <a
                    key={account.id}
                    href={`/dashboard/${profile.id}/${account.id}`}
                    onClick={onNavigate}
                    className={`text-sm px-2 py-1.5 rounded-lg transition-colors ${
                      isActiveAccount
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {account.name}
                  </a>
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
                    placeholder="Job name"
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
                  + Add Job
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
