import { redirect } from "next/navigation";

// The waitlist form is retired — live signups go through Supabase auth.
// Freelancer intent: after signup + onboarding, land on the vetting interview.
export default function JoinPage() {
  redirect("/signup?next=%2Fvetting");
}
