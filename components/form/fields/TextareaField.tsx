"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  maxLength?: number;
};

export function TextareaField({ value, onChange, onSubmit, placeholder, maxLength }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const count = value.length;
  const showCounter = typeof maxLength === "number" && maxLength > 0;
  const nearLimit = showCounter && count / (maxLength as number) > 0.8;

  return (
    <div className="w-full">
      <textarea
        ref={ref}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        rows={4}
        className="w-full text-[16px] md:text-[15px] font-medium px-4 py-3 border-2 transition-colors placeholder:opacity-40 resize-none"
        style={{
          borderColor: value ? "var(--border-focus)" : "var(--border)",
          borderRadius: "var(--radius)",
          background: "transparent",
          color: "var(--text)",
          caretColor: "var(--accent)",
        }}
      />
      {showCounter ? (
        <div
          className="mt-1.5 text-[11px] text-right tabular-nums transition-colors"
          style={{ color: nearLimit ? "var(--accent)" : "var(--muted)" }}
        >
          {count} / {maxLength}
        </div>
      ) : null}
    </div>
  );
}
