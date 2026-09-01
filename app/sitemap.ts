import { MetadataRoute } from "next";
import { ALL_SKILL_SLUGS, INDEXED_CITY_PAGES } from "@/lib/data";
import { COMPETITOR_SLUGS } from "@/lib/compare";
import { GUIDE_SLUGS } from "@/lib/guides";
import { AR_GUIDE_SLUGS } from "@/lib/guides.ar";
import { AR_CITY_SLUGS } from "@/lib/gcc.ar";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hyrde.net";
  const now  = new Date();

  const static_pages = [
    { url: base,                          lastModified: now, priority: 1.0, alternates: { languages: { de: `${base}/de`, "ar-SA": `${base}/ar` } } },
    { url: `${base}/cost-estimator`,      lastModified: now, priority: 0.95 },
    { url: `${base}/faq`,                 lastModified: now, priority: 0.9, alternates: { languages: { de: `${base}/de/faq`, "ar-SA": `${base}/ar/faq` } } },
    // German (DACH) landing surface
    { url: `${base}/de`,                  lastModified: now, priority: 0.9, alternates: { languages: { en: base } } },
    { url: `${base}/de/faq`,              lastModified: now, priority: 0.8, alternates: { languages: { en: `${base}/faq` } } },
    // Arabic (Saudi / GCC) landing surface
    { url: `${base}/ar`,                  lastModified: now, priority: 0.9, alternates: { languages: { en: base } } },
    { url: `${base}/ar/faq`,              lastModified: now, priority: 0.8, alternates: { languages: { en: `${base}/faq` } } },
    { url: `${base}/ar/guides`,           lastModified: now, priority: 0.8 },
    { url: `${base}/ar/hire`,             lastModified: now, priority: 0.85 },
    { url: `${base}/hire-freelancers-with-ai`, lastModified: now, priority: 0.95 },
    { url: `${base}/hire`,            lastModified: now, priority: 0.9 },
    { url: `${base}/signup`,          lastModified: now, priority: 0.9 },
    { url: `${base}/vetting`,         lastModified: now, priority: 0.85 },
    { url: `${base}/agent`,           lastModified: now, priority: 0.9 },
    { url: `${base}/pricing`,         lastModified: now, priority: 0.8 },
    { url: `${base}/enterprise`,      lastModified: now, priority: 0.8 },
    { url: `${base}/rates`,           lastModified: now, priority: 0.8 },
    { url: `${base}/talent`,          lastModified: now, priority: 0.7 },
    { url: `${base}/about`,           lastModified: now, priority: 0.7 },
    { url: `${base}/jobs`,            lastModified: now, priority: 0.7 },
    { url: `${base}/guides`,          lastModified: now, priority: 0.8 },
    { url: `${base}/compare`,         lastModified: now, priority: 0.8 },
  ];

  // Authority hub: editorial guides (client + freelancer clusters)
  const guide_pages = GUIDE_SLUGS.map(slug => ({
    url: `${base}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Arabic (Saudi/GCC) editorial guides
  const ar_guide_pages = AR_GUIDE_SLUGS.map(slug => ({
    url: `${base}/ar/guides/${slug}`,
    lastModified: now,
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

  // Tier 1: /hire/[skill] — 25 pages
  const skill_pages = ALL_SKILL_SLUGS.map(skill => ({
    url: `${base}/hire/${skill}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
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
    ...ar_guide_pages, ...ar_city_pages, ...skill_pages, ...city_pages,
  ];
}
