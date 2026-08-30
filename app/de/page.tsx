import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { altLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { absolute: "Hyrde. Geprüfte Freelancer finden, per KI vermittelt" },
  description:
    "Beschreibe ein Ergebnis oder eine Aufgabe, und die KI vermittelt dir einen im Interview geprüften Spezialisten. Keine Ausschreibungen, kein Angebots-Spam. Freelancer behalten 100 Prozent. Kostenlos im Early Access.",
  alternates: { canonical: "/de", languages: altLanguages("/", "/de") },
  keywords: [
    "Freelancer finden", "geprüfte Freelancer", "Freelancer statt Agentur",
    "Entwickler finden", "Freelancer Deutschland", "Freelancer vermitteln lassen",
    "Upwork Alternative", "Fiverr Alternative", "MVP entwickeln lassen",
  ],
  openGraph: {
    title: "Hyrde. Geprüfte Freelancer finden, per KI vermittelt",
    description: "Beschreibe ein Ergebnis, bekomme einen geprüften Spezialisten vermittelt. Keine Ausschreibungen. Kostenlos im Early Access.",
    url: "https://hyrde.net/de",
    locale: "de_DE",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde" }],
  },
};

export default function GermanHome() {
  return (
    <div lang="de">
      <HomePage locale="de" />
    </div>
  );
}
