import { redirect } from "next/navigation";

export default function FreelancerJoinPage() {
  redirect("/signup?next=%2Fvetting");
}
