import Link from "next/link";
import { getSession } from "@/lib/responses";
import { getQuestions } from "@/lib/questions";

export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  if (!iso) return "·";
  try {
    return new Date(iso).toLocaleString("fr-FR");
  } catch {
    return iso;
  }
}

export default async function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, questions] = await Promise.all([getSession(id), getQuestions()]);

  if (!session) {
    return (
      <div>
        <Link href="/form-admin" className="text-[13px]" style={{ color: "var(--muted)" }}>
          ← Retour
        </Link>
        <h1 className="text-2xl font-semibold mt-6">Session introuvable</h1>
      </div>
    );
  }

  const isCompleted = Boolean(session.completed_at);

  const titleQuestion =
    questions.find((qq) => qq.type === "text") ??
    questions.find(
      (qq) => qq.type !== "email" && qq.type !== "phone" && qq.type !== "country_phone",
    ) ??
    questions[0];
  const emailQuestion = questions.find((qq) => qq.type === "email");
  const phoneQuestion = questions.find(
    (qq) => qq.type === "phone" || qq.type === "country_phone",
  );

  const displayTitle = titleQuestion ? session[titleQuestion.id] : "";
  const displayEmail = emailQuestion ? session[emailQuestion.id] : "";
  const displayPhone = phoneQuestion ? session[phoneQuestion.id] : "";

  return (
    <div>
      <Link href="/form-admin" className="text-[13px] hover:opacity-70" style={{ color: "var(--muted)" }}>
        ← Retour aux sessions
      </Link>

      <div className="mt-6 mb-8 md:mb-10">
        <div className="text-[12px] md:text-[13px] uppercase tracking-wide mb-1.5 md:mb-2" style={{ color: "var(--muted)" }}>
          Session {session.session_id.slice(0, 8)}
        </div>
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight break-words">
          {displayTitle || "Anonyme"}
        </h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 text-[13px] md:text-[14px]" style={{ color: "var(--muted)" }}>
          {displayEmail ? (
            <a href={`mailto:${displayEmail}`} className="hover:opacity-70 break-all">
              {displayEmail}
            </a>
          ) : null}
          {displayEmail && displayPhone ? (
            <span aria-hidden className="hidden sm:inline">·</span>
          ) : null}
          {displayPhone ? (
            <a
              href={`https://wa.me/${displayPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-70"
            >
              WhatsApp {displayPhone}
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-10">
        <MetaCard label="Démarrée" value={fmt(session.started_at)} />
        <MetaCard label="Dernière mise à jour" value={fmt(session.last_updated_at)} />
        <MetaCard
          label="Statut"
          value={isCompleted ? `Terminée · ${fmt(session.completed_at)}` : `En cours (étape ${session.current_step})`}
          accent={isCompleted}
        />
      </div>

      <h2 className="text-lg font-semibold mb-3 md:mb-4">Réponses</h2>
      <div className="border" style={{ borderColor: "var(--border)", borderRadius: "var(--radius)" }}>
        {questions.map((q, i) => {
          const val = session[q.id];
          const choice = q.choices?.find((c) => c.value === val);
          const display = choice?.label ?? val ?? "·";
          return (
            <div
              key={q.id}
              className="grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-4 px-4 md:px-5 py-3.5 md:py-4"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
            >
              <div className="text-[12px] md:text-[13px]" style={{ color: "var(--muted)" }}>
                {q.label}
              </div>
              <div
                className="md:col-span-2 text-[14px] md:text-[15px] font-medium break-words"
                style={{ color: val ? "var(--text)" : "var(--muted)" }}
              >
                {display || "·"}
              </div>
            </div>
          );
        })}
      </div>

      {session.user_agent || session.referrer || session.landing_url ? (
        <details className="mt-8 text-[13px]" style={{ color: "var(--muted)" }}>
          <summary className="cursor-pointer">Contexte technique</summary>
          <div className="mt-3 space-y-1 font-mono text-[11px] md:text-[12px] break-all">
            {session.landing_url ? <div>URL : {session.landing_url}</div> : null}
            {session.referrer ? <div>Referrer : {session.referrer}</div> : null}
            {session.user_agent ? <div>UA : {session.user_agent}</div> : null}
            {["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].map((k) =>
              session[k] ? <div key={k}>{k} : {session[k]}</div> : null
            )}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function MetaCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-5 border" style={{ borderColor: "var(--border)", borderRadius: "var(--radius)" }}>
      <div className="text-[12px] uppercase tracking-wide mb-2" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <div className="text-[15px] font-medium" style={{ color: accent ? "var(--accent)" : "var(--text)" }}>
        {value}
      </div>
    </div>
  );
}
