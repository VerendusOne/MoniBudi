"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

function RevealOnMount({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="rise-in" {...(!entered ? { "data-closed": true } : {})}>
      {children}
    </div>
  );
}

// Keying on pathname forces a fresh mount of RevealOnMount on every
// dashboard navigation, replaying its fade+rise entrance each time —
// gives page changes a settled, deliberate feel instead of an instant snap.
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <RevealOnMount key={pathname}>{children}</RevealOnMount>;
}
