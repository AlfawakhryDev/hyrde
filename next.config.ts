import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

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

// Source maps are uploaded to Sentry at build time, so browser stack traces
// are readable, and then deleted so they are never served to the public. That
// happens only when SENTRY_AUTH_TOKEN is set (the production build's
// environment). Without it the build is the same and simply skips the upload,
// so local and PR builds need no token.
export default withSentryConfig(nextConfig, {
  org: "hyrde",
  project: "javascript-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  telemetry: false,
});
