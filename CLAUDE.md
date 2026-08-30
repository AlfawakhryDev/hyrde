# Hyrde — Project Context
> Drop this at the repo root as `CLAUDE.md`. Claude Code reads it on every session.
> Read this whole file before writing code. If something here contradicts existing code, **this file wins** — the existing code is from the pre-pivot version and is being deliberately unwound.
---
## 0. Read this first: what changed
Hyrde was a horizontal, global, zero-fee freelance marketplace with AI matching and off-platform direct payment. That model is being killed. Do not preserve it, do not "keep it as an option," do not build feature flags to switch back to it.
The new company:
**Hyrde delivers fixed-scope software and engineering outcomes to German-speaking clients, executed by vetted MENA specialists, under a German Werkvertrag structure that removes the client's Scheinselbstständigkeit liability.**
We are an outcome delivery firm with a compliance product, not a marketplace. The AI vetting interview is retained as an internal quality gate. The AI matching engine is retained but demoted — it is a tool for the ops team, not a public-facing feature.
### The thesis, so you can make decisions without asking
Three facts collide:
1. German IT freelance day rates run roughly €800–1,400. A single engagement is €40–80k. That is a real deal size that supports a real sales motion.
2. German buyers face record-high Scheinselbstständigkeit (false self-employment) exposure — back-payments retroactive up to four years. The recognised protection is contracting for a **result** (Werkvertrag) rather than for **labour under direction** (Dienstvertrag).
3. Senior MENA engineering talent delivers at roughly €150–250/day.
So: a German client buys a defined deliverable at ~50% of local market rate, with the liability structurally removed, and we run agency-grade margin. The product is **the contract, the scope, and the audit trail** — not the matching.
**If you ever have to choose between making matching smarter and making the compliance artefacts stronger, choose compliance. That is the moat.**
---
## 1. Hard rules — do not build these
These are settled decisions. Do not reintroduce them, do not suggest them in PR descriptions.
| Banned | Why |
|---|---|
| Bidding, proposals, an "Apply" button | Contradicts the whole positioning. Talent is assigned, never applies. |
| Off-platform / direct client→freelancer payment | This is what killed the last version. We are merchant of record. All money moves through us. |
| A free tier, "$0 fees," or "free during early access" | Pricing power is the product. Every engagement is quoted and paid. |
| Public talent browsing / profile directories | We sell outcomes. The client never shops for a person. |
| Hourly billing as the primary model | Hourly = Dienstvertrag = liability. Fixed-price milestones only. See §4. |
| Horizontal categories (design, copywriting, marketing, data, technical writing) | One vertical only. See §3. |
| Anything implying we supply "staff," "resources," "personnel," or "an extra pair of hands" | That language is legally dangerous in Germany. See §7. |
| Ratings, review stars, public leaderboards | Marketplace furniture. Not our model. |
---
## 2. Who we sell to
**Primary ICP (phase 1 — English-speaking, low procurement friction):**
- German, Austrian, Swiss startups and scale-ups, Series A–C, 20–200 employees
- Buyer: CTO, VP Engineering, Head of Product
- Pain: hiring freeze or budget cut, but a roadmap that still has to ship. Or: they currently use German freelancers and their legal/finance team has flagged the Scheinselbstständigkeit exposure.
- Deal size: €15k–60k
- Cycle: 3–8 weeks
**Secondary ICP (phase 2 — requires German C1 and an entity with a track record):**
- Mittelstand, 200–2,000 employees, IT or engineering department
- Buyer: IT-Leiter, Bereichsleiter, Einkauf involved
- Deal size: €40k–150k
- Cycle: 3–9 months, Betriebsrat and vendor onboarding involved
- **Do not build for this ICP yet.** Note it in architecture decisions so we don't paint ourselves into a corner, but ship for phase 1.
**Explicitly not our customer:** individuals, agencies reselling us, anyone wanting a person hourly, anyone outside DACH in phase 1.
---
## 3. Vertical scope
We serve **one** vertical. The choice is between two candidates and is **not yet made** — see §12. Until it is decided, build the category as configuration, not as hardcoded copy.
- **Candidate A — Cloud / AI / data engineering.** Demand still exceeds supply in DACH while the general freelance market contracts. Large addressable buyer set among startups.
- **Candidate B — SAP (S/4HANA migration work).** Highest day rates in the market, a hard external deadline forcing spend, deep MENA talent pool. Longer sales cycle, more enterprise-shaped.
Model this as a single `vertical` config object driving categories, interview rubrics, scope templates, and marketing copy. One active vertical at a time. Do not build a multi-vertical UI.
---
## 4. The legal structure is the product spec
**⚠️ I am not a lawyer and neither are you. Every template, clause, and generated document in this repo must be reviewed by a German Fachanwalt für Arbeitsrecht / IT-Recht before a single one goes to a real client. Build the system so templates are swappable files, not strings buried in components. Put a `LEGAL_REVIEW_REQUIRED` banner in the template directory README.**
With that said, here is what the system has to encode.
### Werkvertrag, not Dienstvertrag
Every engagement is a contract for a **defined result** with acceptance criteria (Abnahme). This has direct product consequences:
- Every engagement **must** have a written `Leistungsbeschreibung` (scope of work) and explicit `Abnahmekriterien` (acceptance criteria) before work starts. The system must refuse to open an engagement without both.
- Milestones are results, not time periods. "Auth flow implemented and passing acceptance tests" — not "Sprint 2" or "Week 3."
- Payment triggers on Abnahme, never on elapsed time or hours logged.
- There is **no timesheet feature.** Do not build one. If someone asks for one, flag it here.
### Indicia of genuine contractor status — build the audit trail
The system should passively generate evidence that the arrangement is a genuine Werkvertrag. Every engagement accumulates a **compliance dossier**:
- Signed Werkvertrag with scope + acceptance criteria
- Record that the specialist used their own equipment and infrastructure
- Record that the specialist was not integrated into client systems in a way implying instruction (flag it if a client requests they join daily standups, use the client's laptop, or report to a client manager — surface a warning in the UI)
- Evidence of the specialist's other concurrent clients
- Abnahme records with timestamps and the client's explicit sign-off
- Invoices issued by Hyrde (not by the individual to the client)
Exportable as a single PDF dossier per engagement. **This export is a headline feature.** It is what the client's legal team asks for.
### The relationship chain
Client contracts with **Hyrde** (EU entity). Hyrde subcontracts to the specialist. The client and the specialist never contract directly. This matters — it is what puts a real company between the client and the individual.
### Other compliance surfaces to build
- **Impressum** and **Datenschutzerklärung** pages, German-law compliant, reachable from every page footer (legally mandatory — TMG/DDG).
- **AGB** (terms) as a versioned document with acceptance recorded per user, per version.
- **GDPR:** data export, deletion, processing records, cookie consent that actually blocks non-essential scripts before consent.
- **UWG §7 — outbound:** German B2B cold email requires presumed consent (*mutmaßliche Einwilligung*), stricter than CASL or CAN-SPAM. Any outbound tooling built in-repo must log the consent basis per contact and support suppression lists. Do not build a bulk blast tool.
- **VAT:** EU B2B cross-border services are typically reverse charge (client accounts for VAT); a German entity invoicing a German client charges 19% USt. Invoice generation must handle both, driven by entity country + client country + VAT ID validity (VIES check).
---
## 5. Money — architecture constraint you must respect
**Stripe does not support payouts to Egypt.** This is a hard constraint and it shapes the design.
```
German client (EUR)
      ↓  Stripe / SEPA direct debit / bank transfer
Hyrde EU entity  ← merchant of record, holds funds against milestones
      ↓  Payoneer / Wise / bank wire / (USDT as fallback)
MENA specialist
```
Requirements:
- Funds are held against the milestone and released on Abnahme. Model this as an internal ledger with states (`held`, `released`, `refunded`, `disputed`) — do not rely on a payment provider's escrow product to exist.
- Payout rails are pluggable adapters behind one interface. Assume we will change providers.
- Every ledger entry is immutable and append-only. Corrections are new entries, never edits.
- Invoices must be sequential, gapless, and immutable once issued (GoBD requirement).
- Payment terms: 30 days net is standard in DACH. Model this. We front the specialist's milestone payment before the client's invoice clears — surface the working-capital exposure on an internal dashboard.
---
## 6. Stack
Keep what exists where it still fits:
- **Next.js (App Router), TypeScript, React Server Components**
- **Supabase** — Postgres, RLS, storage. RLS policies are not optional; write them with every table.
- **Clerk** — auth. Separate roles: `client`, `specialist`, `ops`.
- **Stripe** — collection only (EU). Not Connect for payouts.
- **Anthropic API** — interview grading, scope decomposition, deliverable review, contract drafting assistance.
- **Vercel** — hosting. The Vercel MCP connector is available.
- **next-intl** or equivalent for i18n.
### i18n is a first-class requirement, not a later task
- **German (`de-DE`) is the default locale for all client-facing surfaces.** Not English with a translation toggle bolted on.
- English (`en`) for specialist-facing surfaces.
- Locale-prefixed routes (`/de/...`, `/en/...`), `hreflang` tags, German-first metadata.
- Legal documents exist per-locale and are **not machine translated** — they are separate authored files.
- Use `Sie` form throughout German client-facing copy. Never `du`. (Specialist-facing English is informal.)
- Formatting: German number format (1.234,56 €), DD.MM.YYYY dates, EUR everywhere.
---
## 7. Copy rules — treat these as strictly as type errors
German B2B buying is conservative and the vocabulary carries legal weight. Wrong word choice creates liability and kills trust.
**Never write, in any language, in any surface:**
- "freelancer," "Freelancer," "Freiberufler" in reference to what the *client* is buying — the client buys a Werkleistung, a delivered result
- "hire," "einstellen," "hire a developer" — nobody is being hired
- "staff," "resources," "personnel," "Personal," "Mitarbeiter," "Arbeitskraft," "Verstärkung"
- "Arbeitnehmerüberlassung," "Zeitarbeit," "Personalvermittlung" — different regulated business, we are not that
- "cheap," "günstig," "low cost," "affordable" — we compete on risk removal and defined outcome, price is a consequence
- "marketplace," "Marktplatz," "platform for freelancers"
- "outsourcing," "offshore" — loaded and defensive
**Do write:**
| Concept | German | English |
|---|---|---|
| The thing being bought | Werkleistung, definiertes Ergebnis | a defined result, a delivered outcome |
| The contract | Werkvertrag | contract for work |
| Scope | Leistungsbeschreibung | scope of work |
| Acceptance | Abnahme, Abnahmekriterien | acceptance, acceptance criteria |
| The person delivering | Spezialist, Fachexperte | specialist |
| Us | Auftragnehmer, Werkunternehmer | contractor, delivery partner |
| The risk we remove | Scheinselbstständigkeitsrisiko | false self-employment exposure |
| Fixed price | Festpreis | fixed price |
**Tone:** precise, unadorned, engineer-to-engineer. German B2B does not respond to American startup enthusiasm. No exclamation marks. No "revolutionise." No emoji in product surfaces. Claims must be falsifiable — say what happens, not how great it is.
**English specialist-facing copy** can be warmer and more direct, but still no hype.
---
## 8. Product surfaces and build order
### Phase 0 — Validation (build this first, nothing else)
The business is not validated. Do not build the platform yet. Build only what is needed to sell twenty conversations and close one engagement manually.
1. **New marketing site, German-first.** Single thesis: buy a defined result, at a defined price, without the liability. Pages: home, how it works, the legal structure explained, pricing, Impressum, Datenschutz, contact.
2. **Scope intake form** → creates a lead record. Not an AI product yet. A form.
3. **Werkvertrag generator (internal tool).** Ops fills scope + acceptance criteria + milestones + price, generates a German Werkvertrag PDF from a lawyer-reviewed template. This is the highest-leverage thing in the repo.
4. **A single internal ops dashboard**: leads, engagements, milestones, ledger.
Everything in phase 0 can have a human in every loop. **Do not automate anything in phase 0.**
**Gate: do not start phase 1 until four out of twenty qualified DACH CTOs have said yes to a priced proposal.** If you are asked to build phase 1 features before that, push back and reference this line.
### Phase 1 — First ten engagements
5. Client portal: engagement view, milestone status, Abnahme flow with explicit sign-off, document vault, invoices
6. Specialist portal: assigned milestone, deliverable submission, payout status
7. Ledger + milestone-linked fund holding
8. Compliance dossier PDF export
9. AI scope decomposition (outcome → ordered milestones with acceptance criteria) — assistive, ops reviews every output before it reaches a client
### Phase 2 — Scale the delivery side
10. Specialist vetting interview (port the existing adaptive interview, retune the rubric to the chosen vertical)
11. Specialist bench management, availability, concurrent-client tracking (feeds the compliance dossier)
12. AI deliverable review against acceptance criteria — internal QA gate before client Abnahme, never shown to the client as the sole verdict
13. Matching engine — ops-facing ranked suggestion, ops decides
### Phase 3 — Not now
Mittelstand procurement features, SSO, DATEV export, multi-vertical, Betriebsrat documentation packs.
---
## 9. Data model — core entities
Sketch, not gospel. Extend as needed; keep the names.
- `organizations` — client companies. country, VAT ID, VIES validation status, preferred locale
- `contacts` — people at client orgs. **consent basis + timestamp + source** on every record (UWG §7)
- `specialists` — vetting score, vertical, categories, day-rate cost, payout rail, concurrent client count
- `engagements` — the unit of business. org, scope description, total price, currency, status, contract version
- `milestones` — engagement, ordered index, result description, **acceptance criteria (required, non-null)**, price, status, assigned specialist
- `acceptances` — milestone, client contact who signed, timestamp, verdict, notes. Immutable.
- `contracts` — engagement, template version, generated PDF, signature records
- `ledger_entries` — append-only. engagement, milestone, direction, amount, currency, state, external ref
- `invoices` — sequential number, immutable once issued, VAT treatment, PDF
- `compliance_events` — anything that strengthens or threatens the Werkvertrag characterisation. Client requested a standup? Log it and warn.
- `documents` — engagement-scoped vault
**RLS on everything.** A client sees only their own org's rows. A specialist sees only assigned milestones and never the client's price, only their own payout amount. Ops sees all.
---
## 10. Design direction
Do not produce the default AI-startup look — cream background, high-contrast serif, terracotta accent. Also avoid dark-mode-with-one-neon-accent, and avoid the broadsheet/hairline-rules layout. These read as templated.
**Ground the design in the subject: German technical documentation.** The visual world of this product is DIN standards, engineering drawings, Leistungsverzeichnisse, stamped and signed acceptance protocols. Precision instruments, not startup optimism. The page should feel like a document you could hand to a legal department.
Direction to explore (revise if you find something stronger — but justify it against the brief, not against taste):
- **Palette:** paper white, a dense near-black ink, one structural blue borrowed from technical drawing convention, a muted signal amber reserved *exclusively* for compliance warnings, and one neutral grey scale. Five values, no more. Colour carries meaning here — amber must never be decorative.
- **Type:** a grotesque with real engineering character for display (something in the lineage of technical lettering, not Inter), a highly legible body face that handles long German compound words without breaking, and a monospace for reference numbers, milestone IDs, prices, and contract clauses. German words are long — test the type scale with `Scheinselbstständigkeitsrisiko` and `Leistungsbeschreibung` before committing.
- **Structure:** numbered sequences are *earned* here — a Werkvertrag has genuinely ordered clauses and milestones genuinely have order. Use numbering where the order is real, nowhere else.
- **Signature element:** the engagement itself rendered as a living document — milestones as clauses in a contract that fill in, get stamped, and get signed off as the work progresses. The client's project *is* the contract, visibly. Spend the boldness here and keep everything else quiet.
- **Motion:** minimal. A stamp/sign-off moment on Abnahme is the one place animation earns its keep.
Quality floor, unannounced: responsive to mobile, visible keyboard focus, `prefers-reduced-motion` respected, WCAG AA contrast.
---
## 11. Working agreements
- TypeScript strict. No `any`.
- Money as integer minor units. Never floats. Currency always explicit.
- All dates stored UTC, displayed in the client's locale and timezone.
- Server Components by default; client components only where interaction demands it.
- Every legal or financial calculation gets a unit test. Every VAT branch gets a test.
- Legal templates live in `/legal/templates/{locale}/` as versioned files with a changelog. Never inline a legal string in a component.
- Secrets in env vars, `.env.example` maintained.
- Commit messages: what changed and why, not "update files."
- When a decision in this file blocks you, **stop and ask.** Do not route around it.
---
## 12. Open decisions — ask, do not assume
These are unresolved. If your work depends on one, raise it rather than picking.
1. **Vertical: cloud/AI/data vs SAP.** Everything downstream depends on this. Highest priority.
2. **Legal entity.** German UG/GmbH vs Estonian OÜ vs Irish Ltd. Affects VAT logic, invoicing, and whether "Made in Germany" is available as a trust signal. Notary and tax advisor needed.
3. **Is Hyrde still the name in DACH?** It reads as neither German nor English. May be fine, may be a liability with conservative buyers. Test it in the twenty validation calls.
4. **Specialist engagement model.** Per-project subcontract vs a small retained bench. Retained bench improves availability and delivery risk; costs cash we don't have.
5. **Payout provider.** Payoneer vs Wise vs direct wire. Depends on entity and on where the first specialists bank.
6. **Warranty exposure.** Werkvertrag carries statutory Gewährleistung on the delivered result — typically 24 months for work-product under German law, and this is exactly the kind of thing a lawyer must scope. What do we cap, what do we insure (Berufshaftpflicht), and what does that cost? This materially affects pricing.
7. **Founder bandwidth.** The repo assumes someone is selling full-time. If that isn't true, phase 0 is the only phase that matters and the build should stay smaller than what's written here.
---
## 13. What "done" means for phase 0
- A German-language site that a DACH CTO could read and understand the offer in under 60 seconds
- A working scope intake that produces a lead in the database
- An internal tool that turns scope + milestones + price into a signable German Werkvertrag PDF
- An ops dashboard showing leads, engagements, milestones, and money
- Impressum, Datenschutzerklärung, AGB live and reachable
- Nothing else
One signed contract and one paid invoice is the actual success metric. Not signups.

---
## 14. Operational / harness notes (kept from the pre-pivot repo — still true)
These are build-environment facts, orthogonal to the business pivot. Do not lose them.
@AGENTS.md
