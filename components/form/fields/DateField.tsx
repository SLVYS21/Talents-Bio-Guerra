"use client";

import { useEffect, useMemo, useRef } from "react";

type Props = {
  value: string; // ISO YYYY-MM-DD
  onChange: (v: string) => void;
  onSubmit: () => void;
  minYearsAgo?: number; // ex. 100 → max 100 ans dans le passé
};

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function offsetYearsISO(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DateField({ value, onChange, onSubmit, minYearsAgo = 100 }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  const max = useMemo(() => todayISO(), []);
  const min = useMemo(() => offsetYearsISO(minYearsAgo), [minYearsAgo]);

  return (
    <input
      ref={ref}
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSubmit();
        }
      }}
      className="w-full text-[16px] md:text-[17px] font-medium px-4 py-3 border-2 transition-colors"
      style={{
        borderColor: value ? "var(--border-focus)" : "var(--border)",
        borderRadius: "var(--radius)",
        background: "transparent",
        color: "var(--text)",
        caretColor: "var(--accent)",
        colorScheme: "dark",
      }}
    />
  );
}
