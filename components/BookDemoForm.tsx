"use client";
import { useState } from "react";
import { ENTERPRISE } from "@/content/marketing";

/**
 * Book-a-demo form — DEMO STUB. Validates and shows a success state entirely
 * client-side; no data leaves the browser in this build. Wire the handleSubmit
 * body to a real endpoint (e.g. POST /api/demo or a CRM) when ready.
 */
export default function BookDemoForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", teamSize: "1–10", needs: "" });
  const [submitted, setSubmitted] = useState(false);

  const valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.company.trim();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // INTEGRATION POINT: POST `form` to your sales/CRM endpoint here.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-border-crisp p-10 text-center">
        <span className="w-14 h-14 rounded-full bg-electric-violet/10 flex items-center justify-center mx-auto mb-4">
          <span
            className="material-symbols-outlined text-electric-violet"
            style={{ fontSize: "30px", fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </span>
        <h3 className="text-xl font-bold font-headline text-tech-blue-deep mb-2">
          {ENTERPRISE.demo.fields.success}
        </h3>
        <p className="text-sm font-body text-on-surface-variant">
          We&apos;ll be in touch at <strong className="text-tech-blue-deep">{form.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-crisp p-7 md:p-8 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name">
          <input
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="Jane Doe"
            className="w-full border border-border-crisp rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10 bg-surface-gray/50"
          />
        </Field>
        <Field label="Work email">
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="jane@company.com"
            className="w-full border border-border-crisp rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10 bg-surface-gray/50"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Company">
          <input
            type="text"
            value={form.company}
            onChange={set("company")}
            placeholder="Acme Inc."
            className="w-full border border-border-crisp rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10 bg-surface-gray/50"
          />
        </Field>
        <Field label="Team size">
          <select
            value={form.teamSize}
            onChange={set("teamSize")}
            className="w-full border border-border-crisp rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10 bg-surface-gray/50"
          >
            {["1–10", "11–50", "51–200", "201–1000", "1000+"].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="What are you hiring for? (optional)">
        <textarea
          rows={3}
          value={form.needs}
          onChange={set("needs")}
          placeholder="e.g. We hire ~10 contract engineers a quarter and need SSO + consolidated billing."
          className="w-full border border-border-crisp rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10 bg-surface-gray/50 resize-none"
        />
      </Field>

      <button
        type="submit"
        disabled={!valid}
        className="w-full bg-tech-blue-deep text-white font-semibold font-body py-3.5 rounded-full hover:scale-[0.99] transition-transform text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {ENTERPRISE.demo.cta.label}
      </button>
      <p className="text-xs font-body text-on-surface-variant/70 text-center">{ENTERPRISE.demo.fields.note}</p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
