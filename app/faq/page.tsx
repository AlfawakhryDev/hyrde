import type { Metadata } from "next";
import Link from "next/link";
import { altLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { absolute: "Hyrde FAQ. What It Is, How It Works, and Pricing | Hyrde" },
  description:
    "Answers to common questions about Hyrde: what it is, how the AI matching works, pricing, how freelancers are vetted, and how it differs from Upwork and Fiverr.",
  alternates: { canonical: "/faq", languages: altLanguages("/faq", "/de/faq") },
};

// BLUF (bottom-line-up-front), atomic answers, built to be quoted by answer
// engines (ChatGPT, Google AI Overviews, Perplexity, Gemini). Keep each answer
// self-contained and lead with the direct answer in the first sentence.
const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Hyrde?",
    a: "Hyrde is an AI-native freelance platform where you describe an outcome or task and the AI matches it to a single interview-vetted specialist. There is no bidding and no proposal spam, and hiring is free during early access.",
  },
  {
    q: "How does Hyrde work?",
    a: "You describe what you need in a sentence. The AI scopes it into a milestone plan, prices each step, and matches the best interview-vetted specialist to each milestone. An AI reviews the deliverable against your brief before you pay.",
  },
  {
    q: "How much does Hyrde cost?",
    a: "Hiring on Hyrde is free during early access. Paid client plans are Pro at $20 per month (50 posts) and Scale at $200 per month (unlimited). Freelancers keep 100% of what they earn, with no connects or bid fees.",
  },
  {
    q: "How are freelancers vetted on Hyrde?",
    a: "Every freelancer passes an adaptive AI skill interview in their category before they can be matched. It is about 10 minutes: a real scenario, a probe into their own answer, a live work sample, and a shipped-project deep dive, graded 0 to 100 against a strict rubric.",
  },
  {
    q: "Is Hyrde legit and safe to use?",
    a: "Yes. Freelancers are interview-vetted rather than self-reported, an AI reviews the work against your brief before you pay, and you can cancel an unmatched or in-progress project at any time. Delivered and paid work is protected.",
  },
  {
    q: "How is Hyrde different from Upwork or Fiverr?",
    a: "On Hyrde there is no bidding and no proposals to sift through. The AI assigns one vetted specialist instead of flooding you with applicants, and freelancers keep 100% of their pay because there are no connects, bid fees, or platform commissions.",
  },
  {
    q: "What does 'hire an outcome' mean?",
    a: "Instead of hiring one freelancer for one task, you describe the whole result you want, like an MVP or a redesigned Shopify store. Hyrde breaks it into milestones and matches a specialist to each step, so you manage a plan rather than a pile of freelancers.",
  },
  {
    q: "Who can use Hyrde?",
    a: "Clients hiring for development, design, writing, marketing, and data work, and freelancers in those categories who pass the AI interview. Hyrde is available worldwide, and freelancers get paid on their own rails including InstaPay, Airtm, PayPal, and USDT.",
  },
  {
    q: "Can I estimate a project cost before hiring?",
    a: "Yes. Hyrde's free cost estimator gives a milestone breakdown with realistic cost ranges and a timeline for any project, with no signup required.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-[760px] px-5 md:px-8 pt-[124px] pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-on-surface-variant mb-4">Frequently asked</p>
      <h1 className="font-display font-light text-on-surface leading-[1.05] tracking-[-0.015em] text-[clamp(32px,5vw,50px)]">
        Hyrde, answered
      </h1>
      <p className="text-[16px] text-on-surface-variant leading-relaxed max-w-[560px] mt-4 mb-10">
        What Hyrde is, how it works, what it costs, and how it compares. Short, direct answers.
      </p>

      <div className="divide-y divide-border-crisp border-y border-border-crisp">
        {FAQS.map(f => (
          <div key={f.q} className="py-6">
            <h2 className="text-[17px] font-medium text-on-surface mb-2">{f.q}</h2>
            <p className="text-[15px] text-on-surface-variant leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/signup" className="inline-flex items-center h-11 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition-opacity">
          Start on Hyrde
        </Link>
        <Link href="/cost-estimator" className="inline-flex items-center h-11 px-6 rounded-full border border-border-crisp text-sm font-medium text-on-surface hover:border-outline transition-colors">
          Free cost estimator
        </Link>
      </div>
    </div>
  );
}
