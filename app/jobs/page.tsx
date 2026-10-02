import type { Metadata } from "next";
import { readStore } from "@/lib/store";
import type { Job } from "@/lib/types";
import JobBoard from "./JobBoard";

export const dynamic = "force-dynamic";

// Out of search on purpose. This is the one page that sells to freelancers
// rather than clients, and it describes applying and proposals, which the
// product removed when matching became automatic.
export const metadata: Metadata = {
  title: "Browse Projects",
  description: "Open freelance projects on Hyrde.",
  robots: { index: false, follow: true },
};

export default function JobsPage() {
  const jobs = readStore<Job[]>("jobs", []);
  return <JobBoard jobs={jobs} />;
}
