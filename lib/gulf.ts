import { CITIES } from "@/lib/data";
import { costPage } from "@/lib/cost-to-hire";

// ── The Gulf, in English ───────────────────────────────────────────────────
// Gulf hiring demand shows up in our Search Console in English and centred on
// Dubai ("hire video editors dubai", "ui design agency dubai", "hire shopify
// website designers in dubai"), but the only Gulf city pages we had were
// Arabic. These are the English twins, carrying the same market facts, priced
// in the local currency, and pointing at their Arabic counterparts.

export interface GulfCity {
  slug: string;            // matches CITIES in lib/data.ts and the Arabic page
  name: string;
  country: string;
  countryCode: string;
  currencyCode: string;
  perUsd: number;          // local units per 1 USD
  note: string;            // what this market is actually like
  demand: string;          // what it hires for
  topSkills: string[];     // trades with a cost page, most wanted first
}

export const GULF_CITIES: Record<string, GulfCity> = {
  dubai: {
    slug: "dubai", name: "Dubai", country: "the UAE", countryCode: "AE",
    currencyCode: "AED", perUsd: 3.67,
    note: "Dubai is the strongest source of Gulf freelance demand in our search data, led by store developers, interface designers and video editors. It is a competitive, international market, and delivery speed and quality separate people far more than price does.",
    demand: "Shopify builds, UI and UX design, video and ad content, and growth marketing.",
    topSkills: ["shopify-developer", "ui-designer", "ux-designer", "video-editor", "growth-marketer", "seo-specialist"],
  },
  "abu-dhabi": {
    slug: "abu-dhabi", name: "Abu Dhabi", country: "the UAE", countryCode: "AE",
    currencyCode: "AED", perUsd: 3.67,
    note: "Abu Dhabi leans towards enterprise and government work rather than quick builds: requirements are tighter and documentation matters more. Write the acceptance criteria before anyone starts, and work in milestones that get approved one at a time.",
    demand: "Data analysis and reporting, financial modelling, presentations and documents, and corporate systems and sites.",
    topSkills: ["data-scientist", "ux-designer", "fullstack-developer", "seo-specialist", "technical-writer", "ui-designer"],
  },
  riyadh: {
    slug: "riyadh", name: "Riyadh", country: "Saudi Arabia", countryCode: "SA",
    currencyCode: "SAR", perUsd: 3.75,
    note: "Riyadh is the biggest source of freelance demand in Saudi Arabia, driven by startup growth and Vision 2030 programmes. Local supply of developers, designers and analysts trails that demand, so teams bring in remote specialists to close the gap quickly.",
    demand: "E-commerce development, UI and UX design, financial modelling and data work, and investor or government presentations.",
    topSkills: ["shopify-developer", "ux-designer", "data-scientist", "fullstack-developer", "ui-designer", "growth-marketer"],
  },
  jeddah: {
    slug: "jeddah", name: "Jeddah", country: "Saudi Arabia", countryCode: "SA",
    currencyCode: "SAR", perUsd: 3.75,
    note: "Jeddah is an established trading and family-business city, and most of its demand comes from companies that already exist moving into e-commerce, rather than startups building from nothing. Scope tends to be clearer and budgets defined, which suits fixed-price project work.",
    demand: "Shopify and WordPress stores, content and digital marketing, brand identity, and remote executive support.",
    topSkills: ["shopify-developer", "wordpress-developer", "seo-specialist", "growth-marketer", "ui-designer", "video-editor"],
  },
  doha: {
    slug: "doha", name: "Doha", country: "Qatar", countryCode: "QA",
    currencyCode: "QAR", perUsd: 3.64,
    note: "Doha is a smaller market than Dubai or Riyadh but a concentrated one: fewer projects at relatively higher budgets. Local freelance supply is thin, so vetted remote specialists are the practical route for most teams.",
    demand: "Websites and stores, brand identity and presentations, bilingual content, and data analysis.",
    topSkills: ["wordpress-developer", "shopify-developer", "ui-designer", "data-scientist", "technical-writer", "ux-designer"],
  },
  "kuwait-city": {
    slug: "kuwait-city", name: "Kuwait City", country: "Kuwait", countryCode: "KW",
    currencyCode: "KWD", perUsd: 0.31,
    note: "Kuwait runs one of the Gulf's most active Instagram-commerce markets, and most freelance demand comes from those store owners: a store to build, content to shoot, ads to run. The projects are short and they repeat, which suits hiring per task.",
    demand: "Shopify and Salla stores, content production and editing, ad management, and identity and social design.",
    topSkills: ["shopify-developer", "video-editor", "growth-marketer", "ui-designer", "seo-specialist", "wordpress-developer"],
  },
};

export const GULF_SLUGS = Object.keys(GULF_CITIES);

export const getGulfCity = (slug: string): GulfCity | undefined =>
  CITIES[slug] ? GULF_CITIES[slug] : undefined;

/** USD into the local currency, rounded to something a person would say. */
export function inLocal(usd: number, city: GulfCity): string {
  const raw = usd * city.perUsd;
  const step = raw >= 5000 ? 500 : raw >= 1000 ? 100 : raw >= 100 ? 10 : 5;
  const rounded = Math.max(step, Math.round(raw / step) * step);
  return `${city.currencyCode} ${rounded.toLocaleString("en-US")}`;
}

export type GulfTrade = { slug: string; label: string; lowUsd: number; highUsd: number; local: string };

/** The trades this city hires for, priced in both currencies. */
export function gulfTrades(city: GulfCity): GulfTrade[] {
  return city.topSkills
    .map(slug => {
      const p = costPage(slug);
      return p && {
        slug, label: p.label, lowUsd: p.lowUsd, highUsd: p.highUsd,
        local: `${inLocal(p.lowUsd, city)}–${inLocal(p.highUsd, city).replace(`${city.currencyCode} `, "")}`,
      };
    })
    .filter((t): t is GulfTrade => Boolean(t));
}
