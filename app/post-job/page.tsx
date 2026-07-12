import { redirect } from "next/navigation";

// "Match now" and every post-a-job CTA lands here. The live product is the
// dashboard composer — carry the visitor's brief straight into it. Logged-out
// visitors get bounced through login/signup by the proxy with `next`
// preserved, so the brief survives the whole signup flow.
export default async function PostJobPage({
  searchParams,
}: {
  searchParams: Promise<{ brief?: string }>;
}) {
  const { brief } = await searchParams;
  const target = brief?.trim()
    ? `/dashboard?brief=${encodeURIComponent(brief.trim().slice(0, 500))}`
    : "/dashboard";
  redirect(target);
}
