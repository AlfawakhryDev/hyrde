// ── Interrogation engine: question tree + selection (spec 2.3-2.4) ──────────
// Pure, dependency-free. Imported by BOTH the interrogation UI (question order,
// progress) and the server (risk-flag derivation, persistence) so the two never
// disagree. Questions are ranked by cost-variance-resolved-per-question, NOT by
// relevance: we ask what most reduces uncertainty about what the work will cost.
//
// Versioned from the first commit (QUESTION_SET_VERSION) so tree changes stay
// attributable when question_value analysis starts.

export const QUESTION_SET_VERSION = "shopify-v1";

// Answer budget. Past ~12, completion collapses and we lose the client. If
// confidence is still low at the ceiling, we emit anyway with risk flags.
export const QUESTION_BUDGET = 10;
export const MIN_QUESTIONS = 4;
// Enough resolved variance to stop early and respect the client's time.
export const CONFIDENCE_TARGET = 0.8;

export type QuestionType = "single_select" | "multi_select";

export type Question = {
  key: string;
  text: string;
  help?: string;
  type: QuestionType;
  options: { value: string; label: string }[];
  // Fraction of total cost uncertainty this question resolves (0..1).
  variance_weight: number;
  affects_milestones: string[];
  // Follow-up gating: eligible once `gatedBy.key` is answered with `equals`,
  // or with any value in `oneOf`. oneOf exists so a question can be shown to
  // several audiences (e.g. everyone except a non-technical client).
  gatedBy?: { key: string; equals?: string; oneOf?: string[] };
  // What an unresolved answer means, and its cost multiplier band.
  unknown_risk: { description: string; cost_impact_multiplier: [number, number] };
};

// The value that means "I don't know" for every single_select (multi_select
// uses an explicit option). dont_know is first-class: it produces a risk flag
// with a contingency band rather than failing validation.
export const DONT_KNOW = "dont_know";

// Shopify has a specialized, calibrated tree. Everything else uses the generic
// tree below, so EVERY project gets interrogated (never zero questions).
export const SHOPIFY_ARCHETYPES = new Set(["shopify", "shopify_replatform", "shopify_theme_custom"]);
export function isShopify(slug: string | null | undefined): boolean {
  return !!slug && SHOPIFY_ARCHETYPES.has(slug);
}
// Every archetype now resolves to a tree (Shopify-specific or generic).
export function archetypeHasTree(): boolean {
  return true;
}

const SHOPIFY_TREE: Question[] = [
  {
    key: "shopify.catalog_data_quality",
    text: "Are your product descriptions and images complete and consistent today?",
    help: "The single biggest driver of migration overruns. Honest answers here save the most.",
    type: "single_select",
    options: [
      { value: "clean", label: "Clean and consistent" },
      { value: "mixed", label: "Mixed, some gaps" },
      { value: "messy", label: "Messy or incomplete" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.85,
    affects_milestones: ["data_migration", "content_migration"],
    unknown_risk: {
      description: "Catalog data quality unconfirmed; migration effort could balloon if data is messy.",
      cost_impact_multiplier: [1.0, 2.5],
    },
  },
  {
    key: "shopify.custom_apps_count",
    gatedBy: { key: "meta.expertise", oneOf: ["hands_on"] },
    text: "Do you have any custom-built apps installed?",
    help: "Each custom app is its own migration risk with hard-to-bound cost.",
    type: "single_select",
    options: [
      { value: "none", label: "None" },
      { value: "one_two", label: "One or two" },
      { value: "several", label: "Several" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.8,
    affects_milestones: ["integration_third_party", "backend_build"],
    unknown_risk: {
      description: "Custom apps not enumerated; each one can be an unbounded migration cost.",
      cost_impact_multiplier: [1.0, 2.2],
    },
  },
  {
    key: "shopify.integrations",
    text: "Which of these do you connect to your store?",
    help: "Each system is a separate integration milestone.",
    type: "multi_select",
    options: [
      { value: "erp", label: "ERP" },
      { value: "3pl", label: "3PL / fulfilment" },
      { value: "subscriptions", label: "Subscriptions" },
      { value: "loyalty", label: "Loyalty / rewards" },
      { value: "none", label: "None of these" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.8,
    affects_milestones: ["integration_third_party"],
    unknown_risk: {
      description: "Integration surface unconfirmed; each connected system is its own milestone.",
      cost_impact_multiplier: [1.0, 2.0],
    },
  },
  {
    key: "shopify.current_theme_origin",
    gatedBy: { key: "meta.expertise", oneOf: ["hands_on", "some"] },
    text: "Is your current storefront an off-the-shelf theme, or custom-coded?",
    type: "single_select",
    options: [
      { value: "off_the_shelf", label: "Off-the-shelf theme" },
      { value: "custom", label: "Custom-coded" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.75,
    affects_milestones: ["frontend_build", "design_page"],
    unknown_risk: {
      description: "Theme origin unknown; a custom theme can hide significant technical debt.",
      cost_impact_multiplier: [1.0, 2.0],
    },
  },
  {
    key: "shopify.design_input",
    text: "Do you have an existing brand and design system, or are we designing from scratch?",
    help: "This is a 3 to 5x swing on the design milestones.",
    type: "single_select",
    options: [
      { value: "brand_system", label: "Full brand system" },
      { value: "partial", label: "Some brand assets" },
      { value: "from_scratch", label: "From scratch" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.7,
    affects_milestones: ["design_system", "design_page"],
    unknown_risk: {
      description: "Design starting point unconfirmed; from-scratch design is a large cost delta.",
      cost_impact_multiplier: [1.0, 3.0],
    },
  },
  {
    key: "shopify.plus_tier",
    gatedBy: { key: "meta.expertise", oneOf: ["hands_on", "some"] },
    text: "Are you on Shopify Plus, or a standard plan?",
    help: "Gates checkout customization, scripts, and API limits.",
    type: "single_select",
    options: [
      { value: "plus", label: "Shopify Plus" },
      { value: "standard", label: "Standard plan" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.6,
    affects_milestones: ["payment_config", "integration_third_party"],
    unknown_risk: {
      description: "Plan tier unconfirmed; some checkout customization may be unavailable.",
      cost_impact_multiplier: [1.0, 1.6],
    },
  },
  {
    key: "shopify.catalog_size",
    text: "Roughly how many products (SKUs) do you sell?",
    type: "single_select",
    options: [
      { value: "lt_100", label: "Under 100" },
      { value: "100_1k", label: "100 to 1,000" },
      { value: "1k_10k", label: "1,000 to 10,000" },
      { value: "10k_plus", label: "Over 10,000" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.55,
    affects_milestones: ["data_migration", "content_migration"],
    unknown_risk: {
      description: "Catalog size unknown; migration effort scales with SKU count.",
      cost_impact_multiplier: [1.0, 1.6],
    },
  },
  {
    key: "shopify.seo_preservation",
    text: "Do your existing URLs need to be preserved for SEO?",
    help: "Redirect mapping is its own milestone.",
    type: "single_select",
    options: [
      { value: "yes", label: "Yes, preserve them" },
      { value: "no", label: "No, fresh start is fine" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.5,
    affects_milestones: ["seo_preservation"],
    unknown_risk: {
      description: "SEO preservation unconfirmed; redirect mapping may add a milestone.",
      cost_impact_multiplier: [1.0, 1.4],
    },
  },
  {
    key: "shopify.content_ownership",
    text: "Who writes the product and page copy?",
    type: "single_select",
    options: [
      { value: "client", label: "We do" },
      { value: "hyrde", label: "We need a writer" },
      { value: DONT_KNOW, label: "Undecided" },
    ],
    variance_weight: 0.45,
    affects_milestones: ["content_migration"],
    unknown_risk: {
      description: "Copy ownership unassigned; a classic source of scope creep.",
      cost_impact_multiplier: [1.0, 1.5],
    },
  },
  {
    key: "shopify.launch_constraint",
    text: "Is there a fixed launch date you need to hit?",
    type: "single_select",
    options: [
      { value: "fixed", label: "Yes, a hard date" },
      { value: "flexible", label: "Flexible" },
      { value: DONT_KNOW, label: "Not sure yet" },
    ],
    variance_weight: 0.4,
    affects_milestones: ["deployment", "qa_functional"],
    unknown_risk: {
      description: "Launch constraint unknown; a fixed date compresses sequencing and raises cost.",
      cost_impact_multiplier: [1.0, 1.3],
    },
  },
  // ── Follow-ups (gated) ──
  {
    key: "shopify.checkout_customization",
    text: "Do you need a customized checkout (scripts, custom fields, or checkout UI)?",
    type: "single_select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.5,
    affects_milestones: ["payment_config", "frontend_build"],
    gatedBy: { key: "shopify.plus_tier", equals: "plus" },
    unknown_risk: {
      description: "Checkout customization scope unconfirmed on a Plus plan.",
      cost_impact_multiplier: [1.0, 1.7],
    },
  },
  {
    key: "shopify.theme_debt",
    text: "Is your custom theme documented and maintainable, or has it drifted over time?",
    type: "single_select",
    options: [
      { value: "documented", label: "Documented and clean" },
      { value: "drifted", label: "Drifted / undocumented" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.6,
    affects_milestones: ["frontend_build"],
    gatedBy: { key: "shopify.current_theme_origin", equals: "custom" },
    unknown_risk: {
      description: "Custom theme maintainability unknown; undocumented themes carry hidden rework.",
      cost_impact_multiplier: [1.0, 1.8],
    },
  },
];

// Generic tree — used for every non-Shopify project so nothing skips
// interrogation. These are the questions that move cost variance on almost any
// freelance outcome, regardless of domain (a game, an app, a brand, content...).
const GENERIC_TREE: Question[] = [
  {
    key: "generic.scope_clarity",
    text: "How defined is what you need right now?",
    help: "The biggest driver of cost variance. Honesty here saves the most.",
    type: "single_select",
    options: [
      { value: "detailed_spec", label: "I have a detailed spec" },
      { value: "rough_idea", label: "A rough idea" },
      { value: "just_outcome", label: "Just the outcome, help me shape it" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.85,
    affects_milestones: ["discovery", "frontend_build"],
    unknown_risk: {
      description: "Scope is not yet defined; effort could vary widely until it is pinned down.",
      cost_impact_multiplier: [1.0, 2.5],
    },
  },
  {
    key: "generic.existing_assets",
    text: "What can we build on?",
    type: "single_select",
    options: [
      { value: "ready", label: "Brand, designs or code, ready to go" },
      { value: "some", label: "Some pieces exist" },
      { value: "scratch", label: "Starting from scratch" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.7,
    affects_milestones: ["design_system", "design_page", "frontend_build"],
    unknown_risk: {
      description: "Starting materials unconfirmed; building from scratch is a large cost delta.",
      cost_impact_multiplier: [1.0, 2.0],
    },
  },
  {
    key: "generic.integrations",
    gatedBy: { key: "meta.expertise", oneOf: ["hands_on", "some"] },
    text: "Does it need to connect to other tools or systems?",
    help: "Each connection is its own piece of work.",
    type: "multi_select",
    options: [
      { value: "payments", label: "Payments" },
      { value: "accounts", label: "Login / accounts" },
      { value: "external_api", label: "External APIs" },
      { value: "data_import", label: "Import existing data" },
      { value: "none", label: "None of these" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.7,
    affects_milestones: ["integration_third_party", "backend_build"],
    unknown_risk: {
      description: "Integration surface unconfirmed; each connected system adds work.",
      cost_impact_multiplier: [1.0, 2.0],
    },
  },
  {
    key: "generic.platform",
    gatedBy: { key: "meta.expertise", oneOf: ["hands_on", "some"] },
    text: "Any platform or technology it has to be built on?",
    type: "single_select",
    options: [
      { value: "specific", label: "Yes, a specific platform or stack" },
      { value: "flexible", label: "No preference, recommend one" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.6,
    affects_milestones: ["frontend_build", "backend_build"],
    unknown_risk: {
      description: "Platform constraints unknown; the wrong assumption can mean rework.",
      cost_impact_multiplier: [1.0, 1.6],
    },
  },
  {
    key: "generic.content_ownership",
    text: "Who provides the content, copy, or assets?",
    type: "single_select",
    options: [
      { value: "client", label: "We do" },
      { value: "hyrde", label: "We need help with it" },
      { value: DONT_KNOW, label: "Undecided" },
    ],
    variance_weight: 0.55,
    affects_milestones: ["content_migration", "design_page"],
    unknown_risk: {
      description: "Who supplies content is unassigned; a classic source of scope creep.",
      cost_impact_multiplier: [1.0, 1.5],
    },
  },
  {
    key: "generic.approvals",
    text: "Who signs off on the work?",
    type: "single_select",
    options: [
      { value: "just_me", label: "Just me" },
      { value: "small_team", label: "A small team" },
      { value: "stakeholders", label: "Several stakeholders" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.5,
    affects_milestones: ["discovery"],
    unknown_risk: {
      description: "Multiple approvers can drive review cycles and rework.",
      cost_impact_multiplier: [1.0, 1.6],
    },
  },
  {
    key: "generic.timeline",
    text: "Is there a hard deadline you need to hit?",
    type: "single_select",
    options: [
      { value: "fixed", label: "Yes, a fixed date" },
      { value: "flexible", label: "Flexible" },
      { value: DONT_KNOW, label: "Not sure yet" },
    ],
    variance_weight: 0.5,
    affects_milestones: ["deployment", "qa_functional"],
    unknown_risk: {
      description: "A fixed date compresses sequencing and can raise cost.",
      cost_impact_multiplier: [1.0, 1.3],
    },
  },
  // ── Plain-language equivalents ──
  // Same information as generic.integrations and generic.platform, asked in
  // terms of what the client's visitors do rather than what the system does.
  // A hands-off client can answer these; they cannot answer "External APIs".
  {
    key: "generic.visitor_actions",
    text: "What should someone be able to do on it?",
    help: "Pick everything that applies. This tells us what has to be built behind the scenes.",
    type: "multi_select",
    options: [
      { value: "read", label: "Read about us and get in touch" },
      { value: "buy", label: "Buy or pay for something" },
      { value: "account", label: "Sign in to their own account" },
      { value: "book", label: "Book or request an appointment" },
      { value: "download", label: "Download documents or reports" },
      { value: "none", label: "None of these" },
      { value: DONT_KNOW, label: "I'm not sure" },
    ],
    variance_weight: 0.7,
    affects_milestones: ["build"],
    gatedBy: { key: "meta.expertise", oneOf: ["hands_off"] },
    unknown_risk: {
      description: "What visitors need to do is unresolved, so the build scope could grow.",
      cost_impact_multiplier: [1.0, 1.6],
    },
  },
  {
    key: "generic.tech_decision",
    text: "Happy for us to choose how it's built?",
    help: "Most clients say yes. Say no if your team already has something they maintain.",
    type: "single_select",
    options: [
      { value: "we_choose", label: "Yes, pick whatever works best" },
      { value: "keep_current", label: "No, keep what we already use" },
      { value: DONT_KNOW, label: "I'd need to ask someone" },
    ],
    variance_weight: 0.5,
    affects_milestones: ["build"],
    gatedBy: { key: "meta.expertise", oneOf: ["hands_off"] },
    unknown_risk: {
      description: "Nobody has confirmed whether the current platform must be kept, which can force a migration mid-build.",
      cost_impact_multiplier: [1.0, 1.5],
    },
  },
  {
    key: "generic.success_metric",
    text: "How will you judge it's done well?",
    type: "single_select",
    options: [
      { value: "specific", label: "A specific measure" },
      { value: "general", label: "General satisfaction" },
      { value: DONT_KNOW, label: "I'm not sure yet" },
    ],
    variance_weight: 0.4,
    affects_milestones: ["qa_functional"],
    unknown_risk: {
      description: "Undefined success criteria make acceptance ambiguous.",
      cost_impact_multiplier: [1.0, 1.4],
    },
  },
];

// The tree for an archetype: Shopify gets its calibrated set, everything else
// gets the generic set. Never returns empty, so interrogation always runs.
// ── Who are we talking to? ───────────────────────────────────────────
// Asked first, before anything else, because it decides which of the
// questions below are even fair to ask. A family-office director does not know
// whether she wants "checkout customization" or "a specific stack", and asking
// costs us her confidence and gets a dont_know that becomes a risk flag for no
// reason. Technical questions are gated on this; plain-language equivalents
// are gated the other way, so both audiences answer the same number of
// questions and we learn the same things.
//
// It carries a real variance weight rather than a token one: a client who
// cannot arbitrate technical decisions genuinely widens the estimate, because
// we have to decide on their behalf and write it down as an assumption.
export const EXPERTISE_KEY = "meta.expertise";
export const EXPERTISE_Q: Question = {
  key: EXPERTISE_KEY,
  text: "How close do you want to be to the technical side?",
  help: "There is no wrong answer. It only changes what we ask you and what we decide for you.",
  type: "single_select",
  options: [
    { value: "hands_on", label: "I'm technical, ask me the detail" },
    { value: "some",     label: "I know the basics" },
    { value: "hands_off", label: "I'd rather not deal with the tech at all" },
  ],
  variance_weight: 0.9,   // highest in either tree, so it is always asked first
  affects_milestones: ["all"],
  unknown_risk: {
    description: "We do not know how much technical detail the client can arbitrate, so decisions may bounce back.",
    cost_impact_multiplier: [1.0, 1.2],
  },
};

/** Audiences that can meaningfully answer an implementation question. */
export const TECHNICAL_AUDIENCE = ["hands_on", "some"];
/** Audiences we ask about outcomes instead of implementation. */
export const PLAIN_AUDIENCE = ["hands_off", "some"];

export function treeFor(archetypeSlug: string | null | undefined): Question[] {
  return [EXPERTISE_Q, ...(isShopify(archetypeSlug) ? SHOPIFY_TREE : GENERIC_TREE)];
}

// Which question-set version was used, for attribution in the dataset.
export function versionFor(archetypeSlug: string | null | undefined): string {
  return isShopify(archetypeSlug) ? "shopify-v2" : "generic-v2";
}

// Answers are keyed by question.key. single_select => string; multi_select =>
// string[]. A single_select value of DONT_KNOW, or a multi_select containing
// DONT_KNOW, is an explicit "I don't know".
export type AnswerMap = Record<string, string | string[]>;

function isAnswered(a: string | string[] | undefined): boolean {
  if (a == null) return false;
  return Array.isArray(a) ? a.length > 0 : a.length > 0;
}
function isDontKnow(a: string | string[] | undefined): boolean {
  if (a == null) return false;
  return Array.isArray(a) ? a.includes(DONT_KNOW) : a === DONT_KNOW;
}
// A question is "resolved" (reduces uncertainty) only if answered with a real
// value, not I-don't-know.
function isResolved(a: string | string[] | undefined): boolean {
  return isAnswered(a) && !isDontKnow(a);
}

function isEligible(q: Question, answers: AnswerMap): boolean {
  if (isAnswered(answers[q.key])) return false;
  if (!q.gatedBy) return true;
  const parent = answers[q.gatedBy.key];
  const val = Array.isArray(parent) ? parent[0] : parent;
  if (q.gatedBy.oneOf) return typeof val === "string" && q.gatedBy.oneOf.includes(val);
  return val === q.gatedBy.equals;
}

// Selection: argmax(variance_weight) over eligible (unanswered, gate-satisfied)
// questions. P(unanswered) is 1 across the eligible set, so weight decides.
export function selectNextQuestion(tree: Question[], answers: AnswerMap): Question | null {
  const eligible = tree.filter(q => isEligible(q, answers));
  if (eligible.length === 0) return null;
  return eligible.reduce((best, q) => (q.variance_weight > best.variance_weight ? q : best));
}

// Confidence = fraction of total base variance resolved with real answers.
// Denominator is the base (ungated) questions, for a stable, honest 0..1.
export function scopeConfidence(tree: Question[], answers: AnswerMap): number {
  const base = tree.filter(q => !q.gatedBy);
  const total = base.reduce((s, q) => s + q.variance_weight, 0);
  if (total === 0) return 1;
  const resolved = tree.reduce((s, q) => (isResolved(answers[q.key]) ? s + q.variance_weight : s), 0);
  return Math.min(1, resolved / total);
}

// Should the interrogation stop? Budget or confidence ceiling, or nothing left
// to ask. Never before MIN_QUESTIONS unless the tree is exhausted.
export function shouldStop(tree: Question[], answers: AnswerMap, askedCount: number): boolean {
  if (selectNextQuestion(tree, answers) === null) return true;
  if (askedCount < MIN_QUESTIONS) return false;
  if (askedCount >= QUESTION_BUDGET) return true;
  return scopeConfidence(tree, answers) >= CONFIDENCE_TARGET;
}

export type DerivedRiskFlag = {
  source_question_key: string;
  description: string;
  likelihood: number;
  cost_impact_multiplier: [number, number];
};

// Turn unresolved uncertainty into explicit risk flags: every dont_know answer,
// plus any high-variance base question left unasked at the budget ceiling.
// Surfacing the unknown honestly IS the product.
export function deriveRiskFlags(
  tree: Question[],
  answers: AnswerMap,
  askedKeys: Set<string>,
): DerivedRiskFlag[] {
  const flags: DerivedRiskFlag[] = [];
  for (const q of tree) {
    const asked = askedKeys.has(q.key);
    const dontKnow = isDontKnow(answers[q.key]);
    // Skipped = a base question we never got to (budget) and never answered.
    const skippedHighVariance = !q.gatedBy && !asked && !isAnswered(answers[q.key]) && q.variance_weight >= 0.6;
    if (dontKnow || skippedHighVariance) {
      flags.push({
        source_question_key: q.key,
        description: q.unknown_risk.description,
        likelihood: dontKnow ? 0.55 : 0.4,
        cost_impact_multiplier: q.unknown_risk.cost_impact_multiplier,
      });
    }
  }
  return flags;
}

// Compact, human-readable facts from resolved answers, for the decomposer prompt.
export function answerFacts(tree: Question[], answers: AnswerMap): string[] {
  const facts: string[] = [];
  for (const q of tree) {
    const a = answers[q.key];
    if (!isResolved(a)) continue;
    const labels = (Array.isArray(a) ? a : [a])
      .filter(v => v !== DONT_KNOW)
      .map(v => q.options.find(o => o.value === v)?.label ?? v);
    if (labels.length) facts.push(`${q.text} -> ${labels.join(", ")}`);
  }
  return facts;
}

// ── Generated questions ──────────────────────────────────────────────
// The trees above are fixed: every WordPress rebuild got the same questions
// whether the site was a two-page brochure or a bilingual investment portfolio.
// They stay as the fallback and as the shape everything else depends on, but
// the questions a client actually sees are now generated per project from
// their brief, what we read off their live site, and how technical they said
// they are (see /api/questions).
//
// Anything a model produces is untrusted input on its way into the UI and into
// the immutable scope record, so it is clamped hard here rather than rendered
// as-is: bounded counts, bounded lengths, safe keys, and a guaranteed
// "I'm not sure" option, because dont_know is first-class in this flow and a
// generated question that omits it would trap a client with no honest answer.
const MAX_GENERATED = 6;
const MAX_OPTIONS = 6;

/** Trim to a length without slicing through the middle of a word. */
function tidy(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "") + "…";
}

const slug = (v: string, i: number) =>
  (v || `opt_${i}`).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40) || `opt_${i}`;

const clamp = (n: unknown, lo: number, hi: number, dflt: number) => {
  const v = Number(n);
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : dflt;
};

export function normalizeGenerated(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: Question[] = [];

  for (const item of raw.slice(0, MAX_GENERATED)) {
    const q = item as Record<string, unknown>;
    const text = tidy(String(q.text ?? ""), 160);
    if (!text) continue;

    const key = `dyn.${slug(String(q.key ?? text), out.length)}`;
    if (seen.has(key)) continue;

    const type: QuestionType = q.type === "multi_select" ? "multi_select" : "single_select";

    const options = (Array.isArray(q.options) ? q.options : [])
      .slice(0, MAX_OPTIONS)
      .map((o, i) => {
        const opt = o as Record<string, unknown>;
        return { value: slug(String(opt.value ?? opt.label ?? ""), i), label: tidy(String(opt.label ?? ""), 95) };
      })
      .filter(o => o.label);
    if (options.length < 2) continue;   // a question with one answer is not a question

    // "I'm not sure" must always be available: it is what produces a risk flag
    // instead of a guess, and a generated question that drops it would force a
    // client to invent an answer we then price against.
    if (!options.some(o => o.value === DONT_KNOW)) {
      options.push({ value: DONT_KNOW, label: type === "multi_select" ? "I'm not sure" : "I'm not sure" });
    }

    out.push({
      key,
      text,
      help: q.help ? tidy(String(q.help), 200) : undefined,
      type,
      options,
      variance_weight: clamp(q.variance_weight, 0.1, 0.85, 0.5),
      affects_milestones: (Array.isArray(q.affects_milestones) ? q.affects_milestones : ["all"])
        .slice(0, 4).map(m => String(m).slice(0, 40)),
      unknown_risk: {
        description: String(
          (q.unknown_risk as Record<string, unknown> | undefined)?.description ?? `"${text}" was left unresolved.`,
        ).slice(0, 240),
        cost_impact_multiplier: [
          clamp((q.unknown_risk as Record<string, unknown> | undefined)?.cost_impact_multiplier
            ? (q.unknown_risk as { cost_impact_multiplier?: number[] }).cost_impact_multiplier?.[0] : 1.0, 1.0, 1.5, 1.0),
          clamp((q.unknown_risk as Record<string, unknown> | undefined)?.cost_impact_multiplier
            ? (q.unknown_risk as { cost_impact_multiplier?: number[] }).cost_impact_multiplier?.[1] : 1.4, 1.0, 3.0, 1.4),
        ] as [number, number],
      },
    });
    seen.add(key);
  }
  return out;
}
