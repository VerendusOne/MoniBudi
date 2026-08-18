"use client";

import { ReactNode } from "react";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { AccountForm } from "@/components/settings/AccountForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";

export function SettingsPanel({
  open,
  onClose,
  name,
  email,
  signOutForm,
}: {
  open: boolean;
  onClose: () => void;
  name: string | null;
  email: string | null;
  signOutForm: ReactNode;
}) {
  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l border-border overflow-y-auto transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Settings</h1>
            <button
              onClick={onClose}
              aria-label="Close settings"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <section className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-medium">Appearance</h2>
            <ThemeSelector />
          </section>

          <section className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-medium">Your Account</h2>
            <AccountForm name={name} email={email} />
          </section>

          <section className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-medium">Change Password</h2>
            <PasswordForm />
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            {signOutForm}
          </section>

          <DeleteAccountSection />
        </div>
      </div>
    </>
  );
}
