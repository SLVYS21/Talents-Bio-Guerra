"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import type { Choice, Condition, FieldType, Question } from "@/config/form";

type Status = "idle" | "saved" | "error";

const TYPE_LABEL: Record<FieldType, string> = {
  text: "Texte court",
  email: "Email",
  phone: "Téléphone",
  country_phone: "Téléphone + pays",
  choice: "Choix multiple",
  number: "Nombre",
  textarea: "Texte long",
  date: "Date",
  checkbox: "Case à cocher (consentement)",
  url: "Lien (URL)",
  cascading_choice: "Département → Commune (Bénin)",
  file_cloudinary: "Upload fichier (Cloudinary)",
  group_members: "Membres du groupe",
};

const TYPE_OPTIONS: FieldType[] = [
  "text",
  "email",
  "phone",
  "country_phone",
  "choice",
  "number",
  "textarea",
  "date",
  "checkbox",
  "url",
  "cascading_choice",
  "file_cloudinary",
  "group_members",
];

const CONDITION_KIND_LABEL: Record<Condition["kind"], string> = {
  eq: "égal à",
  neq: "différent de",
  age_lt: "âge < (années)",
  age_gte: "âge ≥ (années)",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "question";
}

function uniqueId(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}_${i}`)) i++;
  return `${base}_${i}`;
}

export function QuestionsEditor({ initial }: { initial: Question[] }) {
  const [items, setItems] = useState<Question[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const takenIds = useMemo(() => new Set(items.map((q) => q.id)), [items]);

  const patch = useCallback((id: string, p: Partial<Question>) => {
    setItems((arr) => arr.map((q) => (q.id === id ? { ...q, ...p } : q)));
    setStatus("idle");
  }, []);

  const addQuestion = useCallback(() => {
    const id = uniqueId("nouvelle_question", takenIds);
    const q: Question = {
      id,
      type: "text",
      label: "Nouvelle question",
      required: true,
    };
    setItems((arr) => [...arr, q]);
    setExpandedId(id);
    setStatus("idle");
  }, [takenIds]);

  const deleteQuestion = useCallback((id: string) => {
    setItems((arr) => arr.filter((q) => q.id !== id));
    setStatus("idle");
  }, []);

  const duplicateQuestion = useCallback((id: string) => {
    setItems((arr) => {
      const idx = arr.findIndex((q) => q.id === id);
      if (idx === -1) return arr;
      const src = arr[idx];
      const taken = new Set(arr.map((q) => q.id));
      const newId = uniqueId(`${src.id}_copie`, taken);
      const copy: Question = { ...src, id: newId, label: `${src.label} (copie)` };
      const next = [...arr];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setStatus("idle");
  }, []);

  const validate = useCallback((arr: Question[]): string | null => {
    if (arr.length === 0) return "Au moins une question est requise.";
    const seen = new Set<string>();
    for (const q of arr) {
      if (!/^[a-z0-9_]+$/.test(q.id)) return `ID invalide : "${q.id}" (a-z, 0-9, _).`;
      if (seen.has(q.id)) return `ID en double : "${q.id}".`;
      seen.add(q.id);
      if (!q.label.trim()) return `Question "${q.id}" : le label est vide.`;
      if (q.type === "choice") {
        if (!q.choices || q.choices.length < 2) {
          return `Question "${q.id}" : au moins 2 choix requis.`;
        }
        const values = new Set<string>();
        for (const c of q.choices) {
          if (!c.value.trim() || !c.label.trim()) {
            return `Question "${q.id}" : chaque choix a besoin d'une valeur et d'un label.`;
          }
          if (values.has(c.value)) return `Question "${q.id}" : valeur de choix en double "${c.value}".`;
          values.add(c.value);
        }
      }
    }
    return null;
  }, []);

  async function save() {
    setErrorMsg(null);
    const err = validate(items);
    if (err) {
      setErrorMsg(err);
      setStatus("error");
      return;
    }
    setSaving(true);
    setStatus("idle");
    const payload = items.map((q) => ({
      ...q,
      choices: q.type === "choice" ? q.choices : undefined,
      placeholder:
        q.type === "choice" || q.type === "checkbox" || q.type === "cascading_choice" ||
        q.type === "file_cloudinary" || q.type === "date" || q.type === "group_members"
          ? undefined
          : q.placeholder?.trim() ? q.placeholder : undefined,
      hint: q.hint?.trim() ? q.hint : undefined,
      maxLength: q.type === "textarea" ? q.maxLength : undefined,
      checkboxLabel:
        q.type === "checkbox" && q.checkboxLabel?.trim() ? q.checkboxLabel : undefined,
      groupMax: q.type === "group_members" ? q.groupMax ?? 4 : undefined,
      condition: q.condition ?? undefined,
    }));
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErrorMsg(body?.error ?? "Enregistrement impossible.");
        setStatus("error");
      } else {
        setStatus("saved");
      }
    } catch {
      setErrorMsg("Réseau indisponible.");
      setStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 3000);
    }
  }

  return (
    <>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={(next) => {
          setItems(next);
          setStatus("idle");
        }}
        className="flex flex-col gap-3"
      >
        <AnimatePresence initial={false}>
          {items.map((q, index) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={index}
              expanded={expandedId === q.id}
              onToggleExpand={() =>
                setExpandedId((cur) => (cur === q.id ? null : q.id))
              }
              onChange={(p) => patch(q.id, p)}
              onDelete={() => deleteQuestion(q.id)}
              onDuplicate={() => duplicateQuestion(q.id)}
              takenIds={takenIds}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <button
        type="button"
        onClick={addQuestion}
        className="mt-4 w-full py-3 text-[14px] font-medium border-2 border-dashed transition-colors hover:opacity-80"
        style={{
          borderColor: "var(--border)",
          color: "var(--muted)",
          borderRadius: "var(--radius)",
        }}
      >
        + Ajouter une question
      </button>

      <div
        className="flex flex-wrap items-center gap-3 mt-8 pt-4 md:pt-6 border-t sticky bottom-0 py-3 md:py-4 -mx-4 md:mx-0 px-4 md:px-0"
        style={{
          borderColor: "var(--border)",
          background: "color-mix(in oklab, var(--bg) 92%, transparent)",
          backdropFilter: "blur(10px)",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-3 font-semibold text-[15px] transition-all disabled:opacity-40 flex-1 sm:flex-none"
          style={{
            background: "var(--accent)",
            color: "var(--accent-text)",
            borderRadius: "var(--radius)",
          }}
        >
          {saving ? "Publication…" : "Publier"}
        </button>
        {status === "saved" ? (
          <span className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>
            ✓ Publié, appliqué au formulaire public.
          </span>
        ) : null}
        {status === "error" ? (
          <span className="text-[13px] font-medium" style={{ color: "#DC2626" }}>
            {errorMsg ?? "Erreur."}
          </span>
        ) : null}
        <span className="text-[12px] ml-auto" style={{ color: "var(--muted)" }}>
          {items.length} question{items.length !== 1 ? "s" : ""}
        </span>
      </div>
    </>
  );
}

function QuestionCard({
  question,
  index,
  expanded,
  onToggleExpand,
  onChange,
  onDelete,
  onDuplicate,
  takenIds,
}: {
  question: Question;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (p: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  takenIds: Set<string>;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <Reorder.Item
      value={question}
      className="border transition-shadow"
      style={{
        borderColor: expanded ? "var(--accent)" : "var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--bg)",
        boxShadow: expanded ? "0 10px 30px -12px color-mix(in oklab, var(--accent) 25%, transparent)" : "none",
      }}
      whileDrag={{ scale: 1.01, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)" }}
    >
      <div className="flex items-center gap-3 px-3 md:px-4 py-3">
        <span
          className="cursor-grab active:cursor-grabbing select-none text-[18px] leading-none"
          style={{ color: "var(--muted)" }}
          aria-label="Réordonner"
        >
          ⋮⋮
        </span>
        <span
          className="text-[11px] font-mono tabular-nums px-1.5 py-0.5"
          style={{
            background: "color-mix(in oklab, var(--border) 40%, transparent)",
            color: "var(--muted)",
            borderRadius: `calc(var(--radius) * 0.4)`,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 min-w-0 text-left"
        >
          <div className="text-[14px] md:text-[15px] font-medium truncate">
            {question.label || "(sans label)"}
          </div>
          <div className="text-[11px] md:text-[12px] mt-0.5 flex items-center gap-2" style={{ color: "var(--muted)" }}>
            <span>{TYPE_LABEL[question.type]}</span>
            <span aria-hidden>·</span>
            <span className="font-mono truncate">{question.id}</span>
            {question.required ? (
              <>
                <span aria-hidden>·</span>
                <span>requis</span>
              </>
            ) : null}
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton title="Dupliquer" onClick={onDuplicate}>⧉</IconButton>
          {confirmingDelete ? (
            <>
              <button
                type="button"
                onClick={onDelete}
                className="text-[12px] px-2 py-1 font-semibold"
                style={{
                  background: "#DC2626",
                  color: "white",
                  borderRadius: `calc(var(--radius) * 0.5)`,
                }}
              >
                Confirmer
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-[12px] px-2 py-1"
                style={{ color: "var(--muted)" }}
              >
                Annuler
              </button>
            </>
          ) : (
            <IconButton
              title="Supprimer"
              onClick={() => setConfirmingDelete(true)}
              danger
            >
              ✕
            </IconButton>
          )}
          <button
            type="button"
            onClick={onToggleExpand}
            className="text-[13px] px-2 py-1 transition-transform"
            style={{
              color: "var(--muted)",
              transform: expanded ? "rotate(180deg)" : "rotate(0)",
            }}
            aria-label={expanded ? "Réduire" : "Développer"}
          >
            ▾
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-3 md:px-4 pb-4 pt-1 grid gap-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="grid sm:grid-cols-2 gap-3 pt-3">
                <Field label="Type de champ">
                  <select
                    value={question.type}
                    onChange={(e) => {
                      const t = e.target.value as FieldType;
                      const patch: Partial<Question> = { type: t };
                      if (t === "choice" && (!question.choices || question.choices.length === 0)) {
                        patch.choices = [
                          { value: "option_1", label: "Option 1" },
                          { value: "option_2", label: "Option 2" },
                        ];
                      }
                      onChange(patch);
                    }}
                    className="w-full px-3 py-2 text-[14px] border-2"
                    style={{
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                      background: "transparent",
                      color: "var(--text)",
                    }}
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABEL[t]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Requis ?">
                  <label className="flex items-center gap-2 h-[42px]">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => onChange({ required: e.target.checked })}
                      className="w-4 h-4"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span className="text-[13px]" style={{ color: "var(--muted)" }}>
                      Bloquer la progression tant que vide.
                    </span>
                  </label>
                </Field>
              </div>

              <Field label="Label (question posée)">
                <textarea
                  value={question.label}
                  onChange={(e) => onChange({ label: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-[14px] border-2 resize-none"
                  style={{
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    background: "transparent",
                    color: "var(--text)",
                  }}
                />
              </Field>

              <Field label="Aide (optionnel)" hint="Petit texte sous la question.">
                <input
                  type="text"
                  value={question.hint ?? ""}
                  onChange={(e) => onChange({ hint: e.target.value })}
                  className="w-full px-3 py-2 text-[14px] border-2"
                  style={{
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    background: "transparent",
                    color: "var(--text)",
                  }}
                />
              </Field>

              {question.type === "choice" ? (
                <ChoicesEditor
                  choices={question.choices ?? []}
                  onChange={(choices) => onChange({ choices })}
                />
              ) : question.type === "checkbox" ? (
                <Field
                  label="Texte de l'affirmation (case à cocher)"
                  hint="Ce que le candidat accepte en cochant. Ex. « J'accepte le règlement »."
                >
                  <textarea
                    value={question.checkboxLabel ?? ""}
                    onChange={(e) => onChange({ checkboxLabel: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-[14px] border-2 resize-none"
                    style={{
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                      background: "transparent",
                      color: "var(--text)",
                    }}
                  />
                </Field>
              ) : question.type === "textarea" ? (
                <>
                  <Field label="Placeholder (optionnel)">
                    <input
                      type="text"
                      value={question.placeholder ?? ""}
                      onChange={(e) => onChange({ placeholder: e.target.value })}
                      className="w-full px-3 py-2 text-[14px] border-2"
                      style={{
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius)",
                        background: "transparent",
                        color: "var(--text)",
                      }}
                    />
                  </Field>
                  <Field label="Longueur max (caractères)" hint="Vide = pas de limite.">
                    <input
                      type="number"
                      min={0}
                      value={question.maxLength ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        onChange({ maxLength: v === "" ? undefined : Math.max(0, Number(v)) });
                      }}
                      className="w-full px-3 py-2 text-[14px] border-2"
                      style={{
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius)",
                        background: "transparent",
                        color: "var(--text)",
                      }}
                    />
                  </Field>
                </>
              ) : question.type === "group_members" ? (
                <Field
                  label="Nombre max de co-participants"
                  hint="Le responsable du groupe remplit le formulaire. Ce chiffre exclut le responsable."
                >
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={question.groupMax ?? 4}
                    onChange={(e) => onChange({ groupMax: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-full px-3 py-2 text-[14px] border-2"
                    style={{
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                      background: "transparent",
                      color: "var(--text)",
                    }}
                  />
                </Field>
              ) : question.type === "date" ||
                question.type === "cascading_choice" ||
                question.type === "file_cloudinary" ? null : (
                <Field label="Placeholder (optionnel)">
                  <input
                    type="text"
                    value={question.placeholder ?? ""}
                    onChange={(e) => onChange({ placeholder: e.target.value })}
                    className="w-full px-3 py-2 text-[14px] border-2"
                    style={{
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                      background: "transparent",
                      color: "var(--text)",
                    }}
                  />
                </Field>
              )}

              <ConditionEditor
                condition={question.condition}
                onChange={(condition) => onChange({ condition })}
                candidates={Array.from(takenIds).filter((id) => id !== question.id)}
              />

              <IdEditor
                id={question.id}
                onChange={(id) => onChange({ id })}
                takenIds={takenIds}
                labelForDefault={question.label}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Reorder.Item>
  );
}

function ChoicesEditor({
  choices,
  onChange,
}: {
  choices: Choice[];
  onChange: (c: Choice[]) => void;
}) {
  const update = (i: number, p: Partial<Choice>) =>
    onChange(choices.map((c, idx) => (idx === i ? { ...c, ...p } : c)));
  const remove = (i: number) => onChange(choices.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= choices.length) return;
    const next = [...choices];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => {
    const usedValues = new Set(choices.map((c) => c.value));
    let i = choices.length + 1;
    let v = `option_${i}`;
    while (usedValues.has(v)) {
      i++;
      v = `option_${i}`;
    }
    onChange([...choices, { value: v, label: `Option ${i}` }]);
  };

  return (
    <div>
      <div className="text-[13px] font-medium mb-2">Choix</div>
      <div className="flex flex-col gap-2">
        {choices.map((c, i) => (
          <div
            key={i}
            className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center p-2"
            style={{
              border: "1px solid var(--border)",
              borderRadius: `calc(var(--radius) * 0.7)`,
            }}
          >
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-[10px] leading-none px-1 disabled:opacity-30"
                style={{ color: "var(--muted)" }}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === choices.length - 1}
                className="text-[10px] leading-none px-1 disabled:opacity-30"
                style={{ color: "var(--muted)" }}
              >
                ▼
              </button>
            </div>
            <input
              type="text"
              value={c.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label visible"
              className="px-2 py-1.5 text-[13px] border"
              style={{
                borderColor: "var(--border)",
                borderRadius: `calc(var(--radius) * 0.5)`,
                background: "transparent",
                color: "var(--text)",
              }}
            />
            <input
              type="text"
              value={c.value}
              onChange={(e) => update(i, { value: e.target.value.replace(/\s+/g, "_") })}
              placeholder="valeur_technique"
              className="px-2 py-1.5 text-[12px] font-mono border"
              style={{
                borderColor: "var(--border)",
                borderRadius: `calc(var(--radius) * 0.5)`,
                background: "transparent",
                color: "var(--text)",
              }}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-[13px] px-2 py-1"
              style={{ color: "var(--muted)" }}
              aria-label="Retirer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-[13px] px-3 py-1.5 border-2 border-dashed transition-colors hover:opacity-70"
        style={{
          borderColor: "var(--border)",
          color: "var(--muted)",
          borderRadius: `calc(var(--radius) * 0.7)`,
        }}
      >
        + Ajouter un choix
      </button>
    </div>
  );
}

function IdEditor({
  id,
  onChange,
  takenIds,
  labelForDefault,
}: {
  id: string;
  onChange: (id: string) => void;
  takenIds: Set<string>;
  labelForDefault: string;
}) {
  const [unlocked, setUnlocked] = useState(false);
  return (
    <div>
      <div className="text-[13px] font-medium mb-1.5 flex items-center gap-2">
        <span>ID technique</span>
        <span className="text-[11px] font-normal" style={{ color: "var(--muted)" }}>
          Colonne dans la Sheet, clé dans l'export.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={id}
          disabled={!unlocked}
          onChange={(e) =>
            onChange(
              e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, "_")
                .slice(0, 60)
            )
          }
          className="flex-1 px-3 py-2 text-[13px] font-mono border-2 disabled:opacity-60"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            color: "var(--text)",
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (!unlocked) {
              setUnlocked(true);
              return;
            }
            const base = slugify(labelForDefault || id);
            const next = base === id ? id : (takenIds.has(base) ? id : base);
            onChange(next);
            setUnlocked(false);
          }}
          className="text-[12px] px-3 py-2 border"
          style={{
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--muted)",
          }}
        >
          {unlocked ? "Auto" : "Modifier"}
        </button>
      </div>
      {unlocked ? (
        <p className="mt-1.5 text-[11px]" style={{ color: "var(--muted)" }}>
          Changer l'ID crée une nouvelle colonne dans la Sheet. Les réponses passées gardent leur ancienne colonne.
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium mb-1.5">{label}</label>
      {children}
      {hint ? (
        <p className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ConditionEditor({
  condition,
  onChange,
  candidates,
}: {
  condition: Condition | undefined;
  onChange: (c: Condition | undefined) => void;
  candidates: string[];
}) {
  const enabled = !!condition;
  const kinds: Condition["kind"][] = ["eq", "neq", "age_lt", "age_gte"];

  return (
    <div>
      <label className="flex items-center gap-2 text-[13px] font-medium mb-1.5">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            if (e.target.checked) {
              onChange({
                kind: "eq",
                field: candidates[0] ?? "",
                value: "",
              });
            } else {
              onChange(undefined);
            }
          }}
          className="w-4 h-4"
          style={{ accentColor: "var(--accent)" }}
        />
        Visibilité conditionnelle
      </label>
      {enabled && condition ? (
        <div
          className="grid gap-2 p-3"
          style={{
            border: "1px solid var(--border)",
            borderRadius: `calc(var(--radius) * 0.7)`,
          }}
        >
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            <select
              value={condition.field}
              onChange={(e) =>
                onChange({ ...condition, field: e.target.value })
              }
              className="w-full px-2 py-2 text-[13px] border-2 min-w-0"
              style={{
                borderColor: "var(--border)",
                borderRadius: `calc(var(--radius) * 0.5)`,
                background: "transparent",
                color: "var(--text)",
              }}
            >
              {candidates.length === 0 ? (
                <option value="">(aucune autre question)</option>
              ) : (
                candidates.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))
              )}
            </select>
            <select
              value={condition.kind}
              onChange={(e) => {
                const kind = e.target.value as Condition["kind"];
                if (kind === "age_lt" || kind === "age_gte") {
                  onChange({ kind, field: condition.field, value: 18 });
                } else {
                  onChange({
                    kind,
                    field: condition.field,
                    value: typeof condition.value === "string" ? condition.value : "",
                  });
                }
              }}
              className="px-2 py-2 text-[12px] border-2"
              style={{
                borderColor: "var(--border)",
                borderRadius: `calc(var(--radius) * 0.5)`,
                background: "transparent",
                color: "var(--text)",
              }}
            >
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {CONDITION_KIND_LABEL[k]}
                </option>
              ))}
            </select>
            {condition.kind === "age_lt" || condition.kind === "age_gte" ? (
              <input
                type="number"
                min={0}
                max={120}
                value={condition.value}
                onChange={(e) =>
                  onChange({ ...condition, value: Number(e.target.value) || 0 })
                }
                className="w-full px-2 py-2 text-[13px] border-2 min-w-0"
                style={{
                  borderColor: "var(--border)",
                  borderRadius: `calc(var(--radius) * 0.5)`,
                  background: "transparent",
                  color: "var(--text)",
                }}
              />
            ) : (
              <input
                type="text"
                value={condition.value}
                onChange={(e) => onChange({ ...condition, value: e.target.value })}
                placeholder="Valeur attendue"
                className="w-full px-2 py-2 text-[13px] border-2 min-w-0"
                style={{
                  borderColor: "var(--border)",
                  borderRadius: `calc(var(--radius) * 0.5)`,
                  background: "transparent",
                  color: "var(--text)",
                }}
              />
            )}
          </div>
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            Question affichée uniquement si la réponse à « {condition.field} »{" "}
            {CONDITION_KIND_LABEL[condition.kind]} « {String(condition.value)} ».
          </p>
        </div>
      ) : null}
    </div>
  );
}

function IconButton({
  title,
  onClick,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="w-8 h-8 flex items-center justify-center text-[13px] transition-colors"
      style={{
        color: danger ? "#DC2626" : "var(--muted)",
        borderRadius: `calc(var(--radius) * 0.5)`,
      }}
    >
      {children}
    </button>
  );
}
