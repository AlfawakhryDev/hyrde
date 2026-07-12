import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Canonicalize to the non-www apex domain. Both www and non-www currently
  // serve 200s, which Google treats as duplicate content. A permanent (301)
  // redirect consolidates ranking signals onto https://hyrde.net.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hyrde.net" }],
        destination: "https://hyrde.net/:path*",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
