import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AnalyticsSession from "@/models/analyticsSession";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId, deviceId, path, userAgent, screenResolution, action,
      referrer, utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
      metric, value,
      // New fields
      depth,            // scroll_depth
      timeOnPage,       // exit_page (seconds of engaged time on this page)
      engagedSeconds,   // heartbeat (total accumulated engaged seconds)
      elementId, elementClass, elementTag, elementText, // click
    } = body;

    if (!sessionId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const now = new Date();

    // ── Session creation for page_view ────────────────────────────────────────
    if (action === "page_view") {
      if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

      const existingSession = await AnalyticsSession.findOne({ sessionId }).lean();

      if (!existingSession) {
        // Extract geo from Vercel/Cloudflare edge headers
        const country = req.headers.get("x-vercel-ip-country")        || undefined;
        const city    = req.headers.get("x-vercel-ip-city")           || undefined;
        const region  = req.headers.get("x-vercel-ip-country-region") || undefined;

        const forwardedFor = req.headers.get("x-forwarded-for");
        const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : undefined;

        await AnalyticsSession.create({
          sessionId,
          deviceId: deviceId || sessionId,
          ipAddress,
          userAgent,
          screenResolution,
          referrer,
          utmSource,
          utmMedium,
          utmCampaign,
          utmTerm,
          utmContent,
          country,
          city,
          region,
          startTime:    now,
          lastActivity: now,
          duration:     0,
          pageViews:  [{ path, timestamp: now, timeOnPage: 0 }],
          isBounce:   true,
        });
        return NextResponse.json({ success: true, created: true });
      }

      // Existing session — add new page view (avoid consecutive duplicate paths)
      const views = existingSession.pageViews as { path: string; timestamp: Date; timeOnPage?: number }[];
      const lastPath = views[views.length - 1]?.path;

      const update: Record<string, unknown> = { lastActivity: now };

      if (lastPath !== path) {
        update.$push = {
          pageViews: { path, timestamp: now, timeOnPage: 0 },
        };
        // More than 1 unique page = not a bounce
        update.$set = { isBounce: false };
      }

      await AnalyticsSession.updateOne({ sessionId }, update);
      return NextResponse.json({ success: true });
    }

    // ── For all non-creation actions, the session must already exist ──────────
    // Use updateOne for most to avoid loading full document

    if (action === "heartbeat") {
      // engagedSeconds is the total accumulated engaged time sent from the client
      const engaged = typeof engagedSeconds === "number" ? Math.max(0, engagedSeconds) : 0;
      await AnalyticsSession.updateOne(
        { sessionId },
        {
          $set: {
            lastActivity: now,
            duration: engaged,
            // Sessions with > 10s of real engagement are not bounces
            ...(engaged > 10 ? { isBounce: false } : {}),
          },
        }
      );
      return NextResponse.json({ success: true });
    }

    if (action === "exit_page") {
      const engaged = typeof timeOnPage === "number" ? Math.max(0, timeOnPage) : 0;
      // Update the timeOnPage for the last pageView entry and record exit page
      await AnalyticsSession.updateOne(
        { sessionId },
        {
          $set: {
            lastActivity: now,
            exitPage: path,
            // Update timeOnPage for the last pageView (matched by path)
            "pageViews.$[last].timeOnPage": engaged,
          },
        },
        {
          arrayFilters: [{ "last.path": path }],
        }
      );
      return NextResponse.json({ success: true });
    }

    if (action === "scroll_depth") {
      const milestone = typeof depth === "number" ? depth : 0;
      if (milestone > 0 && path) {
        await AnalyticsSession.updateOne(
          { sessionId },
          {
            $max: { [`scrollDepths.${path.replace(/\//g, "_")}`]: milestone },
            $set: { lastActivity: now },
          }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === "click") {
      await AnalyticsSession.updateOne(
        { sessionId },
        {
          $push: {
            events: {
              name:      "click",
              timestamp: now,
              path,
              data: { elementId, elementClass, elementTag, elementText },
            },
          },
          $set: { lastActivity: now },
        }
      );
      return NextResponse.json({ success: true });
    }

    if (action === "web_vital" && metric !== undefined && value !== undefined) {
      const m = (metric as string).toLowerCase();
      if (["lcp", "cls", "fid", "ttfb", "inp"].includes(m)) {
        await AnalyticsSession.updateOne(
          { sessionId },
          { $set: { [`performanceMetrics.${m}`]: value, lastActivity: now } }
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Analytics Track]", error);
    // Always return 200 so the client doesn't retry in a loop
    return NextResponse.json({ success: false, error: "Tracking failed" });
  }
}
