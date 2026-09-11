import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import ThemeSync from "@/components/ThemeSync";
import { THEME_SCRIPT, LOCALE_SCRIPT } from "@/lib/noflash";
import { Analytics } from "@vercel/analytics/next";
import { I18nProvider } from "@/components/I18nProvider";
import ImpersonationBanner from "@/components/ImpersonationBanner";

export const metadata: Metadata = {
  metadataBase: new URL("https://hyrde.net"),
  title: { default: "Hyrde. AI-native freelance platform", template: "%s | Hyrde" },
  description: "Hyrde is the AI-native freelance platform. Describe an outcome or a task and the AI matches it to the one best interview-vetted specialist. No bidding, no proposal spam. Freelancers keep 100%, and your first three projects carry no Hyrde fee.",
  keywords: [
    "hire freelancers", "AI freelance platform", "hire an outcome", "Upwork alternative",
    "Fiverr alternative", "vetted freelancers", "interview vetted freelancers", "hire developers",
    "hire designers", "freelance marketplace", "AI talent matching",
  ],
  // Search-engine ownership verification. Set these in Vercel env and redeploy;
  // undefined values are omitted, so nothing renders until a token is provided.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {},
  },
  openGraph: {
    siteName: "Hyrde",
    type: "website",
    url: "https://hyrde.net",
    title: "Hyrde. Hire pre-vetted freelancers, AI-matched in 60 seconds",
    description: "Describe your project; get the top 5 vetted freelancers in 60 seconds. No bidding. Free to hire. Early access.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde. AI-native freelance platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyrde. Hire pre-vetted freelancers, AI-matched in 60 seconds",
    description: "Describe your project; get the top 5 vetted freelancers in 60 seconds. No bidding. Free to hire. Early access.",
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
    "Hyrde is an AI-native freelance platform. Clients describe an outcome or task and the AI matches it to one interview-vetted specialist. No bidding, no proposal spam. Freelancers keep 100%. Your first three projects carry no Hyrde fee.",
  email: "abdelrahman@hyrde.net",
  slogan: "Don't hire a freelancer. Hire an outcome.",
  foundingDate: "2026",
  areaServed: "Worldwide",
  knowsAbout: [
    "hiring freelancers", "AI talent matching", "vetted freelancers",
    "outcome-based hiring", "freelance marketplace", "no-bidding hiring",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "abdelrahman@hyrde.net",
    contactType: "customer support",
    availableLanguage: ["en", "de", "ar"],
  },
  // sameAs is the strongest entity-consolidation signal for answer engines.
  // The public source repo is a real, verifiable entity link; add LinkedIn/X here
  // once those profiles exist.
  sameAs: ["https://github.com/AlfawakhryDev/hyrde"],
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
    // No className here on purpose. When RootLayout declared `dark`, React
    // reconciled the attribute back to it during hydration and silently undid
    // whatever the no-flash script below had decided — the theme was set
    // correctly before paint and then reverted milliseconds later. The script
    // owns this class; React must not have an opinion about it.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* No-flash theme, resolved before paint. A saved choice always wins;
            with none, app pages open light and marketing keeps its dark art
            direction. The APP list must stay in step with ThemeToggle.tsx. */}
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_SCRIPT,
          }}
        />
        {/* No-flash locale/dir: URL wins on /ar and /de, else the cookie. Sets
            dir=rtl for Arabic before paint so the layout never flips visibly. */}
        <script
          dangerouslySetInnerHTML={{
            __html: LOCALE_SCRIPT,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300..700&display=swap"
          rel="stylesheet"
        />
        {/* Editorial display serif for headlines (optical sizing + soft axis) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&display=swap"
          rel="stylesheet"
        />
        {/* Handwriting for margin annotations on the live demos */}
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Arabic faces. Google serves these behind unicode-range, so the files
            only download when Arabic glyphs are actually painted — English and
            German visitors pay nothing for them. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300..700&family=Noto+Naskh+Arabic:wght@400..700&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <ThemeSync />
        <ImpersonationBanner />
        <I18nProvider>
          <SiteShell>{children}</SiteShell>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
