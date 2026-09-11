# Runbook

What to do when production is wrong. Written to be followed at 3 a.m.

## First look

| Where | Tells you |
|---|---|
| `https://hyrde.net/api/health` | Serving? Database reachable? Which commit is live? |
| Vercel → Logs, search `"level":"error"` | Every reported failure, one JSON line each |
| Sentry → Issues (org `hyrde`) | The same failures grouped, with stack traces and alerts, browser included |
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
| `SENTRY_AUTH_TOKEN` | Sentry → Settings → Auth Tokens | Vercel |
| `NOTIFY_SECRET` | generate a new random value | Vercel **and** Supabase Vault `notify_webhook_secret`. They must match, or every email stops. |

## Emails stopped

Every notification is written to `public.notification_outbox` before it is
sent, then retried for about three hours. One that finally fails emails the
admin an **ops alert**.

1. What is stuck:
   `select status, count(*) from public.notification_outbox where created_at > now() - interval '1 day' group by 1;`
   `select id, kind, attempts, last_status, last_error from public.notification_outbox where status in ('pending', 'dead') order by id desc limit 20;`
   `last_status` 401 means `NOTIFY_SECRET` and the Vault secret `notify_webhook_secret` disagree.
2. Is the scheduler running?
   `select status, start_time from cron.job_run_details order by start_time desc limit 5;`
3. SendGrid → Activity: were messages rejected or bounced?
4. Once the cause is fixed, requeue what died:
   `update public.notification_outbox set status = 'pending', attempts = 0, next_attempt_at = now() where status = 'dead' and created_at > now() - interval '1 day';`
5. `select * from public.support_sessions;`: an open support session silences
   both pilot accounts on purpose.

## A migration went wrong

Write a forward migration that undoes it. Never edit the applied one.

> **There are no database backups right now.** The free Supabase plan includes
> none, and the nightly **DB backup** workflow was paused on 2026-09-11 until
> its secrets are set. A bad migration or a dropped table cannot be undone.
> Storage files (CVs, interview recordings) are in no database backup either.
> Deleted files are gone.

## Someone is stuck in a support session

The amber banner's **End session** closes it. It also expires on its own after
four hours, or:
`delete from public.support_sessions where target_id = '<user uuid>';`

## Restore from a backup

This needs the **DB backup** workflow running again. Set the
`SUPABASE_DB_URL` and `BACKUP_PASSPHRASE` repository secrets, then run
`gh workflow enable db-backup.yml`. Backups then run nightly: GitHub →
Actions → **DB backup** → a run → artifact `db-backup`. The file is
encrypted, because this repository is public.

1. Download the artifact and decrypt it. `gpg` asks for `BACKUP_PASSPHRASE`
   from the password manager:
   ```bash
   gpg --decrypt hyrde-db-<stamp>.tgz.gpg | tar -xz
   ```
   This gives `backup/roles.sql`, `backup/schema.sql` and `backup/data.sql`.

2. Restore into a **new** Supabase project first. Never restore blind over
   production:
   ```bash
   psql --single-transaction --variable ON_ERROR_STOP=1 \
     --file backup/roles.sql \
     --file backup/schema.sql \
     --command 'SET session_replication_role = replica' \
     --file backup/data.sql \
     --dbname "$TARGET_DB_URL"
   ```

3. Compare row counts with production. Only then point Vercel at it.

Storage files (CVs, interview recordings) are **not** in these backups.

Restore one backup into staging every month. Until a backup has been
restored, it is a hope, not a backup.
