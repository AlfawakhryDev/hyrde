"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { isBusinessEmail } from "@/lib/email";

// Pre-order / early-access registration (CLAUDE.md §8.2): a form, not an AI
// product. Writes one `leads` row via the anon client (RLS allows INSERT only).
// Business email + phone are required so ops has a reachable, qualified contact;
// the DB trigger enforce_business_email is the real gate. Honeypot drops bots.

const BUDGETS = ["Noch offen", "unter 15.000 €", "15.000–30.000 €", "30.000–60.000 €", "über 60.000 €"];
const TIMELINES = ["Noch offen", "So bald wie möglich", "in 1–3 Monaten", "in 3–6 Monaten"];

const labelCls = "block font-mono text-[10.5px] uppercase tracking-[0.14em] text-wv-ash mb-1.5";
const fieldCls =
  "w-full rounded-[3px] border border-wv-line bg-white px-3.5 py-2.5 text-[14px] text-wv-ink placeholder:text-wv-mist outline-none transition-colors focus:border-wv-blue";

export default function IntakeForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);

    if ((data.get("website") as string)?.trim()) {
      // Honeypot filled → treat as bot: pretend success, write nothing.
      setDone(true);
      return;
    }

    const contact_name = (data.get("contact_name") as string).trim();
    const email = (data.get("email") as string).trim();
    const phone = (data.get("phone") as string).trim();
    const company = (data.get("company") as string).trim();
    const outcome = (data.get("outcome") as string).trim();
    if (!contact_name || !email || !phone || !company || !outcome) {
      setError("Bitte füllen Sie Name, Unternehmen, geschäftliche E-Mail, Telefon und die Ergebnisbeschreibung aus.");
      return;
    }
    if (!isBusinessEmail(email)) {
      setError("Bitte verwenden Sie Ihre geschäftliche E-Mail-Adresse (keine privaten Anbieter wie Gmail, GMX oder Web.de).");
      return;
    }

    setBusy(true);
    const { error } = await supabaseBrowser().from("leads").insert({
      company,
      contact_name,
      email,
      phone,
      role: (data.get("role") as string).trim() || null,
      outcome,
      budget_range: (data.get("budget_range") as string) || null,
      timeline: (data.get("timeline") as string) || null,
      locale: "de",
      source: "preorder",
    });
    setBusy(false);

    if (error) {
      // The DB gate rejects free-provider domains even if the client check is bypassed.
      if (error.message?.includes("BUSINESS_EMAIL_REQUIRED")) {
        setError("Bitte verwenden Sie Ihre geschäftliche E-Mail-Adresse (keine privaten Anbieter).");
      } else {
        setError("Die Übermittlung ist fehlgeschlagen. Bitte versuchen Sie es erneut oder schreiben Sie an kontakt@hyrde.net.");
      }
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-[4px] border border-wv-line bg-white p-8">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ok">Eingegangen</p>
        <h2 className="mt-3 text-[20px] font-semibold tracking-[-0.01em] text-wv-ink">Vielen Dank.</h2>
        <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-wv-slate">
          Wir haben Ihre Anfrage erhalten und melden uns in der Regel innerhalb eines Werktags mit den
          nächsten Schritten: Leistungsbeschreibung, Abnahmekriterien und einem Festpreis.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[4px] border border-wv-line bg-white p-6 md:p-8" noValidate>
      {/* Honeypot — visually hidden, off the tab order. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact_name" className={labelCls}>Name *</label>
          <input id="contact_name" name="contact_name" required className={fieldCls} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="company" className={labelCls}>Unternehmen *</label>
          <input id="company" name="company" required className={fieldCls} autoComplete="organization" />
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>Geschäftliche E-Mail *</label>
          <input id="email" name="email" type="email" required className={fieldCls} autoComplete="email" placeholder="name@ihre-firma.de" />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>Telefon *</label>
          <input id="phone" name="phone" type="tel" required className={fieldCls} autoComplete="tel" placeholder="+49 …" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="role" className={labelCls}>Ihre Rolle</label>
          <input id="role" name="role" className={fieldCls} placeholder="z. B. CTO, Head of Engineering" />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="outcome" className={labelCls}>Welches Ergebnis benötigen Sie? *</label>
        <textarea
          id="outcome"
          name="outcome"
          required
          rows={5}
          className={`${fieldCls} resize-y`}
          placeholder="Ein grober Umriss genügt — etwa: Migration unserer Kernanwendung nach AWS, oder eine produktionsreife Daten-Pipeline."
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="budget_range" className={labelCls}>Budgetrahmen</label>
          <select id="budget_range" name="budget_range" className={fieldCls} defaultValue="Noch offen">
            {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="timeline" className={labelCls}>Zeitrahmen</label>
          <select id="timeline" name="timeline" className={fieldCls} defaultValue="Noch offen">
            {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="mt-5 text-[13px] text-wv-signal">{error}</p>}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center rounded-[3px] bg-wv-ink px-6 text-[14px] font-medium text-wv-paper transition-colors hover:bg-wv-blue disabled:opacity-60"
        >
          {busy ? "Wird übermittelt…" : "Anfrage senden"}
        </button>
        <p className="text-[12px] leading-snug text-wv-mist">
          Mit dem Absenden willigen Sie in die Kontaktaufnahme zu Ihrer Anfrage ein.
        </p>
      </div>
    </form>
  );
}
