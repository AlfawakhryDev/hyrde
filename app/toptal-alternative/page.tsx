import type { Metadata } from "next";
import ComparisonPage from "@/components/ComparisonPage";
import { COMPETITORS } from "@/lib/compare";

const c = COMPETITORS.toptal;

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: { canonical: "/toptal-alternative" },
  openGraph: { title: c.metaTitle, description: c.metaDescription, url: "/toptal-alternative" },
};

export default function ToptalAlternativePage() {
  return <ComparisonPage c={c} />;
}
