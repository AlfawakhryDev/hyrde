# Hyrde SEO Playbook — "Recreate Zapier" (live progress tracker)

**Goal:** Get **≥10 organic client signups** on hyrde.net via SEO **before** building the real product.
**Strategy:** Copy Zapier's structural SEO win — own the high-intent long tail instead of fighting head terms — plus a switcher play aimed at burned Upwork/Fiverr clients.

**Domain:** https://hyrde.net · **Funnels:** `/get-started` (clients), `/join` (freelancers)

---

## 📊 OVERALL PROGRESS: ~68%

```
Phase 0  Foundation (technical SEO)   [██████████] 100%   weight 10%
Phase 1  Switcher / comparison pages  [█████████░]  90%   weight 20%
Phase 2  Programmatic skill×city      [███████░░░]  75%   weight 20%
Phase 3  Content / authority hub      [█████░░░░░]  55%   weight 25%
Phase 4  Linkable assets + links      [█████░░░░░]  50%   weight 15%
Phase 5  Convert + measure to 10      [████░░░░░░]  40%   weight 10%
```

**Remaining work is now mostly OFF-PAGE + TIME-GATED:** link-building outreach
(human task), publishing cadence (~2 guides/week), and waiting for Google to
crawl + rank so conversions can be measured. The on-page build is largely done.

Update the bars + the OVERALL number at the end of every session.

---

## The Zapier lesson (why this works)
Zapier never fought "automation." They built millions of templated pages for "connect [App A] to [App B]" — ultra-specific, low-competition, high-intent. Partners' brand search volume + backlinks did the heavy lifting; an editorial blog built the authority that floated it all. Bootstrapped, out-structured not outspent. Took ~2–4 yrs to compound.

**Hyrde's equivalent long tail:** Skill × City (already built: `/hire/[skill]/[city]`, 325 pages) + "[competitor] alternative" switcher pages + rate data.

---

## PHASE 0 — Foundation (technical SEO)  · 90%
- [x] Fix sitemap base URL `hyrde.ai` → `hyrde.net` (was pointing Google at a dead domain)
- [x] Add `/join`, `/get-started`, `/rates`, `/talent`, comparison pages to sitemap
- [x] Add `app/robots.ts` (allow all + sitemap pointer)
- [x] Add `metadataBase = https://hyrde.net` to root layout (fixes canonical/OG URLs)
- [x] Verify domain in Google Search Console + submit sitemap (Domain property via DNS; submitted https://hyrde.net/sitemap.xml → Success)
- [x] Per-page canonical tags (skill×city + comparison pages) + Breadcrumb/FAQ JSON-LD
- [x] Organization JSON-LD on root layout (name, url, logo, email)

## PHASE 1 — Switcher / comparison pages (highest client intent)  · 80%
Targets the burned-client searches: "upwork alternative", "fiverr alternative", "toptal vs", "upwork scam protection".
- [x] `lib/compare.ts` — competitor data + real client pain points (sourced from Reddit + 2026 fee data)
- [x] `components/ComparisonPage.tsx` — shared, reusable comparison layout
- [x] `/upwork-alternative` page (the priority — most pain, most volume)
- [x] `/fiverr-alternative` page
- [x] `/toptal-alternative` page
- [x] Homepage "tired of Upwork?" section → routes to the alternative pages
- [x] FAQ JSON-LD on each comparison page (rich-result eligibility)
- [x] `/compare` hub page indexing all comparisons (canonical, in sitemap)
- [ ] Add `freelancer.com`, `guru`, `fiverr-pro` competitors later (data-only, fast to add)

## PHASE 2 — Programmatic skill×city (de-thin the 325 pages)  · 75%
Risk: post-2024 Google penalizes thin pSEO. Each page needs UNIQUE value.
- [x] Unique deterministic intro copy (3 varied templates, hashed by skill+city)
- [x] Rate context: $/hr vs global baseline, junior/mid/senior bands
- [x] Per-page FAQ blocks ("cost to hire", "how fast", "in demand?", "pay if I don't hire?") tied to Upwork pain points
- [x] FAQPage + BreadcrumbList JSON-LD on every skill×city page
- [x] Internal-link mesh: "[skill] rates by city" grid + link to /upwork-alternative + /get-started
- [x] Unique per-page canonical + title/description (incl. $rate/hr)
- [ ] Live talent counts / real sample matches (currently mock data) — revisit when real talent exists
- [ ] `noindex` genuinely empty combos (N/A for now — all 300 combos carry rate + FAQ value)

## PHASE 3 — Content / authority hub (blog/guides)  · 55%
- [x] Stand up `/guides` route + index (client + freelancer clusters), `lib/guides.ts` content model
- [x] Article + FAQPage + BreadcrumbList JSON-LD on every guide; canonical + OG per page
- [x] Wired into sitemap + Footer nav (internal link equity)
- [x] Client cluster (3): how-to-avoid-freelancer-scams (ties to switcher), cost-to-hire-freelance-developer, upwork-vs-fiverr-vs-toptal
- [x] Freelancer cluster (2): freelance-rates-2026, how-to-find-clients-without-upwork → feed `/join`
- [x] Every guide internal-links to money pages (/get-started, /join, /rates, /upwork-alternative)
- [ ] Keep cadence: ~2 cornerstone pieces/week; expand skill-specific "how to hire a [skill]" pieces
- [ ] Add author/E-E-A-T signals (named author, bio) once there's a byline to use

## PHASE 4 — Linkable assets + link building  · 50%
- [x] Turn `/rates` into a citable **"Hyrde Freelance Rate Index 2026"** — named report, edition/date, key-findings stat band, methodology, copy-paste citation block, `Dataset` JSON-LD, canonical/OG; CTAs fixed to /get-started + /join; cross-links to guides
- [ ] Digital PR pitch of the Rate Index  ← **NEEDS USER** (outreach = human task)
- [ ] 8–15 quality links (guest posts / niche edits / HARO-style)  ← **NEEDS USER**
- [ ] Get listed in "Upwork alternatives" roundup articles  ← **NEEDS USER**

## PHASE 5 — Convert + measure to 10 client signups  · 40%
- [x] Vercel Analytics live (@vercel/analytics in layout)
- [x] Custom conversion events: `client_signup` (/get-started) + `freelancer_signup` (/join) fire on success
- [ ] Watch GSC + Analytics: organic visits → get-started views → submissions (target 1–3% conv)  ← time-gated (needs crawl + traffic)
- [ ] A/B the comparison-page CTA copy once there's traffic to test
- [ ] Hit 10 client signups 🎯

---

## Funnel math
50 signups ≈ 2,500 visits @ 2% (or 5,000 @ 1%). **10 signups ≈ 500–1,000 targeted organic visits.**
Realistic timeline from fresh domain: meaningful long-tail rankings 3–6 mo; 10 signups ~month 3–5.

## Budget (lean): ~$3k–$8k total — mostly content + ~10 links + tools. Not ad spend.

## Source pain points (Upwork clients, recent)
1. Hourly contractor "disappeared" mid-project, lost $10k+, **no recourse after 90 days**, no quality guarantee/replacement (Toptal has one). — r/Upwork client, $40k spent across 10 projects
2. **Misleading "Top Rated" / "100% Job Success"** — negative reviews get removed; bad contractors keep badges
3. **Inflated ratings** via fake $5/$10 jobs
4. **Security/theft** — designers misusing client credentials for stock downloads (happened twice)
5. **Duplicate profiles** + message bombing
6. **Fake/AI/stolen portfolios**
7. Talent pool skews **amateur/beginner**; skilled pros avoid the mix
8. 2026 fees: variable 0–15% removed predictability; **real "agency tax" 22–34%**; Connects burn (~6% reply rate); client-side contract-initiation fees $0.99–$14.99
