"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type GroupMember = { first: string; last: string };

type Props = {
  value: string; // JSON.stringify(GroupMember[])
  onChange: (v: string) => void;
  onSubmit: () => void;
  max?: number;
};

function parse(v: string): GroupMember[] {
  if (!v) return [];
  try {
    const arr = JSON.parse(v);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((m) => ({
        first: String(m?.first ?? "").slice(0, 60),
        last: String(m?.last ?? "").slice(0, 60),
      }))
      .filter((m) => m.first || m.last);
  } catch {
    return [];
  }
}

function serialize(members: GroupMember[]): string {
  const cleaned = members
    .map((m) => ({ first: m.first.trim(), last: m.last.trim() }))
    .filter((m) => m.first || m.last);
  return cleaned.length ? JSON.stringify(cleaned) : "";
}

export function GroupMembersField({ value, onChange, onSubmit, max = 4 }: Props) {
  const initial = useMemo(() => parse(value), [value]);
  const [members, setMembers] = useState<GroupMember[]>(
    initial.length ? initial : [{ first: "", last: "" }]
  );
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  useEffect(() => {
    onChange(serialize(members));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  function update(i: number, patch: Partial<GroupMember>) {
    setMembers((arr) => arr.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  function remove(i: number) {
    setMembers((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr));
  }

  function add() {
    if (members.length >= max) return;
    setMembers((arr) => [...arr, { first: "", last: "" }]);
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {members.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-[1fr_1fr_auto] gap-2"
          >
            <input
              ref={i === 0 ? firstRef : undefined}
              type="text"
              value={m.first}
              onChange={(e) => update(i, { first: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && members.some((mm) => mm.first.trim() || mm.last.trim())) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              placeholder="Prénom"
              className="min-w-0 px-3 py-3 text-[15px] font-medium border-2 transition-colors placeholder:opacity-40"
              style={{
                borderColor: m.first ? "var(--border-focus)" : "var(--border)",
                borderRadius: "var(--radius)",
                background: "transparent",
                color: "var(--text)",
                caretColor: "var(--accent)",
              }}
            />
            <input
              type="text"
              value={m.last}
              onChange={(e) => update(i, { last: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && members.some((mm) => mm.first.trim() || mm.last.trim())) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              placeholder="Nom"
              className="min-w-0 px-3 py-3 text-[15px] font-medium border-2 transition-colors placeholder:opacity-40"
              style={{
                borderColor: m.last ? "var(--border-focus)" : "var(--border)",
                borderRadius: "var(--radius)",
                background: "transparent",
                color: "var(--text)",
                caretColor: "var(--accent)",
              }}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={members.length === 1}
              aria-label="Retirer ce membre"
              className="w-11 flex items-center justify-center text-[16px] border-2 transition-colors disabled:opacity-30"
              style={{
                borderColor: "var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--muted)",
                background: "transparent",
              }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {members.length < max ? (
        <button
          type="button"
          onClick={add}
          className="text-[13px] font-medium px-4 py-2.5 border-2 border-dashed transition-colors hover:opacity-80 self-start"
          style={{
            borderColor: "var(--border)",
            color: "var(--muted)",
            borderRadius: "var(--radius)",
          }}
        >
          + Ajouter un membre ({members.length}/{max})
        </button>
      ) : (
        <div className="text-[12px]" style={{ color: "var(--muted)" }}>
          Maximum {max} co-participants atteint.
        </div>
      )}
    </div>
  );
}
