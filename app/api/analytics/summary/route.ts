import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AnalyticsSession from "@/models/analyticsSession";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Parse query params for date filtering
    const url = new URL(req.url);
    const daysParam = url.searchParams.get("days") || "30";
    const days = parseInt(daysParam, 10);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const matchQuery = { createdAt: { $gte: startDate } };

    // 1. Basic Stats
    const summaryStats = await AnalyticsSession.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          totalPageViews: { $sum: { $size: "$pageViews" } },
          totalDuration: { $sum: "$duration" },
          bounces: { $sum: { $cond: ["$isBounce", 1, 0] } },
        }
      }
    ]);

    const stats = summaryStats[0] || { totalVisits: 0, totalPageViews: 0, totalDuration: 0, bounces: 0 };
    
    const avgDuration = stats.totalVisits > 0 ? Math.floor(stats.totalDuration / stats.totalVisits) : 0;
    const bounceRate = stats.totalVisits > 0 ? ((stats.bounces / stats.totalVisits) * 100).toFixed(1) : 0;
    const pagesPerSession = stats.totalVisits > 0 ? (stats.totalPageViews / stats.totalVisits).toFixed(1) : 0;

    // 2. Daily Traffic Trend
    const dailyBreakdown = await AnalyticsSession.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          visits: { $sum: 1 },
          pageViews: { $sum: { $size: "$pageViews" } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    // Fill in missing days so the chart holds continuous timeline
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trendMap = new Map<string, any>();
    dailyBreakdown.forEach(d => trendMap.set(d._id, d));
    
    const trafficTrends = [];
    for (let i = 0; i <= days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dStr = d.toISOString().split("T")[0];
        
        // Skip future days if we requested e.g. 30 days and are generating up to today + extra hours
        if (d > new Date()) continue;

        if (trendMap.has(dStr)) {
            trafficTrends.push({ 
                date: dStr, 
                visits: trendMap.get(dStr).visits, 
                pageViews: trendMap.get(dStr).pageViews 
            });
        } else {
            trafficTrends.push({ date: dStr, visits: 0, pageViews: 0 });
        }
    }

    // 3. Top Pages
    const topPagesAgg = await AnalyticsSession.aggregate([
      { $match: matchQuery },
      { $unwind: "$pageViews" },
      {
        $group: {
          _id: "$pageViews.path",
          hits: { $sum: 1 }
        }
      },
      { $sort: { hits: -1 } },
      { $limit: 15 } // top 15 pages
    ]);
    
    const topPages = topPagesAgg.map(p => ({
        path: p._id,
        hits: p.hits
    }));
    
    // 4. Active Now (last 5 minutes)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsers = await AnalyticsSession.countDocuments({
        lastActivity: { $gte: fiveMinsAgo }
    });

    return NextResponse.json({
      summary: {
        totalVisits: stats.totalVisits,
        totalPageViews: stats.totalPageViews,
        avgDuration,
        bounceRate: parseFloat(bounceRate as string),
        pagesPerSession: parseFloat(pagesPerSession as string)
      },
      trafficTrends,
      topPages,
      activeUsers
    });

  } catch (error) {
    console.error("Analytics summary error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics summary" }, { status: 500 });
  }
}
