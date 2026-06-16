import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://hyrde.net";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private/dynamic surfaces out of the index.
        disallow: ["/api/", "/dashboard"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
