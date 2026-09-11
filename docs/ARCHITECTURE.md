# Architecture

One page on how Hyrde fits together.

## Shape

```
Browser
  → Vercel: Next.js 16 App Router (proxy.ts, route handlers, server components)
  → Supabase: Postgres + RLS, Auth, Storage, Vault, pg_net
  → Anthropic · ElevenLabs · OpenAI TTS · SendGrid
```

Everything above the database is stateless. The database is both the security
boundary and the source of events.

## A request

1. **`proxy.ts`** refreshes the session, applies the email-verification gate
   (it fails open if the lookup errors), and redirects `/` to `/ar` for Arabic
   and Gulf visitors. Crawlers are never redirected.
2. **A server component or route handler** creates a Supabase client *as the
   signed-in user* (`lib/supabase/server.ts`), so every query is subject to RLS.
3. **Privileged reads** go through `SECURITY DEFINER` functions that check the
   caller (`candidate_index`, `admin_candidate_interviews`). The service-role
   key is used only for pilot support sessions and their audit log.

## Data

38 tables, all with RLS. Access is controlled in three layers: row policies,
column grants, and function execute grants. See CONTRIBUTING → Database.

## Events and email

```
insert → trigger (notify_on_message, notify_on_match, …)
       → notifications row (in-app bell)
       → notify_dispatch() → pg_net → /api/notify/dispatch (shared secret) → SendGrid
```

`pg_net` is transactional: a rolled-back insert sends nothing. Delivery is at-least-once: every
notification goes through `notification_outbox`, is retried with backoff for about
three hours by a pg_cron job, and emails the admin if it finally fails. `notify_dispatch` strips recipients who
are in a support session, so the admin copy survives and the pilot accounts
hear nothing.

## AI

| Job | Where | Model |
|---|---|---|
| Interview questions and grading | `lib/interviewer.ts` | Claude Sonnet 4.6 |
| Candidate reports | `app/api/candidates/report` | Claude Sonnet 5 |
| Live voice interview | ElevenLabs agent, steered by `lib/livecontext.ts` | — |
| Interview voice | ElevenLabs → OpenAI → browser, in that order | — |

- **Pricing is a formula** (`lib/pricing.ts`), not a model call. A disputed
  price has to be explainable in one sentence.
- **Scoping questions are chosen by cost uncertainty resolved** per question,
  with a budget and a confidence stop (`lib/questiontree.ts`).
- **Interviews use the candidate's CV** for Q1 and Q4. The CV is fenced as
  untrusted input and never shown to the grader.

## Languages

Marketing pages are localised by URL (`/ar`, `/de`). The app is localised by a
cookie (`hyrde_locale`). `localeForPath()` in `lib/i18n.ts` decides. The app
defaults to Arabic.

## Environments

| | Database | Deploys |
|---|---|---|
| Local | **production** (known gap) | `npm run dev` |
| Preview | **none yet**; previews cannot reach a database | every branch push |
| Staging | Supabase `dxwhczazyeocjmubhllz` (hyrde-staging), eu-central-1. Empty until the schema baseline is applied | — |
| Production | Supabase `nwdkgtoepffnedspabkt`, eu-central-1, Postgres 17, free plan | merge to `main` |

## Observability

- Caught failures: `reportError()` in `lib/observe.ts`. One JSON line in the logs, plus a Sentry event (org `hyrde`).
- Uncaught server errors: `instrumentation.ts` → `onRequestError`, to the log and to Sentry.
- Browser errors: `instrumentation-client.ts`. Root-layout crashes: `app/global-error.tsx`.
- Sentry reports only from deployed builds (`lib/sentry.ts`), never local development or CI, and attaches no PII.
- Liveness: `GET /api/health`.
- Backups: **none right now.** The nightly encrypted dump (`.github/workflows/db-backup.yml`) is paused until its secrets are set. The RUNBOOK has how to resume it and the restore steps.

## Moving off Vercel

The plan is to move to AWS at scale. What is tied to Vercel today, and what
replaces it:

| Piece | Today, on Vercel | On AWS |
|---|---|---|
| Deploys | Git integration: `main` is production, every branch a preview | OpenNext (SST) on Lambda and CloudFront, or containers on ECS (`output: "standalone"`), deployed from CI on merge to `main` |
| Which environment am I? | `VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA` | `APP_ENV` / `APP_RELEASE` (and `NEXT_PUBLIC_` twins). `lib/env.ts` already reads either |
| Secrets | Vercel environment variables | Secrets Manager or SSM Parameter Store |
| Scheduled SEO ping | `vercel.json` cron | EventBridge Scheduler calling `/api/seo/ping` with `CRON_SECRET` |
| Preview protection | Vercel Authentication (E2E sends a bypass header) | Whatever protects previews there. The E2E suite needs only `BASE_URL` |
| Logs | Vercel log search over JSON lines | CloudWatch Logs; the same JSON lines |
| Health checks | `/api/health` for uptime monitors | The same route as the ALB or ECS health check |

These move unchanged, on purpose: the database and its `pg_cron` jobs
(email retries), rate limits (Postgres), Sentry, `instrumentation.ts`, and
the whole test suite.

