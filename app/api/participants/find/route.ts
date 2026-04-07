import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Participant from "@/models/participant";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const participant = await Participant.findOne({ 
      email: { $regex: new RegExp(`^${email.trim()}$`, "i") } 
    });

    if (!participant) {
      return NextResponse.json({ error: "No ticket found for this email" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      participantId: participant.participantId 
    }, { status: 200 });
  } catch (error) {
    console.error("Find Participant Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
