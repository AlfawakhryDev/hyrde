import { redirect } from "next/navigation";

// The client lead form is retired — live signups go through Supabase auth.
export default function GetStartedPage() {
  redirect("/signup");
}
