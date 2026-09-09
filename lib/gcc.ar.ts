// ─── Arabic GCC city landing pages ──────────────────────────────────
// Search Console (2026-09-01) shows genuine Gulf hiring demand — UAE alone
// produced 50 impressions and queries like "shopify developer dubai" /
// "ui designer dubai" — but all of it in English, because no Arabic surface
// existed. These pages are the Arabic-language surface for that demand.
//
// Each city carries its own market note, local currency, and FAQ answers, so
// the set is not a template swap: `note` and `demand` differ per city.
import { SKILLS, getRate } from "./data";

export interface ArCity {
  slug: string;          // matches CITIES slug in lib/data.ts
  name: string;          // Arabic city name
  country: string;       // Arabic country name
  countryCode: string;
  currency: string;      // Arabic currency name
  currencyCode: string;
  perUsd: number;        // local units per 1 USD, for rate conversion
  note: string;          // city-specific market context (unique per city)
  demand: string;        // what this city actually hires for
}

export const AR_CITIES: Record<string, ArCity> = {
  riyadh: {
    slug: "riyadh",
    name: "الرياض",
    country: "السعودية",
    countryCode: "SA",
    currency: "ريال سعودي",
    currencyCode: "SAR",
    perUsd: 3.75,
    note:
      "الرياض اليوم مركز الطلب الأول على العمل الحر في السعودية، مدفوعاً بتوسّع الشركات الناشئة والمشاريع الكبرى ضمن رؤية 2030. النتيجة أن الطلب على المطوّرين والمصمّمين ومحلّلي الأعمال يفوق المعروض المحلي، فتلجأ كثير من الفرق إلى مستقلين عن بُعد لسدّ الفجوة بسرعة.",
    demand:
      "الأكثر طلباً في الرياض: تطوير المتاجر الإلكترونية، تصميم واجهات وتجربة المستخدم، النمذجة المالية وتحليل البيانات، وإعداد العروض التقديمية للمستثمرين والجهات الحكومية.",
  },
  jeddah: {
    slug: "jeddah",
    name: "جدة",
    country: "السعودية",
    countryCode: "SA",
    currency: "ريال سعودي",
    currencyCode: "SAR",
    perUsd: 3.75,
    note:
      "جدة مركز تجاري وعائلي عريق، وأغلب الطلب فيها يأتي من شركات قائمة تنتقل إلى البيع الإلكتروني وتطوير هويّتها الرقمية، لا من شركات ناشئة تبني من الصفر. لذلك تميل المشاريع إلى نطاق أوضح وميزانية محدّدة، وهو ما يناسب التعاقد بالمشروع لا بالساعة.",
    demand:
      "الأكثر طلباً في جدة: متاجر Shopify ووردبريس، إدارة المحتوى والتسويق الرقمي، الهوية البصرية، والمساعدة الإدارية عن بُعد.",
  },
  dubai: {
    slug: "dubai",
    name: "دبي",
    country: "الإمارات",
    countryCode: "AE",
    currency: "درهم إماراتي",
    currencyCode: "AED",
    perUsd: 3.67,
    note:
      "دبي هي المدينة الخليجية الأعلى طلباً على المستقلين في بيانات البحث لدينا، وتتصدّرها طلبات مطوّري المتاجر ومصمّمي الواجهات ومحرّري الفيديو. السوق فيها تنافسي ومتعدّد الجنسيات، ما يعني أن جودة التنفيذ وسرعته يفرقان أكثر من السعر وحده.",
    demand:
      "الأكثر طلباً في دبي: تطوير متاجر Shopify، تصميم واجهات وتجربة المستخدم، مونتاج الفيديو والمحتوى الإعلاني، والتسويق الرقمي والنمو.",
  },
  "abu-dhabi": {
    slug: "abu-dhabi",
    name: "أبوظبي",
    country: "الإمارات",
    countryCode: "AE",
    currency: "درهم إماراتي",
    currencyCode: "AED",
    perUsd: 3.67,
    note:
      "أبوظبي أقرب إلى المشاريع المؤسسية والحكومية منها إلى المشاريع السريعة، فالمتطلبات فيها أدقّ والتوثيق أهم. يفيدك هنا أن تكتب معايير قبول واضحة منذ البداية، وأن تتعامل مع مستقل يجيد العمل ضمن نطاق محدّد ومراحل مُعتمَدة.",
    demand:
      "الأكثر طلباً في أبوظبي: تحليل البيانات والتقارير، النمذجة المالية، إعداد العروض والمستندات، وتطوير الأنظمة والمواقع المؤسسية.",
  },
  doha: {
    slug: "doha",
    name: "الدوحة",
    country: "قطر",
    countryCode: "QA",
    currency: "ريال قطري",
    currencyCode: "QAR",
    perUsd: 3.64,
    note:
      "سوق الدوحة أصغر حجماً من دبي والرياض لكنه مركّز: عدد أقل من المشاريع بميزانيات أعلى نسبياً. المعروض المحلي من المستقلين محدود، لذا الاعتماد على مستقلين موثّقين عن بُعد هو الخيار العملي لأغلب الفرق.",
    demand:
      "الأكثر طلباً في الدوحة: المواقع والمتاجر الإلكترونية، الهوية البصرية والعروض التقديمية، المحتوى ثنائي اللغة، وتحليل البيانات.",
  },
  "kuwait-city": {
    slug: "kuwait-city",
    name: "مدينة الكويت",
    country: "الكويت",
    countryCode: "KW",
    currency: "دينار كويتي",
    currencyCode: "KWD",
    perUsd: 0.31,
    note:
      "الكويت من أنشط أسواق التجارة الإلكترونية عبر إنستغرام والمتاجر الصغيرة في الخليج، وأغلب الطلب على المستقلين يأتي من أصحاب هذه المتاجر: متجر يُبنى، محتوى يُصوَّر، وإعلانات تُدار. المشاريع غالباً قصيرة ومتكرّرة، فيناسبها التعاقد بالمهمة.",
    demand:
      "الأكثر طلباً في مدينة الكويت: متاجر Shopify وسلة، تصوير ومونتاج المحتوى، إدارة الإعلانات، وتصميم الهوية والمنشورات.",
  },
  dammam: {
    slug: "dammam",
    name: "الدمّام",
    country: "السعودية",
    countryCode: "SA",
    currency: "ريال سعودي",
    currencyCode: "SAR",
    perUsd: 3.75,
    note:
      "المنطقة الشرقية سوق صناعي قبل أن يكون سوقاً رقمياً: أرامكو ومقاوّلوها وسلاسل التوريد المرتبطة بهم. الطلب هنا لا يشبه الرياض، فهو يميل إلى أنظمة داخلية ولوحات متابعة وتقارير امتثال أكثر من متاجر إلكترونية أو هويّات بصرية.",
    demand:
      "الأكثر طلباً في الدمّام والخبر: لوحات بيانات وتقارير تشغيلية، أتمتة العمليات الداخلية، الكتابة التقنية والتوثيق، وترجمة الوثائق الهندسية بين العربية والإنجليزية.",
  },
  manama: {
    slug: "manama",
    name: "المنامة",
    country: "البحرين",
    countryCode: "BH",
    currency: "دينار بحريني",
    currencyCode: "BHD",
    perUsd: 0.376,
    note:
      "البحرين سوق صغير لكنه مبكّر التبنّي، وتاريخها كمركز مصرفي إقليمي يجعل أغلب الطلب فيها من الخدمات المالية والتقنية المالية. الفرق هنا أصغر وميزانياتها أدقّ، فتلجأ إلى المستقلين لمهام محدّدة بدل التوظيف الكامل.",
    demand:
      "الأكثر طلباً في المنامة: تطوير الواجهات لتطبيقات مالية، الامتثال والتوثيق التنظيمي، تحليل البيانات، والمحتوى ثنائي اللغة للمؤسسات المالية.",
  },
  muscat: {
    slug: "muscat",
    name: "مسقط",
    country: "عُمان",
    countryCode: "OM",
    currency: "ريال عُماني",
    currencyCode: "OMR",
    perUsd: 0.385,
    note:
      "عُمان في مرحلة تنويع اقتصادي أحدث من جيرانها، والطلب فيها ينمو من قطاعي السياحة واللوجستيات أكثر من التقنية البحتة. الميزانيات أقرب إلى الواقعية منها إلى السخاء، والمشاريع غالباً أصغر نطاقاً وأوضح تسليماً.",
    demand:
      "الأكثر طلباً في مسقط: مواقع السياحة والضيافة، المحتوى العربي والتسويق الرقمي، التصوير وتحرير الفيديو، ومواقع الحجز والدفع.",
  },
};

export const AR_CITY_SLUGS = Object.keys(AR_CITIES);
export function getArCity(slug: string): ArCity | null {
  return AR_CITIES[slug] ?? null;
}

// Skills shown in the per-city rate table. Arabic labels live here rather than
// in SKILLS so the English taxonomy stays untouched.
export const AR_SKILL_LABELS: Record<string, string> = {
  "shopify-developer": "مطوّر متاجر Shopify",
  "wordpress-developer": "مطوّر ووردبريس",
  "fullstack-developer": "مطوّر full-stack",
  "mobile-developer": "مطوّر تطبيقات جوال",
  "ui-designer": "مصمّم واجهات",
  "ux-designer": "مصمّم تجربة مستخدم",
  "video-editor": "محرّر فيديو",
  "growth-marketer": "مختصّ تسويق ونمو",
  "content-writer": "كاتب محتوى",
  "data-analyst": "محلّل بيانات",
  "financial-modeler": "مُعِدّ نماذج مالية",
  "presentation-designer": "مصمّم عروض تقديمية",
};

export const AR_RATE_SKILLS = Object.keys(AR_SKILL_LABELS);

// Hourly rate for a skill in a city, in USD and the city's local currency.
export function arRateFor(skill: string, city: ArCity) {
  const usd = getRate(skill, city.slug);
  return { usd, local: Math.round(usd * city.perUsd) };
}

export function arCityHasSkill(skill: string): boolean {
  return SKILLS[skill] !== undefined;
}
