import { SKILLS } from "@/lib/data";
import { priceMilestone, type MilestonePrice, type Seniority } from "@/lib/pricing";

// ── What a buyer actually wants to know on a "hire a …" page ───────────────
// Those pages used to lead with SKILLS.avgRate, which is a Western *reference*
// rate for an SEO audience ($84/hr for engineering) — higher than what a client
// pays a vetted specialist here ($45 blended). Quoting a buyer more than they
// would pay is a strange way to win them, so the numbers below come from the
// same pricing formula the product quotes with.
//
// Concrete prices are also what answer engines quote. "It depends" is never
// cited; "$720 to $1,080 for a landing page" is.

type Job = { title: string; what: string; hours: number; seniority: Seniority };

/** SKILLS categories are an SEO taxonomy; pricing has its own, smaller one. */
const PRICING_CATEGORY: Record<string, string> = {
  Engineering: "Development", Data: "Data", Design: "Design", Creative: "Design",
  Writing: "Copywriting", Marketing: "Marketing", Research: "Other",
  Finance: "Other", Operations: "Other", Legal: "Other",
};

/** Three jobs people in each trade are actually asked for, smallest first. */
const TYPICAL: Record<string, Job[]> = {
  Engineering: [
    { title: "A bug that keeps coming back", what: "You send the repository and how to trigger it. You get the fix, the cause in writing, and a test so it stays fixed.", hours: 10, seniority: "mid" },
    { title: "One feature added to a live product", what: "Scoped against your current code, shipped behind a flag, with the edge cases listed before work starts.", hours: 45, seniority: "mid" },
    { title: "A working first version of one idea", what: "Sign-up, the core feature, and nothing else. Split into milestones you approve one at a time.", hours: 160, seniority: "senior" },
  ],
  Data: [
    { title: "A messy export turned into a clean dataset", what: "Deduplicated, typed, documented, and reproducible — a script you can run again next month.", hours: 12, seniority: "mid" },
    { title: "A dashboard for the numbers you check weekly", what: "The five metrics that matter, wired to your real sources, refreshing without you.", hours: 25, seniority: "mid" },
    { title: "A forecast you can act on", what: "A model with its assumptions written down, and an honest statement of what it cannot predict.", hours: 80, seniority: "senior" },
  ],
  Design: [
    { title: "A landing page that matches your brand", what: "One page, designed to convert one action, handed over ready to build.", hours: 18, seniority: "mid" },
    { title: "A full screen flow, designed and prototyped", what: "Every state, including the empty and error ones, clickable before a line of code.", hours: 60, seniority: "mid" },
    { title: "A visual identity, not just a logo", what: "Logo, colour, type, and the rules that keep it consistent when someone else uses it.", hours: 50, seniority: "senior" },
  ],
  Writing: [
    { title: "One page of copy that sells one thing", what: "Written from your customers' words, not adjectives. Two versions to test.", hours: 8, seniority: "mid" },
    { title: "Documentation your users can follow", what: "The path a real user takes, written so support stops answering the same question.", hours: 30, seniority: "mid" },
    { title: "Ten articles with search intent behind them", what: "Briefed against what people actually search, written to be read, not to hit a word count.", hours: 40, seniority: "mid" },
  ],
  Marketing: [
    { title: "An ad account audited and rebuilt", what: "What is wasting money, what to keep, and the rebuild — with the numbers before and after.", hours: 15, seniority: "mid" },
    { title: "Search fixed on a site you already have", what: "The technical faults, the pages worth keeping, and the ones quietly holding the domain back.", hours: 25, seniority: "mid" },
    { title: "A launch campaign, planned and shipped", what: "Channels, message, assets and a schedule — plus what you will measure to call it a success.", hours: 45, seniority: "senior" },
  ],
  Creative: [
    { title: "Social assets for one campaign", what: "Sized for every placement, on brand, delivered as editable files.", hours: 15, seniority: "mid" },
    { title: "A short promo video, cut and graded", what: "From your footage or stock: edit, colour, sound, captions, and the vertical cut.", hours: 20, seniority: "mid" },
    { title: "A full visual identity", what: "Logo, colour, type, and the rules that keep it consistent when someone else uses it.", hours: 50, seniority: "senior" },
  ],
  Research: [
    { title: "Ten competitors compared on what matters", what: "Pricing, positioning and gaps, in a table you can act on — with sources you can check.", hours: 15, seniority: "mid" },
    { title: "A market sized with its workings shown", what: "Top-down and bottom-up, so the number survives a sceptical question.", hours: 20, seniority: "mid" },
    { title: "Customer interviews, run and summarised", what: "Recruiting, the conversations, and what was actually said rather than what you hoped.", hours: 30, seniority: "senior" },
  ],
  Finance: [
    { title: "Books cleaned up and reconciled", what: "Categorised, reconciled, and a short list of what to stop doing next month.", hours: 20, seniority: "mid" },
    { title: "A budget and cash-flow plan for the year", what: "What comes in, what goes out, and when it gets tight — in a sheet you can edit.", hours: 25, seniority: "mid" },
    { title: "A financial model you can defend", what: "Assumptions on their own tab, scenarios that move, and no hidden hardcoded numbers.", hours: 30, seniority: "senior" },
  ],
  Operations: [
    { title: "A process documented and handed over", what: "Written so the next person can run it without asking you anything.", hours: 15, seniority: "mid" },
    { title: "A supplier search, shortlisted", what: "Criteria agreed first, then a shortlist with prices, terms, and what the risks are.", hours: 20, seniority: "mid" },
    { title: "Tools connected so data stops being retyped", what: "Your systems talking to each other, with the failure cases handled, not ignored.", hours: 25, seniority: "mid" },
  ],
  Legal: [
    { title: "A contract reviewed for your situation", what: "What is unusual, what to push back on, and what it means in plain language.", hours: 10, seniority: "senior" },
    { title: "Terms and a privacy policy for your product", what: "Written for what your product actually does, not copied from another company.", hours: 15, seniority: "senior" },
    { title: "Paperwork checked before you sign", what: "Read line by line, with the risks ranked rather than listed.", hours: 20, seniority: "senior" },
  ],
};

export type ProjectBand = { title: string; what: string; price: MilestonePrice };

const jobsFor = (category: string) => TYPICAL[category] ?? TYPICAL.Operations;

/** Three typical jobs for this trade, priced the way the product prices them. */
export function projectBands(skillSlug: string): ProjectBand[] {
  const skill = SKILLS[skillSlug];
  if (!skill) return [];
  const category = PRICING_CATEGORY[skill.category] ?? "Other";
  return jobsFor(skill.category).map(job => ({
    title: job.title,
    what: job.what,
    price: priceMilestone(category, job.hours, job.seniority),
  }));
}

/** The span those jobs cover — what goes in the Offer for answer engines. */
export function priceRange(skillSlug: string): { lowUsd: number; highUsd: number } | null {
  const bands = projectBands(skillSlug);
  if (!bands.length) return null;
  return {
    lowUsd: Math.min(...bands.map(b => b.price.lowUsd)),
    highUsd: Math.max(...bands.map(b => b.price.highUsd)),
  };
}

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Questions a buyer asks before they get in touch, answered with numbers. */
export function hireFaqs(skillSlug: string): { q: string; a: string }[] {
  const skill = SKILLS[skillSlug];
  const range = priceRange(skillSlug);
  const bands = projectBands(skillSlug);
  if (!skill || !range || !bands.length) return [];
  const first = bands[0];
  const label = skill.label;   // "UX Designer", not "ux designer"
  return [
    {
      q: `What does it cost to hire a ${label}?`,
      a: `Most ${label} work booked through Hyrde lands between ${money(range.lowUsd)} and ${money(range.highUsd)}. ${first.title} runs ${money(first.price.lowUsd)} to ${money(first.price.highUsd)} — about ${first.price.hours} hours at ${money(first.price.rateUsd)} an hour. You see the price before anyone starts, and it only changes if you change the scope.`,
    },
    {
      q: `How quickly can a ${label} start?`,
      a: `Usually the same day. You describe the result you want, the AI turns it into milestones with a price on each, and matches one vetted ${label} to the first milestone. There is no bidding to wait through and no shortlist to read.`,
    },
    {
      q: `How do you know the ${label} is any good?`,
      a: `Every specialist passes a graded interview before they can be matched: a scenario from their own field, a follow-up that probes the answer, and a deep dive on something they shipped. Answers that could have come from anyone are capped. A portfolio or a badge alone gets nobody in.`,
    },
    {
      q: `Can I hire a ${label} for one small job?`,
      a: `Yes. One task is fine, and so is a whole outcome broken into milestones you approve one at a time. Your first three projects carry no Hyrde fee at all: you pay the specialist their price and nothing else.`,
    },
  ];
}
