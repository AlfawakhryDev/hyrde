import type { Metadata } from "next";
import Link from "next/link";
import { AR_CITIES, AR_CITY_SLUGS, AR_RATE_SKILLS, AR_SKILL_LABELS, arRateFor } from "@/lib/gcc.ar";

export const metadata: Metadata = {
  title: { absolute: "توظيف مستقلين موثّقين في الخليج — أسعار 2026 | Hyrde" },
  description:
    "توظيف مستقلين موثّقين في السعودية والإمارات وقطر والكويت: أسعار الساعة لكل تخصّص ومدينة، وكيف تتحقّق من المهارة قبل أن تدفع. بلا مزايدات ولا عمولة على المستقل.",
  alternates: { canonical: "/ar/hire" },
  keywords: [
    "توظيف مستقلين", "العمل الحر في الخليج", "مستقلين السعودية", "فريلانسر الإمارات",
    "توظيف مطور", "توظيف مصمم", "أسعار المستقلين", "بديل خمسات", "بديل مستقل",
  ],
  openGraph: {
    title: "توظيف مستقلين موثّقين في الخليج — أسعار 2026 | Hyrde",
    description: "أسعار الساعة لكل تخصّص ومدينة في الخليج، ومختصّون موثّقون بالمقابلة.",
    url: "/ar/hire",
    locale: "ar_SA",
  },
};

export default function ArabicHireHubPage() {
  const cities = AR_CITY_SLUGS.map(s => AR_CITIES[s]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    inLanguage: "ar",
    name: "توظيف مستقلين في مدن الخليج",
    itemListElement: cities.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `توظيف مستقلين في ${c.name}`,
      url: `https://hyrde.net/ar/hire/${c.slug}`,
    })),
  };

  return (
    <div lang="ar" dir="rtl" className="min-h-screen bg-surface-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <div className="max-w-[900px] mx-auto px-6 md:px-8 pt-24 pb-20">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-on-surface-variant mb-4">الخليج</p>
        <h1 className="text-3xl md:text-5xl font-bold font-headline text-on-surface leading-tight mb-4">
          توظيف مستقلين موثّقين في الخليج
        </h1>
        <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-[640px] mb-12">
          أسعار الساعة الحالية لكل تخصّص ومدينة، وكيف تتحقّق من المهارة قبل أن تدفع. على Hyrde يُوفَّق لك
          مختصّ واحد موثّق بالمقابلة تلقائياً — بلا مزايدات، وبلا عمولة على المستقل.
        </p>

        <h2 className="text-2xl font-bold font-headline text-on-surface mb-5">اختر مدينتك</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {cities.map(c => {
            const sample = arRateFor(AR_RATE_SKILLS[0], c);
            return (
              <Link key={c.slug} href={`/ar/hire/${c.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-border-crisp p-5 hover:border-electric-violet/50 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold font-headline text-on-surface group-hover:text-electric-violet transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs font-body text-on-surface-variant mt-1">{c.country}</p>
                <p className="text-sm font-body text-on-surface-variant mt-3 flex-1">
                  {AR_SKILL_LABELS[AR_RATE_SKILLS[0]]} من نحو {sample.local} {c.currency}/ساعة
                </p>
                <span className="text-xs font-body text-electric-violet mt-4">اعرض الأسعار ←</span>
              </Link>
            );
          })}
        </div>

        <h2 className="text-2xl font-bold font-headline text-on-surface mb-5">اقرأ قبل أن توظّف</h2>
        <div className="flex flex-wrap gap-4 mb-12">
          <Link href="/ar/guides/how-to-hire-freelancer-saudi" className="text-sm font-body text-electric-violet hover:underline">
            كيف توظّف مستقلاً موثوقاً ←
          </Link>
          <Link href="/ar/guides/cost-to-hire-freelancer-gcc" className="text-sm font-body text-electric-violet hover:underline">
            كم تكلفة توظيف مستقل؟ ←
          </Link>
          <Link href="/ar/guides/khamsat-mostaql-alternative" className="text-sm font-body text-electric-violet hover:underline">
            بدائل خمسات ومستقل ←
          </Link>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/signup" className="inline-flex items-center h-11 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition-opacity">
            انشر مهمة مجانًا
          </Link>
          <Link href="/ar" className="inline-flex items-center h-11 px-6 rounded-full border border-border-crisp text-sm font-medium text-on-surface hover:border-outline transition-colors">
            إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
