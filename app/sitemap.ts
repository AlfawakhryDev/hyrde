import { MetadataRoute } from "next";
import { ALL_SKILL_SLUGS, ALL_CITY_SLUGS } from "@/lib/data";
import { COMPETITOR_SLUGS } from "@/lib/compare";
import { GUIDE_SLUGS } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hyrde.net";
  const now  = new Date();

  const static_pages = [
    { url: base,                      lastModified: now, priority: 1.0 },
    { url: `${base}/get-started`,     lastModified: now, priority: 0.9 },
    { url: `${base}/join`,            lastModified: now, priority: 0.9 },
    { url: `${base}/hire`,            lastModified: now, priority: 0.9 },
    { url: `${base}/post-job`,        lastModified: now, priority: 0.9 },
    { url: `${base}/agent`,           lastModified: now, priority: 0.9 },
    { url: `${base}/pricing`,         lastModified: now, priority: 0.8 },
    { url: `${base}/enterprise`,      lastModified: now, priority: 0.8 },
    { url: `${base}/rates`,           lastModified: now, priority: 0.8 },
    { url: `${base}/talent`,          lastModified: now, priority: 0.7 },
    { url: `${base}/about`,           lastModified: now, priority: 0.7 },
    { url: `${base}/jobs`,            lastModified: now, priority: 0.7 },
    { url: `${base}/freelancer/join`, lastModified: now, priority: 0.9 },
    { url: `${base}/guides`,          lastModified: now, priority: 0.8 },
  ];

  // Authority hub: editorial guides (client + freelancer clusters)
  const guide_pages = GUIDE_SLUGS.map(slug => ({
    url: `${base}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
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

  // Tier 2: /hire/[skill]/[city] — 25×12 = 300 pages (scales to 20K+)
  const skill_city_pages = ALL_SKILL_SLUGS.flatMap(skill =>
    ALL_CITY_SLUGS.map(city => ({
      url: `${base}/hire/${skill}/${city}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  return [...static_pages, ...comparison_pages, ...guide_pages, ...skill_pages, ...skill_city_pages];
}
