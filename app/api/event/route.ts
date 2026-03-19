import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/event";

export async function GET() {
  try {
    await connectDB();
    // Sort by date upcoming first relative to now, but simple sort works for now
    const events = await Event.find().sort({ date: 1 });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    
    if (!body.title || !body.slug || !body.description || !body.banner || !body.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newEvent = await Event.create(body);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
