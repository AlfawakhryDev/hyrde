import type { Metadata } from "next";
import Link from "next/link";
import { altLanguages } from "@/lib/i18n";
import { faqFor, faqJsonLd } from "@/lib/faq";

export const metadata: Metadata = {
  title: { absolute: "أسئلة Hyrde الشائعة. ما هو، كيف يعمل، والأسعار" },
  description:
    "إجابات على الأسئلة الشائعة حول Hyrde: ما هو، كيف تعمل مطابقة الذكاء الاصطناعي، الأسعار، كيف يُوثَّق المستقلّون، وبماذا يختلف عن Upwork وFiverr.",
  alternates: { canonical: "/ar/faq", languages: altLanguages("/faq", "/de/faq", "/ar/faq") },
};

const FAQS = faqFor("ar");

export default function ArabicFaqPage() {
  const jsonLd = { ...faqJsonLd(FAQS), inLanguage: "ar" };

  return (
    <div lang="ar" dir="rtl" className="mx-auto max-w-[760px] px-5 md:px-8 pt-[124px] pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-on-surface-variant mb-4">الأسئلة الشائعة</p>
      <h1 className="font-display font-light text-on-surface leading-[1.15] tracking-[-0.015em] text-[clamp(32px,5vw,50px)]">
        Hyrde، بإجابات
      </h1>
      <p className="text-[16px] text-on-surface-variant leading-relaxed max-w-[560px] mt-4 mb-10">
        ما هو Hyrde، وكيف يعمل، وكم يكلّف، وبماذا يختلف. إجابات قصيرة ومباشرة.
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
          ابدأ الآن
        </Link>
        <Link href="/ar" className="inline-flex items-center h-11 px-6 rounded-full border border-border-crisp text-sm font-medium text-on-surface hover:border-outline transition-colors">
          إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
