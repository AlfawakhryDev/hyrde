// ─── Skills database ────────────────────────────────────────────────
export const SKILLS: Record<string, { label: string; category: string; avgRate: number; demand: "high"|"medium"|"low" }> = {
  "react-developer":        { label: "React Developer",        category: "Engineering",  avgRate: 85,  demand: "high"   },
  "fullstack-developer":    { label: "Fullstack Developer",    category: "Engineering",  avgRate: 95,  demand: "high"   },
  "python-developer":       { label: "Python Developer",       category: "Engineering",  avgRate: 80,  demand: "high"   },
  "node-developer":         { label: "Node.js Developer",      category: "Engineering",  avgRate: 75,  demand: "high"   },
  "mobile-developer":       { label: "Mobile Developer",       category: "Engineering",  avgRate: 90,  demand: "high"   },
  "devops-engineer":        { label: "DevOps Engineer",        category: "Engineering",  avgRate: 100, demand: "high"   },
  "data-scientist":         { label: "Data Scientist",         category: "Data",         avgRate: 95,  demand: "high"   },
  "ml-engineer":            { label: "ML Engineer",            category: "Data",         avgRate: 110, demand: "high"   },
  "data-analyst":           { label: "Data Analyst",           category: "Data",         avgRate: 65,  demand: "medium" },
  "ux-designer":            { label: "UX Designer",            category: "Design",       avgRate: 75,  demand: "high"   },
  "ui-designer":            { label: "UI Designer",            category: "Design",       avgRate: 70,  demand: "high"   },
  "product-designer":       { label: "Product Designer",       category: "Design",       avgRate: 85,  demand: "high"   },
  "brand-designer":         { label: "Brand Designer",         category: "Design",       avgRate: 65,  demand: "medium" },
  "motion-designer":        { label: "Motion Designer",        category: "Design",       avgRate: 70,  demand: "medium" },
  "copywriter":             { label: "Copywriter",             category: "Writing",      avgRate: 55,  demand: "medium" },
  "content-writer":         { label: "Content Writer",         category: "Writing",      avgRate: 45,  demand: "medium" },
  "technical-writer":       { label: "Technical Writer",       category: "Writing",      avgRate: 60,  demand: "medium" },
  "seo-specialist":         { label: "SEO Specialist",         category: "Marketing",    avgRate: 55,  demand: "medium" },
  "social-media-manager":   { label: "Social Media Manager",   category: "Marketing",    avgRate: 45,  demand: "medium" },
  "growth-marketer":        { label: "Growth Marketer",        category: "Marketing",    avgRate: 75,  demand: "high"   },
  "video-editor":           { label: "Video Editor",           category: "Creative",     avgRate: 55,  demand: "medium" },
  "3d-designer":            { label: "3D Designer",            category: "Creative",     avgRate: 65,  demand: "medium" },
  "wordpress-developer":    { label: "WordPress Developer",    category: "Engineering",  avgRate: 50,  demand: "medium" },
  "shopify-developer":      { label: "Shopify Developer",      category: "Engineering",  avgRate: 60,  demand: "high"   },
  "blockchain-developer":   { label: "Blockchain Developer",   category: "Engineering",  avgRate: 120, demand: "medium" },
};

export const CITIES: Record<string, { label: string; country: string; region: string; multiplier: number }> = {
  "new-york":       { label: "New York",       country: "US", region: "North America", multiplier: 1.3  },
  "san-francisco":  { label: "San Francisco",  country: "US", region: "North America", multiplier: 1.4  },
  "london":         { label: "London",         country: "UK", region: "Europe",        multiplier: 1.2  },
  "berlin":         { label: "Berlin",         country: "DE", region: "Europe",        multiplier: 1.0  },
  "amsterdam":      { label: "Amsterdam",      country: "NL", region: "Europe",        multiplier: 1.1  },
  "dubai":          { label: "Dubai",          country: "AE", region: "MENA",          multiplier: 1.15 },
  "cairo":          { label: "Cairo",          country: "EG", region: "MENA",          multiplier: 0.65 },
  "toronto":        { label: "Toronto",        country: "CA", region: "North America", multiplier: 1.1  },
  "sydney":         { label: "Sydney",         country: "AU", region: "APAC",          multiplier: 1.15 },
  "singapore":      { label: "Singapore",      country: "SG", region: "APAC",          multiplier: 1.2  },
  "barcelona":      { label: "Barcelona",      country: "ES", region: "Europe",        multiplier: 0.9  },
  "remote":         { label: "Remote",         country: "",   region: "Global",        multiplier: 1.0  },
};

export function getSkillData(slug: string) {
  return SKILLS[slug] ?? null;
}

export function getCityData(slug: string) {
  return CITIES[slug] ?? null;
}

export function getRate(skillSlug: string, citySlug: string): number {
  const skill = SKILLS[skillSlug];
  const city  = CITIES[citySlug];
  if (!skill || !city) return 0;
  return Math.round(skill.avgRate * city.multiplier);
}

export const ALL_SKILL_SLUGS = Object.keys(SKILLS);
export const ALL_CITY_SLUGS  = Object.keys(CITIES);

// ─── Mock freelancer data ────────────────────────────────────────────
export const MOCK_FREELANCERS = [
  { id: "1", name: "Sara R.",    skill: "react-developer",   rate: 90,  score: 96, bio: "6 yrs React, ex-Stripe. Shipped 3 SaaS products from 0→1.",         location: "remote"     },
  { id: "2", name: "Mo K.",      skill: "react-developer",   rate: 75,  score: 91, bio: "React + TypeScript specialist. Fintech focus. Fast iterations.",    location: "cairo"      },
  { id: "3", name: "Ana L.",     skill: "react-developer",   rate: 85,  score: 84, bio: "Full-stack React/Node. 5 yrs. Open-source contributor.",             location: "barcelona"  },
  { id: "4", name: "James T.",   skill: "ux-designer",       rate: 80,  score: 94, bio: "UX lead ex-Figma. Zero-to-one product design. B2B SaaS expert.",     location: "london"     },
  { id: "5", name: "Lena M.",    skill: "ux-designer",       rate: 70,  score: 88, bio: "Research-led design. 4 yrs. Mobile-first. Figma certified.",         location: "berlin"     },
  { id: "6", name: "Omar S.",    skill: "data-scientist",    rate: 100, score: 92, bio: "ML + analytics. Python/SQL/dbt. Ex-McKinsey data team.",             location: "dubai"      },
  { id: "7", name: "Priya N.",   skill: "copywriter",        rate: 55,  score: 89, bio: "B2B SaaS copy. 200+ landing pages shipped. Conversion-focused.",     location: "remote"     },
  { id: "8", name: "Carlos B.",  skill: "shopify-developer", rate: 60,  score: 87, bio: "100+ Shopify stores. Custom themes + apps. 5-star rated.",           location: "toronto"    },
];
