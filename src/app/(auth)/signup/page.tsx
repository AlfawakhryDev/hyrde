import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";
import { enabledProviders } from "@/lib/auth/providers";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Join Hyrde to hire vetted talent, or get vetted and find work. First 3 projects, no Hyrde fee.",
  robots: { index: false },
};

export default async function SignupPage() {
  const providers = await enabledProviders();
  return (
    <AuthShell mode="signup">
      <AuthForm mode="signup" providers={providers} />
    </AuthShell>
  );
}
