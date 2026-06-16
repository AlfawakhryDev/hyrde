import { MetadataRoute } from "next";
import { ALL_SKILL_SLUGS, ALL_CITY_SLUGS } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hyrde.ai";
  const now  = new Date();

  const static_pages = [
    { url: base,                      lastModified: now, priority: 1.0 },
    { url: `${base}/hire`,            lastModified: now, priority: 0.9 },
    { url: `${base}/post-job`,        lastModified: now, priority: 0.9 },
    { url: `${base}/agent`,           lastModified: now, priority: 0.9 },
    { url: `${base}/pricing`,         lastModified: now, priority: 0.8 },
    { url: `${base}/enterprise`,      lastModified: now, priority: 0.8 },
    { url: `${base}/about`,           lastModified: now, priority: 0.7 },
    { url: `${base}/jobs`,            lastModified: now, priority: 0.7 },
    { url: `${base}/freelancer/join`, lastModified: now, priority: 0.9 },
  ];

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

  return [...static_pages, ...skill_pages, ...skill_city_pages];
}
