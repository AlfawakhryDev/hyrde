# Hyrde — AI-Native Freelance Platform

**Demo build · June 2026**

Hyrde is a two-sided marketplace where clients describe a project in plain language and receive 5 AI-scored freelancer matches in under 60 seconds. Freelancers get a built-in suite of AI agents (proposal writer, rate advisor, contract reviewer) and pay nothing to apply. Platform fee is 8%, charged only on hire.

---

## Table of Contents

1. [Vision & Positioning](#1-vision--positioning)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture Overview](#4-architecture-overview)
5. [Data Layer](#5-data-layer)
6. [API Routes](#6-api-routes)
7. [Page Inventory](#7-page-inventory)
8. [Design System](#8-design-system)
9. [AI Integration](#9-ai-integration)
10. [Revenue Model](#10-revenue-model)
11. [Local Setup](#11-local-setup)
12. [Environment Variables](#12-environment-variables)
13. [What Needs to Be Built for Production](#13-what-needs-to-be-built-for-production)

---

## 1. Vision & Positioning

**The pitch:** AI-native freelancing, built from first principles. Clients get 5 AI-matched candidates in 60 seconds. Freelancers get AI agents that match them to jobs, write proposals, price work, and review contracts. Zero cost to apply. 8% fee only when earned.

**Go-to-market:** Product-led, SEO-driven. Every `skill × city` combination is its own landing page, discoverable through organic search. No ad budget, no sales team — compounding growth through content.

**Market:** The freelance economy is heading toward $455B. The model is built to grow with it — no upfront fees means no barrier to entry for either side.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS `@theme {}` variables) |
| Font | DM Sans via Google Fonts |
| Icons | Material Symbols Outlined (loaded via `<link>` in `<head>`) |
| AI | Anthropic SDK `@anthropic-ai/sdk` v0.99.0 |
| AI Model | `claude-sonnet-4-5` |
| Data persistence | File-based JSON store (`/data/*.json`) — intentionally simple for demo |
| Deployment target | Vercel (see production notes) |
| React | v19.2.4 |

> **Important:** This is Next.js 16.x App Router. `searchParams` in server components is a `Promise<{...}>` that must be `await`ed. `useSearchParams()` requires a `Suspense` boundary. These are breaking changes from Next.js 13/14.

---

## 3. Project Structure

```
matchai/
├── app/
│   ├── layout.tsx                  # Root layout — Navbar, Footer, fonts, metadata
│   ├── page.tsx                    # Homepage
│   ├── globals.css                 # Tailwind v4 theme tokens (all brand colors/fonts here)
│   ├── icon.png                    # Favicon (auto-detected by Next.js)
│   ├── apple-icon.png              # Apple touch icon
│   ├── sitemap.ts                  # Auto-generated XML sitemap
│   │
│   ├── post-job/
│   │   └── page.tsx                # Client flow: write brief → AI matching → results
│   │
│   ├── jobs/
│   │   ├── page.tsx                # Job board (server component wrapper)
│   │   └── JobBoard.tsx            # Client component — inline pitch writer per job
│   │
│   ├── talent/
│   │   └── page.tsx                # Talent directory with server-side category filtering
│   │
│   ├── freelancer/
│   │   └── join/
│   │       └── page.tsx            # 4-step freelancer onboarding form
│   │
│   ├── hire/
│   │   ├── page.tsx                # Skill index (all skills)
│   │   ├── [skill]/
│   │   │   └── page.tsx            # Skill landing page (SEO) e.g. /hire/react-developer
│   │   └── [skill]/[city]/
│   │       └── page.tsx            # Skill × city landing page e.g. /hire/react-developer/london
│   │
│   ├── rates/
│   │   └── page.tsx                # Rate index — market rate data by skill
│   │
│   └── api/
│       ├── match/
│       │   └── route.ts            # POST — AI freelancer matching
│       ├── pitch/
│       │   └── route.ts            # POST — streaming AI proposal writer
│       ├── freelancers/
│       │   └── route.ts            # GET/POST — freelancer registration
│       └── jobs/
│           └── route.ts            # GET — list open jobs
│
├── components/
│   ├── Navbar.tsx                  # Fixed top nav — logo, links, CTAs
│   ├── Footer.tsx                  # Dark footer — logo, nav links, copyright
│   └── FreelancerCard.tsx          # Reusable freelancer card component
│
├── lib/
│   ├── types.ts                    # Shared TypeScript interfaces
│   ├── store.ts                    # File-based JSON read/write utility
│   └── data.ts                     # Static data: MOCK_FREELANCERS, SKILLS, CITIES
│
├── data/
│   ├── jobs.json                   # Persisted job postings (runtime-written)
│   └── freelancers.json            # Registered freelancers (runtime-written)
│
├── public/
│   ├── hyrde-lockup-light.svg      # Logo for light backgrounds (Navbar)
│   ├── hyrde-lockup-dark.svg       # Logo for dark backgrounds (Footer)
│   ├── hyrde-icon.svg              # Square icon mark
│   └── hyrde-mark.svg              # Wordmark only
│
├── .env.local                      # ANTHROPIC_API_KEY (not committed)
├── package.json
└── tsconfig.json
```

---

## 4. Architecture Overview

```
Browser
  │
  ├── Server Components (default in App Router)
  │     ├── Read from /data/*.json via lib/store.ts
  │     ├── Render talent directory, job board, SEO pages
  │     └── Pass data to client components as props
  │
  ├── Client Components ('use client')
  │     ├── post-job/page.tsx — form state, AI streaming display
  │     ├── jobs/JobBoard.tsx — inline pitch writer with streaming
  │     └── freelancer/join/page.tsx — multi-step form
  │
  └── API Routes (Next.js Route Handlers)
        ├── POST /api/match — calls Anthropic, returns JSON matches
        ├── POST /api/pitch — calls Anthropic streaming, returns text/plain stream
        ├── GET  /api/jobs — reads jobs.json
        ├── POST /api/jobs — writes to jobs.json
        ├── GET  /api/freelancers — reads freelancers.json
        └── POST /api/freelancers — writes to freelancers.json
```

### Key architectural decisions

- **`export const dynamic = "force-dynamic"`** is set on every page that reads from the file store. Without this, Next.js caches the page at build time and the data never updates.
- **`searchParams` is a Promise** in Next.js 16 server components. Always `await searchParams` before destructuring.
- **Streaming responses** from the pitch API use `ReadableStream` → `getReader()` on the client, chunking text as it arrives from Anthropic.
- **No database** — the file store is intentional for demo simplicity. `lib/store.ts` is the single abstraction; swap `readStore`/`writeStore` implementations for a real DB without touching any page code.

---

## 5. Data Layer

### Static data (`lib/data.ts`)

- `MOCK_FREELANCERS` — 10 hand-crafted verified freelancer profiles with scores, bios, rates, skills, locations
- `SKILLS` — 26 skill slugs with labels, categories, average rates, demand levels
- `CITIES` — city slugs with labels for SEO pages

### Runtime data (`/data/*.json`)

| File | Written by | Read by |
|---|---|---|
| `data/jobs.json` | `POST /api/match` (on every brief submit) | `GET /api/jobs`, `/jobs` page |
| `data/freelancers.json` | `POST /api/freelancers` (on join form submit) | `/talent` page, `POST /api/match` |

### TypeScript interfaces (`lib/types.ts`)

```typescript
interface Job {
  id: string;         // "job_<timestamp>"
  brief: string;
  budget: string;     // e.g. "$3k–$8k" or "unspecified"
  postedAt: string;   // ISO 8601
  status: "open" | "closed";
  matchCount: number;
}

interface AIMatch {
  id: string;
  name: string;
  skill: string;      // slug e.g. "react-developer"
  rate: number;       // per hour
  score: number;      // 0–100
  bio: string;
  location: string;
  rationale: string;  // AI-generated explanation
  highlights: string[]; // AI-generated bullet strengths
}

interface RegisteredFreelancer {
  id: string;         // "fl_<timestamp>"
  name: string;
  email: string;
  location: string;
  skill: string;      // slug
  rate: string;
  bio: string;
  portfolio: string;
  joinedAt: string;   // ISO 8601
}
```

---

## 6. API Routes

### `POST /api/match`

Accepts a client brief and budget, runs AI scoring against the full freelancer pool (mock + registered), returns ranked matches. Also persists the job to `data/jobs.json`.

**Request:**
```json
{ "brief": "string (required)", "budget": "string (optional)" }
```

**Response:**
```json
{
  "jobId": "job_1234567890",
  "matches": [
    {
      "id": "fl_001",
      "name": "Sara R.",
      "skill": "react-developer",
      "rate": 90,
      "score": 96,
      "bio": "...",
      "location": "Remote",
      "rationale": "Sara's 6 years of React experience and ex-Stripe background...",
      "highlights": ["Ex-Stripe", "3 SaaS products shipped", "TypeScript expert"]
    }
  ]
}
```

**Fallback:** If the Anthropic call fails, returns top 5 freelancers sorted by their static score with a generic rationale message. The job is still saved.

---

### `POST /api/pitch`

Generates a tailored freelance proposal via streaming. Returns `text/plain` stream.

**Request:**
```json
{
  "brief": "string",
  "name": "string",
  "skill": "string (slug)",
  "bio": "string"
}
```

**Response:** Streaming `text/plain` — chunks arrive token-by-token from Claude.

**Fallback:** If Anthropic fails, a template proposal is generated locally and streamed word-by-word (18ms delay) to maintain the streaming UX.

---

### `GET /api/jobs`

Returns all jobs from `data/jobs.json`, newest first.

---

### `GET /api/freelancers` · `POST /api/freelancers`

GET returns all registered freelancers. POST validates and appends a new freelancer.

---

## 7. Page Inventory

| Route | Type | Description |
|---|---|---|
| `/` | Server | Homepage — hero, stats, client/freelancer value props, pricing, skill grid |
| `/post-job` | Client | Brief input → AI loading animation → match results with AI rationales |
| `/jobs` | Server + Client | Open project board with inline AI pitch writer per job |
| `/talent` | Server | Talent directory — server-side category filter via `?cat=` URL param |
| `/freelancer/join` | Client | 4-step onboarding: basics → skill → rate → confirmation |
| `/hire` | Server | Full skill index with demand/rate data |
| `/hire/[skill]` | Server | Skill landing page (SEO) — freelancers, FAQ, CTA |
| `/hire/[skill]/[city]` | Server | Skill × city landing page (SEO) |
| `/rates` | Server | Market rate index by skill |
| `/vs/upwork` | Server | SEO comparison page (not linked from nav) |

### User flow — Client hiring

1. Homepage search bar → `GET /post-job?brief=<text>`
2. `/post-job` auto-triggers AI match on load when `?brief=` param is present (`useEffect` + `useRef` to prevent double-fire)
3. 5-step loading animation while `POST /api/match` runs (~3–6 seconds)
4. Results show with AI rationale + 3 highlight chips per freelancer
5. Job is automatically saved to the job board

### User flow — Freelancer pitching

1. `/jobs` → click "Write a pitch" on any open project
2. Inline form expands: name, skill dropdown, one-liner bio
3. `POST /api/pitch` → proposal streams in real time
4. Copy and submit externally

### User flow — Freelancer registration

1. `/freelancer/join` → 4-step form (name/email/location → skill → rate/bio → done)
2. `POST /api/freelancers` → saved to `data/freelancers.json`
3. Profile immediately appears in `/talent` and enters the AI matching pool for future jobs

---

## 8. Design System

All tokens are defined in `app/globals.css` using Tailwind v4's `@theme {}` block.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `electric-violet` | `#5B4FCF` | Primary brand, CTAs, active states, highlights |
| `ai-glow` | `#A99EE8` | Light violet — used on dark backgrounds |
| `tech-blue-deep` | `#0A0A0F` | Primary text, dark section backgrounds |
| `tech-blue-muted` | `#1a1a2e` | Secondary dark |
| `surface-gray` | `#F5F4F0` | Page background (warm off-white) |
| `border-crisp` | `#E4E2DC` | Card borders, dividers |
| `on-surface` | `#1C1C1E` | Primary text on light |
| `on-surface-variant` | `#6B6B72` | Secondary/muted text |
| `surface-container-high` | `#ECEAE4` | Pill/badge backgrounds |
| `on-primary-container` | `#C8C3F0` | Text on dark purple backgrounds |

### Typography

- **Font:** DM Sans (Google Fonts, loaded via `<link>` in `app/layout.tsx`)
- `font-headline` — DM Sans, headings
- `font-body` — DM Sans, UI and body text

### Key utilities

```css
/* Avatar gradient — used on freelancer initials circles */
.ai-match-gradient {
  background: linear-gradient(135deg, #5B4FCF 0%, #0A0A0F 100%);
}

/* Ambient blob glow — hero section background decoration */
.glow-accent {
  filter: blur(120px);
  opacity: 0.06;
}
```

### Icons

Material Symbols Outlined. Load order matters:
```html
<!-- in app/layout.tsx <head> — must be <link>, not CSS @import -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

Usage:
```tsx
<span
  className="material-symbols-outlined"
  style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
>
  verified
</span>
```

`fontVariationSettings: "'FILL' 1"` switches to the filled (solid) icon variant.

---

## 9. AI Integration

### Model

`claude-sonnet-4-5` via `@anthropic-ai/sdk` v0.99.0. Initialized once per route file:
```typescript
const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env automatically
```

### Matching system prompt

The prompt passes the full client brief, budget, and the serialized freelancer pool. It instructs Claude to score on four criteria and return strict JSON with no markdown fences. The response is parsed, validated, and enriched with full freelancer data before being returned to the client.

Scoring weights:
- Skill relevance: 40%
- Bio/experience fit: 35%
- Rate fit: 15%
- Other signals (specialization, location, seniority): 10%

### Streaming proposal writer

```typescript
const anthropicStream = anthropic.messages.stream({ model, max_tokens: 400, messages });
for await (const event of anthropicStream) {
  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
    controller.enqueue(encoder.encode(event.delta.text));
  }
}
```

Client reads via:
```typescript
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  setProposal(prev => prev + decoder.decode(value));
}
```

### Fallback chain

Both API routes have graceful fallbacks that maintain UX even when the API is unavailable:
- `/api/match` → sorted-by-score mock results with neutral rationale text
- `/api/pitch` → locally generated template, streamed word-by-word at 18ms/word

---

## 10. Revenue Model

Three tiers, in order of implementation priority:

| Tier | Model | Timeline |
|---|---|---|
| 1 | **8% transaction fee** — on completed hires only | Now (no payment integration yet) |
| 2 | **Client subscription** — €99–199/mo for teams posting regularly | Month 1–3 |
| 3 | **AI agent pay-per-use** — €5 contract review, €3 proposal | Month 1–3 |
| Later | **Freelancer Pro** — analytics, priority matching | Month 3–6 |
| Later | **Enterprise API** — talent pool access for companies | Month 6+ |

**Never:** Pay-to-apply, paid connects, or any fee that gates access to jobs.

---

## 11. Local Setup

```bash
# 1. Install dependencies
cd matchai
npm install

# 2. Add your Anthropic API key
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env.local

# 3. Start dev server
npm run dev
# → http://localhost:3000
```

**Node.js 20+** recommended. No database, no Docker, no other services required.

The `/data` directory is auto-created on first API call if it doesn't exist.

To clear all test data:
```bash
echo '[]' > data/jobs.json
echo '[]' > data/freelancers.json
```

---

## 12. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | From console.anthropic.com — needs access to `claude-sonnet-4-5` |

No other env vars needed for local development.

---

## 13. What Needs to Be Built for Production

This is a polished demo. Below is a prioritized production roadmap.

### Critical before launch

| Item | Detail |
|---|---|
| **Database** | Replace `lib/store.ts` with Postgres (Supabase or Railway). The `readStore`/`writeStore` interface is already abstracted — only the implementation in `lib/store.ts` needs to change. No page code changes required. |
| **Authentication** | Clerk or NextAuth. Freelancers need persistent accounts. Clients need session-based job tracking and match history. |
| **Payments** | Stripe Connect for two-sided marketplace payments. 8% platform fee logic goes in a Stripe webhook handler on job completion. |
| **Email** | Resend or Postmark. Key triggers: registration confirmation, new match notification, hire confirmed, payment received. |
| **File uploads** | Portfolio/CV uploads for freelancer profiles. Vercel Blob or AWS S3. |
| **Freelancer vetting** | Currently mock freelancers are statically marked "verified". Build an actual AI-administered skills assessment or manual review queue. |

### Important before scale

| Item | Detail |
|---|---|
| **Rate limiting** | `/api/match` and `/api/pitch` make live Anthropic API calls. Add IP-based rate limiting via Upstash Redis + `@upstash/ratelimit`. |
| **Error monitoring** | Sentry. Wrap API routes and client boundaries. |
| **Analytics** | PostHog or Mixpanel. Key events: `brief_submitted`, `match_viewed`, `pitch_generated`, `freelancer_registered`, `hire_completed`. |
| **AI response caching** | Hash the brief + freelancer pool snapshot → cache match results in Redis to reduce API costs on repeat queries. |
| **Dynamic metadata** | Add `generateMetadata()` to `/hire/[skill]` and `/hire/[skill]/[city]` pages for unique meta titles/descriptions on each SEO page. |
| **Mobile** | Current build is desktop-first. The post-job flow and match results need a mobile pass. |

### Vercel deployment notes

The file-based store **does not work on Vercel** — serverless functions have a read-only filesystem. Before deploying to production:

1. Replace `lib/store.ts` implementations with Supabase client calls
2. Verify no `import fs` exists outside `lib/store.ts` (`grep -r "from 'fs'" app/`)
3. Set `ANTHROPIC_API_KEY` in Vercel → Project → Settings → Environment Variables
4. The `/data` directory and `.json` files should be in `.gitignore` for production

---

## Quick Reference

| Task | File |
|---|---|
| Add / edit a skill | `lib/data.ts` → `SKILLS` object |
| Add a mock freelancer | `lib/data.ts` → `MOCK_FREELANCERS` array |
| Add a city for SEO pages | `lib/data.ts` → `CITIES` object |
| Change brand colors | `app/globals.css` → `@theme {}` block |
| Change AI model | `app/api/match/route.ts` and `app/api/pitch/route.ts` |
| Edit matching prompt | `app/api/match/route.ts` → `content` string in `messages.create()` |
| Edit pitch prompt | `app/api/pitch/route.ts` → `content` string in `messages.stream()` |
| Edit homepage | `app/page.tsx` |
| Edit nav links | `components/Navbar.tsx` |
| Edit footer links | `components/Footer.tsx` |

---

*Built with Next.js 16, React 19, Tailwind CSS v4, Anthropic Claude Sonnet 4.5.*
