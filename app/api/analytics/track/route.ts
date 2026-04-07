import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AnalyticsSession from "@/models/analyticsSession";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, path, userAgent, screenResolution, action } = body;

    if (!sessionId || !path || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const now = new Date();
    
    // Find existing session
    const session = await AnalyticsSession.findOne({ sessionId });

    if (!session) {
      // If heartbeat comes before page_view, ignore
      if (action === "heartbeat") {
        return NextResponse.json({ success: true });
      }

      // Create new session
      await AnalyticsSession.create({
        sessionId,
        userAgent,
        screenResolution,
        startTime: now,
        lastActivity: now,
        duration: 0,
        pageViews: [{ path, timestamp: now }],
        isBounce: true,
      });
      return NextResponse.json({ success: true });
    }

    // Update session
    session.lastActivity = now;
    
    // Calculate new duration in seconds
    session.duration = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);

    if (action === "page_view") {
      // Check if it's a new page view by examining the last one
      const lastView = session.pageViews[session.pageViews.length - 1];
      if (!lastView || lastView.path !== path) {
         session.pageViews.push({ path, timestamp: now });
      }
      
      // If there are multiple unique pages visited, it's not a bounce
      // We can also have duration-based non-bounce, e.g., > 10s
      if (session.pageViews.length > 1 || session.duration > 10) {
        session.isBounce = false;
      }
    } else if (action === "heartbeat") {
      if (session.duration > 10) session.isBounce = false;
    }

    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // Return 200 even on error so client isn't flooded with 500s when db is down
    return NextResponse.json({ success: false, error: "Tracking failed" });
  }
}
