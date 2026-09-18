import type { Metadata } from "next";
import ComparisonPage from "@/components/marketing/ComparisonPage";
import { COMPETITORS } from "@/content/compare";

const c = COMPETITORS.fiverr;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: { canonical: "/fiverr-alternative" },
  openGraph: { title: c.metaTitle, description: c.metaDescription, url: "/fiverr-alternative" },
};

export default function FiverrAlternativePage() {
  return <ComparisonPage c={c} />;
}
