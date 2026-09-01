import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  AR_CITY_SLUGS, AR_CITIES, getArCity, AR_RATE_SKILLS, AR_SKILL_LABELS, arRateFor,
} from "@/lib/gcc.ar";

interface Props { params: Promise<{ city: string }> }

export async function generateStaticParams() {
  return AR_CITY_SLUGS.map(city => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const c = getArCity(city);
  if (!c) return {};
  const canonical = `/ar/hire/${city}`;
  const title = `توظيف مستقلين في ${c.name} — أسعار 2026 ومختصّون موثّقون | Hyrde`;
  const description = `كيف توظّف مستقلاً موثوقاً في ${c.name}: أسعار الساعة الحالية بالـ${c.currency} لكل تخصّص، وما الذي يرفع التكلفة، وكيف تتحقق من المهارة قبل أن تدفع. بلا مزايدات ولا عمولة على المستقل.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    keywords: [
      `توظيف مستقلين في ${c.name}`, `مستقل ${c.name}`, `مطور ${c.name}`, `مصمم ${c.name}`,
      `العمل الحر ${c.country}`, `فريلانسر ${c.name}`, `أسعار المستقلين ${c.country}`,
      "بديل خمسات", "بديل مستقل", "توظيف عن بعد",
    ],
    openGraph: { title, description, url: canonical, locale: "ar_SA" },
  };
}

export default async function ArabicCityHirePage({ params }: Props) {
  const { city } = await params;
  const c = getArCity(city);
  if (!c) notFound();

  const url = `https://hyrde.net/ar/hire/${city}`;
  const rates = AR_RATE_SKILLS.map(s => ({ skill: s, label: AR_SKILL_LABELS[s], ...arRateFor(s, c) }));
  const cheapest = [...rates].sort((a, b) => a.usd - b.usd)[0];
  const priciest = [...rates].sort((a, b) => b.usd - a.usd)[0];

  const faqs = [
    {
      q: `كم تكلفة توظيف مستقل في ${c.name}؟`,
      a: `تتراوح أسعار الساعة في ${c.name} تقريباً بين ${cheapest.local} و${priciest.local} ${c.currency} (نحو ${cheapest.usd}–${priciest.usd} دولاراً) حسب التخصّص والخبرة. الأقل عادةً كتابة المحتوى والمساعدة الإدارية، والأعلى تطوير التطبيقات والنمذجة المالية. وضوح النطاق ومعايير القبول يخفض السعر لأنه يقلّل المخاطرة على المستقل.`,
    },
    {
      q: `كيف أجد مستقلاً موثوقاً في ${c.name}؟`,
      a: `ابحث عن منصّة توثّق المهارة بمقابلة فعلية قبل التعاقد بدل الاعتماد على النجوم والشهادات القابلة للتجميع. على Hyrde يجتاز كل مستقل مقابلة مهارة بالذكاء الاصطناعي في مجاله، ثم يُوفَّق لك مختصّ واحد تلقائياً حسب مشروعك، بلا مزايدة ولا رسائل عروض.`,
    },
    {
      q: `هل يجب أن يكون المستقل مقيماً في ${c.name}؟`,
      a: `ليس شرطاً في أغلب الأعمال الرقمية. ما يهم فعلاً هو تقاطع ساعات العمل وإتقان اللغة وفهم السوق المحلي. توظيف مستقل موثّق عن بُعد يوسّع خياراتك كثيراً، خصوصاً في التخصّصات التي يقلّ فيها المعروض محلياً.`,
    },
    {
      q: `ما الذي يميّز سوق ${c.name}؟`,
      a: c.demand,
    },
    {
      q: `كيف أدفع للمستقل من ${c.country}؟`,
      a: `على Hyrde تدفع للمستقل مباشرة على القناة التي يختارها — تحويل بنكي أو PayPal أو Airtm أو USDT — بمرجع مُتتبَّع، ولا تأخذ المنصّة أي عمولة. ويُنصح دائماً بتقسيم الدفع على مراحل مرتبطة بمخرجات تراجعها وتوافق عليها.`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "ar",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://hyrde.net/ar" },
      { "@type": "ListItem", position: 2, name: "توظيف مستقلين", item: "https://hyrde.net/ar/hire" },
      { "@type": "ListItem", position: 3, name: c.name, item: url },
    ],
  };
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    inLanguage: "ar",
    name: `توظيف مستقلين موثّقين في ${c.name}`,
    serviceType: "توظيف المستقلين",
    provider: { "@type": "Organization", name: "Hyrde", url: "https://hyrde.net" },
    areaServed: { "@type": "City", name: c.name, address: { "@type": "PostalAddress", addressCountry: c.countryCode } },
    url,
  };

  const others = AR_CITY_SLUGS.filter(s => s !== city).map(s => AR_CITIES[s]);

  return (
    <div lang="ar" dir="rtl" className="min-h-screen bg-surface-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <div className="max-w-[820px] mx-auto px-6 md:px-8 pt-24 pb-20">
        <nav className="text-xs font-body text-on-surface-variant mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/ar" className="hover:text-electric-violet transition-colors">الرئيسية</Link>
          <span>/</span>
          <Link href="/ar/hire" className="hover:text-electric-violet transition-colors">توظيف مستقلين</Link>
          <span>/</span>
          <span className="text-on-surface">{c.name}</span>
        </nav>

        <h1 className="text-3xl md:text-5xl font-bold font-headline text-on-surface leading-tight mb-4">
          توظيف مستقلين في {c.name}
        </h1>
        <p className="font-body text-on-surface-variant text-lg leading-relaxed mb-4">
          أسعار الساعة الحالية بالـ{c.currency} لكل تخصّص، وكيف تتحقّق من المهارة قبل أن تدفع، وكيف تحمي ميزانيتك.
          على Hyrde يُوفَّق لك مختصّ واحد موثّق بالمقابلة تلقائياً — بلا مزايدات، وبلا عمولة على المستقل.
        </p>
        <p className="font-body text-on-surface-variant text-base leading-relaxed mb-10">{c.note}</p>

        {/* Rate table — the substantive, city-specific block */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-4">
            أسعار الساعة في {c.name} حسب التخصّص (2026)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border-crisp bg-white">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-border-crisp bg-surface-gray">
                  <th className="p-3 text-sm font-semibold font-body text-on-surface">التخصّص</th>
                  <th className="p-3 text-sm font-semibold font-body text-on-surface whitespace-nowrap">{c.currency} / ساعة</th>
                  <th className="p-3 text-sm font-semibold font-body text-on-surface whitespace-nowrap">دولار / ساعة</th>
                </tr>
              </thead>
              <tbody>
                {rates.map(r => (
                  <tr key={r.skill} className="border-b border-border-crisp last:border-0">
                    <td className="p-3 text-sm font-body text-on-surface">{r.label}</td>
                    <td className="p-3 text-sm font-body text-on-surface-variant whitespace-nowrap">{r.local}</td>
                    <td className="p-3 text-sm font-body text-on-surface-variant whitespace-nowrap">${r.usd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-body text-on-surface-variant text-sm leading-relaxed mt-3">
            أرقام استرشادية لمتوسّط السوق، تختلف حسب النطاق والخبرة والاستعجال. استخدمها كنقطة بداية للتفاوض لا كسعر نهائي.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-4">ما الأكثر طلباً في {c.name}</h2>
          <p className="font-body text-on-surface-variant text-base leading-relaxed">{c.demand}</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-4">كيف توظّف دون أن تخسر ميزانيتك</h2>
          <ul className="space-y-2">
            {[
              "ابدأ من النتيجة المطلوبة لا من المسمّى الوظيفي — «متجر جاهز للبيع» أوضح من «مطوّر».",
              "اكتب ثلاثة معايير قبول تعرف بها أن العمل مقبول، قبل أن تتفق على السعر.",
              "قسّم المشروع إلى مراحل، واربط كل دفعة بمخرَج تراجعه وتوافق عليه.",
              "تحقّق من المهارة بعيّنة عمل مدفوعة صغيرة أو بمنصّة توثّق بالمقابلة، لا بالنجوم والشهادات.",
              "راجع التسليم مقابل معايير القبول قبل الاعتماد والدفع النهائي.",
            ].map(b => (
              <li key={b} className="flex items-start gap-3 font-body text-on-surface-variant text-base">
                <span className="material-symbols-outlined text-electric-violet shrink-0 mt-0.5" style={{ fontSize: "18px" }}>chevron_left</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="bg-tech-blue-deep rounded-2xl p-8 my-12 text-center">
          <h2 className="text-xl md:text-2xl font-bold font-headline text-white mb-2">
            تحتاج مختصًّا في {c.name}؟
          </h2>
          <p className="font-body text-white/75 text-sm max-w-lg mx-auto mb-6">
            صِف النتيجة التي تريدها، ويوفّق لك الذكاء الاصطناعي مختصًّا واحداً موثّقاً بالمقابلة. مجاني خلال الوصول المبكر.
          </p>
          <Link href="/signup"
            className="inline-block bg-white text-on-surface font-semibold font-body px-7 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            انشر مهمتك مجانًا
          </Link>
        </div>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-5">الأسئلة الشائعة</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="bg-white rounded-xl border border-border-crisp p-5 group">
                <summary className="font-semibold font-body text-on-surface cursor-pointer list-none flex items-center justify-between gap-4">
                  {f.q}
                  <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform shrink-0" style={{ fontSize: "20px" }}>expand_more</span>
                </summary>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal mesh */}
        <section className="border-t border-border-crisp pt-8">
          <h2 className="text-lg font-bold font-headline text-on-surface mb-4">مدن أخرى في الخليج</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {others.map(o => (
              <Link key={o.slug} href={`/ar/hire/${o.slug}`}
                className="inline-flex items-center px-4 h-9 rounded-full border border-border-crisp text-sm font-body text-on-surface hover:border-electric-violet/50 transition-colors">
                {o.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/ar/guides/cost-to-hire-freelancer-gcc" className="text-sm font-body text-electric-violet hover:underline">
              دليل الأسعار الكامل للخليج ←
            </Link>
            <Link href="/ar/guides/how-to-hire-freelancer-saudi" className="text-sm font-body text-electric-violet hover:underline">
              كيف توظّف مستقلاً موثوقاً ←
            </Link>
            <Link href="/ar/guides/khamsat-mostaql-alternative" className="text-sm font-body text-electric-violet hover:underline">
              بدائل خمسات ومستقل ←
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
