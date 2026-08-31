"use client";

import { useState, ReactNode } from "react";

type Tab = {
  key: string;
  label: string;
  content: ReactNode;
};

export function TabsShell({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  function selectTab(key: string) {
    if (key === active) return;
    const startTransition = (document as unknown as { startViewTransition?: (cb: () => void) => void })
      .startViewTransition;
    if (startTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      startTransition.call(document, () => setActive(key));
    } else {
      setActive(key);
    }
  }

  return (
    <div>
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => selectTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-t-md ${
              active === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.key} hidden={active !== tab.key} style={{ viewTransitionName: "tab-content" }}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
