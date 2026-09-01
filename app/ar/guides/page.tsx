import type { Metadata } from "next";
import Link from "next/link";
import { AR_GUIDES_LIST } from "@/lib/guides.ar";

export const metadata: Metadata = {
  title: { absolute: "أدلّة التوظيف والعمل الحر بالعربية | Hyrde" },
  description:
    "أدلّة عملية بالعربية لتوظيف المستقلين في السعودية والخليج: كيف توظّف مستقلاً موثوقاً، بدائل خمسات ومستقل، وكم تكلفة توظيف مستقل.",
  alternates: { canonical: "/ar/guides" },
  openGraph: {
    title: "أدلّة التوظيف والعمل الحر بالعربية | Hyrde",
    description: "أدلّة عملية بالعربية للعملاء الذين يوظّفون المستقلين في السعودية والخليج.",
    url: "/ar/guides",
    locale: "ar_SA",
  },
};

export default function ArabicGuidesIndexPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    inLanguage: "ar",
    name: "أدلّة Hyrde بالعربية",
    url: "https://hyrde.net/ar/guides",
    hasPart: AR_GUIDES_LIST.map(g => ({
      "@type": "Article",
      headline: g.title,
      url: `https://hyrde.net/ar/guides/${g.slug}`,
    })),
  };

  return (
    <div lang="ar" dir="rtl" className="min-h-screen bg-surface-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

      <div className="max-w-[900px] mx-auto px-6 md:px-8 pt-24 pb-20">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-on-surface-variant mb-4">الأدلة</p>
        <h1 className="text-3xl md:text-5xl font-bold font-headline text-on-surface leading-tight mb-4">
          أدلّة التوظيف، النسخة الصريحة
        </h1>
        <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-[620px] mb-12">
          أدلّة عملية بلا حشو للعملاء الذين يوظّفون المستقلين في السعودية والخليج: من أين تبدأ، كيف تتحقق من المهارة، والأسعار.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          {AR_GUIDES_LIST.map(g => (
            <Link key={g.slug} href={`/ar/guides/${g.slug}`}
              className="group flex flex-col bg-white rounded-2xl border border-border-crisp p-6 hover:border-electric-violet/50 hover:shadow-lg transition-all">
              <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest mb-3">
                {g.clusterLabel}
              </span>
              <h2 className="text-lg font-bold font-headline text-on-surface leading-snug mb-2 group-hover:text-electric-violet transition-colors">
                {g.title}
              </h2>
              <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-4 flex-1">
                {g.excerpt}
              </p>
              <span className="text-xs font-body text-on-surface-variant inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
                {g.readMins} دقائق قراءة
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap gap-4">
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
