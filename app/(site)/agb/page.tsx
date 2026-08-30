import type { Metadata } from "next";
import PageHead, { PendingLegalNotice } from "@/components/site/PageHead";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen.",
  robots: { index: false },
};

export default function Page() {
  return (
    <>
      <PageHead marker="Rechtliches" title="Allgemeine Geschäftsbedingungen" />
      <section className="mx-auto max-w-[820px] px-5 py-14 md:px-8 md:py-16">
        <PendingLegalNotice />
        <p className="mt-8 text-[13.5px] leading-relaxed text-wv-slate">
          Die AGB werden als versioniertes Dokument geführt; die Zustimmung wird je Nutzer und je
          Version protokolliert. Die verbindliche Fassung folgt nach anwaltlicher Prüfung.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-wv-mist">Version — · gültig ab —</p>
      </section>
    </>
  );
}
