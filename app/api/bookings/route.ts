import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slotLabel, slotIso, name, email, topic } = body;

  if (!slotLabel || !name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const bookings = readStore<Booking[]>("bookings", []);
  const booking: Booking = {
    id: `booking_${Date.now()}`,
    slotLabel,
    slotIso: slotIso || new Date().toISOString(),
    name,
    email,
    topic: topic || "Platform demo",
    createdAt: new Date().toISOString(),
  };
  bookings.unshift(booking);
  writeStore("bookings", bookings.slice(0, 200));

  return NextResponse.json({ booking });
}

export async function GET() {
  const bookings = readStore<Booking[]>("bookings", []);
  return NextResponse.json({ bookings });
}
