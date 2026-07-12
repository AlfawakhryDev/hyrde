## What

<!-- One paragraph: what does this PR do, and why? -->

## How to test

<!-- Steps on the Vercel preview URL. Which account type (client / freelancer)? -->

## Checklist

- [ ] `npx tsc --noEmit` clean, `npm run build` passes
- [ ] Tested on the PR preview URL (both light/dark if UI)
- [ ] New tables have RLS enabled + policies (if schema changed)
- [ ] Migration file added under `supabase/migrations/` (if schema changed)
- [ ] No secrets, keys, or `.env` values in the diff
