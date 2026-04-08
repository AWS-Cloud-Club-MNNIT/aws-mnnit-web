import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Participant from "@/models/participant";
import ActivityLog from "@/models/activityLog";
import { emitter } from "@/lib/eventEmitter";

// POST /api/participants/verify — Bulk verify/reject/pending
export async function POST(req: Request) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");
    const managerToken = cookieStore.get("manager_token");

    const isAdmin =
      adminToken &&
      adminToken.value === (process.env.ADMIN_PASSWORD || "awsmnnit");
    const isManager =
      managerToken &&
      managerToken.value ===
        (process.env.MANAGER_PASSWORD || "scdmanagermnnit@2026");

    if (!isAdmin && !isManager) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { participantIds, verificationStatus, note } = body;

    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return NextResponse.json(
        { error: "No participant IDs provided" },
        { status: 400 }
      );
    }

    if (!["pending", "verified", "rejected"].includes(verificationStatus)) {
      return NextResponse.json(
        { error: "Invalid verification status" },
        { status: 400 }
      );
    }

    const performedBy = isAdmin ? "Admin" : "Manager";

    // Fetch participants for logging
    const participantsToUpdate = await Participant.find({
      participantId: { $in: participantIds },
    });

    // Bulk update
    await Participant.updateMany(
      { participantId: { $in: participantIds } },
      {
        $set: {
          verificationStatus,
          verifiedBy: performedBy,
          verifiedAt: new Date(),
        },
      }
    );

    // Write activity logs for each
    const logs = participantsToUpdate.map((p) => ({
      participantId: p.participantId,
      participantName: p.name,
      action: verificationStatus,
      performedBy,
      note: note || undefined,
      timestamp: new Date(),
    }));

    if (logs.length > 0) {
      await ActivityLog.insertMany(logs);
    }

    participantsToUpdate.forEach(p => {
      // Need to merge the updated status since we only fetched it before the updateMany
      emitter.emit("participant_update", {
        ...p.toObject(),
        verificationStatus,
        verifiedBy: performedBy,
        verifiedAt: new Date()
      });
    });

    return NextResponse.json(
      {
        success: true,
        updatedCount: participantsToUpdate.length,
        message: `${participantsToUpdate.length} participant(s) marked as ${verificationStatus}.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bulk Verify Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
