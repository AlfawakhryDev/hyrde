import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://hyrde.net";
  const privatePaths = ["/api/", "/dashboard"];
  // AEO: explicitly welcome the answer-engine crawlers so we can be cited.
  const aiBots = [
    "GPTBot", "OAI-SearchBot", "ChatGPT-User",       // OpenAI
    "ClaudeBot", "anthropic-ai", "Claude-User",       // Anthropic
    "PerplexityBot", "Perplexity-User",               // Perplexity
    "Google-Extended",                                 // Google AI
    "Applebot-Extended",                               // Apple
    "CCBot",                                            // Common Crawl (feeds many LLMs)
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      { userAgent: aiBots, allow: "/", disallow: privatePaths },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
