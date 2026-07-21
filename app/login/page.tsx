import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Hyrde account.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in"
      subtitle="Post work or pick up matched work, all from your dashboard."
      bullets={[
        "Every freelancer here passed an adaptive AI skill interview.",
        "The AI matches each task to the right specialist. No bidding.",
        "AI reviews the deliverable against your brief before you pay.",
      ]}
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
