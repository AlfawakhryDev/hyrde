import type { Instrumentation } from "next";
import { reportError } from "@/lib/observe";

// Every uncaught server error (route handlers, server components, server
// actions, the proxy) lands here once, as one structured line. Only the path
// and method are recorded: headers carry cookies and auth tokens, and query
// strings can carry email addresses.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  reportError("request", err, {
    path: request.path.split("?")[0],
    method: request.method,
    route: context.routePath,
    kind: context.routeType,
    digest: typeof err === "object" && err !== null && "digest" in err
      ? String((err as { digest: unknown }).digest)
      : undefined,
  });
};
