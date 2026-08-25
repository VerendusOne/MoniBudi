"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [visible, setVisible] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  // Flip to visible a frame after mount so the CSS transition (rather than
  // an instant jump to the open state) actually plays on entry.
  useEffect(() => {
    if (!pending) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [pending]);

  useEffect(() => {
    if (pending) cancelRef.current?.focus();
  }, [pending]);

  function settle(result: boolean) {
    pending?.resolve(result);
    setVisible(false);
    setTimeout(() => setPending(null), 150);
  }

  useEffect(() => {
    if (!pending) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") settle(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          onClick={() => settle(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 transition-opacity duration-150 ease-[var(--ease-out)]"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm origin-center rounded-2xl border border-border/60 bg-card card-shadow p-6 flex flex-col gap-4 transition-[opacity,transform] duration-150 ease-[var(--ease-out)]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0.95)",
            }}
          >
            <div className="flex flex-col gap-1.5">
              <h2 id="confirm-dialog-title" className="text-base font-semibold">
                {pending.title}
              </h2>
              {pending.description && (
                <p className="text-sm text-muted-foreground">{pending.description}</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => settle(false)}
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground transition-[background-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-muted active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {pending.cancelLabel ?? "Cancel"}
              </button>
              {pending.destructive ? (
                <button
                  type="button"
                  onClick={() => settle(true)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium bg-red-500 text-white transition-[transform,opacity] duration-150 ease-[var(--ease-out)] hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {pending.confirmLabel ?? "Confirm"}
                </button>
              ) : (
                <Button type="button" onClick={() => settle(true)}>
                  {pending.confirmLabel ?? "Confirm"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
