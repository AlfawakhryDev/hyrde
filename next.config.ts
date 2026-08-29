import type { NextConfig } from "next";

/**
 * Routes from the pre-pivot marketplace, mapped to their nearest equivalent on
 * the Werkvertrag site.
 *
 * These are 301s rather than deletions-to-404 for two reasons. Any ranking
 * signal these URLs still hold is consolidated onto the new surface instead of
 * being thrown away, and a buyer who arrives from an old link or a stale search
 * result lands on the current offer rather than a dead end.
 *
 * The destinations are deliberately coarse. There is no Werkvertrag equivalent
 * of "hire a React developer in Berlin" — the whole point of the pivot is that
 * we do not sell that (CLAUDE.md §0, §1). Sending those to the homepage states
 * the new position rather than pretending the old page still exists.
 */
const LEGACY_REDIRECTS: { from: string; to: string }[] = [
  // Pricing — the German page is now canonical.
  { from: "/pricing", to: "/preise" },
  { from: "/rates", to: "/preise" },
  { from: "/rates/:path*", to: "/preise" },
  { from: "/cost-estimator", to: "/preise" },
  { from: "/compare", to: "/preise" },
  { from: "/compare/:path*", to: "/preise" },

  // Anything that invited someone to post work or shop for a person. We assign
  // specialists and never publish a talent directory (§1).
  { from: "/hire", to: "/" },
  { from: "/hire/:path*", to: "/" },
  { from: "/hire-freelancers-with-ai", to: "/" },
  { from: "/post-job", to: "/kontakt" },
  { from: "/get-started", to: "/kontakt" },
  { from: "/jobs", to: "/" },
  { from: "/jobs/:path*", to: "/" },
  { from: "/talent", to: "/" },
  { from: "/talent/:path*", to: "/" },
  { from: "/freelancer", to: "/" },
  { from: "/freelancer/:path*", to: "/" },
  { from: "/profile/:path*", to: "/" },

  // Competitor-comparison SEO pages. They position us as a marketplace
  // alternative, which is the category we deliberately left (§7).
  { from: "/upwork-alternative", to: "/" },
  { from: "/fiverr-alternative", to: "/" },
  { from: "/toptal-alternative", to: "/" },

  // Retired product surfaces from the marketplace build.
  { from: "/sparks", to: "/" },
  { from: "/sparks/:path*", to: "/" },
  { from: "/arena", to: "/" },
  { from: "/arena/:path*", to: "/" },
  { from: "/agent", to: "/" },
  { from: "/agent/:path*", to: "/" },
  { from: "/enterprise", to: "/" },
  { from: "/guides", to: "/" },
  { from: "/guides/:path*", to: "/" },
  { from: "/join", to: "/" },
  { from: "/welcome", to: "/" },

  // German is now the default locale for every client-facing surface (§6), so
  // the /de mirror is redundant rather than translated.
  { from: "/de", to: "/" },
  { from: "/de/:path*", to: "/" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Canonicalize to the non-www apex domain. Both www and non-www currently
      // serve 200s, which Google treats as duplicate content. A permanent (301)
      // redirect consolidates ranking signals onto https://hyrde.net.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hyrde.net" }],
        destination: "https://hyrde.net/:path*",
        statusCode: 301,
      },
      // statusCode: 301 rather than `permanent: true` (which emits a 308).
      // Google treats the two the same, but 301 matches the canonicalisation
      // rule above and is what every SEO tool and log analyser expects.
      ...LEGACY_REDIRECTS.map((r) => ({
        source: r.from,
        destination: r.to,
        statusCode: 301 as const,
      })),
    ];
  },
};

export default nextConfig;
