"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "./I18nProvider";

// ── "Where are you?" ─────────────────────────────────────────────────
// Deliberately NOT on the signup form. Every field there is a reason to
// abandon it, and neither of these is needed to create an account. Asked once,
// afterwards, when the person is already in and has a reason to care:
// timezone-correct call scheduling, and a number for the specialist to reach.
//
// Dismissable, and it never comes back once the country is set. Phone stays
// optional — it goes to profile_private, which no other user can read.

const COMMON = [
  "Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman",
  "Egypt", "Jordan", "Germany", "United Kingdom", "United States", "Canada",
  "India", "Pakistan", "Bangladesh", "Nigeria", "Kenya", "South Africa",
];

export default function WhereAreYou({ initialCountry }: { initialCountry: string | null }) {
  const t = useT();
  const [country, setCountry] = useState(initialCountry ?? "");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(!!initialCountry);
  const [error, setError] = useState("");

  async function save() {
    if (!country.trim()) { setError(t("where.errCountry")); return; }
    setBusy(true); setError("");
    try {
      const supa = supabaseBrowser();
      const { data: { user } } = await supa.auth.getUser();
      if (!user) { setError(t("where.errAuth")); return; }

      const { error: pErr } = await supa.from("profiles")
        .update({ country: country.trim() }).eq("id", user.id);
      if (pErr) { setError(pErr.message); return; }

      // Optional, and private. Skipping it must not lose the country.
      if (phone.trim()) {
        await supa.from("profile_private")
          .upsert({ user_id: user.id, phone: phone.trim() }, { onConflict: "user_id" });
      }
      setHidden(true);
    } finally {
      setBusy(false);
    }
  }

  if (hidden) return null;

  return (
    <div className="mb-6 rounded-xl border border-border-crisp bg-surface-container-low px-4 py-3.5">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <span className="material-symbols-outlined text-on-surface-variant mt-0.5" style={{ fontSize: "18px" }}>public</span>
        <div className="flex-1 min-w-[240px]">
          <p className="text-[13.5px] text-on-surface font-medium">{t("where.title")}</p>
          <p className="text-[12.5px] text-on-surface-variant mt-0.5">{t("where.body")}</p>
        </div>
        <button onClick={() => setHidden(true)} aria-label={t("where.later")}
          className="text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <input
          list="way-countries"
          value={country}
          onChange={e => setCountry(e.target.value)}
          placeholder={t("where.countryPh")}
          aria-label={t("where.country")}
          className="flex-1 min-w-[170px] border border-border-crisp rounded-lg px-3 py-2 text-[13.5px] text-on-surface bg-surface-bright focus:outline-none focus:border-on-surface"
        />
        <datalist id="way-countries">
          {COMMON.map(c => <option key={c} value={c} />)}
        </datalist>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          type="tel"
          inputMode="tel"
          dir="ltr"
          placeholder={t("where.phonePh")}
          aria-label={t("where.phone")}
          className="flex-1 min-w-[170px] border border-border-crisp rounded-lg px-3 py-2 text-[13.5px] text-on-surface bg-surface-bright focus:outline-none focus:border-on-surface"
        />
        <button
          onClick={save}
          disabled={busy}
          className="h-9 px-4 rounded-full bg-on-surface text-inverse-on-surface text-[12.5px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {busy ? t("where.saving") : t("where.save")}
        </button>
      </div>

      {error && <p className="text-[12.5px] text-error mt-2">{error}</p>}
    </div>
  );
}
