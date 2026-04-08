import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Participant from "@/models/participant";
import ActivityLog from "@/models/activityLog";
import { emitter } from "@/lib/eventEmitter";

// GET /api/participants/[id] — public (verified only, no mobile) or privileged (full)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const isPrivileged = isAdmin || isManager;

    const participant = await Participant.findOne({ participantId: id });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    if (!isPrivileged) {
      // Public access — only if verified
      if (participant.verificationStatus !== "verified") {
        return NextResponse.json(
          { error: "Ticket not available or not verified yet" },
          { status: 403 }
        );
      }

      // Strip sensitive fields
      const raw = participant.toObject();
      const publicData = Object.fromEntries(
        Object.entries(raw).filter(([k]) => k !== "mobile" && k !== "registrationId")
      );
      return NextResponse.json({ participant: publicData }, { status: 200 });
    }

    return NextResponse.json(
      { participant, isAdmin: !!isAdmin, isManager: !!isManager },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch Participant Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/participants/[id] — Admin/Manager only — update verificationStatus
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { verificationStatus, note } = body;

    if (!["pending", "verified", "rejected"].includes(verificationStatus)) {
      return NextResponse.json(
        { error: "Invalid verification status" },
        { status: 400 }
      );
    }

    const performedBy = isAdmin ? "Admin" : "Manager";

    const updatedParticipant = await Participant.findOneAndUpdate(
      { participantId: id },
      {
        $set: {
          verificationStatus,
          verifiedBy: performedBy,
          verifiedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedParticipant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Write to activity log
    await ActivityLog.create({
      participantId: id,
      participantName: updatedParticipant.name,
      action: verificationStatus,
      performedBy,
      note: note || undefined,
      timestamp: new Date(),
    });

    emitter.emit("participant_update", updatedParticipant);

    return NextResponse.json(
      { success: true, participant: updatedParticipant },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification Update Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/participants/[id] — Admin/Manager only
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const deleted = await Participant.findOneAndDelete({ participantId: id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Clean up activity logs for this participant
    await ActivityLog.deleteMany({ participantId: id });

    emitter.emit("participant_delete", { participantId: id });

    return NextResponse.json(
      { success: true, message: `${deleted.name} has been removed.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Participant Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

