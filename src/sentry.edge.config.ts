import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/platform/sentry";

Sentry.init(sentryOptions);
