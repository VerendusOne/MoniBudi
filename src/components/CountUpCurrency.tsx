"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { formatCurrency } from "@/lib/format";

export function CountUpCurrency({
  value,
  className,
  style,
}: {
  value: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    const duration = 900;
    let start: number | null = null;
    let raf = 0;

    function tick(timestamp: number) {
      if (start === null) start = timestamp;
      const t = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    fromRef.current = to;
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className={className} style={style}>
      {formatCurrency(display)}
    </span>
  );
}
