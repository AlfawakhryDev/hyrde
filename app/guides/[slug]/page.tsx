import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GUIDES, GUIDE_SLUGS, getGuide } from "@/lib/guides";
import GuideArticle, { EN_CHROME, guideMetadata } from "@/components/guides/GuideArticle";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return GUIDE_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  return g ? guideMetadata(EN_CHROME, g) : {};
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  return (
    <GuideArticle
      chrome={EN_CHROME}
      guide={g}
      related={g.related.map(s => GUIDES[s]).filter(Boolean)}
    />
  );
}
