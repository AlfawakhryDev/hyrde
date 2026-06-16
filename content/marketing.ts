// ───────────────────────────────────────────────────────────────────────────
//  content/marketing.ts
//  SINGLE SOURCE OF TRUTH for all user-facing marketing copy + stats.
//  Tweak wording, numbers, sources, and CTAs HERE — components only read.
//  Nothing in this file imports React; it is plain, typed data.
// ───────────────────────────────────────────────────────────────────────────

// ─── Brand ──────────────────────────────────────────────────────────────────
export const BRAND = {
  name: "Hyrde",
  tagline: "Open at the door. Curated at the match.",
  thesis:
    "Anyone with real skill joins free and gets matched — no bidding, no spam, no review trap. Companies get a short, vetted shortlist. Freelancers never pay.",
  oneLiner:
    "Legacy marketplaces are bid boards where freelancers pay to pray. Hyrde is where you get matched — and get paid.",
};

// ─── Global CTAs (reuse everywhere so labels stay consistent) ────────────────
export const CTA = {
  joinFree:     { label: "Join free",      href: "/freelancer/join" },
  findTalent:   { label: "Find talent",    href: "/get-started" },
  postJob:      { label: "Post a job",     href: "/get-started" },
  browseTalent: { label: "Browse talent",  href: "/talent" },
  seePricing:   { label: "See pricing",    href: "/pricing" },
  bookDemo:     { label: "Book a demo",    href: "/get-started" },
  contactSales: { label: "Contact sales",  href: "/get-started" },
  about:        { label: "Why Hyrde",      href: "/about" },
};

// ═════════════════════════════════════════════════════════════════════════════
//  PART 3 — "Hiring is broken — here's what it costs"
//  Animated count-up stat cards, grouped by theme. EXACT cited figures only.
//  `value` = number the counter animates to. `display` overrides the rendered
//  headline when a range/format is clearer than a single animated number.
//  Always show `source` as muted small-print. Do NOT invent numbers.
// ═════════════════════════════════════════════════════════════════════════════
export interface CostStat {
  id: string;
  value: number;          // numeric target for the count-up animation
  prefix?: string;        // e.g. "$"
  suffix?: string;        // e.g. "+", "%", " days", "/day"
  display?: string;       // optional static headline override (for ranges)
  comma?: boolean;        // format the animated number with thousands separators
  label: string;          // what the number measures
  detail?: string;        // optional extra context line
  source: string;         // citation, shown as muted small-print
}

export interface CostGroup {
  id: string;
  theme: string;          // "Money wasted"
  icon: string;           // Material Symbol name
  blurb: string;          // one line under the theme heading
  stats: CostStat[];
}

/** Hyrde's own contrast numbers — no external citation needed. */
export interface ContrastStat {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  display?: string;
  comma?: boolean;
  label: string;
}

const COST_GROUPS: CostGroup[] = [
    {
      id: "money",
      theme: "Money wasted",
      icon: "payments",
      blurb: "What it costs just to fill a seat — before the work even starts.",
      stats: [
        {
          id: "cost-to-fill",
          value: 4700,
          prefix: "$",
          comma: true,
          label: "Average cost to fill a single role",
          detail: "Tech and specialist roles routinely exceed $6,000.",
          source: "SHRM, Human Capital Benchmarking",
        },
        {
          id: "bad-hire",
          value: 240000,
          prefix: "$",
          comma: true,
          display: "$17k–$240k",
          label: "What one bad hire can cost",
          detail:
            "At minimum ~30% of the employee's first-year salary (U.S. Dept. of Labor).",
          source: "CareerBuilder",
        },
        {
          id: "replace-2026",
          value: 56500,
          prefix: "$",
          comma: true,
          label: "Projected cost to replace an employee in 2026",
          detail: "Recruiting, onboarding, and lost ramp-up time compound fast.",
          source: "SHRM",
        },
        {
          id: "wrong-person",
          value: 75,
          suffix: "%",
          label: "of employers admit they've hired the wrong person",
          detail: "Three out of four hiring teams have paid for a mis-hire.",
          source: "CareerBuilder",
        },
      ],
    },
    {
      id: "time",
      theme: "Time lost",
      icon: "schedule",
      blurb: "Weeks of calendar time and days of human attention, per role.",
      stats: [
        {
          id: "time-to-fill",
          value: 42,
          suffix: " days",
          label: "Average time to fill a role",
          detail: "Six weeks of a project stalled before work begins.",
          source: "SHRM",
        },
        {
          id: "screening-hours",
          value: 23,
          suffix: " hrs",
          label: "Spent screening résumés for one hire",
          detail: "50+ hours total across the full hiring process.",
          source: "Industry benchmarks",
        },
        {
          id: "per-day-open",
          value: 500,
          prefix: "$",
          suffix: "/day",
          label: "Lost productivity for every day a key role stays open",
          detail: "Unfilled roles quietly drain output the whole time.",
          source: "Industry estimates",
        },
      ],
    },
    {
      id: "effort",
      theme: "Effort wasted",
      icon: "filter_alt",
      blurb: "Mountains of applications on one side, paid proposals on the other.",
      stats: [
        {
          id: "applications",
          value: 500,
          suffix: "+",
          label: "Applications a single posting can attract",
          detail: "300–500+ per posting — only ~5% make it past the first screen.",
          source: "Recruiting industry data",
        },
        {
          id: "proposal-hit",
          value: 5,
          suffix: "%",
          label: "Proposal-to-hire rate on legacy bidding platforms",
          detail:
            "Freelancers pay to send dozens of proposals to land one job.",
          source: "Legacy marketplace benchmarks",
        },
      ],
    },
];

const CONTRAST_STATS: ContrastStat[] = [
  { id: "h-matches",   value: 5,  suffix: "",  label: "Curated matches — not 500 applications" },
  { id: "h-speed",     value: 60, suffix: "s", label: "To a ranked, AI-vetted shortlist" },
  { id: "h-proposals", value: 0,  suffix: "",  label: "Proposals a freelancer ever pays for" },
  { id: "h-fee",       value: 8,  suffix: "%", label: "Success fee — only when you hire" },
];

export const COST_OF_HIRING = {
  eyebrow: "The status quo",
  heading: "Hiring is broken — here's what it costs",
  subheading:
    "Every open role burns money, time, and effort before anyone delivers a thing. The numbers below are why we built Hyrde.",
  groups: COST_GROUPS,
  // The optimistic counter that closes the section — the Hyrde contrast.
  contrast: {
    heading: "The Hyrde difference",
    blurb: "Same hire. None of the waste.",
    stats: CONTRAST_STATS,
  },
};

// ═════════════════════════════════════════════════════════════════════════════
//  PART 2 — /about page copy
// ═════════════════════════════════════════════════════════════════════════════

export interface ProblemPoint {
  icon: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
  source: string;
  sourceUrl: string;
}

export interface PainRow {
  pain: { headline: string; detail: string; stat: string; statLabel: string; source: string; sourceUrl: string };
  fix:  { headline: string; detail: string; stat: string; statLabel: string };
}

export const ABOUT = {
  meta: {
    title: "Why Hyrde",
    description:
      "Hyrde is an AI-native freelance platform: open at the door, curated at the match. Anyone with real skill joins free and gets matched. Companies get a vetted shortlist. Freelancers never pay.",
  },
  hero: {
    eyebrow: "Our mission",
    heading: "Open at the door. Curated at the match.",
    sub:
      "We're building the freelance platform we always wanted to use — one where talent is proven, not claimed, and getting matched doesn't cost a thing.",
  },
  mission: {
    heading: "Why we exist",
    body: [
      "Hiring online is stuck between two broken extremes. Closed networks gatekeep great people out for having the wrong logo on their résumé. Open bid boards let anyone in — then bury everyone under spam, pay-to-apply credits, and a permanent-review trap where one bad month follows you forever.",
      "Hyrde takes the best of both. We're open at the door: anyone with real skill joins free and proves it with a short work sample, not a CV. And we're curated at the match: when a company posts a brief, our AI returns a short, ranked, vetted shortlist — not a pile of 500 proposals.",
    ],
  },
  problem: {
    heading: "The problem — in numbers",
    points: [
      {
        icon: "sentiment_dissatisfied",
        title: "Freelancers pay to pray",
        body: "Legacy platforms sell proposal credits at $0.15 each, require 4–6 per application, then take up to 20% of everything you earn. You're paying rent on your own career.",
        stat: "~5%",
        statLabel: "average proposal-to-hire rate on Upwork",
        source: "Payoneer Global Freelancer Income Report, 2023",
        sourceUrl: "https://payoneer.com/blog/freelancer-income-report/",
      },
      {
        icon: "inventory_2",
        title: "Companies drown in noise",
        body: "The average job posting gets 250 applications. Only 4–6 candidates ever get an interview. The rest is noise that wastes 23 hours of screening time per hire.",
        stat: "250",
        statLabel: "applications per average job post",
        source: "Glassdoor Economic Research",
        sourceUrl: "https://www.glassdoor.com/research/",
      },
      {
        icon: "gavel",
        title: "Reputation is a trap",
        body: "One 1-star review from years ago still outranks 50 glowing ones. New talent can never get the first review. Reputation systems punish risk-taking and freeze out newcomers.",
        stat: "75%",
        statLabel: "of employers have made a bad hire they knew felt wrong",
        source: "CareerBuilder Hiring Survey",
        sourceUrl: "https://press.careerbuilder.com/",
      },
      {
        icon: "payments",
        title: "The bill is enormous",
        body: "A single mis-hire costs $17k–$240k when you add recruiting fees, onboarding, and lost productivity. Every day a role stays open burns ~$500 in output.",
        stat: "$4,700",
        statLabel: "average cost just to fill one role",
        source: "SHRM Human Capital Benchmarking Report",
        sourceUrl: "https://www.shrm.org/topics-tools/research/benchmarking",
      },
      {
        icon: "schedule",
        title: "Weeks of wasted time",
        body: "The average time-to-fill in tech is 42 days. 23 of those hours are spent screening CVs manually. Projects stall, deadlines slip, and the team burns out covering the gap.",
        stat: "42 days",
        statLabel: "average time to fill a tech role",
        source: "SHRM, 2024 Talent Acquisition Benchmarking",
        sourceUrl: "https://www.shrm.org/topics-tools/research/benchmarking",
      },
      {
        icon: "trending_down",
        title: "Freelancer income is shrinking",
        body: "Real freelancer earnings have declined as more people compete on saturated bid boards. Over 59% report experiencing scope creep without additional pay on project-based work.",
        stat: "20%",
        statLabel: "Fiverr's cut of every seller transaction",
        source: "Fiverr Fee Structure",
        sourceUrl: "https://www.fiverr.com/support/articles/360011135477",
      },
    ] satisfies ProblemPoint[],
  },

  painVsSolution: [
    {
      pain: {
        headline: "Send 25 proposals to land 1 job",
        detail: "Upwork charges $0.15 per Connect and most briefs require 4–6. Fiverr takes 20% of everything you earn. Freelancers spend an average of 20 hrs/week on admin, pitching, and self-marketing — before doing any actual work.",
        stat: "20 hrs",
        statLabel: "per week lost to admin & self-marketing",
        source: "FreshBooks Self-Employment Report",
        sourceUrl: "https://www.freshbooks.com/press/self-employed-report",
      },
      fix: {
        headline: "Your AI agent pitches you automatically — $0 forever",
        detail: "The moment a matching brief posts, Hyrde's AI drafts a personalised, evidence-backed intro on your behalf and sends it. No credits. No proposals. No commission on your earnings.",
        stat: "$0",
        statLabel: "cost to freelancers, always",
      },
    },
    {
      pain: {
        headline: "250 applications. 42 days. 23 hours of screening.",
        detail: "The average tech role attracts 250+ applicants, takes 42 days to fill, and burns 23 hours of internal time just screening CVs — before a single interview. Mis-hires cost $17k–$240k each.",
        stat: "42 days",
        statLabel: "average tech role time-to-fill",
        source: "SHRM Human Capital Benchmarking Report",
        sourceUrl: "https://www.shrm.org/topics-tools/research/benchmarking",
      },
      fix: {
        headline: "A vetted shortlist of ~5 in under 60 seconds",
        detail: "Describe the work in plain language. Hyrde's AI scopes the role, scans the talent pool, and returns a ranked, blind-first shortlist of ~5 vetted candidates in under 60 seconds. Pay 8% only when you hire.",
        stat: "60s",
        statLabel: "to a ranked, AI-vetted shortlist",
      },
    },
    {
      pain: {
        headline: "One bad review follows you for years",
        detail: "Traditional star-rating systems treat a 1-star from 3 years ago the same as last week's 5-star. New freelancers with no reviews get 91% fewer views, trapping great talent at the bottom forever.",
        stat: "91%",
        statLabel: "fewer views for new freelancers with 0 reviews",
        source: "LinkedIn Talent Blog, Platform Dynamics Research",
        sourceUrl: "https://business.linkedin.com/talent-solutions/blog",
      },
      fix: {
        headline: "Living reputation — recent work weighted most",
        detail: "Hyrde's reputation score weights the last 90 days of delivery signals (on-time rate, repeat hires, response speed) most heavily. New talent proves skill with a work sample and earns their first score from day one.",
        stat: "90 days",
        statLabel: "recent delivery weighted most heavily",
      },
    },
  ] satisfies PainRow[],

  how: {
    heading: "How Hyrde works",
    tagline: "Open at the door, curated at the match.",
    steps: [
      {
        n: "01",
        title: "Prove it, don't claim it",
        body: "Skip the résumé. New freelancers complete a short, domain-specific work sample. Our AI scores it and builds a verified skill profile — so you have signal from day one, even with zero reviews.",
      },
      {
        n: "02",
        title: "No bidding. Ever.",
        body: "Freelancers never buy connects or send proposals into a void. Your AI agent surfaces you to the right briefs automatically and writes an evidence-backed intro on your behalf.",
      },
      {
        n: "03",
        title: "A shortlist, not a pile",
        body: "Companies describe the work in plain language. Hyrde returns ~5 ranked, AI-vetted candidates — matched on skill and fit, shown blind-first before name, photo, or country.",
      },
      {
        n: "04",
        title: "Get matched, get paid",
        body: "Browsing and shortlisting are free. We charge a flat 8% success fee only when you actually hire — paid through escrow and milestones. Freelancers keep the rest.",
      },
    ],
  },
  audience: {
    heading: "Who it's for",
    columns: [
      {
        icon: "engineering",
        title: "For freelancers",
        body: "Skilled people who are sick of paying to apply and being judged on a logo. Join free, prove your skill once, and let your AI agent bring the work to you.",
        cta: CTA.joinFree,
      },
      {
        icon: "rocket_launch",
        title: "For companies",
        body: "Founders and teams who need the right person fast — without sifting 500 proposals. Describe the work, get a vetted shortlist, pay only when you hire.",
        cta: CTA.findTalent,
      },
    ],
  },
  vision: {
    heading: "The vision",
    body: [
      "We think the future of work is matched, not advertised. You shouldn't have to market yourself into exhaustion to earn, and you shouldn't have to wade through noise to hire.",
      "Hyrde is building toward a world where every skilled person has an AI agent working to get them paid, and every company has an AI partner that already knows who's great — so the right match takes seconds, not weeks.",
    ],
  },
  closing: {
    line: BRAND.oneLiner,
    cta: CTA.joinFree,
    ctaSecondary: CTA.findTalent,
  },
};

// ═════════════════════════════════════════════════════════════════════════════
//  PART 4 — Pricing tiers
// ═════════════════════════════════════════════════════════════════════════════
export interface PricingTier {
  id: string;
  name: string;
  audience: string;
  price: string;
  priceNote: string;
  highlight?: boolean;
  loud?: boolean;          // render the "free forever" tier extra-prominent
  badge?: string;
  features: string[];
  cta: { label: string; href: string };
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: "freelancers",
    name: "Freelancers",
    audience: "Independent talent",
    price: "Free",
    priceNote: "forever — no catch",
    loud: true,
    badge: "Always free",
    features: [
      "Free profile + AI skill assessment",
      "No connects, no proposals, no pay-to-apply",
      "Your AI agent pitches you to matching jobs",
      "Verified skill score from day one",
      "Living reputation — recent work weighted most",
      "Keep 100% of your rate — clients pay the fee, never you",
    ],
    cta: CTA.joinFree,
  },
  {
    id: "companies",
    name: "Companies",
    audience: "Startups & teams hiring",
    price: "8%",
    priceNote: "success fee — only when you hire",
    highlight: true,
    badge: "Most popular",
    features: [
      "Free to post, browse, and shortlist",
      "AI scoping assistant writes your brief",
      "~5 ranked, AI-vetted candidates per role",
      "Blind-first matching — skill before name",
      "Escrow + milestone payments built in",
      "Flat 8% vs the industry-standard 20%",
    ],
    cta: CTA.findTalent,
  },
  {
    id: "business",
    name: "Business",
    audience: "Volume hirers",
    price: "Custom",
    priceNote: "tailored to your hiring volume",
    badge: "For scale",
    features: [
      "Everything in Companies",
      "Team workspace with seats & roles",
      "Saved talent pools & pipelines",
      "Reduced success fee at volume",
      "Priority AI matching & support",
      "Consolidated monthly billing",
    ],
    cta: CTA.contactSales,
  },
];

export const PRICING = {
  meta: {
    title: "Pricing",
    description:
      "Freelancers are free forever. Companies pay a flat 8% success fee — only when they hire. Volume hirers and enterprises get dedicated plans.",
  },
  eyebrow: "Pricing",
  heading: "Fair by design. No surprises, ever.",
  subheading:
    "Freelancers never pay. Companies pay only when a hire actually happens. That's the whole model.",
  tiers: PRICING_TIERS,

  enterpriseCallout: {
    heading: "Need more than a plan?",
    body: "Dedicated account management, private talent pools, SSO, compliance, and API access for teams hiring at scale.",
    cta: CTA.bookDemo,
    link: { label: "Explore Enterprise", href: "/enterprise" },
  },

  faqs: [
    {
      q: "Do freelancers really pay nothing?",
      a: "Nothing. No subscription, no connects, no proposal credits, no fee on what they earn. We monetize the company side only.",
    },
    {
      q: "When do companies pay the 8%?",
      a: "Only when you hire and work is delivered through Hyrde. Posting, AI matching, browsing, and shortlisting are always free.",
    },
    {
      q: "How is 8% sustainable when others charge 20%?",
      a: "AI does the matching and screening that armies of recruiters used to. Lower overhead means we pass the savings on.",
    },
    {
      q: "How does Business pricing work?",
      a: "Business plans are tailored to your hiring volume. Talk to us and we'll put together pricing that fits how often your team hires.",
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
//  PART 4 — /enterprise page
// ═════════════════════════════════════════════════════════════════════════════
export interface EnterpriseFeature {
  icon: string;
  title: string;
  body: string;
}

export const ENTERPRISE = {
  meta: {
    title: "Enterprise",
    description:
      "Hyrde for enterprise: dedicated account management, private vetted talent pools, team workspaces with SSO & SOC 2, compliance & EOR, API + ATS/VMS integrations, SLAs, and volume pricing.",
  },
  hero: {
    eyebrow: "Hyrde for Enterprise",
    heading: "Vetted talent, at the scale your team hires.",
    sub:
      "Everything that makes Hyrde fast for a single role — now with the controls, security, and support a large org needs. Private talent pools, SSO, compliance, and a dedicated team behind every hire.",
    primaryCta: CTA.bookDemo,
    secondaryCta: { label: "See pricing", href: "/pricing" },
  },
  // Placeholder trust strip — swap for real customer logos when available.
  trust: {
    label: "Built for the way modern teams hire at scale",
    logos: ["NORTHWIND", "ACME CORP", "LUMEN", "VERTEX", "HELIOS", "QUANTA"],
  },
  features: [
    { icon: "support_agent", title: "Dedicated account manager", body: "A named partner who learns your roles, curates pools, and is on call for every hire." },
    { icon: "groups",        title: "Private, custom-vetted talent pools", body: "We build and maintain reserved pools of pre-vetted talent matched to your exact stack and standards." },
    { icon: "workspaces",    title: "Team workspaces, seats & RBAC", body: "Invite your whole org, organize by team, and control who can post, shortlist, approve, and pay." },
    { icon: "lock",          title: "SSO / SAML + SOC 2", body: "Enterprise single sign-on and SOC 2-aligned security so IT and procurement sign off with confidence." },
    { icon: "receipt_long",  title: "Consolidated billing", body: "One invoice across every team, role, and contractor — with the reporting finance actually wants." },
    { icon: "monitoring",    title: "Analytics dashboards", body: "Track time-to-hire, spend, match quality, and pipeline health across the whole organization." },
    { icon: "verified_user", title: "Compliance, classification & EOR", body: "Worker classification, contracts, and Employer-of-Record coverage to hire globally without the legal risk." },
    { icon: "hub",           title: "API + ATS / VMS integrations", body: "Pipe Hyrde matches straight into your ATS or VMS, or build on our API to fit your own workflow." },
    { icon: "handshake",     title: "SLAs & volume pricing", body: "Guaranteed response and match SLAs, plus reduced success fees that scale with your hiring volume." },
    { icon: "engineering",   title: "Optional managed talent", body: "Need a whole pod or staff augmentation? We'll assemble, vet, and manage the team for you." },
  ] satisfies EnterpriseFeature[],
  demo: {
    eyebrow: "Talk to us",
    heading: "Book a demo",
    sub: "Tell us how your team hires and we'll show you Hyrde tailored to it. We'll follow up within one business day.",
    fields: {
      success: "Thanks — our team will reach out within one business day.",
      note: "Prefer email? Reach us directly at abdelrahman@hyrde.net.",
    },
    cta: { label: "Request access to hire", href: "/get-started" },
  },
};

// ═════════════════════════════════════════════════════════════════════════════
//  PART 1 — AI Skill Assessment ("prove it, don't claim it")
//  A short, domain-specific work sample, scored by AI into a verified profile.
//  NOT a pass/fail gate: a low score still admits you and matches you to
//  appropriately-leveled work. Re-attemptable any time.
// ═════════════════════════════════════════════════════════════════════════════
export const SKILL_ASSESSMENT = {
  intro: {
    eyebrow: "Prove it, don't claim it",
    heading: "One short work sample. A verified profile from day one.",
    sub:
      "No résumé, no reviews required. Spend a few minutes on a real task in your field. Our AI reads your actual work and builds a verified skill score — so great talent gets matched immediately, even on day one.",
    reassurance: [
      "There's no pass or fail. A lower score still gets you in — we just match you to the right level of work.",
      "You can re-take it any time as you grow. Your most recent result is what counts.",
    ],
  },
  // One representative challenge per skill category. The /api/assess route can
  // swap in a more specific prompt; this is the demoable default.
  challenges: {
    Engineering: {
      title: "Debug & explain",
      prompt:
        "This React component re-renders on every keystroke and loses focus. Describe what's wrong and how you'd fix it. Pseudocode is fine — we're reading your reasoning, not your syntax.",
      placeholder:
        "Walk us through the bug, the root cause, and your fix. Mention trade-offs if there are any…",
      minChars: 120,
    },
    Data: {
      title: "Pipeline judgment",
      prompt:
        "A nightly ETL job silently drops ~2% of rows some nights but not others. Outline how you'd find the cause and what you'd put in place so it never happens silently again.",
      placeholder:
        "Describe your investigation approach, likely culprits, and the guardrails you'd add…",
      minChars: 120,
    },
    Design: {
      title: "Critique & improve",
      prompt:
        "A SaaS onboarding flow has a 40% drop-off on the second screen. Pick three concrete changes you'd test first and explain why each one should move the number.",
      placeholder:
        "List your three changes, the reasoning behind each, and how you'd measure success…",
      minChars: 120,
    },
    Writing: {
      title: "Rewrite for impact",
      prompt:
        "Take this flat product line — 'Our tool helps teams manage tasks efficiently' — and rewrite the hero headline + subhead for a B2B SaaS landing page. Then explain your choices in two sentences.",
      placeholder:
        "Your headline, your subhead, then a short note on why it works…",
      minChars: 100,
    },
    Marketing: {
      title: "Channel strategy",
      prompt:
        "A B2B SaaS startup has $5k/month and zero brand awareness. Lay out the first 30-day plan you'd run and the single metric you'd hold yourself to.",
      placeholder:
        "Outline your 30-day plan, channel choices, and the one metric that matters…",
      minChars: 120,
    },
    Creative: {
      title: "Concept & rationale",
      prompt:
        "A productivity app wants a 15-second launch teaser. Pitch the concept — the hook, the beats, and the final frame — and explain the feeling you're going for.",
      placeholder:
        "Describe your concept beat by beat and the emotional payoff…",
      minChars: 100,
    },
  } as Record<string, { title: string; prompt: string; placeholder: string; minChars: number }>,

  // Score → human-readable band, used in the verified profile chip.
  bands: [
    { min: 90, label: "Exceptional",  blurb: "Top-tier signal. Matched to senior, high-trust work." },
    { min: 75, label: "Strong",       blurb: "Solid, reliable signal. Matched to mid-to-senior work." },
    { min: 60, label: "Promising",    blurb: "Real ability. Matched to growth-stage and mid-level work." },
    { min: 0,  label: "Rising",       blurb: "You're in. Matched to starter tasks to build your track record." },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
//  PART 1 — Living reputation (objective delivery signals, recency-weighted)
// ═════════════════════════════════════════════════════════════════════════════
export const REPUTATION = {
  heading: "Reputation that reflects who you are now",
  blurb:
    "No permanent 1-star. Hyrde weighs objective delivery signals and recent feedback most — so your track record grows with you instead of haunting you.",
  signals: [
    { icon: "task_alt",    label: "On-time delivery",     hint: "Milestones hit on schedule" },
    { icon: "repeat",      label: "Repeat-hire rate",     hint: "Clients who come back" },
    { icon: "bolt",        label: "Response speed",       hint: "How fast you reply & start" },
    { icon: "trending_up", label: "Recent feedback",      hint: "Last 90 days weighted most" },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
//  PART 1 — Rising-talent / audition pool (small real paid trial tasks)
// ═════════════════════════════════════════════════════════════════════════════
export const RISING_TALENT = {
  heading: "Rising-talent auditions",
  blurb:
    "New to the platform or leveling up? Take a small, real, paid trial task. Deliver well and it becomes your first verified track record — no unpaid spec work, ever.",
  points: [
    "Real tasks from real clients — always paid",
    "Built to be small: a few hours, not a few weeks",
    "Great delivery fast-tracks you into full matches",
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
//  Homepage hero + how-it-works (kept here so copy lives in one place)
// ═════════════════════════════════════════════════════════════════════════════
export const HOME = {
  hero: {
    eyebrow: "AI-native freelance platform",
    heading: "Get matched. Get paid.",
    headingAccent: "No bidding, ever.",
    sub:
      "Open at the door, curated at the match. Anyone with real skill joins free and gets matched by AI. Companies get a vetted shortlist in 60 seconds — and pay only 8%, only on hire.",
  },
  // Top-line proof stats for the hero band.
  proof: [
    { value: "$0",  label: "Cost to freelancers" },
    { value: "8%",  label: "Fee — only on hire" },
    { value: "~5",  label: "Vetted matches per role" },
    { value: "60s", label: "To your shortlist" },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
//  PART 5 — Enterprise solution packages (custom, high-value tiers)
// ═════════════════════════════════════════════════════════════════════════════
export interface SolutionPackage {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
  cta: { label: string; href: string };
}

export const SOLUTIONS: SolutionPackage[] = [
  {
    id: "ai-recruiter",
    name: "AI Recruiter",
    tagline: "Replace your staffing agency",
    price: "Custom",
    priceNote: "monthly — tailored to your roles",
    features: [
      "Unlimited AI-scoped job briefs",
      "Dedicated talent pool (50+ vetted freelancers)",
      "Weekly AI shortlist reports",
      "1 named account manager",
      "ATS integration (Greenhouse, Lever, Ashby)",
      "Reduced success fee: 5% vs 8% standard",
    ],
    cta: { label: "Start 30-day pilot", href: "/get-started" },
  },
  {
    id: "launch-pod",
    name: "Launch Pod",
    tagline: "A fully AI-curated team for your sprint",
    price: "Custom",
    priceNote: "per sprint — scoped to your project",
    highlight: true,
    badge: "Most requested",
    features: [
      "Pre-assembled 3–5 person pod (vetted for your stack)",
      "AI project scoping + milestone planning",
      "Dedicated pod manager",
      "Daily async standups on Hyrde workspace",
      "IP & compliance documentation included",
      "30-day talent replacement guarantee",
    ],
    cta: { label: "Build my pod", href: "/get-started" },
  },
  {
    id: "talent-cloud",
    name: "Talent Cloud",
    tagline: "Your private on-demand workforce",
    price: "Custom",
    priceNote: "annual — scoped to your workforce",
    features: [
      "Private vetted talent cloud (100+ freelancers)",
      "Unlimited hires — flat annual fee, no per-hire fee",
      "SOC 2 + SSO + RBAC workspaces",
      "EOR & global compliance coverage",
      "API + ATS/VMS integrations",
      "SLA: shortlist in 24h, fill in 7 days or free",
    ],
    cta: { label: "Talk to enterprise sales", href: "/get-started" },
  },
];
