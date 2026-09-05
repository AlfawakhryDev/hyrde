import Link from "next/link";
import type { Metadata } from "next";
import type { Guide } from "@/lib/guides";

// ── One renderer for every language's guide article ─────────────────
// /guides/[slug], /de/guides/[slug] and /ar/guides/[slug] were three files of
// ~167 lines that differed only in their data source, their chrome strings and
// their text direction. Everything real about the page — the layout, the
// Article + FAQPage + BreadcrumbList schema, the related links — now lives
// here once. Adding a fourth language is a config object, not a fourth copy.

export interface GuideChrome {
  lang: string;                 // html lang for the wrapper
  rtl?: boolean;
  inLanguage: string;           // schema.org inLanguage
  ogLocale?: string;            // "de_DE", "ar_SA"; omit for English
  basePath: string;             // "/guides" | "/ar/guides"
  homeHref: string;             // "/" | "/de" | "/ar"
  homeLabel: string;
  guidesLabel: string;
  faqHeading: string;
  relatedHeading: string;
  readMins: (n: number) => string;
  updatedLabel: (d: Date) => string;
}

export const EN_CHROME: GuideChrome = {
  lang: "en", inLanguage: "en", basePath: "/guides", homeHref: "/",
  homeLabel: "Home", guidesLabel: "Guides",
  faqHeading: "Frequently asked", relatedHeading: "Keep reading",
  readMins: n => `${n} min read`,
  updatedLabel: d => `Updated ${d.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
};

export const DE_CHROME: GuideChrome = {
  lang: "de", inLanguage: "de", ogLocale: "de_DE", basePath: "/de/guides", homeHref: "/de",
  homeLabel: "Startseite", guidesLabel: "Ratgeber",
  faqHeading: "Häufige Fragen", relatedHeading: "Weiterlesen",
  readMins: n => `${n} Min. Lesezeit`,
  updatedLabel: d => `Aktualisiert ${d.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`,
};

export const AR_CHROME: GuideChrome = {
  lang: "ar", rtl: true, inLanguage: "ar", ogLocale: "ar_SA", basePath: "/ar/guides", homeHref: "/ar",
  homeLabel: "الرئيسية", guidesLabel: "الأدلة",
  faqHeading: "الأسئلة الشائعة", relatedHeading: "اقرأ أيضاً",
  readMins: n => `${n} دقائق قراءة`,
  updatedLabel: d => `تحديث ${d.toLocaleDateString("ar", { month: "long", year: "numeric" })}`,
};

/** Metadata for one guide. `title.absolute` so the layout template does not
 *  append a second "| Hyrde" onto a metaTitle that already carries one. */
export function guideMetadata(chrome: GuideChrome, g: Guide): Metadata {
  const canonical = `${chrome.basePath}/${g.slug}`;
  return {
    title: { absolute: g.metaTitle },
    description: g.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: g.metaTitle, description: g.metaDescription, url: canonical,
      type: "article", ...(chrome.ogLocale ? { locale: chrome.ogLocale } : {}),
    },
  };
}

export default function GuideArticle({
  chrome, guide: g, related,
}: { chrome: GuideChrome; guide: Guide; related: Guide[] }) {
  const url = `https://hyrde.net${chrome.basePath}/${g.slug}`;
  const ld = [
    {
      "@context": "https://schema.org", "@type": "Article", inLanguage: chrome.inLanguage,
      headline: g.title, description: g.metaDescription,
      datePublished: g.updated, dateModified: g.updated,
      author: { "@type": "Organization", name: "Hyrde" },
      publisher: { "@type": "Organization", name: "Hyrde", url: "https://hyrde.net" },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage", inLanguage: chrome.inLanguage,
      mainEntity: g.faqs.map(f => ({
        "@type": "Question", name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: chrome.homeLabel, item: `https://hyrde.net${chrome.homeHref}` },
        { "@type": "ListItem", position: 2, name: chrome.guidesLabel, item: `https://hyrde.net${chrome.basePath}` },
        { "@type": "ListItem", position: 3, name: g.title, item: url },
      ],
    },
  ];
  // In RTL the marker sits on the right of the text, so it has to point the other way.
  const bullet = chrome.rtl ? "chevron_left" : "chevron_right";

  return (
    <div lang={chrome.lang} dir={chrome.rtl ? "rtl" : undefined} className="min-h-screen bg-surface-gray">
      {ld.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }} />
      ))}

      <article className="max-w-[760px] mx-auto px-6 md:px-8 pt-20 pb-16">
        <nav className="text-xs font-body text-on-surface-variant mb-6 flex items-center gap-2 flex-wrap">
          <Link href={chrome.homeHref} className="hover:text-electric-violet transition-colors">{chrome.homeLabel}</Link>
          <span>/</span>
          <Link href={chrome.basePath} className="hover:text-electric-violet transition-colors">{chrome.guidesLabel}</Link>
          <span>/</span>
          <span className="text-on-surface">{g.clusterLabel}</span>
        </nav>

        <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">
          {g.clusterLabel}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-on-surface leading-tight mt-3 mb-4">
          {g.title}
        </h1>
        <p className="text-xs font-body text-on-surface-variant inline-flex items-center gap-4 mb-8">
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
            {chrome.readMins(g.readMins)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>update</span>
            {chrome.updatedLabel(new Date(g.updated))}
          </span>
        </p>

        <div className="space-y-4 mb-10">
          {g.intro.map((p, i) => (
            <p key={i} className="font-body text-on-surface text-lg leading-relaxed">{p}</p>
          ))}
        </div>

        {g.sections.map((sec, i) => (
          <section key={i} className="mb-10">
            <h2 className="text-2xl font-bold font-headline text-on-surface mb-4">{sec.h2}</h2>
            <div className="space-y-4">
              {sec.body.map((p, j) => (
                <p key={j} className="font-body text-on-surface-variant text-base leading-relaxed">{p}</p>
              ))}
            </div>
            {sec.bullets && (
              <ul className="mt-4 space-y-2">
                {sec.bullets.map((b, k) => (
                  <li key={k} className="flex items-start gap-3 font-body text-on-surface-variant text-base">
                    <span className="material-symbols-outlined text-electric-violet shrink-0 mt-0.5" style={{ fontSize: "18px" }}>{bullet}</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div className="bg-tech-blue-deep rounded-2xl p-8 my-12 text-center">
          <h2 className="text-xl md:text-2xl font-bold font-headline text-white mb-2">{g.cta.heading}</h2>
          <p className="font-body text-white/75 text-sm max-w-lg mx-auto mb-6">{g.cta.body}</p>
          <Link href={g.cta.href}
            className="inline-block bg-white text-on-surface font-semibold font-body px-7 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            {g.cta.label}
          </Link>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-5">{chrome.faqHeading}</h2>
          <div className="space-y-3">
            {g.faqs.map((f, i) => (
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

        {related.length > 0 && (
          <section className="border-t border-border-crisp pt-8">
            <h2 className="text-lg font-bold font-headline text-on-surface mb-4">{chrome.relatedHeading}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map(r => (
                <Link key={r.slug} href={`${chrome.basePath}/${r.slug}`}
                  className="group bg-white rounded-xl border border-border-crisp p-5 hover:border-electric-violet/50 transition-colors">
                  <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">{r.clusterLabel}</span>
                  <h3 className="font-bold font-headline text-on-surface text-base leading-snug mt-2 group-hover:text-electric-violet transition-colors">{r.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
