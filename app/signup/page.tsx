import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Join Hyrde to hire vetted talent, or get vetted and find work. Free during early access.",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <AuthShell mode="signup">
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
