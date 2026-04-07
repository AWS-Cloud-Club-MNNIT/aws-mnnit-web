import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Participant from "@/models/participant";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { participants } = body;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: "Invalid data format or empty list" }, { status: 400 });
    }

    // Find the last participant by creation time to get the highest sequential number
    const lastParticipant = await Participant.findOne().sort({ createdAt: -1 });
    let lastNumber = 0;

    if (lastParticipant?.participantId) {
      const match = lastParticipant.participantId.match(/AWS-SCD-2026(\d+)/);
      if (match) {
        lastNumber = parseInt(match[1], 10);
      }
    }

    // Deduplicate incoming emails against existing records
    const incomingEmails = participants.map((p: any) => p.email?.toLowerCase()).filter(Boolean);
    const existingDocs = await Participant.find(
      { email: { $in: incomingEmails } },
      { email: 1 }
    );
    const existingEmails = new Set(existingDocs.map((d: any) => d.email.toLowerCase()));

    const newParticipants = participants
      .filter((p: any) => p.name && p.email && !existingEmails.has(p.email.toLowerCase()))
      .map((p: any, index: number) => {
        const idNum = (lastNumber + index + 1).toString().padStart(3, "0");
        return {
          participantId: `AWS-SCD-2026${idNum}`,
          name: p.name.trim(),
          email: p.email.trim(),
          college: p.college?.trim() || "Unknown Institution",
          present: false,
          food: false,
        };
      });

    if (newParticipants.length === 0) {
      return NextResponse.json(
        { error: "All participants already exist or no valid rows found." },
        { status: 400 }
      );
    }

    await Participant.insertMany(newParticipants, { ordered: false });

    return NextResponse.json(
      {
        success: true,
        count: newParticipants.length,
        skipped: participants.length - newParticipants.length,
        message: `${newParticipants.length} participant(s) uploaded successfully.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload participants" }, { status: 500 });
  }
}
