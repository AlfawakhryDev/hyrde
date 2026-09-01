import type { Locale } from "./i18n";

// Single source of truth for the site FAQ. BLUF (bottom-line-up-front), atomic
// answers built to be quoted by answer engines (ChatGPT, Google AI Overviews,
// Perplexity, Gemini) and to power FAQPage structured data. Used by /faq,
// /de/faq, and the homepage FAQ section — keep them consistent by importing here.
export interface Faq {
  q: string;
  a: string;
}

const EN: Faq[] = [
  {
    q: "What is Hyrde?",
    a: "Hyrde is an AI-native freelance platform where you describe an outcome or task and the AI matches it to a single interview-vetted specialist. There is no bidding and no proposal spam, and hiring is free during early access.",
  },
  {
    q: "How does Hyrde work?",
    a: "You describe what you need in a sentence. The AI scopes it into a milestone plan, prices each step, and matches the best interview-vetted specialist to each milestone. An AI reviews the deliverable against your brief before you pay.",
  },
  {
    q: "How much does Hyrde cost?",
    a: "Hiring on Hyrde is free during early access. Paid client plans are Pro at $20 per month (50 posts) and Scale at $200 per month (unlimited). Freelancers keep 100% of what they earn, with no connects or bid fees.",
  },
  {
    q: "How are freelancers vetted on Hyrde?",
    a: "Every freelancer passes an adaptive AI skill interview in their category before they can be matched. It is about 10 minutes: a real scenario, a probe into their own answer, a live work sample, and a shipped-project deep dive, graded 0 to 100 against a strict rubric.",
  },
  {
    q: "Is Hyrde legit and safe to use?",
    a: "Yes. Freelancers are interview-vetted rather than self-reported, an AI reviews the work against your brief before you pay, and you can cancel an unmatched or in-progress project at any time. Delivered and paid work is protected.",
  },
  {
    q: "How is Hyrde different from Upwork or Fiverr?",
    a: "On Hyrde there is no bidding and no proposals to sift through. The AI assigns one vetted specialist instead of flooding you with applicants, and freelancers keep 100% of their pay because there are no connects, bid fees, or platform commissions.",
  },
  {
    q: "What does 'hire an outcome' mean?",
    a: "Instead of hiring one freelancer for one task, you describe the whole result you want, like an MVP or a redesigned Shopify store. Hyrde breaks it into milestones and matches a specialist to each step, so you manage a plan rather than a pile of freelancers.",
  },
  {
    q: "Who can use Hyrde?",
    a: "Clients hiring for development, design, writing, marketing, and data work, and freelancers in those categories who pass the AI interview. Hyrde is available worldwide, and freelancers get paid on their own rails including InstaPay, Airtm, PayPal, and USDT.",
  },
  {
    q: "Can I estimate a project cost before hiring?",
    a: "Yes. Hyrde's free cost estimator gives a milestone breakdown with realistic cost ranges and a timeline for any project, with no signup required.",
  },
];

const DE: Faq[] = [
  {
    q: "Was ist Hyrde?",
    a: "Hyrde ist eine KI-native Freelance-Plattform. Du beschreibst ein Ergebnis oder eine Aufgabe, und die KI vermittelt dir einen einzelnen, im Interview geprüften Spezialisten. Es gibt keine Ausschreibungen und keinen Angebots-Spam, und das Beauftragen ist im Early Access kostenlos.",
  },
  {
    q: "Wie funktioniert Hyrde?",
    a: "Du beschreibst in einem Satz, was du brauchst. Die KI zerlegt es in einen Meilenstein-Plan, kalkuliert jeden Schritt und vermittelt für jeden Meilenstein den besten geprüften Spezialisten. Eine KI prüft die Lieferung gegen deinen Auftrag, bevor du bezahlst.",
  },
  {
    q: "Was kostet Hyrde?",
    a: "Das Beauftragen ist im Early Access kostenlos. Bezahlte Kundentarife sind Pro für 20 USD pro Monat (50 Aufträge) und Scale für 200 USD pro Monat (unbegrenzt). Freelancer behalten 100 Prozent, ohne Gebühren fürs Bewerben oder Bieten.",
  },
  {
    q: "Wie werden Freelancer bei Hyrde geprüft?",
    a: "Jeder Freelancer besteht vor der Vermittlung ein adaptives KI-Fachinterview in seiner Kategorie. Es dauert etwa 10 Minuten: ein reales Szenario, eine Nachfrage zur eigenen Antwort, eine kleine Arbeitsprobe und eine Vertiefung zu einem echten Projekt, bewertet von 0 bis 100 nach einem strengen Raster.",
  },
  {
    q: "Ist Hyrde seriös und sicher?",
    a: "Ja. Freelancer werden im Interview geprüft statt per Selbstauskunft, eine KI prüft die Arbeit gegen deinen Auftrag, bevor du zahlst, und ein noch nicht vermitteltes oder laufendes Projekt kannst du jederzeit abbrechen. Gelieferte und bezahlte Arbeit ist geschützt.",
  },
  {
    q: "Wie unterscheidet sich Hyrde von Upwork oder Fiverr?",
    a: "Bei Hyrde gibt es kein Bieten und keine Angebote zum Durchsehen. Die KI vermittelt einen geprüften Spezialisten, statt dich mit Bewerbern zu überschwemmen, und Freelancer behalten 100 Prozent, weil es keine Bewerbungs- oder Bietgebühren und keine Plattformprovision gibt.",
  },
  {
    q: "Was bedeutet ein Ergebnis beauftragen?",
    a: "Statt einen Freelancer für eine einzelne Aufgabe zu beauftragen, beschreibst du das ganze Ergebnis, etwa ein MVP oder einen überarbeiteten Shopify-Shop. Hyrde zerlegt es in Meilensteine und vermittelt für jeden Schritt einen Spezialisten, sodass du einen Plan managest statt einen Stapel Freelancer.",
  },
  {
    q: "Kann ich vorab die Projektkosten schätzen?",
    a: "Ja. Der kostenlose Kostenrechner von Hyrde liefert für jedes Projekt eine Meilenstein-Aufschlüsselung mit realistischen Preisspannen und einem Zeitrahmen, ganz ohne Anmeldung.",
  },
];

const AR: Faq[] = [
  {
    q: "ما هو Hyrde؟",
    a: "Hyrde منصّة عمل حر مبنيّة على الذكاء الاصطناعي، تصف فيها نتيجة أو مهمة فيوفّق لها الذكاء الاصطناعي مختصًّا واحدًا موثّقًا بالمقابلة. لا مزايدات ولا رسائل عروض مزعجة، والتوظيف مجاني خلال الوصول المبكر.",
  },
  {
    q: "كيف يعمل Hyrde؟",
    a: "تصف ما تحتاجه في جملة. يقسّمه الذكاء الاصطناعي إلى خطة مراحل، ويسعّر كل خطوة، ويوفّق لكل مرحلة أفضل مختصّ موثّق بالمقابلة. ويراجع ذكاء اصطناعي التسليم مقابل وصفك قبل أن تدفع.",
  },
  {
    q: "كم تكلفة Hyrde؟",
    a: "التوظيف على Hyrde مجاني خلال الوصول المبكر. الخطط المدفوعة للعملاء هي Pro بـ20 دولارًا شهريًا (50 مهمة) وScale بـ200 دولار شهريًا (بلا حدود). يحتفظ المستقلّون بـ100٪ مما يكسبون، دون رسوم تقديم أو مزايدة.",
  },
  {
    q: "كيف يُوثَّق المستقلّون على Hyrde؟",
    a: "كل مستقلّ يجتاز مقابلة مهارة تكيّفية بالذكاء الاصطناعي في مجاله قبل أن يُوفَّق له عمل. تستغرق نحو 10 دقائق: سيناريو واقعي، وتعمّق في إجابته، وعيّنة عمل حية، وغوص في مشروع سلّمه فعلاً، مُقيَّمة من 0 إلى 100 وفق معيار صارم.",
  },
  {
    q: "هل Hyrde موثوق وآمن؟",
    a: "نعم. المستقلّون موثّقون بالمقابلة لا بالإقرار الذاتي، ويراجع ذكاء اصطناعي العمل مقابل وصفك قبل أن تدفع، ويمكنك إلغاء مشروع لم يُوفَّق بعد أو قيد التنفيذ في أي وقت. العمل المُسلَّم والمدفوع محمي.",
  },
  {
    q: "بماذا يختلف Hyrde عن Upwork أو Fiverr؟",
    a: "على Hyrde لا توجد مزايدة ولا عروض تتصفّحها. يُسنِد الذكاء الاصطناعي مختصًّا موثّقًا واحدًا بدلاً من إغراقك بالمتقدّمين، ويحتفظ المستقلّون بـ100٪ من أجرهم لأنّه لا رسوم تقديم أو مزايدة ولا عمولة منصّة.",
  },
  {
    q: "ماذا يعني «وظّف نتيجة»؟",
    a: "بدلاً من توظيف مستقلّ واحد لمهمة واحدة، تصف النتيجة كاملةً التي تريدها، مثل نسخة أولية MVP أو متجر Shopify مُعاد تصميمه. يقسّمها Hyrde إلى مراحل ويوفّق لكل خطوة مختصًّا، فتدير خطة بدل كومة من المستقلين.",
  },
  {
    q: "من يمكنه استخدام Hyrde؟",
    a: "العملاء الذين يوظّفون في التطوير والتصميم والكتابة والتسويق والبيانات، والمستقلّون في تلك المجالات ممن يجتازون مقابلة الذكاء الاصطناعي. Hyrde متاح عالميًا، ويقبض المستقلّون على قنواتهم الخاصة، ومنها InstaPay وAirtm وPayPal وUSDT.",
  },
  {
    q: "هل أستطيع تقدير تكلفة المشروع قبل التوظيف؟",
    a: "نعم. يمنحك مقدّر التكلفة المجاني من Hyrde تفصيلاً بالمراحل مع نطاقات تكلفة واقعية وجدولاً زمنيًا لأي مشروع، دون الحاجة إلى تسجيل.",
  },
];

export function faqFor(locale: Locale): Faq[] {
  if (locale === "de") return DE;
  if (locale === "ar") return AR;
  return EN;
}

// FAQPage JSON-LD for a given set of Q&As.
export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
