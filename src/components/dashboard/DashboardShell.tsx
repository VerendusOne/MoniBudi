"use client";

import { useState, ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

type SidebarProfile = {
  id: string;
  name: string;
  payAccounts: { id: string; name: string }[];
};

export function DashboardShell({
  profiles,
  userEmail,
  signOutForm,
  children,
}: {
  profiles: SidebarProfile[];
  userEmail: string | null | undefined;
  signOutForm: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-border px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-foreground -ml-1 p-1"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <a href="/dashboard" className="font-semibold">
            Budget App
          </a>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{userEmail}</span>
          <a
            href="/dashboard/settings"
            aria-label="Settings"
            className="hover:text-accent transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </a>
          {signOutForm}
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        {open && (
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
        <div
          className={`fixed md:static inset-y-0 left-0 z-50 bg-background transition-transform duration-200 md:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar profiles={profiles} onNavigate={() => setOpen(false)} />
        </div>
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
