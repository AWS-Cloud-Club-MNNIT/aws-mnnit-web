import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import ActivityLog from "@/models/activityLog";

// GET /api/participants/logs — Admin/Manager only
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
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const logs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Logs Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
