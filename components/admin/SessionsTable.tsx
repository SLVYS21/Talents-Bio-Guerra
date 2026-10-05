"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Question } from "@/data/questions.default";

type Session = Record<string, string>;

type Filter = "all" | "completed" | "in_progress";

function fmtDate(iso: string): string {
  if (!iso) return "·";
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function displayAnswer(q: Question, raw: string | undefined): string {
  if (!raw) return "";
  const choice = q.choices?.find((c) => c.value === raw);
  return choice?.label ?? raw;
}

function isCopyable(q: Question): boolean {
  return q.type === "email" || q.type === "phone" || q.type === "country_phone";
}

export function SessionsTable({
  sessions,
  questions,
}: {
  sessions: Session[];
  questions: Question[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const totalQuestions = questions.length;

  // Identity fields, derived dynamically from question types
  const titleQuestion = useMemo(
    () =>
      questions.find((qq) => qq.type === "text") ??
      questions.find((qq) => qq.type !== "email" && qq.type !== "phone" && qq.type !== "country_phone") ??
      questions[0],
    [questions],
  );
  const subtitleQuestion = useMemo(
    () =>
      questions.find((qq) => qq.type === "email") ??
      questions.find((qq) => qq.type === "phone" || qq.type === "country_phone"),
    [questions],
  );

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const isCompleted = Boolean(s.completed_at);
      if (filter === "completed" && !isCompleted) return false;
      if (filter === "in_progress" && isCompleted) return false;
      if (q) {
        const needle = q.toLowerCase();
        const haystack = questions
          .map((qq) => displayAnswer(qq, s[qq.id]))
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [sessions, filter, q, questions]);

  const counts = useMemo(() => {
    let completed = 0;
    for (const s of sessions) if (s.completed_at) completed += 1;
    return { all: sessions.length, completed, in_progress: sessions.length - completed };
  }, [sessions]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <div
          className="flex items-center gap-1 p-1 self-start sm:self-auto overflow-x-auto no-scrollbar"
          style={{
            background: "color-mix(in oklab, var(--border) 40%, transparent)",
            borderRadius: "var(--radius)",
          }}
        >
          {(["all", "in_progress", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-[13px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5"
              style={{
                background: filter === f ? "var(--bg)" : "transparent",
                color: filter === f ? "var(--text)" : "var(--muted)",
                borderRadius: `calc(var(--radius) * 0.7)`,
                boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <span>
                {f === "all" ? "Toutes" : f === "completed" ? "Complètes" : "Incomplètes"}
              </span>
              <span
                className="text-[11px] tabular-nums px-1.5 py-0.5"
                style={{
                  background:
                    filter === f
                      ? "color-mix(in oklab, var(--accent) 14%, transparent)"
                      : "color-mix(in oklab, var(--border) 60%, transparent)",
                  color: filter === f ? "var(--accent)" : "var(--muted)",
                  borderRadius: `calc(var(--radius) * 0.4)`,
                }}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher…"
          className="flex-1 sm:min-w-[240px] px-4 py-2 text-[14px] border transition-colors"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            color: "var(--text)",
          }}
        />
        <a
          href="/api/admin/sessions"
          download="sessions.json"
          className="text-[13px] px-3 py-2 border transition-colors hover:opacity-70 text-center self-start sm:self-auto"
          style={{ borderColor: "var(--border)", borderRadius: "var(--radius)", color: "var(--muted)" }}
        >
          Export JSON
        </a>
      </div>

      {/* Desktop: table, wide with horizontal scroll to reveal every answer column */}
      <div
        className="hidden md:block overflow-x-auto border"
        style={{ borderColor: "var(--border)", borderRadius: "var(--radius)" }}
      >
        <table className="text-[14px]" style={{ minWidth: "100%", width: "max-content" }}>
          <thead>
            <tr style={{ background: "color-mix(in oklab, var(--border) 30%, transparent)" }}>
              {questions.map((qq, i) => (
                <Th key={qq.id} sticky={i === 0}>
                  {qq.label}
                </Th>
              ))}
              <Th>Étape</Th>
              <Th>Statut</Th>
              <Th>Maj</Th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={questions.length + 4}
                  className="px-4 py-10 text-center"
                  style={{ color: "var(--muted)" }}
                >
                  Aucune session pour ce filtre.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const isCompleted = Boolean(s.completed_at);
                const step = Number(s.current_step ?? 0);
                const progress = Math.round((step / Math.max(totalQuestions, 1)) * 100);
                return (
                  <tr key={s.session_id} style={{ borderTop: "1px solid var(--border)" }}>
                    {questions.map((qq, i) => {
                      const val = displayAnswer(qq, s[qq.id]);
                      const copyable = isCopyable(qq) && Boolean(s[qq.id]);
                      const isFirst = i === 0;
                      return (
                        <td
                          key={qq.id}
                          className={`px-4 py-3 align-top ${isFirst ? "font-medium whitespace-nowrap" : ""}`}
                          style={{
                            color: val ? "var(--text)" : "var(--muted)",
                            maxWidth: isFirst ? undefined : 280,
                            position: isFirst ? "sticky" : undefined,
                            left: isFirst ? 0 : undefined,
                            background: isFirst ? "var(--bg)" : undefined,
                            zIndex: isFirst ? 1 : undefined,
                          }}
                          title={val || undefined}
                        >
                          {copyable ? (
                            <ValueWithCopy value={s[qq.id]} display={val} />
                          ) : (
                            <div className={isFirst ? "" : "line-clamp-2 break-words"}>
                              {val || "·"}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-16 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "var(--border)" }}
                        >
                          <div
                            className="h-full"
                            style={{
                              background: "var(--accent)",
                              width: `${isCompleted ? 100 : progress}%`,
                            }}
                          />
                        </div>
                        <span className="text-[12px]" style={{ color: "var(--muted)" }}>
                          {isCompleted ? "100%" : `${progress}%`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusPill isCompleted={isCompleted} />
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      {fmtDate(s.last_updated_at)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/form-admin/${s.session_id}`}
                        className="text-[13px] font-medium hover:opacity-70"
                        style={{ color: "var(--accent)" }}
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div
            className="px-4 py-10 text-center border text-[14px]"
            style={{ color: "var(--muted)", borderColor: "var(--border)", borderRadius: "var(--radius)" }}
          >
            Aucune session pour ce filtre.
          </div>
        ) : (
          filtered.map((s) => {
            const isCompleted = Boolean(s.completed_at);
            const step = Number(s.current_step ?? 0);
            const progress = Math.round((step / Math.max(totalQuestions, 1)) * 100);
            const title = titleQuestion ? displayAnswer(titleQuestion, s[titleQuestion.id]) : "";
            const subtitle = subtitleQuestion ? displayAnswer(subtitleQuestion, s[subtitleQuestion.id]) : "";
            const copyables = questions.filter((qq) => isCopyable(qq) && s[qq.id]);
            return (
              <div
                key={s.session_id}
                className="block p-4 border"
                style={{ borderColor: "var(--border)", borderRadius: "var(--radius)" }}
              >
                <Link
                  href={`/form-admin/${s.session_id}`}
                  className="flex items-start justify-between gap-3 mb-2 active:opacity-70"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold truncate">
                      {title || "Anonyme"}
                    </div>
                    <div className="text-[13px] truncate" style={{ color: "var(--muted)" }}>
                      {subtitle || "·"}
                    </div>
                  </div>
                  <StatusPill isCompleted={isCompleted} />
                </Link>
                {copyables.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {copyables.map((qq) => (
                      <CopyButton
                        key={qq.id}
                        value={s[qq.id]}
                        label={`Copier ${qq.label.replace(/\?$/, "").trim().toLowerCase()}`}
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{ background: "var(--accent)", width: `${isCompleted ? 100 : progress}%` }}
                    />
                  </div>
                  <span className="text-[12px] tabular-nums" style={{ color: "var(--muted)" }}>
                    {isCompleted ? "100%" : `${progress}%`}
                  </span>
                </div>
                <div className="mt-2 text-[12px]" style={{ color: "var(--muted)" }}>
                  {fmtDate(s.last_updated_at)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function Th({ children, sticky }: { children: React.ReactNode; sticky?: boolean }) {
  return (
    <th
      className="text-left px-4 py-3 font-medium whitespace-nowrap"
      style={{
        color: "var(--muted)",
        position: sticky ? "sticky" : undefined,
        left: sticky ? 0 : undefined,
        background: sticky ? "color-mix(in oklab, var(--border) 30%, var(--bg))" : undefined,
        zIndex: sticky ? 2 : undefined,
      }}
    >
      {children}
    </th>
  );
}

function ValueWithCopy({ value, display }: { value: string; display: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="truncate max-w-[220px]" title={value}>
        {display || value}
      </span>
      <CopyIconButton value={value} />
    </div>
  );
}

function CopyIconButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* ignore */
        }
      }}
      title={copied ? "Copié" : "Copier"}
      aria-label={copied ? "Copié" : "Copier"}
      className="inline-flex items-center justify-center w-6 h-6 transition-all hover:opacity-100 opacity-60 hover:scale-105 shrink-0"
      style={{
        borderRadius: `calc(var(--radius) * 0.5)`,
        background: copied
          ? "color-mix(in oklab, var(--accent) 14%, transparent)"
          : "color-mix(in oklab, var(--border) 40%, transparent)",
        color: copied ? "var(--accent)" : "var(--text)",
      }}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* ignore */
        }
      }}
      className="text-[12px] px-2.5 py-1 border transition-colors"
      style={{
        borderColor: "var(--border)",
        borderRadius: `calc(var(--radius) * 0.5)`,
        color: copied ? "var(--accent)" : "var(--muted)",
      }}
    >
      {copied ? "Copié" : label}
    </button>
  );
}

function StatusPill({ isCompleted }: { isCompleted: boolean }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide whitespace-nowrap"
      style={{
        background: isCompleted
          ? "color-mix(in oklab, var(--accent) 12%, transparent)"
          : "color-mix(in oklab, var(--muted) 12%, transparent)",
        color: isCompleted ? "var(--accent)" : "var(--muted)",
        borderRadius: `calc(var(--radius) * 0.5)`,
      }}
    >
      {isCompleted ? "Complète" : "Incomplète"}
    </span>
  );
}
