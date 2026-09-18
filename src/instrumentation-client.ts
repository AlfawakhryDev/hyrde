import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/platform/sentry";
import { tolerateForeignDomEdits } from "@/lib/platform/dom-guard";

// Before hydration, so a visitor who translates the page keeps a working site.
tolerateForeignDomEdits();

// Runs before the app becomes interactive. From here on, uncaught browser
// exceptions and unhandled promise rejections are captured automatically.
Sentry.init(sentryOptions);

// Required by the SDK to follow client-side navigations; without it every
// build warns, and navigations are invisible in Sentry's timeline.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
