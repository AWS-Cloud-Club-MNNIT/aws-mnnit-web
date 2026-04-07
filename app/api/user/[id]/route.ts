import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Participant from "@/models/participant";

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
      // Public access — only if verified, strip mobile
      if (participant.verificationStatus !== "verified") {
        return NextResponse.json(
          { error: "Ticket not available or not verified yet" },
          { status: 403 }
        );
      }
      const { mobile, registrationId, ...safeData } = participant.toObject();
      return NextResponse.json(
        { participant: safeData, isAdmin: false, isManager: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { participant, isAdmin: !!isAdmin, isManager: !!isManager },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch User Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, participant: updatedParticipant },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
