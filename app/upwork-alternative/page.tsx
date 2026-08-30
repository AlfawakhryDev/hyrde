import type { Metadata } from "next";
import ComparisonPage from "@/components/ComparisonPage";
import { COMPETITORS } from "@/lib/compare";

const c = COMPETITORS.upwork;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: { canonical: "/upwork-alternative" },
  openGraph: { title: c.metaTitle, description: c.metaDescription, url: "/upwork-alternative" },
};

export default function UpworkAlternativePage() {
  return <ComparisonPage c={c} />;
}
