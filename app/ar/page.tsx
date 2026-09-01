import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { altLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { absolute: "Hyrde. وظّف مستقلين موثّقين بالذكاء الاصطناعي" },
  description:
    "صِف نتيجة أو مهمة فيوفّق لها الذكاء الاصطناعي مختصًّا موثّقًا بالمقابلة. لا مزايدات ولا رسائل عروض مزعجة. يحتفظ المستقلّون بـ100٪. مجاني للتوظيف خلال الوصول المبكر.",
  alternates: { canonical: "/ar", languages: altLanguages("/", "/de", "/ar") },
  keywords: [
    "توظيف مستقلين", "منصة عمل حر", "مستقلين موثقين", "توظيف مطورين", "توظيف مصممين",
    "العمل الحر السعودية", "فريلانسر السعودية", "منصة فريلانس عربية", "توظيف عن بعد",
    "بديل Upwork", "بديل خمسات", "بديل مستقل", "ذكاء اصطناعي للتوظيف", "وظّف نتيجة",
  ],
  openGraph: {
    title: "Hyrde. وظّف مستقلين موثّقين بالذكاء الاصطناعي",
    description: "صِف نتيجة، واحصل على مختصّ موثّق بالمقابلة. لا مزايدات. مجاني خلال الوصول المبكر.",
    url: "https://hyrde.net/ar",
    locale: "ar_SA",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde" }],
  },
};

export default function ArabicHome() {
  return (
    <div lang="ar" dir="rtl">
      <HomePage locale="ar" />
    </div>
  );
}
