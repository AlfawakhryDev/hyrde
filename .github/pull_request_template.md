## What

<!-- One paragraph: what this changes and why. -->

## How to verify

<!-- Steps a reviewer can follow. Which account: client, freelancer or admin? -->

## Checklist

CI already checks types, lint, tests, the dependency audit and the build. It cannot check these:

- [ ] A bug fix comes with a test that fails without it
- [ ] No empty `catch {}` and no ignored Supabase `{ error }`: failures go through `reportError()`
- [ ] Schema change: a new migration file, RLS on new tables, `revoke execute` after any `SECURITY DEFINER` function, run inside `begin; … rollback;` first
- [ ] UI change: checked in light and dark, English and Arabic (RTL)
- [ ] If this PR fixed lint warnings, the cap in `package.json` is lowered
