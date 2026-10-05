"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string; // "true" quand coché, "" sinon
  onChange: (v: string) => void;
  onSubmit: () => void;
  label: string;
};

export function CheckboxField({ value, onChange, onSubmit, label }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const checked = value === "true";

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onChange(checked ? "" : "true")}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (checked) onSubmit();
          else onChange("true");
        }
        if (e.key === " ") {
          e.preventDefault();
          onChange(checked ? "" : "true");
        }
      }}
      role="checkbox"
      aria-checked={checked}
      className="w-full text-left flex items-start gap-3 px-4 py-3 border-2 transition-all"
      style={{
        borderColor: checked ? "var(--accent)" : "var(--border)",
        background: checked
          ? "color-mix(in oklab, var(--accent) 10%, transparent)"
          : "transparent",
        borderRadius: "var(--radius)",
        color: "var(--text)",
      }}
    >
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-6 h-6 shrink-0 mt-0.5 transition-all"
        style={{
          border: `2px solid ${checked ? "var(--accent)" : "var(--border)"}`,
          background: checked ? "var(--accent)" : "transparent",
          color: "var(--accent-text)",
          borderRadius: `calc(var(--radius) * 0.35)`,
        }}
      >
        {checked ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M2 7.5L5.5 11L12 3.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span className="text-[14px] md:text-[15px] font-medium leading-relaxed">
        {label}
      </span>
    </button>
  );
}
