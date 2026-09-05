import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DE_GUIDES, DE_GUIDE_SLUGS, getDeGuide } from "@/lib/guides.de";
import GuideArticle, { DE_CHROME, guideMetadata } from "@/components/guides/GuideArticle";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return DE_GUIDE_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = getDeGuide(slug);
  return g ? guideMetadata(DE_CHROME, g) : {};
}

export default async function GermanGuidePage({ params }: Props) {
  const { slug } = await params;
  const g = getDeGuide(slug);
  if (!g) notFound();
  return (
    <GuideArticle
      chrome={DE_CHROME}
      guide={g}
      related={g.related.map(s => DE_GUIDES[s]).filter(Boolean)}
    />
  );
}
