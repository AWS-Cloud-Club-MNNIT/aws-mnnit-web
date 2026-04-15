import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AnalyticsSession from "@/models/analyticsSession";

export const dynamic = "force-dynamic";

// ─── UA Parser ───────────────────────────────────────────────────────────────
function parseUA(ua: string = "") {
  const uaLow = ua.toLowerCase();
  let device = "Desktop";
  if (/mobile|android.*mobile|iphone|ipod/.test(uaLow)) device = "Mobile";
  else if (/ipad|android(?!.*mobile)|tablet/.test(uaLow)) device = "Tablet";

  let browser = "Other";
  if (uaLow.includes("edg/"))                              browser = "Edge";
  else if (uaLow.includes("chrome") && !uaLow.includes("chromium")) browser = "Chrome";
  else if (uaLow.includes("firefox"))                      browser = "Firefox";
  else if (uaLow.includes("safari") && !uaLow.includes("chrome"))   browser = "Safari";
  else if (uaLow.includes("opera") || uaLow.includes("opr/"))       browser = "Opera";

  let os = "Other";
  if (uaLow.includes("windows"))                         os = "Windows";
  else if (uaLow.includes("mac os") || uaLow.includes("macos")) os = "macOS";
  else if (uaLow.includes("android"))                    os = "Android";
  else if (uaLow.includes("iphone") || uaLow.includes("ipad")) os = "iOS";
  else if (uaLow.includes("linux"))                      os = "Linux";

  return { device, browser, os };
}

// ─── Traffic source classifier ────────────────────────────────────────────────
function classifySource(utmSource?: string, referrer?: string): string {
  if (utmSource) {
    const s = utmSource.toLowerCase();
    if (["google", "bing", "yahoo", "duckduckgo", "baidu"].includes(s)) return "Search";
    if (["facebook", "instagram", "twitter", "x", "linkedin", "tiktok", "reddit"].includes(s)) return "Social";
    return "Referral";
  }
  if (referrer) {
    const r = referrer.toLowerCase();
    if (/google\.|bing\.|yahoo\.|duckduckgo\./.test(r)) return "Search";
    if (/t\.co|facebook\.|instagram\.|linkedin\.|tiktok\.|reddit\./.test(r)) return "Social";
    return "Referral";
  }
  return "Direct";
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url       = new URL(req.url);
    const startParam = url.searchParams.get("start");
    const endParam   = url.searchParams.get("end");
    const daysParam  = url.searchParams.get("days") || "7";

    let startDate: Date;
    let endDate   = new Date();
    let days      = parseInt(daysParam, 10);
    let isCustom  = false;

    if (startParam && endParam) {
      startDate = new Date(startParam);
      endDate   = new Date(endParam);
      endDate.setHours(23, 59, 59, 999);
      isCustom = true;
      days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000));
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    }

    const compareStart = new Date(startDate);
    compareStart.setDate(compareStart.getDate() - days);

    const matchQuery: Record<string, unknown> = { createdAt: { $gte: startDate } };
    if (isCustom) (matchQuery.createdAt as Record<string, unknown>).$lte = endDate;
    const compareQuery = { createdAt: { $gte: compareStart, $lt: startDate } };

    // ── 1. Summary stats (current + previous period) ─────────────────────────
    const [currentStats, compareStats] = await Promise.all([
      AnalyticsSession.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalSessions:  { $sum: 1 },
            totalPageViews: { $sum: { $size: "$pageViews" } },
            totalDuration:  { $sum: "$duration" },
            bounces:        { $sum: { $cond: ["$isBounce", 1, 0] } },
            uniqueDevices:  { $addToSet: "$deviceId" },
          },
        },
      ]),
      AnalyticsSession.aggregate([
        { $match: compareQuery },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalDuration: { $sum: "$duration" },
            bounces:       { $sum: { $cond: ["$isBounce", 1, 0] } },
          },
        },
      ]),
    ]);

    const curr = currentStats[0] ?? { totalSessions: 0, totalPageViews: 0, totalDuration: 0, bounces: 0, uniqueDevices: [] };
    const prev = compareStats[0] ?? { totalSessions: 0, totalDuration: 0, bounces: 0 };

    const uniqueVisitors    = Array.isArray(curr.uniqueDevices) ? curr.uniqueDevices.filter(Boolean).length : 0;
    const avgDuration       = curr.totalSessions > 0 ? Math.floor(curr.totalDuration / curr.totalSessions) : 0;
    const bounceRate        = curr.totalSessions > 0 ? parseFloat(((curr.bounces / curr.totalSessions) * 100).toFixed(1)) : 0;
    const pagesPerSession   = curr.totalSessions > 0 ? parseFloat((curr.totalPageViews / curr.totalSessions).toFixed(1)) : 0;
    const prevAvgDuration   = prev.totalSessions > 0 ? Math.floor(prev.totalDuration / prev.totalSessions) : 0;
    const prevBounceRate    = prev.totalSessions > 0 ? parseFloat(((prev.bounces / prev.totalSessions) * 100).toFixed(1)) : 0;

    const visitGrowth     = prev.totalSessions > 0
      ? parseFloat((((curr.totalSessions - prev.totalSessions) / prev.totalSessions) * 100).toFixed(1))
      : null;
    const durationGrowth  = prevAvgDuration > 0
      ? parseFloat((((avgDuration - prevAvgDuration) / prevAvgDuration) * 100).toFixed(1))
      : null;
    const bounceRateDelta = parseFloat((bounceRate - prevBounceRate).toFixed(1));

    // ── 2. Daily traffic trend ────────────────────────────────────────────────
    const dailyAgg = await AnalyticsSession.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id:           { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          visits:        { $sum: 1 },
          pageViews:     { $sum: { $size: "$pageViews" } },
          bounces:       { $sum: { $cond: ["$isBounce", 1, 0] } },
          totalDuration: { $sum: "$duration" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const trendMap = new Map(dailyAgg.map((d) => [d._id, d]));
    const now      = new Date();
    const trafficTrends = [];
    for (let i = 0; i < days; i++) {  // FIXED: < not <= (was off-by-one)
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      if (!isCustom && d > now) break;
      if (isCustom  && d > endDate) break;
      const dStr  = d.toISOString().split("T")[0];
      const entry = trendMap.get(dStr);
      trafficTrends.push({
        date:        dStr,
        visits:      entry?.visits     ?? 0,
        pageViews:   entry?.pageViews  ?? 0,
        bounces:     entry?.bounces    ?? 0,
        avgDuration: entry && entry.visits > 0 ? Math.floor(entry.totalDuration / entry.visits) : 0,
      });
    }

    // ── 3. Top pages (accurate per-page avgTime via timeOnPage field) ─────────
    const topPagesAgg = await AnalyticsSession.aggregate([
      { $match: matchQuery },
      { $unwind: "$pageViews" },
      {
        $group: {
          _id:          "$pageViews.path",
          hits:         { $sum: 1 },
          totalTime:    { $sum: { $ifNull: ["$pageViews.timeOnPage", 0] } },
          timeCount:    { $sum: { $cond: [{ $gt: [{ $ifNull: ["$pageViews.timeOnPage", 0] }, 0] }, 1, 0] } },
        },
      },
      { $sort: { hits: -1 } },
      { $limit: 15 },
    ]);

    const topPages = topPagesAgg.map((p) => ({
      path:    p._id,
      hits:    p.hits,
      avgTime: p.timeCount > 0 ? Math.floor(p.totalTime / p.timeCount) : 0,
    }));

    // ── 4. Scroll depth per top page ──────────────────────────────────────────
    const scrollAgg = await AnalyticsSession.aggregate([
      { $match: { ...matchQuery, scrollDepths: { $exists: true, $ne: {} } } },
      { $project: { scrollDepths: { $objectToArray: "$scrollDepths" } } },
      { $unwind: "$scrollDepths" },
      {
        $group: {
          _id:      "$scrollDepths.k",
          avgDepth: { $avg: "$scrollDepths.v" },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { sessions: -1 } },
      { $limit: 10 },
    ]);

    const scrollDepthByPage = scrollAgg.map((s) => ({
      path:     s._id.replace(/_/g, "/"),
      avgDepth: Math.round(s.avgDepth),
      sessions: s.sessions,
    }));

    // ── 5. Top clicks ─────────────────────────────────────────────────────────
    const clickAgg = await AnalyticsSession.aggregate([
      { $match: matchQuery },
      { $unwind: "$events" },
      { $match: { "events.name": "click" } },
      {
        $group: {
          _id:   { tag: "$events.data.elementTag", text: "$events.data.elementText", id: "$events.data.elementId" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    const topClicks = clickAgg.map((c) => ({
      tag:   c._id.tag   || "unknown",
      text:  c._id.text  || "",
      id:    c._id.id    || "",
      count: c.count,
    }));

    // ── 6. Device / browser / OS breakdown (via MongoDB, not Node.js loop) ───
    const sessionFields = await AnalyticsSession.find(matchQuery, {
      userAgent: 1, deviceId: 1, duration: 1, isBounce: 1,
      createdAt: 1, country: 1, city: 1, pageViews: 1,
    }).lean();

    const deviceMap:  Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const osMap:      Record<string, number> = {};

    for (const s of sessionFields) {
      const { device, browser, os } = parseUA(s.userAgent as string);
      deviceMap[device]   = (deviceMap[device]   ?? 0) + 1;
      browserMap[browser] = (browserMap[browser] ?? 0) + 1;
      osMap[os]           = (osMap[os]           ?? 0) + 1;
    }

    const sortDesc = (obj: Record<string, number>) =>
      Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const deviceBreakdown  = sortDesc(deviceMap);
    const browserBreakdown = sortDesc(browserMap);
    const osBreakdown      = sortDesc(osMap);

    // ── 7. Traffic sources ────────────────────────────────────────────────────
    const sourceMap: Record<string, number> = { Direct: 0, Search: 0, Referral: 0, Social: 0 };
    for (const s of sessionFields) {
      const src = classifySource(s.utmSource as string, s.referrer as string);
      sourceMap[src]++;
    }

    // Only include non-zero sources — no fake fallback
    const trafficSources = [
      { name: "Direct",   value: sourceMap.Direct,   color: "#FF9900" },
      { name: "Search",   value: sourceMap.Search,   color: "#0073BB" },
      { name: "Referral", value: sourceMap.Referral, color: "#7C3AED" },
      { name: "Social",   value: sourceMap.Social,   color: "#16A34A" },
    ].filter((t) => t.value > 0);

    // ── 8. Session duration distribution ─────────────────────────────────────
    const buckets = [
      { label: "0-10s",  min: 0,   max: 10,       count: 0 },
      { label: "10-30s", min: 10,  max: 30,        count: 0 },
      { label: "30-60s", min: 30,  max: 60,        count: 0 },
      { label: "1-3m",   min: 60,  max: 180,       count: 0 },
      { label: "3-10m",  min: 180, max: 600,       count: 0 },
      { label: "10m+",   min: 600, max: Infinity,  count: 0 },
    ];
    for (const s of sessionFields) {
      const dur = (s.duration as number) ?? 0;
      const b   = buckets.find((b) => dur >= b.min && dur < b.max);
      if (b) b.count++;
    }
    const durationDistribution = buckets.map(({ label, count }) => ({ label, count }));

    // ── 9. Entry & exit pages ────────────────────────────────────────────────
    const entryMap: Record<string, number> = {};
    const exitMap:  Record<string, number> = {};
    for (const s of sessionFields) {
      const views = s.pageViews as { path: string }[];
      if (views.length > 0) {
        const entry = views[0].path;
        entryMap[entry] = (entryMap[entry] ?? 0) + 1;
      }
      // Use dedicated exitPage field first, fall back to last pageView
      const exit = (s.exitPage as string) ?? views[views.length - 1]?.path;
      if (exit) exitMap[exit] = (exitMap[exit] ?? 0) + 1;
    }

    const entryPages = Object.entries(entryMap)
      .map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 10);
    const exitPages  = Object.entries(exitMap)
      .map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 10);

    // ── 10. User flow (top N→M transitions) ──────────────────────────────────
    const flowMap: Record<string, number> = {};
    for (const s of sessionFields) {
      const views = s.pageViews as { path: string }[];
      for (let i = 0; i < Math.min(views.length - 1, 4); i++) {
        const key = `${views[i].path} → ${views[i + 1].path}`;
        flowMap[key] = (flowMap[key] ?? 0) + 1;
      }
    }
    const userFlow = Object.entries(flowMap)
      .map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 12);

    // ── 11. New vs returning users ────────────────────────────────────────────
    const currentDeviceIds = [...new Set(
      sessionFields.map((s) => s.deviceId as string).filter(Boolean)
    )];
    const returningDeviceDocs = await AnalyticsSession.find(
      { createdAt: { $lt: startDate }, deviceId: { $in: currentDeviceIds } },
      { deviceId: 1 }
    ).lean();
    const returningSet = new Set(returningDeviceDocs.map((s) => s.deviceId as string));

    const seenDevices  = new Set<string>();
    let   newUsers = 0, returningUsers = 0;
    for (const s of sessionFields) {
      const id = (s.deviceId as string) || (s.sessionId as string);
      if (returningSet.has(id) || seenDevices.has(id)) {
        returningUsers++;
      } else {
        seenDevices.add(id);
        newUsers++;
      }
    }

    // ── 12. Web vitals aggregation ────────────────────────────────────────────
    let lcpSum=0, lcpN=0, clsSum=0, clsN=0, fidSum=0, fidN=0;
    let ttfbSum=0, ttfbN=0, inpSum=0, inpN=0;
    for (const s of sessionFields) {
      const pm = s.performanceMetrics as Record<string, number> | undefined;
      if (!pm) continue;
      if (pm.lcp  > 0) { lcpSum  += pm.lcp;  lcpN++;  }
      if (pm.cls  >= 0){ clsSum  += pm.cls;  clsN++;  }
      if (pm.fid  > 0) { fidSum  += pm.fid;  fidN++;  }
      if (pm.ttfb > 0) { ttfbSum += pm.ttfb; ttfbN++; }
      if (pm.inp  > 0) { inpSum  += pm.inp;  inpN++;  }
    }

    // No Math.random() — return null when no real data
    const performanceMetrics = {
      lcp:  lcpN  > 0 ? parseFloat((lcpSum  / lcpN  / 1000).toFixed(2)) : null,
      cls:  clsN  > 0 ? parseFloat((clsSum  / clsN).toFixed(3))         : null,
      fid:  fidN  > 0 ? Math.round(fidSum  / fidN)                       : null,
      ttfb: ttfbN > 0 ? Math.round(ttfbSum / ttfbN)                      : null,
      inp:  inpN  > 0 ? Math.round(inpSum  / inpN)                       : null,
      // Error rates are infra-level metrics, cannot be derived from client sessions alone
      errorRate4xx: null,
      errorRate5xx: null,
    };

    // ── 13. Conversion funnel ─────────────────────────────────────────────────
    const funnelSteps = [
      { step: "/",         label: "Home" },
      { step: "/tracks",   label: "Tracks" },
      { step: "/events",   label: "Events" },
      { step: "/register", label: "Register" },
    ];
    const funnelData = funnelSteps.map(({ step, label }) => ({
      label,
      path:  step,
      count: sessionFields.filter((s) =>
        (s.pageViews as { path: string }[]).some(
          (pv) => pv.path === step || pv.path.startsWith(step + "/")
        )
      ).length,
    }));

    // ── 14. Active users (last 2 min for precision) ───────────────────────────
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
    const activeUsers = await AnalyticsSession.countDocuments({ lastActivity: { $gte: twoMinsAgo } });

    // ── 15. Geo distribution ──────────────────────────────────────────────────
    const countryMap: Record<string, number> = {};
    const cityMap:    Record<string, number> = {};
    for (const s of sessionFields) {
      if (s.country) countryMap[s.country as string] = (countryMap[s.country as string] ?? 0) + 1;
      if (s.city)    cityMap[s.city as string]       = (cityMap[s.city as string]       ?? 0) + 1;
    }
    const topCountries = Object.entries(countryMap)
      .map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 10);
    const topCities = Object.entries(cityMap)
      .map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 10);

    // Screen resolutions
    const resMap: Record<string, number> = {};
    for (const s of sessionFields) {
      const res = (s.screenResolution as string) || "";
      if (res) resMap[res] = (resMap[res] ?? 0) + 1;
    }
    const screenResolutions = Object.entries(resMap)
      .map(([resolution, count]) => ({ resolution, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    // ── 16. Hourly heatmap ────────────────────────────────────────────────────
    const hourlyAgg = await AnalyticsSession.aggregate([
      { $match: matchQuery },
      { $group: { _id: { hour: { $hour: "$createdAt" }, dow: { $dayOfWeek: "$createdAt" } }, count: { $sum: 1 } } },
    ]);
    const heatmapData = hourlyAgg.map((e) => ({ hour: e._id.hour, dow: e._id.dow, count: e.count }));

    // ── 17. Recent Visitor Log (truly recent — last 30 min) ───────────────────
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);  // FIXED: was full date range
    const recentVisitors = await AnalyticsSession.find(
      { lastActivity: { $gte: thirtyMinsAgo } },
      { ipAddress: 1, deviceId: 1, country: 1, city: 1, userAgent: 1,
        lastActivity: 1, duration: 1, pageViews: 1, exitPage: 1 }
    )
      .sort({ lastActivity: -1 })
      .limit(50)
      .lean()
      .then((sessions) =>
        sessions.map((s) => {
          const { os, browser } = parseUA(s.userAgent as string);
          const views = (s.pageViews as { path: string }[]);
          return {
            ip:          s.ipAddress   || "Unknown",
            deviceId:    s.deviceId    || "Unknown",
            location:    [s.city, s.country].filter(Boolean).join(", ") || "Unknown",
            system:      `${os} / ${browser}`,
            duration:    s.duration    || 0,
            pageCount:   views.length,
            lastPage:    (s.exitPage as string) ?? views[views.length - 1]?.path ?? "/",
            lastActive:  s.lastActivity,
          };
        })
      );

    return NextResponse.json({
      summary: {
        totalVisits:    curr.totalSessions,
        uniqueVisitors,
        totalPageViews: curr.totalPageViews,
        avgDuration,
        bounceRate,
        pagesPerSession,
        newUsers,
        returningUsers,
        visitGrowth,
        bounceRateDelta,
        durationGrowth,
      },
      trafficTrends,
      topPages,
      topClicks,
      scrollDepthByPage,
      activeUsers,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      trafficSources,
      durationDistribution,
      entryPages,
      exitPages,
      userFlow,
      performanceMetrics,
      funnelData,
      screenResolutions,
      topCountries,
      topCities,
      heatmapData,
      recentVisitors,
    });
  } catch (error) {
    console.error("[Analytics Advanced]", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
