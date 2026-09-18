import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import type { Job } from "@/content/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const jobs = readStore<Job[]>("jobs", []);
  return NextResponse.json({ jobs });
}
