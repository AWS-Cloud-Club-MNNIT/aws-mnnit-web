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

    // Find the absolute highest participantId sequentially
    const lastParticipant = await Participant.findOne()
      .sort({ participantId: -1 })
      .collation({ locale: 'en_US', numericOrdering: true });
      
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
        { 
          success: true, 
          count: 0, 
          skipped: participants.length, 
          message: `0 new added. ${participants.length} already exist.` 
        },
        { status: 200 }
      );
    }

    let actualInsertedCount = newParticipants.length;

    try {
      await Participant.insertMany(newParticipants, { ordered: false });
    } catch (insertError: any) {
      if (insertError.code === 11000 || insertError.name === 'MongoBulkWriteError') {
        // Ordered: false will throw this if ANY duplicates are found (e.g. race conditions), 
        // but it still successfully inserts the non-duplicates.
        actualInsertedCount = insertError.result?.insertedCount || 0;
      } else {
        throw insertError; // Throw other unpredictable DB errors
      }
    }

    return NextResponse.json(
      {
        success: true,
        count: actualInsertedCount,
        skipped: participants.length - actualInsertedCount,
        message: `${actualInsertedCount} new delegates added. ${participants.length - actualInsertedCount} duplicates skipped.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload participants" }, { status: 500 });
  }
}
