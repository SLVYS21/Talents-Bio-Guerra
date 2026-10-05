"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string; // URL Cloudinary (secure_url)
  onChange: (v: string) => void;
  onSubmit: () => void;
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo

type Status = "idle" | "uploading" | "error";

export function FileCloudinaryField({ value, onChange, onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const misconfigured = !cloudName || !uploadPreset;

  useEffect(() => {
    if (!misconfigured && !value) inputRef.current?.focus();
  }, [misconfigured, value]);

  async function handleFile(file: File) {
    if (misconfigured) return;
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setErrorMsg("Formats acceptés : JPG, PNG, WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus("error");
      setErrorMsg("Fichier trop lourd (max 5 Mo).");
      return;
    }
    setStatus("uploading");
    setErrorMsg(null);
    setProgress(0);

    try {
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset!);

      const secureUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              if (json.secure_url) resolve(json.secure_url as string);
              else reject(new Error("Réponse Cloudinary invalide."));
            } catch {
              reject(new Error("Réponse Cloudinary illisible."));
            }
          } else {
            reject(new Error(`Cloudinary a répondu ${xhr.status}.`));
          }
        };
        xhr.onerror = () => reject(new Error("Réseau indisponible."));
        xhr.send(fd);
      });

      onChange(secureUrl);
      setStatus("idle");
      setProgress(100);
    } catch (err) {
      setStatus("error");
      setErrorMsg((err as Error).message || "Envoi impossible.");
    }
  }

  function reset() {
    onChange("");
    setStatus("idle");
    setProgress(0);
    setErrorMsg(null);
    inputRef.current?.focus();
  }

  if (misconfigured) {
    return (
      <div
        className="w-full text-[13px] px-4 py-3 border-2"
        style={{
          borderColor: "#DC2626",
          borderRadius: "var(--radius)",
          color: "#DC2626",
          background: "color-mix(in oklab, #DC2626 8%, transparent)",
        }}
      >
        Cloudinary n'est pas configuré. Ajoute
        <code className="mx-1 px-1 py-0.5 font-mono text-[12px]" style={{ background: "color-mix(in oklab, #DC2626 15%, transparent)" }}>
          NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        </code>
        et
        <code className="mx-1 px-1 py-0.5 font-mono text-[12px]" style={{ background: "color-mix(in oklab, #DC2626 15%, transparent)" }}>
          NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        </code>
        dans <code className="font-mono text-[12px]">.env.local</code>.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {value ? (
        <div
          className="flex items-center gap-3 p-3 border-2"
          style={{
            borderColor: "var(--border-focus)",
            borderRadius: "var(--radius)",
            background: "color-mix(in oklab, var(--accent) 5%, transparent)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Aperçu"
            className="w-16 h-16 object-cover shrink-0"
            style={{ borderRadius: `calc(var(--radius) * 0.5)` }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>
              Photo ajoutée
            </div>
            <div className="text-[11px] truncate" style={{ color: "var(--muted)" }}>
              {value.replace(/^https?:\/\//, "")}
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-[12px] px-3 py-1.5 border transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              color: "var(--muted)",
              borderRadius: `calc(var(--radius) * 0.5)`,
            }}
          >
            Changer
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          className="w-full px-4 py-6 border-2 border-dashed transition-all text-center disabled:opacity-60"
          style={{
            borderColor: status === "error" ? "#DC2626" : "var(--border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            color: "var(--text)",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{
                border: `2px solid var(--border)`,
                borderRadius: `calc(var(--radius) * 0.5)`,
                color: "var(--muted)",
              }}
              aria-hidden
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 3v10m0-10l-4 4m4-4l4 4M4 15v2h12v-2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {status === "uploading" ? (
              <>
                <div className="text-[14px] font-medium">Envoi en cours… {progress}%</div>
                <div
                  className="w-full max-w-xs h-1 overflow-hidden"
                  style={{ background: "var(--border)", borderRadius: 99 }}
                  aria-hidden
                >
                  <div
                    className="h-full transition-all"
                    style={{ width: `${progress}%`, background: "var(--accent)" }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="text-[14px] font-medium">Choisir une photo</div>
                <div className="text-[12px]" style={{ color: "var(--muted)" }}>
                  JPG, PNG ou WebP — 5 Mo max
                </div>
              </>
            )}
          </div>
        </button>
      )}

      {errorMsg ? (
        <div className="text-[12px] font-medium" style={{ color: "#DC2626" }}>
          {errorMsg}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {value ? (
        <button
          type="button"
          onClick={onSubmit}
          className="hidden"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
