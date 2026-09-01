import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { altLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  // Brand-led title: "hyrde" is the only query that earns clicks (242 impr,
  // pos 5.4, 10 of 18 total clicks) and competes with an unrelated Hyrde IoT
  // company, so the brand goes first and the description answers "what is it".
  title: { absolute: "Hyrde — Hire Interview-Vetted Freelancers, AI-Matched" },
  description:
    "Hyrde is an AI-native freelance platform. Describe an outcome or task and the AI matches it to one interview-vetted specialist — no bidding, no proposal spam, no pay-to-apply. Freelancers keep 100%, and hiring is free during early access.",
  alternates: { canonical: "/", languages: altLanguages("/", "/de", "/ar") },
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
