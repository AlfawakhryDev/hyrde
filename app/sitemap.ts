import { MetadataRoute } from "next";
import { ALL_SKILL_SLUGS, INDEXED_CITY_PAGES } from "@/lib/data";
import { COMPETITOR_SLUGS } from "@/lib/compare";
import { COST_SLUGS } from "@/lib/cost-to-hire";
import { GULF_SLUGS } from "@/lib/gulf";
import { GUIDE_SLUGS, GUIDES } from "@/lib/guides";
import { AR_GUIDE_SLUGS, AR_GUIDES } from "@/lib/guides.ar";
import { DE_GUIDE_SLUGS, DE_GUIDES } from "@/lib/guides.de";
import { AR_CITY_SLUGS } from "@/lib/gcc.ar";

// Date of the last meaningful site-wide content change. Bump this when you
// ship new copy/pages; do NOT set it to new Date() (see note below).
const SITE_REV = new Date("2026-09-21");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hyrde.net";
  // Real modification dates. This used to be `new Date()` on every request, so
  // all ~234 URLs claimed to change every time the sitemap was fetched — a
  // false freshness signal that Google discounts and that makes Bing's
  // lastmod+IndexNow pairing useless. Bump SITE_REV when site-wide content
  // changes; editorial pages report their own `updated` date instead.
  const now = SITE_REV;

  const static_pages = [
    { url: base,                          lastModified: now, priority: 1.0, alternates: { languages: { de: `${base}/de`, "ar-SA": `${base}/ar` } } },
    { url: `${base}/cost-estimator`,      lastModified: now, priority: 0.95 },
    { url: `${base}/faq`,                 lastModified: now, priority: 0.9, alternates: { languages: { de: `${base}/de/faq`, "ar-SA": `${base}/ar/faq` } } },
    // German (DACH) landing surface
    { url: `${base}/de`,                  lastModified: now, priority: 0.9, alternates: { languages: { en: base } } },
    { url: `${base}/de/faq`,              lastModified: now, priority: 0.8, alternates: { languages: { en: `${base}/faq` } } },
    { url: `${base}/de/guides`,           lastModified: now, priority: 0.8, alternates: { languages: { en: `${base}/guides` } } },
    // Arabic (Saudi / GCC) landing surface
    { url: `${base}/ar`,                  lastModified: now, priority: 0.9, alternates: { languages: { en: base } } },
    { url: `${base}/ar/faq`,              lastModified: now, priority: 0.8, alternates: { languages: { en: `${base}/faq` } } },
    { url: `${base}/ar/guides`,           lastModified: now, priority: 0.8 },
    { url: `${base}/ar/hire`,             lastModified: now, priority: 0.85 },
    { url: `${base}/hire-freelancers-with-ai`, lastModified: now, priority: 0.95 },
    { url: `${base}/hire`,            lastModified: now, priority: 0.9 },
    { url: `${base}/cost-to-hire`,    lastModified: now, priority: 0.9 },
    { url: `${base}/compare`,         lastModified: now, priority: 0.85 },
    { url: `${base}/pricing`,         lastModified: now, priority: 0.85 },
    { url: `${base}/enterprise`,      lastModified: now, priority: 0.8 },
    { url: `${base}/rates`,           lastModified: now, priority: 0.8 },
    { url: `${base}/guides`,          lastModified: now, priority: 0.8 },
    { url: `${base}/about`,           lastModified: now, priority: 0.6 },
    // Specialists have to find us too, but they are not the side that pays, and
    // search already sends us almost none of them: of 222 queries in the
    // 2026-09-01 Search Console export, 130 were clients looking to hire and 2
    // were people looking for work. So the supply funnel stays indexable and
    // stays out of the sitemap, and the crawl budget goes to buyer pages.
    { url: `${base}/vetting`,         lastModified: now, priority: 0.4 },
  ];
  // Deliberately absent: /signup (a form has nothing to rank for), /agent (a
  // retired demo), /jobs and /talent (browsing, which this product does not do
  // — both are noindex now).

  // Authority hub: editorial guides (client + freelancer clusters)
  const guide_pages = GUIDE_SLUGS.map(slug => ({
    url: `${base}/guides/${slug}`,
    lastModified: new Date(GUIDES[slug].updated),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Arabic (Saudi/GCC) editorial guides
  const ar_guide_pages = AR_GUIDE_SLUGS.map(slug => ({
    url: `${base}/ar/guides/${slug}`,
    lastModified: new Date(AR_GUIDES[slug].updated),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // German (DACH) editorial guides
  const de_guide_pages = DE_GUIDE_SLUGS.map(slug => ({
    url: `${base}/de/guides/${slug}`,
    lastModified: new Date(DE_GUIDES[slug].updated),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // Arabic GCC city pages — the Arabic-language surface for the Gulf hiring
  // demand that GSC shows arriving in English today.
  const ar_city_pages = AR_CITY_SLUGS.map(slug => ({
    url: `${base}/ar/hire/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Switcher / comparison pages — "[competitor] alternative" (high client intent)
  const comparison_pages = COMPETITOR_SLUGS.map(slug => ({
    url: `${base}/${slug}-alternative`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Tier 1: /hire/[skill]. These carry the searches that bring clients — "hire
  // ux designer", "hire developers in egypt" — so they rank just under the
  // homepage, above everything else.
  const skill_pages = ALL_SKILL_SLUGS.map(skill => ({
    url: `${base}/hire/${skill}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // "What does it cost to hire a …" — the question buyers ask straight after
  // "hire a …", and the one answer engines are asked constantly.
  const cost_pages = COST_SLUGS.map(skill => ({
    url: `${base}/cost-to-hire/${skill}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // English Gulf city hubs. Gulf demand arrives in English and centred on
  // Dubai, while the only Gulf city pages were Arabic; these are the twins.
  const gulf_pages = GULF_SLUGS.map(city => ({
    url: `${base}/hire/in/${city}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
    alternates: { languages: { "ar-SA": `${base}/ar/hire/${city}` } },
  }));

  // Curated skill×city pages. These were pulled from the sitemap entirely in
  // v0.10.0 as suspected doorway pages — but the 2026-09-01 Search Console
  // export showed they generate 61% of all impressions. We now submit the
  // curated allowlist (proven demand + the GCC grid, see INDEXED_CITY_PAGES);
  // the remaining long tail stays out of the sitemap and noindexed.
  const city_pages = [...INDEXED_CITY_PAGES].map(pair => ({
    url: `${base}/hire/${pair}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...static_pages, ...comparison_pages, ...guide_pages,
    ...ar_guide_pages, ...de_guide_pages, ...ar_city_pages, ...skill_pages, ...cost_pages, ...gulf_pages, ...city_pages,
  ];
}
