"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BENIN_DEPARTMENTS, decodeGeo, encodeGeo, findDepartment } from "@/data/benin";

type Props = {
  value: string; // "<dept_id>:<commune_id>"
  onChange: (v: string) => void;
  onSubmit: () => void;
};

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

export function CascadingChoiceField({ value, onChange, onSubmit }: Props) {
  const initial = useMemo(() => decodeGeo(value), [value]);
  const [deptId, setDeptId] = useState(initial.departmentId);
  const [communeId, setCommuneId] = useState(initial.communeId);
  const [open, setOpen] = useState<null | "dept" | "commune">(null);
  const isMobile = useIsMobile();
  const rootRef = useRef<HTMLDivElement>(null);

  const dept = findDepartment(deptId);
  const commune = dept?.communes.find((c) => c.id === communeId);

  useEffect(() => {
    if (deptId && communeId) onChange(encodeGeo(deptId, communeId));
    else if (!deptId && !communeId && value) onChange("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptId, communeId]);

  useEffect(() => {
    if (!open || isMobile) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  function pickDept(id: string) {
    setDeptId(id);
    setCommuneId("");
    setOpen(null);
    setTimeout(() => setOpen("commune"), 60);
  }

  function pickCommune(id: string) {
    setCommuneId(id);
    setOpen(null);
  }

  const deptList = BENIN_DEPARTMENTS;
  const communeList = dept?.communes ?? [];

  const deptPanel = (
    <>
      {deptList.map((d) => {
        const selected = d.id === deptId;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => pickDept(d.id)}
            className="w-full text-left flex items-center justify-between px-4 py-3 text-[15px] transition-colors sm:py-2 sm:hover:opacity-80 active:opacity-70"
            style={{
              background: selected
                ? "color-mix(in oklab, var(--accent) 10%, transparent)"
                : "transparent",
              color: "var(--text)",
            }}
          >
            <span className="font-medium">{d.name}</span>
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>
              {d.communes.length} communes
            </span>
          </button>
        );
      })}
    </>
  );

  const communePanel = (
    <>
      {communeList.map((c) => {
        const selected = c.id === communeId;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => pickCommune(c.id)}
            onDoubleClick={() => {
              pickCommune(c.id);
              onSubmit();
            }}
            className="w-full text-left px-4 py-3 text-[15px] transition-colors sm:py-2 sm:hover:opacity-80 active:opacity-70"
            style={{
              background: selected
                ? "color-mix(in oklab, var(--accent) 10%, transparent)"
                : "transparent",
              color: "var(--text)",
            }}
          >
            {c.name}
          </button>
        );
      })}
    </>
  );

  return (
    <div className="flex flex-col gap-2 w-full" ref={rootRef}>
      <div className="flex gap-2 w-full items-stretch">
        <button
          type="button"
          onClick={() => setOpen(open === "dept" ? null : "dept")}
          className="flex-1 min-w-0 px-4 py-3 flex items-center justify-between gap-2 border-2 text-[15px] font-medium transition-colors text-left"
          style={{
            borderColor:
              open === "dept" ? "var(--accent)" : deptId ? "var(--border-focus)" : "var(--border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            color: "var(--text)",
          }}
          aria-haspopup="listbox"
          aria-expanded={open === "dept"}
        >
          <span className="truncate">
            {dept ? dept.name : (
              <span style={{ color: "var(--muted)" }}>Département</span>
            )}
          </span>
          <span aria-hidden className="text-[10px] opacity-60 ml-2">▾</span>
        </button>
        <button
          type="button"
          onClick={() => (deptId ? setOpen(open === "commune" ? null : "commune") : setOpen("dept"))}
          disabled={!deptId}
          className="flex-1 min-w-0 px-4 py-3 flex items-center justify-between gap-2 border-2 text-[15px] font-medium transition-colors text-left disabled:opacity-40"
          style={{
            borderColor:
              open === "commune"
                ? "var(--accent)"
                : communeId
                ? "var(--border-focus)"
                : "var(--border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            color: "var(--text)",
          }}
          aria-haspopup="listbox"
          aria-expanded={open === "commune"}
        >
          <span className="truncate">
            {commune ? commune.name : (
              <span style={{ color: "var(--muted)" }}>Commune</span>
            )}
          </span>
          <span aria-hidden className="text-[10px] opacity-60 ml-2">▾</span>
        </button>
      </div>

      {/* Desktop popover */}
      {open && !isMobile ? (
        <div
          className="relative"
          style={{ height: 0 }}
        >
          <div
            className="absolute left-0 right-0 top-1 z-50 max-h-[320px] overflow-hidden flex flex-col shadow-2xl"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <div
              className="px-4 py-2 text-[12px]"
              style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}
            >
              {open === "dept" ? "Département" : `Commune du ${dept?.name ?? ""}`}
            </div>
            <div className="overflow-y-auto no-scrollbar">
              {open === "dept" ? deptPanel : communePanel}
            </div>
          </div>
        </div>
      ) : null}

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {open && isMobile ? (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(null)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.55)" }}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) setOpen(null);
              }}
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[85dvh]"
              style={{
                background: "var(--bg)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                boxShadow: "0 -20px 60px -12px rgba(0,0,0,0.5)",
                paddingBottom: "env(safe-area-inset-bottom, 12px)",
              }}
            >
              <div className="flex justify-center pt-2 pb-1">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: "var(--border)" }}
                  aria-hidden
                />
              </div>
              <div
                className="flex items-center justify-between px-4 pt-2 pb-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="text-[15px] font-semibold" style={{ color: "var(--text)" }}>
                  {open === "dept" ? "Ton département" : `Commune du ${dept?.name ?? ""}`}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="text-[13px] px-2 py-1"
                  style={{ color: "var(--muted)" }}
                >
                  Fermer
                </button>
              </div>
              <div className="overflow-y-auto flex-1 pb-2">
                {open === "dept" ? deptPanel : communePanel}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
