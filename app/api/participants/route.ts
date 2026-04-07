import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Participant from "@/models/participant";

export async function GET() {
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

    const isPrivileged = isAdmin || isManager;

    if (isPrivileged) {
      // Admin/Manager get ALL participants with full data including mobile
      const participants = await Participant.find().sort({ participantId: 1 });
      return NextResponse.json({ participants }, { status: 200 });
    } else {
      // Public: only verified participants, mobile stripped
      const participants = await Participant.find(
        { verificationStatus: "verified" },
        { mobile: 0, registrationId: 0 }
      ).sort({ participantId: 1 });
      return NextResponse.json({ participants }, { status: 200 });
    }
  } catch (error) {
    console.error("Fetch Participants Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
