import type { Metadata } from "next";
import { readStore } from "@/lib/store";
import type { Job } from "@/lib/types";
import JobBoard from "./JobBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Projects",
  description: "Open freelance projects. Write an AI proposal in seconds. No connects, no fees to apply.",
};

export default function JobsPage() {
  const jobs = readStore<Job[]>("jobs", []);
  return <JobBoard jobs={jobs} />;
}
