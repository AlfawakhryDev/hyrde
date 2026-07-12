import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Join Hyrde — hire vetted talent or get vetted and find work. Free during early access.",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Join Hyrde"
      title="Create your account"
      subtitle="Pick your side next — hire vetted talent, or pass the interview and get matched to work."
      bullets={[
        "Hiring? The AI matches your task to the best vetted specialist.",
        "Freelancing? Prove your skill once and let matched work come to you.",
        "Keep 100% — no commission, no Connects, no pay-to-apply.",
      ]}
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
