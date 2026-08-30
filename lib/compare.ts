/**
 * Competitor comparison data — powers the "[competitor] alternative" switcher
 * pages (Zapier-style high-intent SEO). Pain points are grounded in real, recent
 * client complaints (r/Upwork client threads + 2026 fee breakdowns), not invented.
 *
 * Each competitor renders via components/ComparisonPage.tsx at /[slug]-alternative.
 */

export interface PainPoint {
  icon: string;        // Material Symbols name
  title: string;       // the client's pain
  them: string;        // what the competitor does / why it hurts
  hyrde: string;       // how Hyrde fixes it
}

export interface FeeRow {
  label: string;
  them: string;
  hyrde: string;
}

export interface FeatureRow {
  feature: string;
  them: string | false;
  hyrde: string | true;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Competitor {
  slug: string;          // "upwork"
  name: string;          // "Upwork"
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  painPoints: PainPoint[];
  fees: FeeRow[];
  features: FeatureRow[];
  faqs: Faq[];
}

export const COMPETITORS: Record<string, Competitor> = {
  upwork: {
    slug: "upwork",
    name: "Upwork",
    metaTitle: "The Upwork Alternative for Clients Who Are Tired of Getting Burned",
    metaDescription:
      "Disappearing contractors, fake 'Top Rated' badges, removed reviews, 22–34% real fees. Hyrde is the Upwork alternative that vets talent with AI and is free to hire during early access.",
    eyebrow: "Upwork alternative",
    h1: "The Upwork alternative for clients who got burned",
    intro:
      "After $40k across 10 Upwork projects, one client documented disappearing contractors, fake \"Top Rated\" badges, removed reviews, and zero recourse after 90 days. They're not alone. Hyrde rebuilds hiring around the one thing Upwork can't guarantee: that the person you hire is actually good — proven before they reach you.",
    painPoints: [
      {
        icon: "person_off",
        title: "Contractors disappear mid-project — and you eat the loss",
        them: "Hourly contractors bill, then vanish. Upwork won't intervene after 90 days and offers no quality guarantee or replacement, so a $10k+ loss is yours alone.",
        hyrde: "Every freelancer passes an AI work-sample assessment before they ever reach your shortlist — so you start with people who can actually do the work, not a profile that reads well.",
      },
      {
        icon: "verified_user",
        title: "\"Top Rated\" and \"100% Job Success\" don't mean what you think",
        them: "Badges are gameable. Negative reviews get removed, and a few good jobs wipe out a bad record — so the contractor who ghosted you keeps their perfect score.",
        hyrde: "Ranking is driven by demonstrated skill on a real task, scored by AI — not by a badge a contractor can launder away with $5 gigs.",
      },
      {
        icon: "trending_up",
        title: "Ratings are inflated with fake $5 jobs",
        them: "Sellers pad their stats with trivial or fake micro-projects to manufacture a glowing rating that has nothing to do with the work you need.",
        hyrde: "We score the actual skill you're hiring for. A React role is judged on a React work sample — not on review volume.",
      },
      {
        icon: "security",
        title: "Security and credential theft",
        them: "Clients report contractors misusing their credentials — e.g. downloading paid stock assets on the client's accounts without permission.",
        hyrde: "Vetted, accountable talent and a managed workflow — you're not handing logins to an anonymous bidder you met yesterday.",
      },
      {
        icon: "content_copy",
        title: "Duplicate profiles, fake portfolios, message bombing",
        them: "Duplicate accounts apply to the same job, portfolios show AI-generated or stolen work, and your inbox gets flooded with 50 copy-paste proposals.",
        hyrde: "No bidding, ever. You describe the role and AI returns ~5 ranked, pre-vetted candidates — no inbox to sift, no proposal spam.",
      },
      {
        icon: "payments",
        title: "The real fees are 22–34% — and unpredictable",
        them: "Upwork's 2025 shift to variable 0–15% freelancer fees killed predictability. Add Connects burn (~6% reply rate), withdrawal fees, and client-side contract-initiation fees of $0.99–$14.99 and the true take is 22–34% of the contract.",
        hyrde: "Free to hire during early access — posting, matching, shortlisting, and the hire itself cost nothing right now.",
      },
    ],
    fees: [
      { label: "Cost to post / get matches", them: "Free, but Connects are burned on proposals", hyrde: "Free" },
      { label: "Client marketplace fee", them: "3–7.99% on payments", hyrde: "$0" },
      { label: "Contract initiation fee", them: "$0.99–$14.99 per contract", hyrde: "$0" },
      { label: "Real all-in 'agency tax'", them: "≈ 22–34% of contract", hyrde: "$0 — free during early access" },
    ],
    features: [
      { feature: "Talent vetted before you see them", them: false, hyrde: "AI work-sample on every profile" },
      { feature: "No bidding / no proposal spam", them: false, hyrde: true },
      { feature: "Shortlist speed", them: "Days of sifting 50+ proposals", hyrde: "~5 ranked matches in 60s" },
      { feature: "Quality guarantee / replacement", them: false, hyrde: "Vetted matches + managed workflow" },
      { feature: "Tamper-proof quality signal", them: false, hyrde: "Skill score, not gameable badges" },
      { feature: "Predictable pricing", them: false, hyrde: "Free during early access" },
    ],
    faqs: [
      {
        q: "What is the best Upwork alternative for clients in 2026?",
        a: "If your problem with Upwork is talent quality and unpredictable fees, Hyrde is built for exactly that: every freelancer passes an AI work-sample assessment before you see them, there's no bidding, and it's free to hire during early access — no Connects, no contract-initiation fees, no 22–34% all-in tax.",
      },
      {
        q: "Is Hyrde cheaper than Upwork?",
        a: "For most contracts, yes. Upwork's real all-in cost lands around 22–34% once you count the marketplace fee, contract-initiation fees, and wasted Connects. Hyrde is free to hire during early access.",
      },
      {
        q: "How does Hyrde stop the 'disappearing contractor' problem?",
        a: "Two ways: talent is pre-vetted with a real work sample (so you start with people who can do the job), and matching is AI-curated rather than open bidding, so you're not gambling on an anonymous lowest bidder.",
      },
      {
        q: "Do I have to sift through dozens of proposals like on Upwork?",
        a: "No. You describe the role and Hyrde's AI returns roughly five ranked, pre-vetted candidates with an explanation of why each matched. There's no bidding and no proposal inbox.",
      },
    ],
  },

  fiverr: {
    slug: "fiverr",
    name: "Fiverr",
    metaTitle: "The Fiverr Alternative for Serious Client Work",
    metaDescription:
      "Tired of gig roulette, race-to-the-bottom quality, surprise revisions and buyer fees on Fiverr? Hyrde matches you to AI-vetted talent in 60 seconds and is free to hire during early access.",
    eyebrow: "Fiverr alternative",
    h1: "The Fiverr alternative for real, professional work",
    intro:
      "Fiverr is great for a $20 logo — and painful when the work actually matters. Gig titles oversell, quality is a coin flip, and \"extras\" balloon the price after you've committed. Hyrde matches you to pre-vetted professionals for the role you actually need, not the cheapest gig that ranked.",
    painPoints: [
      {
        icon: "casino",
        title: "Gig roulette — quality is a coin flip",
        them: "Two sellers with near-identical gigs and ratings deliver wildly different work. You only find out after you've paid.",
        hyrde: "Every freelancer is scored on a real work sample for the skill you need, so the baseline quality is proven before you commit.",
      },
      {
        icon: "trending_down",
        title: "Race to the bottom",
        them: "Pricing pressure pushes sellers to cut corners, outsource, or use AI fillers to hit a price point.",
        hyrde: "We protect rate floors per skill and rank on skill, not on who's cheapest — so you get professionals, not corner-cutters.",
      },
      {
        icon: "receipt_long",
        title: "Surprise 'extras' and buyer fees",
        them: "The headline gig price isn't the real price — revisions, 'fast delivery,' and source files are paid add-ons, plus a buyer service fee on top.",
        hyrde: "Transparent rates up front and free to hire during early access. No nickel-and-diming.",
      },
      {
        icon: "reviews",
        title: "Reviews you can't fully trust",
        them: "Sellers lean on volume and incentivized reviews; a polished profile doesn't mean polished delivery.",
        hyrde: "Your shortlist is ranked by an AI skill score on a real task — not by review-count theater.",
      },
      {
        icon: "interpreter_mode",
        title: "Communication and scope gaps",
        them: "Rigid gig packages don't fit nuanced projects, so scope and expectations break down fast.",
        hyrde: "You describe the role in plain language and get matched talent who fit the actual brief — no forcing your project into a gig box.",
      },
    ],
    fees: [
      { label: "Cost to browse / get matches", them: "Free", hyrde: "Free" },
      { label: "Buyer service fee", them: "~5.5% + small order fee", hyrde: "$0" },
      { label: "Paid 'extras' to get usable work", them: "Revisions, source files, speed add-ons", hyrde: "None — scoped up front" },
      { label: "What you pay overall", them: "Gig price + fees + extras", hyrde: "Market rate — free to hire (early access)" },
    ],
    features: [
      { feature: "Talent vetted before you see them", them: false, hyrde: "AI work-sample on every profile" },
      { feature: "Matched to your brief (not gig packages)", them: false, hyrde: true },
      { feature: "Transparent total price", them: false, hyrde: true },
      { feature: "Rate floor protects quality", them: false, hyrde: true },
      { feature: "Ranked shortlist in 60s", them: "Manual gig searching", hyrde: true },
    ],
    faqs: [
      {
        q: "What's a better alternative to Fiverr for professional work?",
        a: "Hyrde. Instead of buying a fixed gig and hoping, you describe the role and get ~5 AI-vetted professionals ranked for your brief, with transparent rates and free to hire during early access.",
      },
      {
        q: "Why is Fiverr work so inconsistent?",
        a: "Fiverr's gig model rewards volume and low headline prices, which pushes sellers to cut corners and upsell 'extras.' Hyrde scores talent on a real work sample for your skill and protects rate floors, so quality isn't a coin flip.",
      },
      {
        q: "Does Hyrde charge buyer fees like Fiverr?",
        a: "No. There's no buyer service fee and no paid 'extras' to get usable deliverables. Hiring is free during early access.",
      },
    ],
  },

  toptal: {
    slug: "toptal",
    name: "Toptal",
    metaTitle: "The Toptal Alternative — Elite Vetting Without the Elite Price",
    metaDescription:
      "Love Toptal's vetting, hate the markups, opaque pricing and slow onboarding? Hyrde gives you AI-vetted talent in 60 seconds, transparent rates, and free to hire during early access — no premium gatekeeping.",
    eyebrow: "Toptal alternative",
    h1: "The Toptal alternative: elite vetting without the elite price",
    intro:
      "Toptal solved trust by gatekeeping hard — and pricing accordingly. You get vetted talent, but with opaque markups, a deposit to start, and rates that put it out of reach for most teams. Hyrde keeps the rigor (an AI work-sample on every freelancer) while making it fast, transparent, and affordable.",
    painPoints: [
      {
        icon: "attach_money",
        title: "Premium pricing and hidden markups",
        them: "Toptal's markup is baked into rates you can't see, pushing effective costs well above market — fine for enterprises, brutal for startups.",
        hyrde: "Transparent rates set by the freelancer, and free to hire during early access. No opaque agency markup.",
      },
      {
        icon: "account_balance_wallet",
        title: "Deposit just to start talking",
        them: "Toptal typically asks for an upfront deposit before you can engage talent — a real barrier when you're still scoping.",
        hyrde: "Free to post, match, shortlist, and hire during early access.",
      },
      {
        icon: "schedule",
        title: "Slower to a shortlist",
        them: "Matching runs through account managers and can take days to surface candidates.",
        hyrde: "Describe the role and get ~5 ranked, vetted matches in about 60 seconds.",
      },
      {
        icon: "groups",
        title: "Narrow, gatekept pool",
        them: "Toptal's 'top 3%' positioning narrows the pool and the price — and you take their word on the screen.",
        hyrde: "A broader vetted pool, with a transparent AI skill score on a real task so you can see the evidence yourself.",
      },
    ],
    fees: [
      { label: "Cost to start", them: "Upfront deposit (often ~$500)", hyrde: "Free" },
      { label: "Pricing transparency", them: "Opaque markup baked into rate", hyrde: "Freelancer's rate + $0 fee (early access)" },
      { label: "Time to shortlist", them: "Days, via account manager", hyrde: "~60 seconds" },
      { label: "What you pay overall", them: "Premium rate + hidden markup", hyrde: "Market rate + $0 fee (early access)" },
    ],
    features: [
      { feature: "Talent vetted on a real work sample", them: "Yes (manual screening)", hyrde: "AI work-sample on every profile" },
      { feature: "Transparent pricing", them: false, hyrde: true },
      { feature: "No deposit to start", them: false, hyrde: true },
      { feature: "Self-serve shortlist in 60s", them: false, hyrde: true },
      { feature: "Affordable for startups & SMBs", them: false, hyrde: true },
    ],
    faqs: [
      {
        q: "Is there a cheaper alternative to Toptal that still vets talent?",
        a: "Yes — Hyrde. Every freelancer passes an AI work-sample assessment, but there's no opaque markup or upfront deposit. You see the freelancer's real rate, and hiring is free during early access.",
      },
      {
        q: "Do I need to pay a deposit like Toptal?",
        a: "No. Posting, matching, getting your shortlist, and hiring are all free on Hyrde during early access.",
      },
      {
        q: "How is Hyrde's vetting different from Toptal's?",
        a: "Toptal screens manually and positions on a 'top 3%' gate you take on faith. Hyrde scores every freelancer with an AI work-sample for the specific skill, and surfaces that evidence so you can judge the match yourself — faster and more transparently.",
      },
    ],
  },
};

export const COMPETITOR_SLUGS = Object.keys(COMPETITORS);

export function getCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS[slug];
}
