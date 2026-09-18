import { redirect } from "next/navigation";

// The live console moved onto the homepage — the demo IS the landing page now.
export default function ArenaPage() {
  redirect("/");
}
