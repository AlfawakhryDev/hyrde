"use client";
import { useState, useCallback, useRef } from "react";
import type { ParsedCV } from "@/lib/types";

interface Props {
  onParsed: (cv: ParsedCV) => void;
  className?: string;
}

export default function CvUpload({ onParsed, className = "" }: Props) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedCV | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError("");
    setParsed(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/parse-cv", { method: "POST", body: fd });
      const data: ParsedCV = await res.json();
      if ((data as { error?: string }).error) {
        setError((data as { error?: string }).error || "Could not parse CV.");
        return;
      }
      setParsed(data);
      onParsed(data);
    } catch {
      setError("Network error — please try again or fill the form manually.");
    } finally {
      setLoading(false);
    }
  }, [onParsed]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (parsed) {
    return (
      <div className={`rounded-xl border border-electric-violet/30 bg-electric-violet/5 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">AI extracted from CV</span>
          </div>
          <button
            onClick={() => { setParsed(null); if (inputRef.current) inputRef.current.value = ""; }}
            className="text-xs text-on-surface-variant hover:text-electric-violet transition-colors font-body"
          >
            ↺ Re-upload
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {([
            parsed.name,
            parsed.skill,
            parsed.location,
            parsed.rate ? `$${parsed.rate}/hr` : null,
            parsed.yearsExperience ? `${parsed.yearsExperience} yrs exp` : null,
          ] as (string | null)[]).filter(Boolean).map((item, i) => (
            <span key={i} className="text-xs bg-white border border-electric-violet/20 text-tech-blue-deep px-2.5 py-1 rounded-full font-body">
              {item}
            </span>
          ))}
        </div>
        {parsed.bio && (
          <p className="text-xs text-on-surface-variant font-body leading-relaxed line-clamp-2">{parsed.bio}</p>
        )}
        {parsed.highlights?.length > 0 && (
          <div className="mt-2 flex flex-col gap-0.5">
            {parsed.highlights.slice(0, 2).map((h, i) => (
              <p key={i} className="text-[11px] text-on-surface-variant font-body">· {h}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all select-none ${
          dragging
            ? "border-electric-violet bg-electric-violet/5 scale-[1.01]"
            : "border-border-crisp hover:border-electric-violet/50 hover:bg-surface-gray/40"
        } ${loading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.txt,.md" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} className="hidden" />
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-7 h-7 border-2 border-electric-violet border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold font-body text-electric-violet">AI is reading your CV…</p>
            <p className="text-xs text-on-surface-variant font-body">Extracting your profile in seconds</p>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-electric-violet mb-2 block animate-floaty" style={{ fontSize: "28px" }}>upload_file</span>
            <p className="text-sm font-semibold font-body text-tech-blue-deep mb-0.5">Drop your CV here, or click to upload</p>
            <p className="text-xs text-on-surface-variant font-body">PDF, TXT, or Markdown — AI fills your profile instantly</p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-2 font-body">{error}</p>}
    </div>
  );
}
