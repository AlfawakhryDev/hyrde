# Security Policy

## Reporting a vulnerability

Please report security issues privately to **abdelrahman@hyrde.net**. Do not open
a public issue for anything exploitable.

Include what you found, how to reproduce it, and the impact. We'll acknowledge,
investigate, and fix as fast as we can, and credit you if you'd like.

## Model

- Row Level Security is enabled on every table.
- Sensitive columns (payout details, `is_admin`, interview transcripts, unpaid
  deliverables) are never exposed via the public anon key — they're reachable only
  through `SECURITY DEFINER` accessor functions that check the caller.
- Secrets live in environment variables / the Supabase Vault, never in the repo.
