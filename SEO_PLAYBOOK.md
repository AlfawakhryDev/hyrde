# Hyrde SEO Playbook — "Recreate Zapier" (live progress tracker)

**Goal:** Get **≥10 organic client signups** on hyrde.net via SEO **before** building the real product.
**Strategy:** Copy Zapier's structural SEO win — own the high-intent long tail instead of fighting head terms — plus a switcher play aimed at burned Upwork/Fiverr clients.

**Domain:** https://hyrde.net · **Funnels:** `/get-started` (clients), `/join` (freelancers)

---

## 📊 OVERALL PROGRESS: ~20%

```
Phase 0  Foundation (technical SEO)   [███████░░░]  70%   weight 10%
Phase 1  Switcher / comparison pages  [███████░░░]  70%   weight 20%
Phase 2  Programmatic skill×city      [░░░░░░░░░░]   0%   weight 20%
Phase 3  Content / authority hub      [░░░░░░░░░░]   0%   weight 25%
Phase 4  Linkable assets + links      [░░░░░░░░░░]   0%   weight 15%
Phase 5  Convert + measure to 10      [░░░░░░░░░░]   0%   weight 10%
```

Update the bars + the OVERALL number at the end of every session.

---

## The Zapier lesson (why this works)
Zapier never fought "automation." They built millions of templated pages for "connect [App A] to [App B]" — ultra-specific, low-competition, high-intent. Partners' brand search volume + backlinks did the heavy lifting; an editorial blog built the authority that floated it all. Bootstrapped, out-structured not outspent. Took ~2–4 yrs to compound.

**Hyrde's equivalent long tail:** Skill × City (already built: `/hire/[skill]/[city]`, 325 pages) + "[competitor] alternative" switcher pages + rate data.

---

## PHASE 0 — Foundation (technical SEO)  · 70%
- [x] Fix sitemap base URL `hyrde.ai` → `hyrde.net` (was pointing Google at a dead domain)
- [x] Add `/join`, `/get-started`, `/rates`, `/talent`, comparison pages to sitemap
- [x] Add `app/robots.ts` (allow all + sitemap pointer)
- [x] Add `metadataBase = https://hyrde.net` to root layout (fixes canonical/OG URLs)
- [ ] Verify domain in Google Search Console + submit sitemap  ← **NEEDS USER** (DNS TXT or HTML file)
- [ ] Per-page canonical tags + JSON-LD structured data (Organization, FAQ, Breadcrumb)

## PHASE 1 — Switcher / comparison pages (highest client intent)  · 70%
Targets the burned-client searches: "upwork alternative", "fiverr alternative", "toptal vs", "upwork scam protection".
- [x] `lib/compare.ts` — competitor data + real client pain points (sourced from Reddit + 2026 fee data)
- [x] `components/ComparisonPage.tsx` — shared, reusable comparison layout
- [x] `/upwork-alternative` page (the priority — most pain, most volume)
- [x] `/fiverr-alternative` page
- [x] `/toptal-alternative` page
- [x] Homepage "tired of Upwork?" section → routes to the alternative pages
- [ ] `/compare` hub page indexing all comparisons
- [ ] FAQ JSON-LD on each comparison page (rich-result eligibility)
- [ ] Add `freelancer.com`, `guru`, `fiverr-pro` competitors later

## PHASE 2 — Programmatic skill×city (de-thin the 325 pages)  · 0%
Risk: post-2024 Google penalizes thin pSEO. Each page needs UNIQUE value.
- [ ] Inject per-page: live talent count, local rate band (from `/rates` data), 2–3 sample matches, city-specific copy
- [ ] Add "[skill] hourly rate in [city]" + FAQ blocks
- [ ] Internal-link mesh between skill, city, and comparison pages
- [ ] `noindex` any genuinely empty combos

## PHASE 3 — Content / authority hub (blog/guides)  · 0%
- [ ] Stand up `/blog` (or `/guides`) route + index
- [ ] Client cluster: "how to hire a [skill]", "freelance [skill] cost", "contract vs full-time", "how to avoid freelancer scams" (ties to switcher angle)
- [ ] Freelancer cluster: "freelance [skill] rates 2026", "how to become a freelance [skill]", "remote [skill] jobs" → feeds `/join`
- [ ] 2 cornerstone pieces/week; internal-link to money pages

## PHASE 4 — Linkable assets + link building  · 0%
- [ ] Turn `/rates` into a citable **"Hyrde Freelance Rate Index"** report (original data = link magnet)
- [ ] Digital PR pitch of the Rate Index
- [ ] 8–15 quality links (guest posts / niche edits / HARO-style)
- [ ] Get listed in "Upwork alternatives" roundup articles

## PHASE 5 — Convert + measure to 10 client signups  · 0%
- [ ] Confirm Vercel Analytics + GSC tracking organic → `/get-started`
- [ ] A/B the comparison-page CTA copy
- [ ] Track: organic visits → get-started views → submissions (target 1–3% conv)
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
