import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://hyrde.net"),
  title: { default: "Hyrde — AI-native freelance platform", template: "%s | Hyrde" },
  description: "The AI-native freelance platform. Clients describe what they need and get the top 5 matches in 60 seconds. Freelancers get AI agents that find work, write intros, and review contracts. Freelancers keep 100% — and hiring is free during early access.",
  keywords: [
    "hire freelancers", "AI freelance platform", "Upwork alternative",
    "Fiverr alternative", "vetted freelancers", "hire developers",
    "hire designers", "freelance marketplace", "AI talent matching",
  ],
  openGraph: {
    siteName: "Hyrde",
    type: "website",
    url: "https://hyrde.net",
    title: "Hyrde — Hire pre-vetted freelancers, AI-matched in 60 seconds",
    description: "Describe your project; get the top 5 vetted freelancers in 60 seconds. No bidding. Free to hire — early access.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde — AI-native freelance platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyrde — Hire pre-vetted freelancers, AI-matched in 60 seconds",
    description: "Describe your project; get the top 5 vetted freelancers in 60 seconds. No bidding. Free to hire — early access.",
    images: ["/og.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hyrde",
  url: "https://hyrde.net",
  logo: "https://hyrde.net/hyrde-lockup-dark.svg",
  image: "https://hyrde.net/og.png",
  description:
    "AI-native freelance platform. Pre-vetted talent, AI-matched to your brief in 60 seconds — free to hire during early access.",
  email: "abdelrahman@hyrde.net",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hyrde",
  url: "https://hyrde.net",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://hyrde.net/hire?q={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* No-flash theme: dark by default, honor a saved light choice before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})();`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
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
