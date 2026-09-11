import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";
import { logError } from "@/lib/observe";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("./sentry.edge.config");
}

// Every uncaught server error (route handlers, server components, server
// actions, the proxy) lands here once and goes two places: one structured log
// line, and Sentry, which groups and alerts. The log records path and method
// only: headers carry cookies and auth tokens, and query strings can carry
// email addresses.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  logError("request", err, {
    path: request.path.split("?")[0],
    method: request.method,
    route: context.routePath,
    kind: context.routeType,
    digest: typeof err === "object" && err !== null && "digest" in err
      ? String((err as { digest: unknown }).digest)
      : undefined,
  });
  await Sentry.captureRequestError(err, request, context);
};
