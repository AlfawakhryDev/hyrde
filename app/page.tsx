import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { altLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { absolute: "Hire Interview-Vetted Freelancers, AI-Matched | Hyrde" },
  description:
    "Every freelancer on Hyrde passed an adaptive AI skill interview. Post a task and the AI matches it to the best-vetted specialist in that category. No bidding, no proposal spam, no pay-to-apply.",
  alternates: { canonical: "/", languages: altLanguages("/", "/de") },
  openGraph: {
    title: "Hire Interview-Vetted Freelancers, AI-Matched | Hyrde",
    description:
      "AI-vetted talent, matched to your task. No bidding, no proposal spam. Free to hire during early access.",
    url: "https://hyrde.net",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde, AI-vetted freelance talent" }],
  },
};

export default function Home() {
  return <HomePage locale="en" />;
}
