import type { Metadata } from "next";
import PageHead from "@/components/site/PageHead";
import IntakeForm from "@/components/site/IntakeForm";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Beschreiben Sie das Ergebnis, das Sie benötigen. Wir antworten mit Leistungsbeschreibung, Abnahmekriterien und einem Festpreis.",
};

export default function Page() {
  return (
    <>
      <PageHead
        marker="Kontakt"
        title="Beschreiben Sie Ihr Ergebnis."
        intro="Ein kurzer Umriss genügt. Wir melden uns in der Regel innerhalb eines Werktags mit Leistungsbeschreibung, Abnahmekriterien und einem Festpreis."
      />
      <section className="mx-auto max-w-[820px] px-5 py-14 md:px-8 md:py-16">
        <IntakeForm />
      </section>
    </>
  );
}
