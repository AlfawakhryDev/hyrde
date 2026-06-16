import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import type { RegisteredFreelancer } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const freelancers = readStore<RegisteredFreelancer[]>("freelancers", []);
  return NextResponse.json({ freelancers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, location, skill, rate, bio, portfolio, assessment } = body;

  if (!name || !email || !skill) {
    return NextResponse.json(
      { error: "name, email, and skill are required" },
      { status: 400 }
    );
  }

  const freelancers = readStore<RegisteredFreelancer[]>("freelancers", []);

  // Prevent duplicate emails
  if (freelancers.some(f => f.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json(
      { error: "A profile with this email already exists" },
      { status: 409 }
    );
  }

  const newFreelancer: RegisteredFreelancer = {
    id: `fl_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    location: location?.trim() || "Remote",
    skill,
    rate: rate?.toString() || "0",
    bio: bio?.trim() || "",
    portfolio: portfolio?.trim() || "",
    joinedAt: new Date().toISOString(),
    ...(assessment ? { assessment } : {}),
  };

  freelancers.unshift(newFreelancer);
  writeStore("freelancers", freelancers);

  return NextResponse.json({ freelancer: newFreelancer }, { status: 201 });
}
