import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://hyrde.net"),
  title: { default: "Hyrde — AI-native freelance platform", template: "%s | Hyrde" },
  description: "The AI-native freelance platform. Clients describe what they need and get the top 5 matches in 60 seconds. Freelancers get AI agents that find work, write intros, and review contracts. Freelancers keep 100% — clients pay a flat 8% only when they hire.",
  openGraph: { siteName: "Hyrde", type: "website" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hyrde",
  url: "https://hyrde.net",
  logo: "https://hyrde.net/hyrde-lockup-dark.svg",
  description:
    "AI-native freelance platform. Pre-vetted talent, AI-matched to your brief in 60 seconds, at a flat 8% fee.",
  email: "abdelrahman@hyrde.net",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
