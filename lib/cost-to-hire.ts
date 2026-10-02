import { SKILLS } from "@/lib/data";
import { pricingCategory } from "@/lib/hire-brief";
import { priceMilestone, rateFor, SENIORITY_MULTIPLIER, type MilestonePrice, type Seniority } from "@/lib/pricing";

// ── "What does it cost to hire a …" ────────────────────────────────────────
// The second question every buyer asks, and the one answer engines are asked
// constantly. Whoever publishes a real number gets quoted; "it depends" never
// does. So each trade gets its own page, with the three jobs people actually
// buy from that trade — written per skill, not stamped from one template,
// because sixteen pages saying the same thing is how you end up at position 60
// again.
//
// This answers what a *project* costs. /rates is the other question — market
// hourly rates by city — and the two pages link to each other.

type Job = { title: string; what: string; hours: number; seniority: Seniority };

/** Trades with real search demand behind them (Search Console, Sep 2026). */
export const COST_SKILLS: Record<string, { jobs: [Job, Job, Job]; drivers: string[] }> = {
  "ux-designer": {
    jobs: [
      { title: "A usability review of what you already have", what: "Someone walks your product as a new user would, and lists what confuses them in the order it costs you money.", hours: 12, seniority: "mid" },
      { title: "One flow redesigned end to end", what: "Checkout, onboarding or sign-up: every state mapped, including the empty and error ones, and clickable before anyone builds it.", hours: 45, seniority: "mid" },
      { title: "A product designed from nothing", what: "Research, the information architecture, and every screen of the first version, handed over ready to build.", hours: 140, seniority: "senior" },
    ],
    drivers: ["How many screens, and whether mobile and desktop both count", "Whether research is included or you already know the problem", "How many rounds of review your side needs", "Whether a design system exists or has to be invented"],
  },
  "ui-designer": {
    jobs: [
      { title: "A landing page, designed to convert one action", what: "One page, one goal, delivered as a file a developer can build from without asking questions.", hours: 18, seniority: "mid" },
      { title: "A screen set for one feature", what: "Every state of the feature drawn: loading, empty, error, success — not just the version that demos well.", hours: 40, seniority: "mid" },
      { title: "A design system your team can build on", what: "Components, spacing, type and colour with the rules that keep them consistent when someone else uses them.", hours: 90, seniority: "senior" },
    ],
    drivers: ["The number of unique screens, not the number of pages", "Whether brand assets exist already", "Desktop only, or every breakpoint", "Whether you need the files in a specific tool"],
  },
  "product-designer": {
    jobs: [
      { title: "A feature scoped and designed", what: "The problem written down, the options weighed, and the chosen one drawn to the edge cases.", hours: 35, seniority: "mid" },
      { title: "An onboarding flow that stops the drop-off", what: "Where people currently leave, why, and the redesigned path — with what to measure after.", hours: 50, seniority: "mid" },
      { title: "The first version of a product, designed", what: "From problem to buildable screens, including what to deliberately leave out of version one.", hours: 140, seniority: "senior" },
    ],
    drivers: ["Whether the problem is agreed or still being argued about", "How much user research is needed first", "Whether you have analytics to design against", "How many stakeholders sign off"],
  },
  "wordpress-developer": {
    jobs: [
      { title: "A slow site made fast", what: "What is actually slow, measured, then fixed: images, caching, the plugins nobody dares delete. Before and after numbers included.", hours: 12, seniority: "mid" },
      { title: "A site built on a theme you own", what: "Your content, your brand, editable by a non-developer afterwards, without a page builder you cannot escape.", hours: 45, seniority: "mid" },
      { title: "A WooCommerce store that handles real traffic", what: "Products, payment, shipping rules and the checkout tuned for the volume you actually expect.", hours: 90, seniority: "senior" },
    ],
    drivers: ["How many templates differ from each other", "Whether the content is written and ready", "Plugins you must keep versus ones that can go", "Whether anything has to migrate from an old site"],
  },
  "shopify-developer": {
    jobs: [
      { title: "A theme customised to your brand", what: "A good theme bent to fit your brand without forking it so hard that updates break.", hours: 20, seniority: "mid" },
      { title: "A store set up and launched", what: "Products, collections, payment, shipping and taxes, live and tested with a real order.", hours: 45, seniority: "mid" },
      { title: "Checkout and apps rebuilt around how you sell", what: "Bundles, subscriptions or B2B pricing, done in the platform rather than bolted on by five apps.", hours: 80, seniority: "senior" },
    ],
    drivers: ["How many products, and whether the data is clean", "How far the design strays from the theme", "The apps you need and whether they conflict", "Migration from another platform"],
  },
  "node-developer": {
    jobs: [
      { title: "An API endpoint set, built and documented", what: "The routes you need, with validation, errors that say something useful, and docs another developer can follow.", hours: 25, seniority: "mid" },
      { title: "A service that talks to someone else's API", what: "The integration, plus what happens when the other side is slow, wrong, or down — which it will be.", hours: 45, seniority: "mid" },
      { title: "A backend for your first version", what: "Accounts, data, jobs and deployment: the part of the product a user never sees but always feels.", hours: 150, seniority: "senior" },
    ],
    drivers: ["How much of it must work with code you already have", "Whether the data model is decided", "Tests and deployment included or not", "Traffic you need it to survive"],
  },
  "react-developer": {
    jobs: [
      { title: "A bug that keeps coming back", what: "You send the repository and how to trigger it. You get the fix, the cause in writing, and a test so it stays fixed.", hours: 10, seniority: "mid" },
      { title: "A feature added to a live product", what: "Built against your current code and conventions, shipped behind a flag, with the edge cases listed before work starts.", hours: 45, seniority: "mid" },
      { title: "A front end built from designs", what: "Your screens made real and responsive, with the states designers forget: slow networks, empty lists, failures.", hours: 120, seniority: "senior" },
    ],
    drivers: ["The state of the code being joined", "Whether designs are final", "How many browsers and devices must behave", "Tests, or move fast and accept the risk"],
  },
  "fullstack-developer": {
    jobs: [
      { title: "A prototype that proves one idea", what: "The single risky part built for real, so you learn whether it works before funding the rest.", hours: 40, seniority: "mid" },
      { title: "An internal tool that replaces a spreadsheet", what: "The thing your team currently does by hand, with the permissions and the audit trail it always needed.", hours: 80, seniority: "mid" },
      { title: "A working first version of your product", what: "Sign-up, the core feature, payments if you sell, and nothing else — split into milestones you approve one at a time.", hours: 200, seniority: "senior" },
    ],
    drivers: ["How much is genuinely new versus assembled", "Payments, which always cost more than expected", "Whether someone else will maintain it", "How finished 'finished' has to be"],
  },
  "devops-engineer": {
    jobs: [
      { title: "A deployment pipeline that stops the manual steps", what: "Push, test, deploy, roll back — without someone remembering the order of five commands.", hours: 20, seniority: "mid" },
      { title: "Infrastructure written down as code", what: "What is running today, reproduced in code, so the next environment takes an hour instead of a week.", hours: 50, seniority: "senior" },
      { title: "A system that survives its traffic", what: "Load tested, scaled, monitored, with alerts that mean something at three in the morning.", hours: 80, seniority: "senior" },
    ],
    drivers: ["How many services and environments exist", "The cloud you are on and how it was set up", "Whether compliance rules apply", "Whether anyone is on call afterwards"],
  },
  "data-scientist": {
    jobs: [
      { title: "A question answered from data you already have", what: "One business question, the analysis behind it, and an honest statement of what the data cannot tell you.", hours: 20, seniority: "mid" },
      { title: "A dashboard for the numbers you check weekly", what: "The five metrics that matter, wired to real sources, refreshing without anyone touching it.", hours: 30, seniority: "mid" },
      { title: "A model in production, not in a notebook", what: "Trained, evaluated against a baseline, deployed, and monitored for the day its accuracy quietly drops.", hours: 110, seniority: "senior" },
    ],
    drivers: ["How clean and complete the data is", "Whether labels exist or must be created", "One-off answer or something that keeps running", "Where it has to live afterwards"],
  },
  "seo-specialist": {
    jobs: [
      { title: "A technical audit you can act on", what: "What is blocking the site, ranked by what it costs you, with the fix for each — not a 60-page PDF.", hours: 15, seniority: "mid" },
      { title: "Search fixed on a site you already have", what: "The faults fixed, the pages worth keeping improved, and the ones quietly holding the domain back dealt with.", hours: 35, seniority: "mid" },
      { title: "A content plan built on real search demand", what: "What your buyers actually search, what you can realistically rank for, and the briefs to write against.", hours: 45, seniority: "senior" },
    ],
    drivers: ["The size of the site and how old its mistakes are", "Whether a developer can ship the fixes", "How competitive your market is", "Whether content is included or just briefed"],
  },
  "growth-marketer": {
    jobs: [
      { title: "An ad account audited and rebuilt", what: "What is wasting money, what to keep, and the rebuild — with the numbers before and after.", hours: 15, seniority: "mid" },
      { title: "A funnel measured end to end", what: "Where people drop between first click and payment, instrumented so the answer stops being an opinion.", hours: 30, seniority: "mid" },
      { title: "A launch campaign, planned and shipped", what: "Channels, message, assets and schedule, plus what you will measure to call it a success.", hours: 55, seniority: "senior" },
    ],
    drivers: ["How many channels are in scope", "Whether you have tracking today", "Ad spend, which is yours and separate from this", "Whether creative is included"],
  },
  "3d-designer": {
    jobs: [
      { title: "One product rendered properly", what: "Your product modelled and lit so it looks like a photograph, in the angles your store needs.", hours: 15, seniority: "mid" },
      { title: "A set of assets for a campaign", what: "Several models or scenes, consistent in style, delivered in the formats each channel wants.", hours: 35, seniority: "mid" },
      { title: "An animated sequence", what: "Modelled, animated, lit and rendered — the version people actually watch to the end.", hours: 60, seniority: "senior" },
    ],
    drivers: ["How complex the geometry is", "Whether references or CAD files exist", "Render quality and how long the shot runs", "Revisions, which are where 3D budgets die"],
  },
  "video-editor": {
    jobs: [
      { title: "A short promo, cut and graded", what: "From your footage or stock: edit, colour, sound, captions, and the vertical cut for social.", hours: 20, seniority: "mid" },
      { title: "A month of social content from one shoot", what: "One set of footage cut into the pieces each platform needs, rather than the same video posted four times.", hours: 30, seniority: "mid" },
      { title: "A longer film, start to finish", what: "Story, edit, sound design, colour and titles, with the review rounds built into the schedule.", hours: 70, seniority: "senior" },
    ],
    drivers: ["How much raw footage there is", "Whether a script or structure exists", "Motion graphics and subtitles", "How many languages you need"],
  },
  "technical-writer": {
    jobs: [
      { title: "Documentation for one feature", what: "Written from the path a real user takes, so support stops answering the same question.", hours: 15, seniority: "mid" },
      { title: "API reference someone can build against", what: "Every endpoint, the errors, and a working example — checked against the code, not the wishful version.", hours: 40, seniority: "mid" },
      { title: "A documentation site, structured and written", what: "Getting started, guides and reference, organised so people find answers without searching support tickets.", hours: 80, seniority: "senior" },
    ],
    drivers: ["Whether the product is stable or moving weekly", "How much exists to work from", "Whether engineers are available to ask", "Whether you need it in more than one language"],
  },
  "blockchain-developer": {
    jobs: [
      { title: "A contract reviewed before it ships", what: "Read line by line for the ways it loses money, with the findings ranked rather than listed.", hours: 20, seniority: "senior" },
      { title: "A smart contract written and tested", what: "The contract, the tests that try to break it, and deployment scripts you can run yourself.", hours: 50, seniority: "senior" },
      { title: "An app that talks to the chain", what: "Wallet connection, transactions, and the states nobody designs for: pending, failed, replaced.", hours: 90, seniority: "senior" },
    ],
    drivers: ["Which chain, and how mature its tooling is", "Whether money is at risk on day one", "Whether an external audit is required", "How much of it is off-chain"],
  },
};

export const COST_SLUGS = Object.keys(COST_SKILLS);

export type CostBand = { title: string; what: string; price: MilestonePrice };
export type CostPage = {
  slug: string; label: string; category: string;
  bands: CostBand[]; drivers: string[];
  hourly: { junior: number; mid: number; senior: number };
  lowUsd: number; highUsd: number;
  faqs: { q: string; a: string }[];
};

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export function costPage(slug: string): CostPage | null {
  const entry = COST_SKILLS[slug];
  const skill = SKILLS[slug];
  if (!entry || !skill) return null;

  const category = pricingCategory(slug);
  const base = rateFor(category);
  const bands = entry.jobs.map(j => ({
    title: j.title, what: j.what,
    price: priceMilestone(category, j.hours, j.seniority),
  }));
  const lowUsd = Math.min(...bands.map(b => b.price.lowUsd));
  const highUsd = Math.max(...bands.map(b => b.price.highUsd));
  const hourly = {
    junior: Math.round(base * SENIORITY_MULTIPLIER.junior),
    mid: Math.round(base * SENIORITY_MULTIPLIER.mid),
    senior: Math.round(base * SENIORITY_MULTIPLIER.senior),
  };
  const label = skill.label;

  return {
    slug, label, category: skill.category, bands, drivers: entry.drivers, hourly, lowUsd, highUsd,
    faqs: [
      {
        q: `How much does it cost to hire a ${label} in 2026?`,
        a: `Through Hyrde, ${money(lowUsd)} to ${money(highUsd)} for a typical job. ${bands[0].title} costs ${money(bands[0].price.lowUsd)} to ${money(bands[0].price.highUsd)}; ${bands[2].title.charAt(0).toLowerCase()}${bands[2].title.slice(1)} costs ${money(bands[2].price.lowUsd)} to ${money(bands[2].price.highUsd)}. Hourly, a vetted ${label} works out at ${money(hourly.junior)} to ${money(hourly.senior)} depending on seniority.`,
      },
      {
        q: `Is it cheaper to hire a freelance ${label} or an agency?`,
        a: `A freelancer, usually by a wide margin: an agency prices the same work with account management, overhead and margin on top. What an agency buys you is someone else managing the work. On Hyrde the scoping and the quality check are automated instead, so you get the structure without the markup — and no commission is added to the specialist's price.`,
      },
      {
        q: `What makes a ${label} quote go up?`,
        a: `${entry.drivers.join(". ")}. Each of those is asked before you get a number, which is why the price does not move later unless you change the scope.`,
      },
      {
        q: `Can I get a fixed price instead of an hourly rate?`,
        a: `Yes, and that is the default. The work is priced per milestone before anyone starts, you approve each milestone, and an AI checks the delivered work against your brief before you pay. Your first three projects carry no Hyrde fee at all.`,
      },
    ],
  };
}

/** Every page, cheapest typical job first — the hub's summary table. */
export function allCostPages(): CostPage[] {
  return COST_SLUGS.map(costPage).filter((p): p is CostPage => p !== null)
    .sort((a, b) => a.lowUsd - b.lowUsd);
}
