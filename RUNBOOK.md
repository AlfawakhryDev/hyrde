# Runbook

What to do when production is wrong. Written to be followed at 3 a.m.

## First look

| Where | Tells you |
|---|---|
| `https://hyrde.net/api/health` | Serving? Database reachable? Which commit is live? |
| Vercel → Logs, search `"level":"error"` | Every reported failure, one JSON line each |
| Supabase → Logs | Database, auth and storage errors |
| GitHub → Security | Leaked secrets, vulnerable dependencies, code scanning |

## A deploy broke the site

Vercel → Deployments → the last good one → **Promote to Production**. It is
instant and needs no rebuild. Then revert the bad merge on `main`, or the next
deploy brings it back.

## Turn something off

Environment variables apply from the **next deployment**. After changing one in
Vercel, redeploy (Deployments → ⋯ → Redeploy).

| Variable | Effect |
|---|---|
| `AI_ENABLED=false` | Every AI route refuses. Stops Anthropic spend. |
| `IMPERSONATION_ENABLED=false` | Support sessions are refused for everyone. |
| `AI_RATE_LIMIT` / `AI_GLOBAL_LIMIT` | AI requests per minute, per IP / per instance. |

## A key leaked

Rotate it at the provider first, then update Vercel, then redeploy. Removing a
key from git history does not un-leak it.

| Key | Rotate at | Then update |
|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com | Vercel |
| `SENDGRID_API_KEY` | SendGrid → API Keys | Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | Vercel |
| `ELEVENLABS_API_KEY` | ElevenLabs → Profile | Vercel |
| `NOTIFY_SECRET` | generate a new random value | Vercel **and** Supabase Vault `notify_webhook_secret`. They must match, or every email stops. |

## Emails stopped

1. In Supabase SQL:
   `select status_code, count(*) from net._http_response where created > now() - interval '1 day' group by 1;`
   A `401` means `NOTIFY_SECRET` and the Vault secret disagree.
2. SendGrid → Activity: were messages rejected or bounced?
3. `select * from public.support_sessions;`: an open support session silences
   both pilot accounts on purpose.

## A migration went wrong

Write a forward migration that undoes it. Never edit the applied one.

> **There are no automatic backups.** The Supabase project is on the free plan,
> which does not include them, and Storage files (CVs, interview recordings) are
> not in database backups on any plan. Deleted rows and files are gone.

## Someone is stuck in a support session

The amber banner's **End session** closes it. It also expires on its own after
four hours, or:
`delete from public.support_sessions where target_id = '<user uuid>';`
