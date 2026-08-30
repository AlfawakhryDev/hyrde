import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import JsonLd from "@/components/site/JsonLd";
import { organizationLd, serviceLd, websiteLd } from "@/lib/seo";

// Self-hosted (next/font) — no request to Google's servers at render time.
// This is deliberate: embedding Google Fonts via <link> to fonts.gstatic.com
// leaks visitor IPs to Google and has been ruled a GDPR violation in Germany
// (LG München, 2022). Our market is DACH, so the fonts must be self-hosted.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"], // latin-ext covers ä ö ü ß and German punctuation
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hyrde.net"),
  title: {
    default: "Hyrde — Definierte Software-Ergebnisse zum Festpreis",
    template: "%s · Hyrde",
  },
  description:
    "Hyrde liefert definierte Software- und Engineering-Ergebnisse für Unternehmen im DACH-Raum — zum Festpreis, per Werkvertrag mit klaren Abnahmekriterien. Umgesetzt von geprüften Spezialisten. Ohne Scheinselbstständigkeitsrisiko.",
  keywords: [
    "Werkvertrag",
    "Scheinselbstständigkeit vermeiden",
    "Festpreis Softwareentwicklung",
    "Cloud Engineering DACH",
    "Data Engineering Dienstleister",
    "KI-Entwicklung Festpreis",
    "IT-Werkleistung",
    "externe Entwicklung ohne Scheinselbstständigkeit",
  ],
  alternates: { canonical: "/" },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {},
  },
  openGraph: {
    siteName: "Hyrde",
    type: "website",
    locale: "de_DE",
    url: "https://hyrde.net",
    title: "Hyrde — Definierte Software-Ergebnisse zum Festpreis",
    description:
      "Ein definiertes Ergebnis, zum Festpreis, per Werkvertrag mit Abnahmekriterien. Umgesetzt von geprüften Spezialisten. Ohne Scheinselbstständigkeitsrisiko.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-DE" className={`${plexSans.variable} ${plexMono.variable}`}>
      <head>
        {/* Entity graph, on-message (Werkleistung provider, not a marketplace, §7). */}
        <JsonLd data={organizationLd} />
        <JsonLd data={serviceLd} />
        <JsonLd data={websiteLd} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
