import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Participant from "@/models/participant";

export async function GET() {
  try {
    await dbConnect();
    // Fetch all participants sorted by ID
    const participants = await Participant.find().sort({ participantId: 1 });
    return NextResponse.json({ participants }, { status: 200 });
  } catch (error) {
    console.error("Fetch Participants Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
