import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/team";

export async function GET() {
  try {
    await connectDB();
    const members = await Team.find().sort({ createdAt: 1 });
    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch team:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    
    if (!body.name || !body.role || !body.image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newMember = await Team.create(body);
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Failed to create team member:", error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
