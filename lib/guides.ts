// ─── Editorial / authority hub content ──────────────────────────────
// Cornerstone guides that capture top-of-funnel search intent and
// internal-link down into the money pages (/get-started, /join, /hire,
// /rates, comparison pages). Zapier's editorial blog is what built the
// authority that floated their programmatic long tail — this is ours.

export interface GuideSection {
  h2: string;
  body: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  cluster: "client" | "freelancer";
  clusterLabel: string;
  title: string;        // on-page H1
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  readMins: number;
  updated: string;      // ISO date
  intro: string[];
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  cta: { heading: string; body: string; label: string; href: string };
  related: string[];    // slugs
}

export const GUIDES: Record<string, Guide> = {
  "how-to-avoid-freelancer-scams": {
    slug: "how-to-avoid-freelancer-scams",
    cluster: "client",
    clusterLabel: "Hiring guide",
    title: "How to Avoid Freelancer Scams: A Client's Guide for 2026",
    metaTitle: "How to Avoid Freelancer Scams (2026 Client Guide) | Hyrde",
    metaDescription:
      "Disappearing contractors, fake reviews, padded portfolios. The 7 most common freelancer scams in 2026 and exactly how to protect your budget when hiring.",
    excerpt:
      "Disappearing contractors, fake 5-star badges, AI-generated portfolios. The seven scams burning clients right now — and how to hire safely.",
    readMins: 9,
    updated: "2026-06-01",
    intro: [
      "If you've spent any time hiring on the big freelance marketplaces, you've probably been burned — or come close. One of the most-upvoted client posts on r/Upwork in the last year describes spending $40,000 across ten projects, only to have a contractor vanish mid-build with roughly $10,000 of unfinished work and no recourse, because the platform's dispute window had already closed.",
      "That story is common because the incentives behind a typical marketplace reward volume, not outcomes. This guide breaks down the seven scams clients hit most often in 2026, the warning signs for each, and the practical steps that actually protect your budget.",
    ],
    sections: [
      {
        h2: "1. The disappearing contractor",
        body: [
          "The most expensive scam isn't elaborate — it's just someone who takes a milestone payment and stops responding. On hourly contracts especially, money can be released automatically before you've reviewed real output. By the time you notice, the platform's protection window may have lapsed.",
          "Protect yourself by funding work in small, outcome-based milestones, keeping all communication and files on-platform, and never approving an auto-logged hour you can't tie to a visible deliverable.",
        ],
        bullets: [
          "Warning sign: pressure to move billing or chat off-platform.",
          "Warning sign: vague time logs with no commits, files, or screenshots attached.",
          "Fix: short milestones, escrow released only against reviewed work, a vetting layer that screens out repeat offenders before you ever meet them.",
        ],
      },
      {
        h2: "2. Fake 'Top Rated' and '100% Job Success' badges",
        body: [
          "Badges feel like a safety signal, but they're often gamed. Negative reviews get quietly removed through dispute pressure, and a contractor can keep an elite badge while leaving a trail of unhappy clients. The label measures activity and review-management skill, not the quality of the work.",
          "Treat platform badges as a weak signal at best. Ask for references you can contact directly, and weight a short paid trial task far more heavily than any star rating.",
        ],
      },
      {
        h2: "3. Ratings inflated by $5 jobs",
        body: [
          "A common tactic: take dozens of tiny $5–$10 gigs, deliver something minimal, and collect easy 5-star reviews to build a wall of social proof. The profile looks spotless, but none of those reviews reflect the kind of substantial, multi-week project you're about to hand over.",
          "Read the reviews, not the average. Look for feedback on projects similar in scope and budget to yours. A 4.6 with detailed reviews of real builds beats a 5.0 stacked with micro-gigs.",
        ],
      },
      {
        h2: "4. Credential theft and misuse",
        body: [
          "Clients have reported handing over logins — to stock-image accounts, CMS dashboards, ad platforms — only to find the freelancer using them for their own purposes, like downloading paid assets on the client's dime. It can happen more than once before anyone notices.",
          "Never share a master password. Use per-seat invites with scoped permissions, rotate credentials when an engagement ends, and grant the minimum access needed for the task.",
        ],
      },
      {
        h2: "5. Duplicate profiles and message bombing",
        body: [
          "Post a job and your inbox floods with near-identical proposals, sometimes from multiple accounts run by the same person or agency. The volume is designed to overwhelm your judgment and bury the few genuine applicants.",
          "A platform that AI-matches a short, pre-vetted shortlist to your brief — instead of opening the floodgates to anyone who can spend a Connect — removes this problem entirely.",
        ],
      },
      {
        h2: "6. Fake, AI-generated, or stolen portfolios",
        body: [
          "Portfolios are easy to fake. Work gets lifted from other designers, generated wholesale by AI, or attributed to a team when the person you'll actually work with never touched it. The reel looks incredible; the delivered work doesn't match.",
          "Verify provenance. Ask them to walk you through one project live — decisions, trade-offs, what they'd change. Anyone who genuinely did the work can talk about it; anyone who didn't will stall.",
        ],
      },
      {
        h2: "7. The 'senior' who's actually a beginner",
        body: [
          "Because the big pools skew heavily toward beginners competing on price, genuinely senior talent often avoids the mix — and some beginners simply relabel themselves 'senior' to win better-paying briefs. You pay senior rates for junior output and lose weeks discovering it.",
          "A short paid trial task scoped to real work is the single most reliable filter. It costs a little up front and saves you the far larger cost of a bad multi-week hire.",
        ],
      },
      {
        h2: "How Hyrde is built to remove these risks",
        body: [
          "Hyrde's model is the opposite of an open bidding pool. Every freelancer is pre-vetted before they ever reach you, our AI matches a short shortlist to your brief in about 60 seconds instead of flooding your inbox, and it's free to hire during early access rather than the effective 22–34% take rate that pushes the volume-over-quality dynamic in the first place.",
          "That doesn't make due diligence optional — always run a trial task — but it removes the structural reasons most of these scams exist.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Upwork safe for clients?",
        a: "It can be, but the protections are weaker than many clients assume — dispute windows close fast, auto-logged hourly time is easy to abuse, and badges are gameable. Fund work in small milestones, keep everything on-platform, and never skip a paid trial task.",
      },
      {
        q: "What's the safest way to pay a freelancer?",
        a: "Milestone-based escrow tied to reviewed deliverables, never large upfront lump sums. Release payment only against work you've actually seen and approved.",
      },
      {
        q: "How do I verify a freelancer's portfolio is real?",
        a: "Ask them to walk you through one project live — the decisions, the trade-offs, what they'd do differently. Genuine authors can discuss their work fluently; people using stolen or AI-generated portfolios cannot.",
      },
    ],
    cta: {
      heading: "Hire pre-vetted talent without the scam roulette",
      body: "Every freelancer on Hyrde is screened before you see them. Post a brief and get an AI-matched shortlist in 60 seconds — free to hire during early access.",
      label: "Find vetted talent",
      href: "/get-started",
    },
    related: ["upwork-vs-fiverr-vs-toptal", "cost-to-hire-freelance-developer"],
  },

  "cost-to-hire-freelance-developer": {
    slug: "cost-to-hire-freelance-developer",
    cluster: "client",
    clusterLabel: "Hiring guide",
    title: "How Much Does It Cost to Hire a Freelance Developer in 2026?",
    metaTitle: "Cost to Hire a Freelance Developer in 2026 | Hyrde",
    metaDescription:
      "Real 2026 hourly rates for freelance React, Python, mobile and fullstack developers — plus the hidden platform fees that quietly add 20–34% to your bill.",
    excerpt:
      "Real 2026 hourly rates by stack and seniority — plus the platform fees that quietly inflate your bill by 20–34%.",
    readMins: 8,
    updated: "2026-06-05",
    intro: [
      "Hiring a freelance developer in 2026 costs more than the hourly rate on the profile — and the gap is where most budgets get blown. Between platform fees, time-zone overlap, and the cost of a bad hire, the sticker price tells you maybe two-thirds of the story.",
      "Here's a realistic breakdown of what you'll actually pay, by stack and seniority, and how to keep the hidden costs from doubling your bill.",
    ],
    sections: [
      {
        h2: "Baseline hourly rates by stack",
        body: [
          "Rates vary by specialization and the complexity of the work. As a 2026 baseline for solid mid-level freelancers working with Western clients:",
        ],
        bullets: [
          "React / frontend developer: ~$85/hr",
          "Fullstack developer: ~$95/hr",
          "Python developer: ~$80/hr",
          "Node.js developer: ~$75/hr",
          "Mobile (iOS/Android) developer: ~$90/hr",
          "DevOps engineer: ~$100/hr",
          "ML engineer: ~$110/hr",
        ],
      },
      {
        h2: "How seniority changes the number",
        body: [
          "A useful rule of thumb: junior talent runs roughly 60% of the mid-level rate, and senior specialists command around 150%. So a mid-level React developer at $85/hr implies roughly $50/hr junior and $128/hr senior.",
          "Paying senior rates only pays off when the work genuinely needs senior judgment — architecture, ambiguous problems, performance-critical systems. For well-scoped, well-specified tasks, a strong mid-level developer is usually the better value.",
        ],
      },
      {
        h2: "Location still moves the price",
        body: [
          "Even for remote work, market rates track local cost of living. A React developer averages noticeably more in San Francisco or London than in Berlin, Barcelona, or Cairo. Hiring across time zones can cut your rate substantially — the trade-off is overlap hours for real-time collaboration.",
          "Our city-by-city breakdowns show the local market rate for each skill so you can budget realistically before you post.",
        ],
      },
      {
        h2: "The fee that doubles your real cost",
        body: [
          "This is the line item clients miss. The hourly rate is what the freelancer sees — but the platform's take rate is what inflates your bill. On the major marketplaces in 2026, clients report an effective 22–34% in combined service fees, contract-initiation charges, and payment markups.",
          "On a $95/hr fullstack developer working 160 hours a month, a 25% effective take adds roughly $3,800/month in pure platform overhead. Hyrde charges no platform fee during early access — that entire ~$3,800/month of overhead disappears for identical work.",
        ],
      },
      {
        h2: "The most expensive cost of all: a bad hire",
        body: [
          "Nothing on a rate card compares to the cost of hiring the wrong person. Weeks of salary, rework, missed deadlines, and the management overhead of untangling it routinely dwarf the difference between a $75 and a $95 hourly rate.",
          "This is why vetting and a short paid trial task matter more than shaving a few dollars off the rate. The cheapest developer who has to be replaced is the most expensive one you'll hire all year.",
        ],
      },
    ],
    faqs: [
      {
        q: "What's the average hourly rate for a freelance developer in 2026?",
        a: "Mid-level freelance developers typically run $75–$110/hr depending on stack, with frontend at the lower end and ML/DevOps at the higher end. Senior specialists command roughly 1.5x that, juniors about 0.6x.",
      },
      {
        q: "Why is my freelancer bill higher than their hourly rate?",
        a: "Platform fees. On major marketplaces in 2026, clients report an effective 22–34% in combined service fees, contract-initiation charges, and payment markups on top of the freelancer's rate. Hyrde is free to hire during early access (paid plans planned for later).",
      },
      {
        q: "Is it cheaper to hire a freelancer or a full-time developer?",
        a: "For defined, time-boxed work, freelancers are almost always cheaper — no benefits, payroll tax, or idle-time cost. For continuous, long-horizon work, a full-time hire can be more economical once you're past roughly 30+ hours/week sustained.",
      },
    ],
    cta: {
      heading: "See real local rates before you budget",
      body: "Browse live market rates by skill and city, then post a brief and get matched in 60 seconds — free to hire during early access instead of 22–34%.",
      label: "Browse rates & hire",
      href: "/rates",
    },
    related: ["how-to-avoid-freelancer-scams", "upwork-vs-fiverr-vs-toptal"],
  },

  "upwork-vs-fiverr-vs-toptal": {
    slug: "upwork-vs-fiverr-vs-toptal",
    cluster: "client",
    clusterLabel: "Hiring guide",
    title: "Upwork vs Fiverr vs Toptal vs Hyrde: Which Should You Use to Hire?",
    metaTitle: "Upwork vs Fiverr vs Toptal vs Hyrde (2026 Comparison) | Hyrde",
    metaDescription:
      "An honest 2026 comparison of Upwork, Fiverr, Toptal and Hyrde for clients — fees, vetting, speed, and who each platform actually suits best.",
    excerpt:
      "An honest breakdown of the four platforms for clients — fees, vetting, speed, and who each one actually suits.",
    readMins: 7,
    updated: "2026-06-10",
    intro: [
      "Most clients searching for a place to hire end up comparing the same four options. They work very differently, and picking the wrong one for your project is how you end up over budget or under-delivered.",
      "Here's an honest breakdown of where each one fits in 2026 — including where Hyrde does and doesn't make sense.",
    ],
    sections: [
      {
        h2: "Upwork — the giant open marketplace",
        body: [
          "Upwork has the deepest talent pool, which is both its strength and its weakness. You can find anyone, but you have to filter through everyone. Post a job and you'll field a flood of proposals, including duplicate profiles and gamed badges. The effective take rate clients report sits around 22–34% once fees and contract charges are counted.",
          "Best for: clients who want maximum selection and are willing to do heavy vetting themselves.",
        ],
      },
      {
        h2: "Fiverr — productized gigs",
        body: [
          "Fiverr is built around fixed-scope 'gigs' rather than ongoing hires. It's fast for small, well-defined tasks — a logo, a landing page, a video edit. It's a poor fit for anything that needs iteration, judgment, or a real working relationship, and the headline price rarely includes the realistic revisions you'll need.",
          "Best for: one-off, tightly-scoped deliverables where you know exactly what you want.",
        ],
      },
      {
        h2: "Toptal — premium, heavily vetted",
        body: [
          "Toptal sits at the opposite end: a small, rigorously screened pool with a satisfaction guarantee. Quality is high and so is the price — premium hourly rates plus a deposit to start. For mission-critical, senior work where a bad hire is unacceptable, it's a strong choice.",
          "Best for: well-funded teams who want vetted senior talent and will pay a premium for the assurance.",
        ],
      },
      {
        h2: "Hyrde — vetted talent without the premium tax",
        body: [
          "Hyrde aims for the middle that's missing: pre-vetted talent like Toptal, AI-matched to your brief in about 60 seconds, free to hire during early access instead of a 22–34% effective take. No Connects to buy, no bidding wars, no inbox flood — a short shortlist of screened candidates instead of an open auction.",
          "Best for: clients who want vetting and speed without paying premium-tier prices or doing the filtering themselves.",
        ],
      },
      {
        h2: "Quick decision guide",
        body: [
          "If you want the largest possible pool and don't mind vetting: Upwork. If you need a single fixed-scope deliverable cheaply: Fiverr. If budget is no object and you want maximum assurance on senior work: Toptal. If you want vetted, AI-matched talent fast at a fraction of the fees: Hyrde.",
        ],
      },
    ],
    faqs: [
      {
        q: "What's the cheapest way to hire a freelancer?",
        a: "On rates alone, an open marketplace can look cheapest, but platform fees of 22–34% often erase the difference. A platform like Hyrde — free to hire during early access — is dramatically cheaper all-in for ongoing work, before you even factor in the cost of a bad hire.",
      },
      {
        q: "Is Toptal worth the premium over Upwork?",
        a: "For mission-critical senior work where a bad hire is unacceptable, the vetting and guarantee can justify the premium. For most projects, vetted mid-level talent at a lower fee delivers comparable results for far less.",
      },
      {
        q: "Which platform is best for ongoing work vs one-off tasks?",
        a: "Fiverr suits one-off fixed-scope gigs. Upwork, Toptal, and Hyrde all suit ongoing engagements — the difference is vetting depth, matching speed, and fee structure.",
      },
    ],
    cta: {
      heading: "Skip the comparison paralysis",
      body: "Hyrde gives you Toptal-style vetting at Upwork-beating fees, with matches in 60 seconds. Post a brief and see for yourself.",
      label: "Start hiring on Hyrde",
      href: "/get-started",
    },
    related: ["how-to-avoid-freelancer-scams", "cost-to-hire-freelance-developer"],
  },

  "freelance-rates-2026": {
    slug: "freelance-rates-2026",
    cluster: "freelancer",
    clusterLabel: "Freelancer guide",
    title: "Freelance Rates in 2026: What to Charge (and How to Raise Them)",
    metaTitle: "Freelance Rates 2026: What to Charge | Hyrde",
    metaDescription:
      "How to set your freelance rate in 2026 — by skill, seniority and location — why hourly undersells you, and how to raise rates without losing clients.",
    excerpt:
      "How to price yourself in 2026 by skill, seniority and location — and why most freelancers charge too little.",
    readMins: 8,
    updated: "2026-06-08",
    intro: [
      "Most freelancers undercharge — not because their work isn't worth more, but because they price against a race-to-the-bottom marketplace instead of against the value they deliver. If you've been competing on a platform full of $5 gigs, your sense of 'market rate' is probably skewed low.",
      "Here's how to set a rate in 2026 that reflects your actual worth, and how to raise it over time without scaring clients off.",
    ],
    sections: [
      {
        h2: "Start from the real market baseline",
        body: [
          "Before you price, know what the market actually pays. 2026 mid-level baselines for Western clients land roughly here:",
        ],
        bullets: [
          "React / frontend: ~$85/hr",
          "Fullstack: ~$95/hr",
          "Python: ~$80/hr",
          "UX / product design: ~$75–85/hr",
          "DevOps: ~$100/hr",
          "ML engineering: ~$110/hr",
          "Copywriting: ~$55/hr",
        ],
      },
      {
        h2: "Adjust for seniority honestly",
        body: [
          "Juniors sit around 60% of the mid baseline; genuine seniors command about 150%. Be honest about where you are — overclaiming seniority wins one bad contract and burns the relationship. Underclaiming leaves money on the table every single invoice.",
          "Seniority isn't years; it's the size of the problem you can own without supervision. If a client can hand you ambiguity and walk away, you're senior.",
        ],
      },
      {
        h2: "Location: charge the client's market, not yours",
        body: [
          "If you're in a lower-cost city serving clients in higher-cost markets, you don't have to match local rates — but you shouldn't price at the floor either. Charging meaningfully below the client's market signals 'cheap,' not 'value,' and attracts the worst clients.",
          "Anchor to the value and the client's market. A great developer in Cairo or Barcelona serving US clients should price well above their local average — just below the US senior rate is often the sweet spot.",
        ],
      },
      {
        h2: "Why hourly quietly undersells you",
        body: [
          "Hourly billing punishes you for getting faster and better — the more efficient you are, the less you earn. As you gain experience, shift toward fixed-project or value-based pricing tied to the outcome, not the clock.",
          "A landing page that converts is worth the same to the client whether it takes you four hours or twelve. Price the result.",
        ],
      },
      {
        h2: "How to raise rates without losing clients",
        body: [
          "Raise rates on new clients first — there's zero risk. For existing clients, give notice, tie the increase to delivered results, and raise in steps. Most good clients expect it; the ones who leave over a reasonable increase were usually the low-margin, high-stress ones anyway.",
          "The fastest way to a higher rate, though, is to stop competing in a pool that rewards the cheapest bid. A platform that pre-vets talent and matches on fit instead of price lets you compete on quality.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I know if I'm charging too little?",
        a: "If you're always booked solid and never lose a deal on price, you're charging too little. A healthy rate means occasionally losing price-sensitive clients you didn't want anyway.",
      },
      {
        q: "Should I charge hourly or per project?",
        a: "Hourly is simplest to start but penalizes efficiency. As you get faster and more senior, move toward fixed-project or value-based pricing tied to outcomes — you'll earn more for the same work.",
      },
      {
        q: "How often should I raise my rates?",
        a: "Review at least annually, and immediately whenever you're consistently overbooked. Raise on new clients first, then existing ones with notice tied to results.",
      },
    ],
    cta: {
      heading: "Get matched to clients who pay for quality",
      body: "Hyrde pre-vets talent and matches on fit, not lowest bid. Join free and get put in front of clients who value your work.",
      label: "Join as a freelancer",
      href: "/join",
    },
    related: ["how-to-find-clients-without-upwork"],
  },

  "how-to-find-clients-without-upwork": {
    slug: "how-to-find-clients-without-upwork",
    cluster: "freelancer",
    clusterLabel: "Freelancer guide",
    title: "How to Find Clients Without Upwork in 2026",
    metaTitle: "How to Find Freelance Clients Without Upwork (2026) | Hyrde",
    metaDescription:
      "Tired of Connects, bidding wars and a 6% reply rate? Seven proven ways to land freelance clients in 2026 without relying on Upwork.",
    excerpt:
      "Tired of Connects and bidding wars? Seven proven ways to land clients in 2026 without the big marketplaces.",
    readMins: 7,
    updated: "2026-06-12",
    intro: [
      "If you're spending Connects to send proposals that get a roughly 6% reply rate, the marketplace isn't working for you — it's working you. The good news: the open bidding pool is one of the worst places to find good clients, and there are far better channels in 2026.",
      "Here are seven that consistently land higher-paying, lower-stress clients.",
    ],
    sections: [
      {
        h2: "1. Vetted matching platforms",
        body: [
          "Instead of bidding against hundreds of people for the cheapest slot, get matched. Platforms that pre-vet talent and surface a short shortlist to clients put you in front of buyers who've already chosen quality over price — and you're not paying to apply.",
        ],
      },
      {
        h2: "2. Turn past clients into a referral engine",
        body: [
          "Your best future clients are one introduction away from your best past clients. Make a habit of asking — at the end of a successful project, when satisfaction is highest. A simple 'who else do you know who needs this?' outperforms any cold channel.",
        ],
      },
      {
        h2: "3. Publish proof, not a portfolio",
        body: [
          "A portfolio shows what you made; a case study shows what you changed. Write up one project as a problem → approach → result story with real numbers. One strong case study converts better than twenty polished thumbnails.",
        ],
      },
      {
        h2: "4. Be findable for the exact thing you do",
        body: [
          "Clients search for specifics — 'Shopify developer for subscription store,' not 'developer.' Niche down publicly so you're the obvious answer to a narrow question. The narrower your positioning, the less you compete on price.",
        ],
      },
      {
        h2: "5. Show up where your clients already are",
        body: [
          "Communities, niche Slack and Discord groups, industry forums — being genuinely helpful where your ideal clients hang out generates inbound that never touches a bidding war. Answer questions, don't pitch.",
        ],
      },
      {
        h2: "6. Productize a clear starting offer",
        body: [
          "A defined entry offer — a fixed-scope audit, sprint, or setup — lowers the barrier to a first 'yes.' Once you've delivered something concrete, the larger engagement is an easy upsell built on trust you've already earned.",
        ],
      },
      {
        h2: "7. Partner with adjacent freelancers",
        body: [
          "A designer who refers a developer (and vice versa) builds a steady referral loop with zero acquisition cost. Find people who serve the same clients with a complementary skill and trade introductions.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is it realistic to quit Upwork and still stay booked?",
        a: "Yes — most established freelancers get the majority of work from referrals and direct relationships, not open marketplaces. The bidding pool is a starting point, not a long-term channel.",
      },
      {
        q: "What's the fastest channel to land a new client?",
        a: "Referrals from happy past clients, by a wide margin — they convert fastest and at the highest rates. Vetted matching platforms are the best 'cold' channel because you're matched, not bidding.",
      },
      {
        q: "Do I still need a portfolio?",
        a: "You need proof more than a portfolio. One detailed case study with real results outperforms a wall of thumbnails for winning serious clients.",
      },
    ],
    cta: {
      heading: "Stop bidding. Start getting matched.",
      body: "Hyrde matches pre-vetted freelancers to clients who value quality — no Connects, no bidding wars. Join free.",
      label: "Join as a freelancer",
      href: "/join",
    },
    related: ["freelance-rates-2026"],
  },
};

export const GUIDE_SLUGS = Object.keys(GUIDES);

export function getGuide(slug: string): Guide | null {
  return GUIDES[slug] ?? null;
}

export const GUIDES_LIST: Guide[] = GUIDE_SLUGS.map(s => GUIDES[s]);
