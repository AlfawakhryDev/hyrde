import { redirect } from "next/navigation";

// During early access we capture hiring intent as inbound leads rather than
// opening the live posting tool. Every "Post a job" / "Find talent" CTA funnels
// here and is redirected to the client signup form.
// The original AI posting demo is preserved at _backup/post-job-page.tsx.bak.
export default function PostJobPage() {
  redirect("/get-started");
}
