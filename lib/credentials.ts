// ── Who vouches for us ─────────────────────────────────────────────────────
// Add a line to this list and it appears in the top bar and in the strip on
// the home page. Nothing else needs touching.
//
// Wording matters here. NVIDIA Inception is a free programme for startups: its
// members are not funded, invested in, or endorsed by NVIDIA, and NVIDIA's own
// terms do not allow a member to imply otherwise. "Member of NVIDIA Inception"
// is accurate and is what the programme asks for. "Backed by NVIDIA" is not,
// and it is the kind of claim a client's lawyer notices.
//
// Logos are deliberately absent. Using a company's mark needs their permission,
// and most programmes hand members a specific badge asset for the purpose. Drop
// one in `logo` when you have it; the strip will use it instead of the text.

export interface Credential {
  id: string;
  /** The organisation, as they write it. */
  name: string;
  /** The relationship, in their words: "Member", "Partner", "Portfolio". */
  relation: string;
  /** Where a sceptical reader can check. */
  href?: string;
  /** Path under /public to an official badge, when one has been granted. */
  logo?: string;
}

export const CREDENTIALS: Credential[] = [
  {
    id: "nvidia-inception",
    name: "NVIDIA Inception",
    relation: "Member",
    href: "https://www.nvidia.com/en-us/startups/",
  },
];

export const hasCredentials = CREDENTIALS.length > 0;
