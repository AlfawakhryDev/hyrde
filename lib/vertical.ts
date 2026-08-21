// ── Vertical configuration (CLAUDE.md §3) ────────────────────────────────────
// We serve ONE vertical at a time. It drives categories, scope templates,
// interview rubrics, and marketing copy — so the choice lives in data, not in
// hardcoded strings scattered through components. Active vertical: cloud / AI /
// data engineering (decided 2026-08-21). Swapping verticals = swap this object.

export type Vertical = {
  id: string;
  /** Short label for internal/ops surfaces (English). */
  label: string;
  /** Client-facing German name of the delivery domain. */
  labelDe: string;
  /** Delivery categories a scope can fall under. Ops + scope templates key off these. */
  categories: { id: string; de: string; en: string }[];
  /** Concrete example outcomes, German, for marketing copy (Sie-form, on-message). */
  examplesDe: string[];
};

export const VERTICAL: Vertical = {
  id: "cloud-ai-data",
  label: "Cloud / AI / Data Engineering",
  labelDe: "Cloud-, KI- und Data-Engineering",
  categories: [
    { id: "cloud", de: "Cloud-Architektur & Migration", en: "Cloud architecture & migration" },
    { id: "data", de: "Data-Engineering & Pipelines", en: "Data engineering & pipelines" },
    { id: "ml", de: "KI- & ML-Systeme", en: "AI / ML systems" },
    { id: "platform", de: "Plattform & DevOps", en: "Platform & DevOps" },
    { id: "backend", de: "Backend & APIs", en: "Backend & APIs" },
  ],
  examplesDe: [
    "Migration einer Monolith-Anwendung nach AWS mit definierten Abnahmekriterien",
    "Aufbau einer Data-Pipeline von Quellsystem bis Dashboard, produktionsreif",
    "Ein RAG-basiertes Retrieval-System, gegen einen Testdatensatz abgenommen",
    "Infrastruktur-as-Code für eine bestehende Kubernetes-Landschaft",
  ],
};
