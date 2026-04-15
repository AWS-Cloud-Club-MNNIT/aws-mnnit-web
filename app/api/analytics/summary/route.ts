import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AnalyticsSession from "@/models/analyticsSession";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url      = new URL(req.url);
    const days     = parseInt(url.searchParams.get("days") || "30", 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const matchQuery = { createdAt: { $gte: startDate } };

    // Basic stats
    const [summaryAgg, dailyAgg, topPagesAgg] = await Promise.all([
      AnalyticsSession.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id:            null,
            totalVisits:    { $sum: 1 },
            totalPageViews: { $sum: { $size: "$pageViews" } },
            totalDuration:  { $sum: "$duration" },
            bounces:        { $sum: { $cond: ["$isBounce", 1, 0] } },
            uniqueDevices:  { $addToSet: "$deviceId" },
          },
        },
      ]),
      AnalyticsSession.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id:       { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            visits:    { $sum: 1 },
            pageViews: { $sum: { $size: "$pageViews" } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      AnalyticsSession.aggregate([
        { $match: matchQuery },
        { $unwind: "$pageViews" },
        { $group: { _id: "$pageViews.path", hits: { $sum: 1 } } },
        { $sort: { hits: -1 } },
        { $limit: 15 },
      ]),
    ]);

    const stats         = summaryAgg[0] ?? { totalVisits: 0, totalPageViews: 0, totalDuration: 0, bounces: 0, uniqueDevices: [] };
    const uniqueVisitors = Array.isArray(stats.uniqueDevices) ? stats.uniqueDevices.filter(Boolean).length : 0;
    const avgDuration   = stats.totalVisits > 0 ? Math.floor(stats.totalDuration / stats.totalVisits) : 0;
    const bounceRate    = stats.totalVisits > 0 ? parseFloat(((stats.bounces / stats.totalVisits) * 100).toFixed(1)) : 0;
    const pagesPerSession = stats.totalVisits > 0 ? parseFloat((stats.totalPageViews / stats.totalVisits).toFixed(1)) : 0;

    // Fill date gaps
    const trendMap = new Map(dailyAgg.map((d) => [d._id, d]));
    const trafficTrends = [];
    const now = new Date();
    for (let i = 0; i < days; i++) {  // FIXED: < not <=
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      if (d > now) break;
      const dStr = d.toISOString().split("T")[0];
      const e    = trendMap.get(dStr);
      trafficTrends.push({ date: dStr, visits: e?.visits ?? 0, pageViews: e?.pageViews ?? 0 });
    }

    const topPages = topPagesAgg.map((p) => ({ path: p._id, hits: p.hits }));

    // Active users (last 2 min)
    const twoMinsAgo  = new Date(Date.now() - 2 * 60 * 1000);
    const activeUsers = await AnalyticsSession.countDocuments({ lastActivity: { $gte: twoMinsAgo } });

    return NextResponse.json({
      summary: { totalVisits: stats.totalVisits, uniqueVisitors, totalPageViews: stats.totalPageViews, avgDuration, bounceRate, pagesPerSession },
      trafficTrends,
      topPages,
      activeUsers,
    });
  } catch (error) {
    console.error("[Analytics Summary]", error);
    return NextResponse.json({ error: "Failed to fetch analytics summary" }, { status: 500 });
  }
}
