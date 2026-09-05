import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AR_GUIDES, AR_GUIDE_SLUGS, getArGuide } from "@/lib/guides.ar";
import GuideArticle, { AR_CHROME, guideMetadata } from "@/components/guides/GuideArticle";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return AR_GUIDE_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = getArGuide(slug);
  return g ? guideMetadata(AR_CHROME, g) : {};
}

export default async function ArabicGuidePage({ params }: Props) {
  const { slug } = await params;
  const g = getArGuide(slug);
  if (!g) notFound();
  return (
    <GuideArticle
      chrome={AR_CHROME}
      guide={g}
      related={g.related.map(s => AR_GUIDES[s]).filter(Boolean)}
    />
  );
}
