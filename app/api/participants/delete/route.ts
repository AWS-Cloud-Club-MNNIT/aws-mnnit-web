import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Participant from "@/models/participant";
import ActivityLog from "@/models/activityLog";

// POST /api/participants/delete — Bulk delete (Admin/Manager only)
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
    const { participantIds } = body;

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

    const result = await Participant.deleteMany({
      participantId: { $in: participantIds },
    });

    // Clean up their activity logs too
    await ActivityLog.deleteMany({ participantId: { $in: participantIds } });

    return NextResponse.json(
      {
        success: true,
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} participant(s) deleted.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
