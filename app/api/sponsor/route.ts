import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sponsor from "@/models/sponsor";

export async function GET() {
  try {
    await connectDB();
    const sponsors = await Sponsor.find().sort({ priority: 1, createdAt: 1 });
    return NextResponse.json(sponsors);
  } catch (error) {
    console.error("Failed to fetch sponsors:", error);
    return NextResponse.json({ error: "Failed to fetch sponsors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();

    if (!body.companyName || !body.category || !body.sponsorType || !body.logo || !body.websiteLink) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (body.priority === undefined || body.priority === null) {
      body.priority = 10;
    }

    const newSponsor = await Sponsor.create(body);
    return NextResponse.json(newSponsor, { status: 201 });
  } catch (error) {
    console.error("Failed to create sponsor:", error);
    return NextResponse.json({ error: "Failed to create sponsor" }, { status: 500 });
  }
}
