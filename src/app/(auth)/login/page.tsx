import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";
import { enabledProviders } from "@/lib/auth/providers";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Hyrde account.",
  robots: { index: false },
};

export default async function LoginPage() {
  const providers = await enabledProviders();
  return (
    <AuthShell mode="login">
      <AuthForm mode="login" providers={providers} />
    </AuthShell>
  );
}
