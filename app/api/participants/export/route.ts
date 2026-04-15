import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Participant from "@/models/participant";

// GET /api/participants/export — Admin/Manager only, returns CSV with all fields including mobile
export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");

    const query: any = {};
    if (statusFilter && ["pending", "verified", "rejected"].includes(statusFilter)) {
      query.verificationStatus = statusFilter;
    }
    
    const attendanceFilter = url.searchParams.get("attendance");
    if (attendanceFilter === "present") {
      query.present = true;
    } else if (attendanceFilter === "absent") {
      query.present = { $ne: true };
    }

    const participants = await Participant.find(query).sort({ participantId: 1 });

    // Build CSV
    const headers = [
      "Participant ID",
      "Registration ID",
      "Name",
      "Email",
      "Mobile",
      "College",
      "Location",
      "Verification Status",
      "Verified By",
      "Verified At",
      "Present",
      "Food",
      "Created At",
    ];

    const rows = participants.map((p) => [
      p.participantId,
      p.registrationId || "",
      p.name,
      p.email,
      p.mobile || "",
      p.college,
      p.location || "",
      p.verificationStatus,
      p.verifiedBy || "",
      p.verifiedAt ? p.verifiedAt.toISOString() : "",
      p.present ? "Yes" : "No",
      p.food ? "Yes" : "No",
      p.createdAt ? p.createdAt.toISOString() : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="aws_scd_2026_participants${statusFilter ? `_${statusFilter}` : ""}${attendanceFilter ? `_${attendanceFilter}` : ""}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
