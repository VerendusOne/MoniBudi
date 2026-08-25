"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/Input";

type Category = { id: string; name: string };

export function CategoryCombobox({
  name,
  categories,
  defaultCategoryId = "",
  defaultCategoryName = "",
}: {
  name: string;
  categories: Category[];
  defaultCategoryId?: string;
  defaultCategoryName?: string;
}) {
  const [query, setQuery] = useState(defaultCategoryName);
  const [selectedId, setSelectedId] = useState(defaultCategoryId);
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function select(category: Category) {
    setSelectedId(category.id);
    setQuery(category.name);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selectedId} />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedId("");
          setHighlight(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            if (filtered[highlight]) {
              e.preventDefault();
              select(filtered[highlight]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Type to search categories…"
        autoComplete="off"
        className="mt-1"
      />
      {open && (
        <div
          className="pop-in absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-lg origin-top"
          {...(!entered ? { "data-closed": true } : {})}
        >
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No matching categories. Add one below if needed.
            </p>
          )}
          {filtered.map((c, i) => (
            <button
              type="button"
              key={c.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(c)}
              className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                i === highlight ? "bg-muted" : "hover:bg-muted"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      {!selectedId && query && !open && (
        <p className="text-xs text-red-500 mt-1">
          Select a category from the list.
        </p>
      )}
    </div>
  );
}
