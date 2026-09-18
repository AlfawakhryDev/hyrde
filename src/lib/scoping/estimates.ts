// ── Outcome instrumentation helpers ─────────────────────────────────────────
// Pure, dependency-free logic shared by the create-project route. These produce
// the FIRST version of the calibration dataset. Everything here is intentionally
// crude (keyword classification, wide cold-start bands) and honestly labelled as
// such: basis='heuristic', prior_sample_size=0. It is replaced from the data
// side later (priors at n >= 5), never by hand-tuning these constants.

// Controlled milestone-type vocabulary. MUST stay in sync with the
// `milestone_types` table seeded in migration 0015. Free text is forbidden: it
// destroys the "milestone 3 overruns 60% of the time" aggregation.
export const MILESTONE_TYPES = [
  "discovery", "data_audit", "information_architecture", "design_system",
  "design_page", "frontend_build", "backend_build", "integration_third_party",
  "data_migration", "content_migration", "seo_preservation", "payment_config",
  "qa_functional", "qa_cross_browser", "performance_optimization", "deployment",
  "training_handover", "post_launch_support",
] as const;
export type MilestoneType = (typeof MILESTONE_TYPES)[number];

// Ordered rules: first keyword hit wins. Order matters where terms overlap
// (e.g. "migrate content" should read as content_migration before data_migration).
const TYPE_RULES: [MilestoneType, RegExp][] = [
  ["discovery",               /\b(discover|research|audit needs|requirements|kickoff|scoping|strategy)\b/i],
  ["data_audit",              /\b(data audit|assess data|inventory|catalog audit|content audit)\b/i],
  ["information_architecture",/\b(information architecture|sitemap|nav(igation)? structure|taxonomy|user flow)\b/i],
  ["design_system",          /\b(design system|component library|style guide|brand system|design tokens)\b/i],
  ["seo_preservation",       /\b(seo|redirect|url|canonical|search ranking|301)\b/i],
  ["content_migration",      /\b(content migrat|migrate content|copy migrat|move content|import posts)\b/i],
  ["data_migration",         /\b(migrat|data transfer|import data|port over|move the data)\b/i],
  ["payment_config",         /\b(payment|checkout|stripe|billing setup|subscription setup|tax config)\b/i],
  ["integration_third_party",/\b(integrat|api hook|third[- ]party|erp|3pl|crm|webhook|connect \w+ to)\b/i],
  ["design_page",            /\b(design|mockup|wireframe|figma|layout|visual|ui\b|hero section)\b/i],
  ["backend_build",          /\b(backend|api\b|server|database|auth|endpoint|schema|business logic)\b/i],
  ["frontend_build",         /\b(frontend|front[- ]end|build the (page|site|ui)|react|next|component|responsive)\b/i],
  ["qa_cross_browser",       /\b(cross[- ]browser|browser compat|safari|firefox|device testing)\b/i],
  ["qa_functional",          /\b(qa|test|bug|quality assurance|acceptance)\b/i],
  ["performance_optimization",/\b(performance|optimi[sz]e|speed|lighthouse|core web vitals|load time)\b/i],
  ["deployment",             /\b(deploy|launch|go[- ]live|ship it|release to prod|dns cutover)\b/i],
  ["training_handover",      /\b(training|handover|handoff|documentation|onboard the team|walkthrough)\b/i],
  ["post_launch_support",    /\b(post[- ]launch|support|maintenance|retainer|monitor|hypercare)\b/i],
];

// Rough fallback by marketplace category when no keyword matches.
const CATEGORY_FALLBACK: Record<string, MilestoneType> = {
  "Design": "design_page",
  "Web Development": "frontend_build",
  "Mobile Development": "frontend_build",
  "Writing": "content_migration",
  "Marketing": "content_migration",
  "Data": "data_migration",
  "Video": "design_page",
  "Other": "frontend_build",
};

export type MilestoneTypeResult = {
  type: MilestoneType;
  matched: boolean;   // false = fell back; log the raw label for monthly review
  rawLabel: string;   // what we were trying to classify
};

// Map a naive milestone to the controlled vocabulary. Never invents a type.
// Falls back to a category default and reports matched=false so the attempted
// label can be logged to `events` (spec 1.3) for deliberate vocab expansion.
export function mapMilestoneType(title: string, brief: string, category: string): MilestoneTypeResult {
  const hay = `${title} ${brief}`;
  for (const [type, re] of TYPE_RULES) {
    if (re.test(hay)) return { type, matched: true, rawLabel: `${category}: ${title}` };
  }
  return {
    type: CATEGORY_FALLBACK[category] ?? "frontend_build",
    matched: false,
    rawLabel: `${category}: ${title}`,
  };
}

// Keyword archetype classifier. Cheap and free; the LLM classifier (Call A)
// replaces this in a later build-order step. Returns a slug present in the
// `project_archetypes` seed, defaulting to 'other'.
export function classifyArchetype(rawRequest: string): string {
  const r = rawRequest.toLowerCase();
  if (/\bshopify\b/.test(r)) {
    if (/\b(replatform|migrat|move (from|to)|switch (from|to)|re-?platform)\b/.test(r)) return "shopify_replatform";
    if (/\b(theme|custom (theme|storefront)|liquid|redesign)\b/.test(r)) return "shopify_theme_custom";
    return "shopify";
  }
  if (/\b(mvp|web app|saas|dashboard|platform|internal tool)\b/.test(r)) return "web_app_mvp";
  if (/\b(landing page|marketing site|website for|homepage|company site)\b/.test(r)) return "marketing_site";
  if (/\b(brand|logo|identity|design system|rebrand)\b/.test(r)) return "brand_identity";
  if (/\b(blog|articles|copywriting|content|newsletter|whitepaper)\b/.test(r)) return "content_production";
  return "other";
}

export type EstimateBand = {
  cost_low: number;
  cost_high: number;
  duration_days_low: number;
  duration_days_high: number;
  confidence: number;
  basis: "heuristic";
  prior_sample_size: number;
};

// Cold-start heuristic band around the naive point estimate. Deliberately WIDE:
// with zero completed similar projects we do not pretend to precision. As priors
// accumulate (n >= 5 for an archetype+type) these are replaced by basis='prior'
// bands that narrow automatically. Never narrow these constants by hand.
export function estimateBand(budgetUsd: number, dueInDays: number): EstimateBand {
  const b = Math.max(0, Math.round(budgetUsd));
  const d = Math.max(1, Math.round(dueInDays));
  return {
    cost_low: Math.round(b * 0.7),
    cost_high: Math.round(b * 1.8),
    duration_days_low: Math.max(1, Math.round(d * 0.7)),
    duration_days_high: Math.max(1, Math.round(d * 1.8)),
    confidence: 0.25,               // low: cold start
    basis: "heuristic",
    prior_sample_size: 0,
  };
}
