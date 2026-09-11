# Contributing to Hyrde

How code gets from a laptop to hyrde.net. Anything marked **enforced** is
checked by a machine. Everything else is a convention you are trusted with.

## Setup

```bash
nvm use                     # Node 24, the same major as production (.nvmrc)
npm ci                      # exactly what package-lock.json says
cp .env.example .env.local  # then fill in development values; ask the lead
npm run dev
```

Never use production keys locally.

## Branches

| Branch | Is | Deploys to |
|---|---|---|
| `main` | Production. **Enforced:** changes arrive by PR, CI must pass, no force-push. | hyrde.net, automatically |
| `develop` | Integration. **Enforced:** changes arrive by PR, CI must pass. | A Vercel preview URL |
| `feat/*` `fix/*` `chore/*` | One change each, cut from `develop`. | Its own preview URL |
| `hotfix/*` | An urgent production fix, cut from `main`, merged back into both. | — |

```
feat/x ──PR──▶ develop ──PR──▶ main ──▶ hyrde.net
```

There is no manual deploy step. Vercel's Git integration deploys `main` on
merge. Running `vercel deploy --prod` by hand only creates a duplicate.

## The loop

1. `git switch develop && git pull`
2. `git switch -c feat/short-description`
3. Commit small, in the present tense: `Add deadline field to composer`.
4. `npm run check` runs the same typecheck, lint and tests as CI.
5. Push and open a PR into `develop`. The **verify** check must pass (**enforced**).
6. To release, open a PR from `develop` into `main`.

## What CI checks

`.github/workflows/ci.yml`, on every PR and every push to `main`/`develop`:

| Step | Fails when |
|---|---|
| Typecheck | any TypeScript error |
| Lint | any error, or more warnings than the cap in `package.json` |
| Unit tests | any failing test in `lib/**/*.test.ts` |
| Audit | a high or critical vulnerability in a production dependency |
| Build | `next build` fails |

**The lint warning cap only goes down.** It exists because the React Compiler
rules arrived after this code was written. If your change fixes warnings, lower
`--max-warnings` in `package.json` in the same PR. Never raise it.

## Tests

Pure logic lives in `lib/` and is tested next to itself (`lib/pricing.ts` →
`lib/pricing.test.ts`). Test what would cost money, data or trust if it broke:
pricing, access rules, auth decisions, parsing of untrusted input. **Every bug
fix comes with a test that fails without the fix.**

## Database

Postgres on Supabase is the security boundary, not the app. Before touching
`supabase/`:

- **RLS on every table.** Default to owner-only and open up deliberately.
- **Admin checks go through `public.am_i_admin()`**, never an inline
  `profiles.is_admin` subquery, which recurses through the policy it sits in.
- **Every `SECURITY DEFINER` function is followed by
  `revoke execute … from public, anon, authenticated`**, unless users are meant
  to call it, in which case it checks the caller itself. PostgREST exposes every
  public function at `/rest/v1/rpc/<name>`; one of these was once an open email relay.
- **Column-level grants:** selecting a column the role has no grant on fails the
  whole query, not just that column.
- **Every schema change is a new file in `supabase/migrations/`**, in the same PR
  as the code that needs it. Never edit an applied migration.

> **Staging exists; the baseline is pending.** `hyrde-staging` is an empty
> Supabase project in the same region as production. Once the
> **DB schema baseline** workflow has run, its dump becomes the first migration
> and staging is built from it. After that, every migration goes to staging
> first and to production second. Until then, treat every migration as
> irreversible, and run it inside `begin; … rollback;` first.

## Errors

Never swallow a failure. An empty `catch {}`, or a Supabase call whose
`{ error }` is ignored, is how lead capture failed on every insert for months
without anyone noticing. Server code reports through `reportError()` in
`lib/observe.ts`. Uncaught server errors are captured by `instrumentation.ts`. Both reach
Sentry as well as the logs.

## Secrets

- `.env*` is ignored, and GitHub push protection rejects known secret formats.
- Production values live in Vercel, plus Supabase Vault's `notify_webhook_secret`,
  which must equal `NOTIFY_SECRET`.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses every RLS policy. Server code only.

## Reviews

`.github/CODEOWNERS` says who reviews which paths. Required approvals are 0
while there is one engineer. Set them to 1 the day a second one joins.

## More

- [RUNBOOK.md](RUNBOOK.md): what to do when production is broken.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the system fits together.
- `graphify-out/GRAPH_REPORT.md`: a generated map of the modules (`/graphify .`).
