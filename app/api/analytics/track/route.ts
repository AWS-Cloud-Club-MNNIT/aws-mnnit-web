import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AnalyticsSession from "@/models/analyticsSession";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      sessionId, deviceId, path, userAgent, screenResolution, action, 
      referrer, utmSource, utmMedium, utmCampaign,
      metric, value, eventName, eventData 
    } = body;

    if (!sessionId || !path || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const now = new Date();
    
    // Find existing session
    const session = await AnalyticsSession.findOne({ sessionId });

    if (!session) {
      // If heartbeat or vital comes before page_view, ignore
      if (action !== "page_view") {
        return NextResponse.json({ success: true });
      }

      // Try to determine country/city from request headers (IP geolocation)
      // Usually provided by Vercel/Cloudflare. If missing, they remain undefined.
      const country = req.headers.get("x-vercel-ip-country") || undefined;
      const city = req.headers.get("x-vercel-ip-city") || undefined;
      const region = req.headers.get("x-vercel-ip-country-region") || undefined;
      
      // Extract IP address from request
      const forwardedFor = req.headers.get("x-forwarded-for");
      const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unknown";

      // Create new session
      await AnalyticsSession.create({
        sessionId,
        deviceId: deviceId || sessionId, // Fallback for old clients
        ipAddress,
        userAgent,
        screenResolution,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        country,
        city,
        region,
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
    } else if (action === "web_vital" && metric !== undefined && value !== undefined) {
      if (!session.performanceMetrics) {
        session.performanceMetrics = {};
      }
      const m = metric.toLowerCase();
      if (["lcp", "cls", "fid", "ttfb", "inp"].includes(m)) {
        session.performanceMetrics[m] = value;
      }
    } else if (action === "custom_event" && eventName) {
      session.events.push({
        name: eventName,
        timestamp: now,
        data: eventData
      });
      if (session.duration > 10 || session.events.length > 0) {
        session.isBounce = false;
      }
    }

    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // Return 200 even on error so client isn't flooded with 500s when db is down
    return NextResponse.json({ success: false, error: "Tracking failed" });
  }
}
