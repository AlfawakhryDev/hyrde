# Hyrde

**Don't hire a freelancer. Hire an outcome.** — [hyrde.net](https://hyrde.net)

Hyrde is an AI-native freelance marketplace. You describe an outcome or a task, and the AI scopes it into a milestone plan, prices each step, and matches each milestone to a single **interview-vetted** specialist. No bidding, no proposal spam. An AI reviews the deliverable against your brief before you pay. Freelancers keep 100%.

This is the real product, open-sourced. It runs live at [hyrde.net](https://hyrde.net).

## How it works

- **Clients** describe a task or a whole outcome ("I need an MVP", "redesign my Shopify store"). The AI asks a few sharp scoping questions, breaks it into milestones, and auto-matches a vetted specialist to each. Cancel unmatched work anytime.
- **Freelancers** pass one adaptive AI skill interview (graded 0–100 against a strict rubric). Matching work then comes to them automatically, with a deadline and pay. They keep 100% and get paid on their own rails (InstaPay, Airtm, PayPal, USDT).
- **Free tool:** a public [cost estimator](https://hyrde.net/cost-estimator) that breaks any project into priced milestones, no signup.

## Tech stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · TypeScript · Tailwind
- **Supabase** — Postgres + Auth + Row Level Security + Realtime + Storage
- **Anthropic Claude** — matching, project scoping/interrogation, deliverable review, vetting interviews
- **Vercel** — hosting
- Optional: ElevenLabs / OpenAI (voice interview TTS). Email goes through SendGrid (`SENDGRID_API_KEY`).

## Quick start

```bash
git clone https://github.com/AlfawakhryDev/hyrde
cd hyrde
npm install
cp .env.example .env.local   # fill in the required values (see below)
npm run dev                  # http://localhost:3000
```

You'll need a Supabase project. Apply the SQL in `supabase/migrations/` in order (via the Supabase SQL editor or CLI) to create the schema, RLS policies, and functions.

### Required environment variables

| Variable | What |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public by design; access is enforced by RLS) |
| `ANTHROPIC_API_KEY` | Claude API key (used by all AI routes) |

Optional keys (voice interview, email, SEO verification, rate limits) are listed in [`.env.example`](.env.example). AI features degrade gracefully when their keys are absent.

## Security

Access control lives in the database: **RLS on every table**, sensitive columns gated behind column grants and `SECURITY DEFINER` accessor functions. If you find a vulnerability, please email **abdelrahman@hyrde.net** rather than opening a public issue (see [SECURITY.md](SECURITY.md)).

## Contributing

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the branch/PR flow. Good first issues are labeled in the tracker.

## License

[AGPL-3.0](LICENSE). You can use, study, and modify Hyrde freely; if you run a modified version as a network service, you must share your changes. This keeps the platform open while preventing closed-source clones.
