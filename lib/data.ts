// ─── Skills database ────────────────────────────────────────────────
export const SKILLS: Record<string, { label: string; category: string; avgRate: number; demand: "high"|"medium"|"low" }> = {
  "react-developer":        { label: "React Developer",        category: "Engineering",  avgRate: 85,  demand: "high"   },
  "fullstack-developer":    { label: "Fullstack Developer",    category: "Engineering",  avgRate: 95,  demand: "high"   },
  "python-developer":       { label: "Python Developer",       category: "Engineering",  avgRate: 80,  demand: "high"   },
  "node-developer":         { label: "Node.js Developer",      category: "Engineering",  avgRate: 75,  demand: "high"   },
  "mobile-developer":       { label: "Mobile Developer",       category: "Engineering",  avgRate: 90,  demand: "high"   },
  "devops-engineer":        { label: "DevOps Engineer",        category: "Engineering",  avgRate: 100, demand: "high"   },
  "data-scientist":         { label: "Data Scientist",         category: "Data",         avgRate: 95,  demand: "high"   },
  "ml-engineer":            { label: "ML Engineer",            category: "Data",         avgRate: 110, demand: "high"   },
  "data-analyst":           { label: "Data Analyst",           category: "Data",         avgRate: 65,  demand: "medium" },
  "ux-designer":            { label: "UX Designer",            category: "Design",       avgRate: 75,  demand: "high"   },
  "ui-designer":            { label: "UI Designer",            category: "Design",       avgRate: 70,  demand: "high"   },
  "product-designer":       { label: "Product Designer",       category: "Design",       avgRate: 85,  demand: "high"   },
  "brand-designer":         { label: "Brand Designer",         category: "Design",       avgRate: 65,  demand: "medium" },
  "motion-designer":        { label: "Motion Designer",        category: "Design",       avgRate: 70,  demand: "medium" },
  "copywriter":             { label: "Copywriter",             category: "Writing",      avgRate: 55,  demand: "medium" },
  "content-writer":         { label: "Content Writer",         category: "Writing",      avgRate: 45,  demand: "medium" },
  "technical-writer":       { label: "Technical Writer",       category: "Writing",      avgRate: 60,  demand: "medium" },
  "seo-specialist":         { label: "SEO Specialist",         category: "Marketing",    avgRate: 55,  demand: "medium" },
  "social-media-manager":   { label: "Social Media Manager",   category: "Marketing",    avgRate: 45,  demand: "medium" },
  "growth-marketer":        { label: "Growth Marketer",        category: "Marketing",    avgRate: 75,  demand: "high"   },
  "video-editor":           { label: "Video Editor",           category: "Creative",     avgRate: 55,  demand: "medium" },
  "3d-designer":            { label: "3D Designer",            category: "Creative",     avgRate: 65,  demand: "medium" },
  "wordpress-developer":    { label: "WordPress Developer",    category: "Engineering",  avgRate: 50,  demand: "medium" },
  "shopify-developer":      { label: "Shopify Developer",      category: "Engineering",  avgRate: 60,  demand: "high"   },
  "blockchain-developer":   { label: "Blockchain Developer",   category: "Engineering",  avgRate: 120, demand: "medium" },

  // ── Beyond tech: knowledge work, finance, operations, legal ──────────
  // Hyrde matches any defined outcome, not only engineering. These broaden the
  // taxonomy the matcher draws from and give non-tech buyers (family offices,
  // finance, ops teams) a page that speaks to them.
  "market-research-analyst": { label: "Market Research Analyst", category: "Research",    avgRate: 65,  demand: "high"   },
  "financial-analyst":       { label: "Financial Analyst",       category: "Finance",     avgRate: 75,  demand: "high"   },
  "financial-modeler":       { label: "Financial Modeler",       category: "Finance",     avgRate: 85,  demand: "high"   },
  "due-diligence-analyst":   { label: "Due Diligence Analyst",   category: "Finance",     avgRate: 95,  demand: "medium" },
  "bookkeeper":              { label: "Bookkeeper",              category: "Finance",     avgRate: 40,  demand: "medium" },
  "accountant":              { label: "Accountant",              category: "Finance",     avgRate: 55,  demand: "medium" },
  "executive-assistant":     { label: "Executive Assistant",     category: "Operations",  avgRate: 35,  demand: "high"   },
  "virtual-assistant":       { label: "Virtual Assistant",       category: "Operations",  avgRate: 30,  demand: "high"   },
  "project-manager":         { label: "Project Manager",         category: "Operations",  avgRate: 70,  demand: "high"   },
  "operations-manager":      { label: "Operations Manager",      category: "Operations",  avgRate: 75,  demand: "medium" },
  "paralegal":               { label: "Paralegal",               category: "Legal",       avgRate: 50,  demand: "medium" },
  "legal-researcher":        { label: "Legal Researcher",        category: "Legal",       avgRate: 60,  demand: "medium" },
  "contract-specialist":     { label: "Contract Specialist",     category: "Legal",       avgRate: 70,  demand: "medium" },
  "business-plan-writer":    { label: "Business Plan Writer",    category: "Writing",     avgRate: 60,  demand: "medium" },
  "grant-writer":            { label: "Grant Writer",            category: "Writing",     avgRate: 55,  demand: "medium" },
  "presentation-designer":   { label: "Presentation Designer",   category: "Design",      avgRate: 55,  demand: "high"   },
  "translator":              { label: "Translator",              category: "Writing",     avgRate: 40,  demand: "medium" },
};

export const CITIES: Record<string, { label: string; country: string; region: string; multiplier: number }> = {
  "new-york":       { label: "New York",       country: "US", region: "North America", multiplier: 1.3  },
  "san-francisco":  { label: "San Francisco",  country: "US", region: "North America", multiplier: 1.4  },
  "london":         { label: "London",         country: "UK", region: "Europe",        multiplier: 1.2  },
  "berlin":         { label: "Berlin",         country: "DE", region: "Europe",        multiplier: 1.0  },
  "amsterdam":      { label: "Amsterdam",      country: "NL", region: "Europe",        multiplier: 1.1  },
  "dubai":          { label: "Dubai",          country: "AE", region: "MENA",          multiplier: 1.15 },
  // GCC expansion (2026-09-01). Search Console shows real, English-language
  // hiring demand out of the Gulf ("shopify developer dubai", "ui designer
  // dubai", UAE = 50 impressions), so the Gulf gets first-class city pages.
  "abu-dhabi":      { label: "Abu Dhabi",      country: "AE", region: "MENA",          multiplier: 1.15 },
  "riyadh":         { label: "Riyadh",         country: "SA", region: "MENA",          multiplier: 1.1  },
  "jeddah":         { label: "Jeddah",         country: "SA", region: "MENA",          multiplier: 1.0  },
  "doha":           { label: "Doha",           country: "QA", region: "MENA",          multiplier: 1.15 },
  "kuwait-city":    { label: "Kuwait City",    country: "KW", region: "MENA",          multiplier: 1.05 },
  "cairo":          { label: "Cairo",          country: "EG", region: "MENA",          multiplier: 0.65 },
  "toronto":        { label: "Toronto",        country: "CA", region: "North America", multiplier: 1.1  },
  "sydney":         { label: "Sydney",         country: "AU", region: "APAC",          multiplier: 1.15 },
  "singapore":      { label: "Singapore",      country: "SG", region: "APAC",          multiplier: 1.2  },
  "barcelona":      { label: "Barcelona",      country: "ES", region: "Europe",        multiplier: 0.9  },
  "remote":         { label: "Remote",         country: "",   region: "Global",        multiplier: 1.0  },
};

export function getSkillData(slug: string) {
  return SKILLS[slug] ?? null;
}

export function getCityData(slug: string) {
  return CITIES[slug] ?? null;
}

export function getRate(skillSlug: string, citySlug: string): number {
  const skill = SKILLS[skillSlug];
  const city  = CITIES[citySlug];
  if (!skill || !city) return 0;
  return Math.round(skill.avgRate * city.multiplier);
}

export const ALL_SKILL_SLUGS = Object.keys(SKILLS);
export const ALL_CITY_SLUGS  = Object.keys(CITIES);

// ─── Which skill×city pages are allowed in the index ────────────────
// History: all ~660 skill×city pages were noindexed in v0.10.0 on the theory
// that a young domain would read them as doorway pages. The Search Console
// export of 2026-09-01 falsified half of that: those pages produced **61% of
// all impressions** (1,259 of 2,077), led by /hire/wordpress-developer/amsterdam
// at 389. Noindexing them was throwing away the only demand the site has.
//
// So: neither "index all 660" (real doorway risk) nor "index none" (proven
// loss). We index a curated set — pages with demonstrated search demand, plus
// the GCC grid we're now investing in — and leave the long tail noindexed.
// Add a pair here only when GSC shows impressions for it, or it's strategic.

// Pairs with proven impressions in GSC (2026-06-15 → 2026-08-29).
const PROVEN_CITY_PAGES = [
  "wordpress-developer/amsterdam", "shopify-developer/london", "wordpress-developer/berlin",
  "ui-designer/singapore", "node-developer/new-york", "ux-designer/san-francisco",
  "ui-designer/new-york", "mobile-developer/cairo", "shopify-developer/dubai",
  "fullstack-developer/new-york", "ux-designer/sydney", "ui-designer/dubai",
  "growth-marketer/new-york", "product-designer/toronto", "3d-designer/new-york",
  "data-scientist/singapore", "video-editor/dubai", "data-scientist/new-york",
  "ui-designer/toronto", "wordpress-developer/san-francisco", "ux-designer/london",
  "shopify-developer/singapore", "mobile-developer/san-francisco", "shopify-developer/barcelona",
  "product-designer/barcelona", "copywriter/toronto", "growth-marketer/san-francisco",
  "technical-writer/new-york", "video-editor/san-francisco", "video-editor/sydney",
  "3d-designer/berlin", "data-scientist/amsterdam", "seo-specialist/barcelona",
  "shopify-developer/amsterdam", "wordpress-developer/cairo", "node-developer/san-francisco",
  "content-writer/sydney", "ux-designer/dubai", "ml-engineer/dubai", "copywriter/berlin",
  "wordpress-developer/london", "shopify-developer/new-york", "ui-designer/london",
];

// GCC is the current strategic bet — Gulf hiring demand shows up in English in
// GSC, so these get indexed ahead of proven impressions rather than after.
const GCC_CITIES = ["dubai", "abu-dhabi", "riyadh", "jeddah", "doha", "kuwait-city"];
const GCC_SKILLS = [
  "shopify-developer", "wordpress-developer", "fullstack-developer", "mobile-developer",
  "ui-designer", "ux-designer", "product-designer", "video-editor", "growth-marketer",
  "seo-specialist", "content-writer", "data-analyst", "financial-modeler",
  "market-research-analyst", "executive-assistant", "presentation-designer",
];

export const INDEXED_CITY_PAGES: ReadonlySet<string> = new Set([
  ...PROVEN_CITY_PAGES,
  ...GCC_CITIES.flatMap(c => GCC_SKILLS.map(s => `${s}/${c}`)),
  // Remote is a genuine, non-duplicative intent ("hire X remotely").
  ...GCC_SKILLS.map(s => `${s}/remote`),
].filter(pair => {
  const [s, c] = pair.split("/");
  return SKILLS[s] !== undefined && CITIES[c] !== undefined; // drop typos/renames
}));

export function isIndexedCityPage(skill: string, city: string): boolean {
  return INDEXED_CITY_PAGES.has(`${skill}/${city}`);
}

// ─── pSEO content helpers (unique value per skill×city page) ─────────
// Deterministic so the same combo always renders the same copy, but
// varied across the grid so Google doesn't see 325 boilerplate clones.
function hashIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return mod > 0 ? h % mod : 0;
}

export interface RateContext {
  rate: number; baseline: number;
  junior: number; mid: number; senior: number;
  diffPct: number; direction: "above" | "below" | "in line with";
}

export function getRateContext(skillSlug: string, citySlug: string): RateContext | null {
  const skill = SKILLS[skillSlug];
  const city  = CITIES[citySlug];
  if (!skill || !city) return null;
  const rate = getRate(skillSlug, citySlug);
  const diff = Math.round((city.multiplier - 1) * 100);
  return {
    rate,
    baseline: skill.avgRate,
    junior: Math.round(rate * 0.6),
    mid: rate,
    senior: Math.round(rate * 1.5),
    diffPct: Math.abs(diff),
    direction: diff > 0 ? "above" : diff < 0 ? "below" : "in line with",
  };
}

// Other cities for the same skill, ranked by rate — powers the
// internal-link mesh + "how rates compare" block.
export function getCityRateComparisons(skillSlug: string, citySlug: string, n = 5) {
  if (!SKILLS[skillSlug]) return [];
  return ALL_CITY_SLUGS
    .filter(c => c !== citySlug && CITIES[c].label !== "Remote")
    .map(c => ({ slug: c, label: CITIES[c].label, rate: getRate(skillSlug, c) }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, n);
}

export function getSkillCityIntro(skillSlug: string, citySlug: string): string {
  const s = SKILLS[skillSlug]; const c = CITIES[citySlug];
  const ctx = getRateContext(skillSlug, citySlug);
  if (!s || !c || !ctx) return "";
  const locShort = c.label === "Remote" ? "remotely" : `in ${c.label}`;
  const vsBaseline = ctx.direction === "in line with"
    ? "right in line with"
    : `${ctx.diffPct}% ${ctx.direction}`;
  const variants = [
    `Looking to hire a ${s.label} ${locShort}? Hyrde matches you with pre-vetted ${s.category.toLowerCase()} talent at around $${ctx.rate}/hr — ${vsBaseline} the $${ctx.baseline}/hr global baseline. Every candidate is screened before you ever see them, so you skip the fake portfolios and inflated "Top Rated" badges that plague the big marketplaces.`,
    `Hiring a ${s.label} ${locShort} typically runs about $${ctx.rate}/hr. Hyrde's AI reads your brief and surfaces a ranked shortlist of vetted ${s.label}s ${c.label === "Remote" ? "from around the world" : `across ${c.region}`} in seconds — no Connects to buy, no bidding wars, and it's free to hire during early access instead of the 20%+ you'd lose elsewhere.`,
    `Need a ${s.label} ${locShort}? With ${s.demand} demand for ${s.category.toLowerCase()} skills, finding reliable talent fast matters. Hyrde pre-vets every ${s.label}, AI-matches them to your brief in about 60 seconds, and is free to hire during early access — versus the effective 22–34% take rate burned clients report on legacy platforms.`,
  ];
  return variants[hashIndex(skillSlug + citySlug, variants.length)];
}

export function getSkillCityFaqs(skillSlug: string, citySlug: string): { q: string; a: string }[] {
  const s = SKILLS[skillSlug]; const c = CITIES[citySlug];
  const ctx = getRateContext(skillSlug, citySlug);
  if (!s || !c || !ctx) return [];
  const locShort = c.label === "Remote" ? "remotely" : `in ${c.label}`;
  const loc = c.label === "Remote" ? "for remote work" : `in ${c.label}`;
  const demandWord = s.demand === "high" ? "high" : s.demand === "medium" ? "steady" : "moderate";
  const vsBaseline = ctx.direction === "in line with"
    ? "in line with"
    : `${ctx.diffPct}% ${ctx.direction}`;
  return [
    {
      q: `How much does it cost to hire a ${s.label} ${locShort}?`,
      a: `The going market rate for a ${s.label} ${loc} is around $${ctx.rate}/hr. Junior talent starts near $${ctx.junior}/hr, while senior specialists run to about $${ctx.senior}/hr. On Hyrde, hiring is free during early access — not the 20–34% effective take rate clients report on Upwork and Fiverr.`,
    },
    {
      q: `How fast can I find a ${s.label} ${locShort}?`,
      a: `Post a short brief and Hyrde's AI returns a shortlist of pre-vetted ${s.label}s ${loc} in about 60 seconds. Most clients are reviewing real candidates within minutes — no Connects, no bidding wars, and no inbox spam.`,
    },
    {
      q: `Are ${s.label}s ${loc} in demand?`,
      a: `Yes — ${s.label} is a ${demandWord}-demand ${s.category.toLowerCase()} skill. Rates ${locShort} sit ${vsBaseline} the global baseline of $${ctx.baseline}/hr, reflecting local market conditions and cost of living.`,
    },
    {
      q: `Do I pay anything if I don't hire?`,
      a: `No. Posting a brief, getting matched, and reviewing ${s.label} candidates ${loc} is completely free. Hiring is free during early access too — and every match is pre-vetted, so you're not gambling on fake reviews or padded badges.`,
    },
  ];
}

// ─── Mock freelancer data ────────────────────────────────────────────
export const MOCK_FREELANCERS = [
  { id: "1", name: "Sara R.",    skill: "react-developer",   rate: 90,  score: 96, bio: "6 yrs React, ex-Stripe. Shipped 3 SaaS products from 0→1.",         location: "remote"     },
  { id: "2", name: "Mo K.",      skill: "react-developer",   rate: 75,  score: 91, bio: "React + TypeScript specialist. Fintech focus. Fast iterations.",    location: "cairo"      },
  { id: "3", name: "Ana L.",     skill: "react-developer",   rate: 85,  score: 84, bio: "Full-stack React/Node. 5 yrs. Open-source contributor.",             location: "barcelona"  },
  { id: "4", name: "James T.",   skill: "ux-designer",       rate: 80,  score: 94, bio: "UX lead ex-Figma. Zero-to-one product design. B2B SaaS expert.",     location: "london"     },
  { id: "5", name: "Lena M.",    skill: "ux-designer",       rate: 70,  score: 88, bio: "Research-led design. 4 yrs. Mobile-first. Figma certified.",         location: "berlin"     },
  { id: "6", name: "Omar S.",    skill: "data-scientist",    rate: 100, score: 92, bio: "ML + analytics. Python/SQL/dbt. Ex-McKinsey data team.",             location: "dubai"      },
  { id: "7", name: "Priya N.",   skill: "copywriter",        rate: 55,  score: 89, bio: "B2B SaaS copy. 200+ landing pages shipped. Conversion-focused.",     location: "remote"     },
  { id: "8", name: "Carlos B.",  skill: "shopify-developer", rate: 60,  score: 87, bio: "100+ Shopify stores. Custom themes + apps. 5-star rated.",           location: "toronto"    },
  // Beyond tech — so non-engineering pages show relevant specialists
  { id: "9",  name: "Yara H.",  skill: "financial-modeler",       rate: 85, score: 95, bio: "10 yrs FP&A, ex-sovereign fund. Three-statement models, LBOs, IC decks.", location: "dubai"   },
  { id: "10", name: "Karim A.", skill: "market-research-analyst", rate: 60, score: 92, bio: "Market maps and competitive research. GCC and MENA focus.",              location: "cairo"   },
  { id: "11", name: "Noura S.", skill: "financial-analyst",       rate: 75, score: 90, bio: "Equity research background. Valuation, comps, and investor memos.",       location: "dubai"   },
  { id: "12", name: "Omar F.",  skill: "due-diligence-analyst",   rate: 95, score: 91, bio: "Buy-side due diligence. Data rooms, red flags, IC-ready memos.",          location: "london"  },
  { id: "13", name: "Dana R.",  skill: "executive-assistant",     rate: 35, score: 94, bio: "EA to two founders. Inbox, calendar, travel, and light ops.",             location: "remote"  },
  { id: "14", name: "Layla M.", skill: "business-plan-writer",    rate: 60, score: 89, bio: "50+ funded business plans and information memoranda. Investor-ready.",   location: "remote"  },
  { id: "15", name: "Sami T.",  skill: "presentation-designer",   rate: 55, score: 93, bio: "Pitch and board decks. Story plus design. Decks that closed rounds.",    location: "berlin"  },
  { id: "16", name: "Hana K.",  skill: "paralegal",               rate: 50, score: 88, bio: "Corporate paralegal. Contracts, filings, and compliance support.",        location: "remote"  },
  { id: "17", name: "Ali N.",   skill: "bookkeeper",              rate: 40, score: 90, bio: "Xero and QuickBooks. Monthly close and reconciliations.",                 location: "cairo"   },
  { id: "18", name: "Rana B.",  skill: "translator",              rate: 40, score: 92, bio: "Arabic and English. Legal and financial translation. Sworn.",             location: "dubai"   },
];
