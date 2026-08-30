"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export type Lead = {
  id: string;
  created_at: string;
  company: string | null;
  contact_name: string;
  email: string;
  role: string | null;
  outcome: string;
  budget_range: string | null;
  timeline: string | null;
  status: string;
};

// Ops pipeline stages. `new` is the DB default from the intake form.
const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_STYLE: Record<string, string> = {
  new: "text-wv-blue bg-wv-blue-tint",
  contacted: "text-wv-slate bg-wv-panel",
  qualified: "text-wv-blue bg-wv-blue-tint",
  proposal: "text-wv-signal bg-wv-signal-tint",
  won: "text-wv-ok bg-[color-mix(in_srgb,var(--color-wv-ok)_10%,transparent)]",
  lost: "text-wv-ash bg-wv-panel",
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(iso));
}

export default function LeadsClient({ initial }: { initial: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  // §8 gate: 4 of 20 qualified DACH CTOs saying yes to a priced proposal.
  const yesses = (counts.proposal ?? 0) + (counts.won ?? 0);

  async function setStatus(id: string, status: Status) {
    const prev = leads;
    setBusy(id);
    setError("");
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabaseBrowser().from("leads").update({ status }).eq("id", id);
    setBusy(null);
    if (error) {
      setLeads(prev); // roll back the optimistic update
      setError("Status konnte nicht gespeichert werden. Bitte erneut versuchen.");
    }
  }

  return (
    <div className="min-h-screen bg-wv-paper text-wv-ink">
      <div className="mx-auto max-w-[1180px] px-5 py-10 md:px-8">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-mono text-[12px] text-wv-ash hover:text-wv-ink">← Admin</Link>
            <Link href="/admin/werkvertrag" className="font-mono text-[12px] text-wv-ash hover:text-wv-ink">Werkvertrag →</Link>
          </div>
          <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.02em]">Leads</h1>
          <p className="mt-1.5 text-[13.5px] text-wv-slate">
            Aus dem Kontaktformular. {leads.length} gesamt · {yesses} in Angebot/gewonnen
            <span className="text-wv-ash"> (Gate: 4 von 20 für Phase 1)</span>.
          </p>
          {/* status summary */}
          <div className="mt-4 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <span key={s} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] ${STATUS_STYLE[s]}`}>
                {s} <span className="tabular-nums opacity-70">{counts[s] ?? 0}</span>
              </span>
            ))}
          </div>
          {error && <p className="mt-3 text-[13px] text-wv-signal">{error}</p>}
        </header>

        {leads.length === 0 ? (
          <div className="grid min-h-[220px] place-items-center rounded-[3px] border border-dashed border-wv-line bg-wv-panel p-8 text-center">
            <p className="max-w-[40ch] text-[13.5px] text-wv-ash">
              Noch keine Leads. Sie erscheinen hier, sobald jemand das Kontaktformular auf{" "}
              <Link href="/kontakt" className="underline">/kontakt</Link> absendet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[3px] border border-wv-line bg-white">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-wv-line text-wv-ash">
                  {["Datum", "Kontakt", "Unternehmen", "Ergebnis", "Budget", "Zeit", "Status"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-wv-line align-top last:border-0">
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-[12px] tabular-nums text-wv-ash">{fmtDate(l.created_at)}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-wv-ink">{l.contact_name}</div>
                      <a href={`mailto:${l.email}`} className="text-[12px] text-wv-blue hover:underline">{l.email}</a>
                      {l.role && <div className="text-[12px] text-wv-ash">{l.role}</div>}
                    </td>
                    <td className="px-3 py-3 text-wv-slate">{l.company || "—"}</td>
                    <td className="px-3 py-3">
                      <p className="max-w-[34ch] text-wv-slate">{l.outcome}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-wv-slate">{l.budget_range || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-wv-slate">{l.timeline || "—"}</td>
                    <td className="px-3 py-3">
                      <select
                        value={STATUSES.includes(l.status as Status) ? l.status : "new"}
                        disabled={busy === l.id}
                        onChange={(e) => setStatus(l.id, e.target.value as Status)}
                        className={`rounded-[3px] border border-wv-line px-2 py-1 font-mono text-[11px] outline-none focus:border-wv-blue disabled:opacity-50 ${STATUS_STYLE[l.status] ?? ""}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Engagements / milestones / ledger — activate with the first signed
            engagement (Phase 1, gated). Shown so the dashboard's shape is clear. */}
        <section className="mt-12 rounded-[3px] border border-dashed border-wv-line bg-wv-panel p-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash">Aufträge · Meilensteine · Ledger</p>
          <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-wv-slate">
            Werden aktiviert, sobald der erste Auftrag unterschrieben ist. Das mittelgebundene
            Ledger (Zahlungseingang, Auszahlung an Spezialisten) ist Phase 1 und erst nach dem Gate
            (4 von 20) vorgesehen — bis dahin ein bewusst leerer Platzhalter.
          </p>
        </section>
      </div>
    </div>
  );
}
