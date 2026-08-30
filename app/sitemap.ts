import { MetadataRoute } from "next";

/**
 * The indexable surface is deliberately small.
 *
 * Every marketplace-era URL this file used to advertise — /hire, /pricing,
 * /compare, the competitor-alternative pages, the guide hub, the 25 skill
 * pages — now 301s to the Werkvertrag site (see next.config.ts). Listing a
 * redirecting URL in a sitemap earns a "Page with redirect" indexing error in
 * Search Console, so they are gone rather than remapped.
 *
 * Impressum, Datenschutz and AGB are excluded on purpose: they carry
 * `robots: { index: false }` while they are unreviewed placeholders (§4). They
 * belong here once a Fachanwalt has signed them off, not before.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hyrde.net";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    {
      url: `${base}/wie-es-funktioniert`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/rechtssicherheit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { url: `${base}/preise`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/kontakt`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];
}
