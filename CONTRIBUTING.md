# Contributing to Hyrde

This is how we ship. It's optimized for a small team moving fast without breaking production.

## Branches

| Branch | Meaning | Deploys to |
|---|---|---|
| `main` | **Production.** What's live on [hyrde.net](https://hyrde.net). Protected — no direct pushes. | Production (Vercel) |
| `develop` | Integration/testing. Feature branches merge here first. | Preview URL (Vercel) |
| `feat/<name>` | One feature or fix per branch, cut from `develop`. | PR preview URL (Vercel) |
| `hotfix/<name>` | Urgent production fix, cut from `main`, merged back to both. | — |

```
feat/x ──PR──▶ develop ──PR──▶ main ──▶ hyrde.net
```

## The loop

1. `git checkout develop && git pull`
2. `git checkout -b feat/short-description`
3. Commit small, present-tense: `Add deadline field to composer` (not "added stuff")
4. Push and open a PR **into `develop`**. Every PR gets an automatic Vercel preview URL — test there.
5. One approval required. Squash-merge.
6. Releases: PR `develop` → `main`, then tag it: `git tag v0.3.0 && git push --tags`

## Rollbacks

- **App**: every deploy is immutable on Vercel — `vercel rollback` or promote any previous deployment from the Vercel dashboard. Tags mark known-good states.
- **Database**: schema changes go through `supabase/migrations/NNNN_*.sql` files — write a new forward migration to undo, never edit an applied one.

## Database rules

- Every schema change = a new numbered file in `supabase/migrations/` in the same PR as the code that needs it.
- **RLS is mandatory on every new table.** No exceptions. Default to owner-only (`auth.uid() = user_id`) and open up deliberately.
- Never reference the `service_role` key in anything that ships to a browser or app.

## Secrets

- `.env*` is gitignored. Never commit keys. Local setup needs `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY` — ask the team lead.
- Email runs on SendGrid. `SENDGRID_API_KEY` lives in the Vercel env only; Supabase Vault holds just `notify_webhook_secret`, the shared secret its triggers use to call `/api/notify/dispatch`.

## Before you push

```bash
npx tsc --noEmit   # must be clean
npm run build      # must pass (NOT while `npm run dev` is running — it corrupts .next)
```

## Codebase orientation

Read `graphify-out/GRAPH_REPORT.md` (build it with `/graphify .` in Claude Code, or `uv tool install graphifyy && graphify install` first). It maps god nodes, communities, and how modules connect — faster than grepping.
