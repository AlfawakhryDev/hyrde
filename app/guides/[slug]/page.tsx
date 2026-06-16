import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { GUIDES, GUIDE_SLUGS, getGuide } from "@/lib/guides";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return GUIDE_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  const canonical = `/guides/${slug}`;
  return {
    title: g.metaTitle,
    description: g.metaDescription,
    alternates: { canonical },
    openGraph: { title: g.metaTitle, description: g.metaDescription, url: canonical, type: "article" },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const url = `https://hyrde.net/guides/${slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.metaDescription,
    datePublished: g.updated,
    dateModified: g.updated,
    author: { "@type": "Organization", name: "Hyrde" },
    publisher: { "@type": "Organization", name: "Hyrde", url: "https://hyrde.net" },
    mainEntityOfPage: url,
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://hyrde.net" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://hyrde.net/guides" },
      { "@type": "ListItem", position: 3, name: g.title, item: url },
    ],
  };

  const related = g.related.map(s => GUIDES[s]).filter(Boolean);

  return (
    <div className="min-h-screen bg-surface-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <article className="max-w-[760px] mx-auto px-6 md:px-8 pt-20 pb-16">
        <nav className="text-xs font-body text-on-surface-variant mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-electric-violet transition-colors">Home</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-electric-violet transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-on-surface">{g.clusterLabel}</span>
        </nav>

        <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">
          {g.clusterLabel}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-tech-blue-deep leading-tight mt-3 mb-4">
          {g.title}
        </h1>
        <p className="text-xs font-body text-on-surface-variant inline-flex items-center gap-4 mb-8">
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
            {g.readMins} min read
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>update</span>
            Updated {new Date(g.updated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </p>

        <div className="space-y-4 mb-10">
          {g.intro.map((p, i) => (
            <p key={i} className="font-body text-on-surface text-lg leading-relaxed">{p}</p>
          ))}
        </div>

        {g.sections.map((sec, i) => (
          <section key={i} className="mb-10">
            <h2 className="text-2xl font-bold font-headline text-tech-blue-deep mb-4">{sec.h2}</h2>
            <div className="space-y-4">
              {sec.body.map((p, j) => (
                <p key={j} className="font-body text-on-surface-variant text-base leading-relaxed">{p}</p>
              ))}
            </div>
            {sec.bullets && (
              <ul className="mt-4 space-y-2">
                {sec.bullets.map((b, k) => (
                  <li key={k} className="flex items-start gap-3 font-body text-on-surface-variant text-base">
                    <span className="material-symbols-outlined text-electric-violet shrink-0 mt-0.5" style={{ fontSize: "18px" }}>chevron_right</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Inline CTA */}
        <div className="bg-tech-blue-deep rounded-2xl p-8 my-12 text-center">
          <h2 className="text-xl md:text-2xl font-bold font-headline text-white mb-2">{g.cta.heading}</h2>
          <p className="font-body text-white/75 text-sm max-w-lg mx-auto mb-6">{g.cta.body}</p>
          <Link href={g.cta.href}
            className="inline-block bg-white text-tech-blue-deep font-semibold font-body px-7 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            {g.cta.label}
          </Link>
        </div>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold font-headline text-tech-blue-deep mb-5">Frequently asked</h2>
          <div className="space-y-3">
            {g.faqs.map((f, i) => (
              <details key={i} className="bg-white rounded-xl border border-border-crisp p-5 group">
                <summary className="font-semibold font-body text-tech-blue-deep cursor-pointer list-none flex items-center justify-between">
                  {f.q}
                  <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform" style={{ fontSize: "20px" }}>expand_more</span>
                </summary>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-border-crisp pt-8">
            <h2 className="text-lg font-bold font-headline text-tech-blue-deep mb-4">Keep reading</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map(r => (
                <Link key={r.slug} href={`/guides/${r.slug}`}
                  className="group bg-white rounded-xl border border-border-crisp p-5 hover:border-electric-violet/50 transition-colors">
                  <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">{r.clusterLabel}</span>
                  <h3 className="font-bold font-headline text-tech-blue-deep text-base leading-snug mt-2 group-hover:text-electric-violet transition-colors">{r.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
