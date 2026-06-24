# Hyrde database (Supabase / Postgres)

The relational backbone for the web app **and** the iOS app. One Postgres
database, one schema, two clients.

## Tables
- **clients** — hire-side leads (waitlist + posted briefs)
- **pilots** — freelancer-side leads (the "Pilots")
- **tasks** — work dropped into the Arena (human or AI-client origin)
- **mounts** — a Pilot claiming a task to finish it

See `migrations/0001_init.sql` for the full schema (enums, foreign keys,
indexes, and Row-Level-Security policies).

## One-time setup (≈5 minutes)
1. Create a free project at **supabase.com** (pick a region near your users).
2. Open **SQL Editor → New query**, paste all of `migrations/0001_init.sql`, and **Run**.
3. Go to **Project Settings → API** and copy two values:
   - **Project URL**
   - **anon / public** API key  ← safe to ship in clients; protected by RLS
4. iOS app: paste those into `ios/HyrdeArena/Sources/Secrets.swift` (see that README).
5. Web app (optional, later): add them as env vars in Vercel
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the
   secret `SUPABASE_SERVICE_ROLE_KEY` for server-side writes). Tell me when
   they're set and I'll wire the lead/waitlist routes to write here.

## Security notes
- The **anon key is public by design** — it's meant to live in client apps and
  is gated by the RLS policies in the migration. Never embed the
  `service_role` key in the iOS app or any browser bundle.
- v1 RLS lets anyone read/post tasks and create mounts, and lets anyone sign
  up as a client/pilot (but those rows can't be *read* with the anon key, so
  PII stays private). Add auth before scaling to lock writes down further.
