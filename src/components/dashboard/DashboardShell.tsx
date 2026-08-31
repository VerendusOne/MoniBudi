"use client";

import { useState, ReactNode } from "react";
import Image from "next/image";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import { AmbientBackground } from "@/components/AmbientBackground";
import { PageTransition } from "@/components/dashboard/PageTransition";
import { Avatar } from "@/components/Avatar";

type SidebarProfile = {
  id: string;
  name: string;
  payAccounts: { id: string; name: string }[];
};

export function DashboardShell({
  profiles,
  userName,
  userEmail,
  avatarUrl,
  signOutForm,
  children,
}: {
  profiles: SidebarProfile[];
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  avatarUrl: string | null;
  signOutForm: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <ConfirmProvider>
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden text-foreground -ml-1 p-1.5 rounded-lg transition-[background-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.94] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <a href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Image src="/logo.png" alt="" width={24} height={24} className="rounded-md" />
              MoniBudi
            </a>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{userEmail}</span>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="rounded-full transition-[transform,box-shadow] duration-150 ease-[var(--ease-out)] active:scale-[0.94] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Avatar src={avatarUrl} name={userName} email={userEmail} size={32} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0 relative">
          <div
            aria-hidden={!menuOpen}
            onClick={() => setMenuOpen(false)}
            className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200 ease-[var(--ease-out)] ${
              menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
          <div
            className={`fixed md:static inset-y-0 left-0 z-50 bg-background transition-transform duration-200 ease-[var(--ease-drawer)] md:translate-x-0 ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar profiles={profiles} onNavigate={() => setMenuOpen(false)} />
          </div>
          <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
            <AmbientBackground />
            <PageTransition>{children}</PageTransition>
          </div>
        </div>

        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          name={userName ?? null}
          email={userEmail ?? null}
          avatarUrl={avatarUrl}
          signOutForm={signOutForm}
        />
      </div>
    </ConfirmProvider>
  );
}
