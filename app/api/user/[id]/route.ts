import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Participant from "@/models/participant";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    const participant = await Participant.findOne({ participantId: id });

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    return NextResponse.json({ participant }, { status: 200 });
  } catch (error) {
    console.error("Fetch User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await req.json();

    const { present, food } = body;

    const updatedParticipant = await Participant.findOneAndUpdate(
      { participantId: id },
      { $set: { present, food } },
      { new: true }
    );

    if (!updatedParticipant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, participant: updatedParticipant }, { status: 200 });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
