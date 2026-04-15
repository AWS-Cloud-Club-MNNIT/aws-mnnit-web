import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AnalyticsSession from "@/models/analyticsSession";

export const dynamic = "force-dynamic";

/**
 * Lightweight heartbeat endpoint.
 * Called by the live-refresh polling on the dashboard — only updates lastActivity
 * and returns the active user count. Far cheaper than calling /advanced.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, engagedSeconds } = body;
    if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

    await connectDB();
    const now = new Date();
    const engaged = typeof engagedSeconds === "number" ? Math.max(0, engagedSeconds) : undefined;

    await AnalyticsSession.updateOne(
      { sessionId },
      {
        $set: {
          lastActivity: now,
          ...(engaged !== undefined ? { duration: engaged } : {}),
          ...(engaged !== undefined && engaged > 10 ? { isBounce: false } : {}),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Analytics Heartbeat]", error);
    return NextResponse.json({ success: false });
  }
}

/**
 * GET: returns only the live active user count (last 2 minutes).
 * Used by the dashboard live-pill polling every 30s.
 */
export async function GET() {
  try {
    await connectDB();
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
    const activeUsers = await AnalyticsSession.countDocuments({
      lastActivity: { $gte: twoMinsAgo },
    });
    return NextResponse.json({ activeUsers });
  } catch (error) {
    console.error("[Analytics Heartbeat GET]", error);
    return NextResponse.json({ activeUsers: 0 });
  }
}
