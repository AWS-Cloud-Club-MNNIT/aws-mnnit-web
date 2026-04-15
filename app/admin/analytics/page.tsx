"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Eye, Clock, ArrowBendRightDown, ChartLineUp, Globe,
  DeviceMobile, Desktop, DeviceTablet, Browser, Path, ArrowSquareOut,
  Lightning, Funnel, Export, MagnifyingGlass, BellRinging,
  Circle, ArrowsLeftRight, Gauge, MapPin, ChartBar,
  SlidersHorizontal, DownloadSimple, CalendarBlank, CursorClick,
  ArrowDown
} from "@phosphor-icons/react"
import { format } from "date-fns"

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

import { OverviewCard }           from "./components/OverviewCard"
import { TrafficChart }           from "./components/TrafficChart"
import { DonutChart }             from "./components/DonutChart"
import { HorizontalBar, VerticalBarChart } from "./components/BarCharts"
import { FunnelChart }            from "./components/FunnelChart"
import { PerformanceMetricsCard } from "./components/PerformanceMetrics"
import { Heatmap }                from "./components/Heatmap"
import { ScrollDepthChart }       from "./components/ScrollDepthChart"

// ─── Types ────────────────────────────────────────────────────────────────────
type AdvancedAnalytics = {
  summary: {
    totalVisits:    number
    uniqueVisitors: number
    totalPageViews: number
    avgDuration:    number
    bounceRate:     number
    pagesPerSession: number
    newUsers:       number
    returningUsers: number
    visitGrowth:    number | null
    bounceRateDelta: number
    durationGrowth: number | null
  }
  trafficTrends:     { date: string; visits: number; pageViews: number; bounces: number; avgDuration: number }[]
  topPages:          { path: string; hits: number; avgTime: number }[]
  topClicks:         { tag: string; text: string; id: string; count: number }[]
  scrollDepthByPage: { path: string; avgDepth: number; sessions: number }[]
  activeUsers:       number
  deviceBreakdown:   { name: string; value: number }[]
  browserBreakdown:  { name: string; value: number }[]
  osBreakdown:       { name: string; value: number }[]
  trafficSources:    { name: string; value: number; color: string }[]
  durationDistribution: { label: string; count: number }[]
  entryPages:        { path: string; count: number }[]
  exitPages:         { path: string; count: number }[]
  userFlow:          { path: string; count: number }[]
  performanceMetrics: {
    lcp:  number | null; cls: number | null; fid: number | null
    inp:  number | null; ttfb: number | null
    errorRate4xx: number | null; errorRate5xx: number | null
  }
  funnelData:        { label: string; count: number; path: string }[]
  screenResolutions: { resolution: string; count: number }[]
  topCountries:      { country: string; count: number }[]
  topCities:         { city: string; count: number }[]
  heatmapData:       { hour: number; dow: number; count: number }[]
  recentVisitors:    {
    ip: string; deviceId: string; location: string; system: string
    duration: number; pageCount: number; lastPage: string; lastActive: string
  }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDuration = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

const DAY_OPTIONS = [
  { label: "Today", value: 1 },
  { label: "7D",    value: 7 },
  { label: "30D",   value: 30 },
  { label: "90D",   value: 90 },
]

function StatSkeleton() {
  return <Skeleton className="h-10 w-24 rounded-xl" />
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [days,      setDays]      = React.useState(7)
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({})
  const [chartMode, setChartMode] = React.useState<"area" | "bar">("area")
  const [pageFilter, setPageFilter] = React.useState("")
  const [loading,   setLoading]   = React.useState(true)
  const [data,      setData]      = React.useState<AdvancedAnalytics | null>(null)
  const [alerts,    setAlerts]    = React.useState<string[]>([])
  const [liveCount, setLiveCount] = React.useState(0)

  // ── Fetch full analytics ──────────────────────────────────────────────────
  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      let url = `/api/analytics/advanced?days=${days}`
      if (dateRange.from && dateRange.to) {
        url = `/api/analytics/advanced?start=${dateRange.from.toISOString()}&end=${dateRange.to.toISOString()}`
      }
      const res  = await fetch(url)
      const json = await res.json() as AdvancedAnalytics
      setData(json)
      setLiveCount(json.activeUsers ?? 0)

      // Anomaly alerts (deduplicated)
      if (json.summary.visitGrowth !== null && json.summary.visitGrowth > 50) {
        setAlerts((a) => [...a.filter((x) => !x.includes("spike")),
          `🚀 Traffic spike! Sessions up ${json.summary.visitGrowth}% vs prior period.`])
      } else if (json.summary.visitGrowth !== null && json.summary.visitGrowth < -40) {
        setAlerts((a) => [...a.filter((x) => !x.includes("drop")),
          `⚠️ Traffic drop! Sessions down ${Math.abs(json.summary.visitGrowth ?? 0)}% vs prior period.`])
      }
    } catch (e) {
      console.error("[Dashboard] Failed to load analytics", e)
    } finally {
      setLoading(false)
    }
  }, [days, dateRange])

  React.useEffect(() => { fetchData() }, [fetchData])

  // ── Lightweight live-user polling every 30s via /heartbeat ────────────────
  React.useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/analytics/heartbeat")
        const { activeUsers } = await res.json()
        if (typeof activeUsers === "number") setLiveCount(activeUsers)
      } catch { /* silent */ }
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  // ── CSV export ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!data) return
    const rows = [
      ["Date", "Sessions", "Page Views", "Avg Duration (s)", "Bounces"],
      ...data.trafficTrends.map((t) => [t.date, t.visits, t.pageViews, t.avgDuration, t.bounces]),
    ]
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredPages = (data?.topPages ?? []).filter((p) =>
    !pageFilter || p.path.toLowerCase().includes(pageFilter.toLowerCase())
  )

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-7 pb-24 min-h-screen">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="p-2 rounded-xl bg-[#FF9900]/15 border border-[#FF9900]/20">
                <ChartBar weight="duotone" className="w-5 h-5 text-[#FF9900]" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Analytics</h1>
              <Badge className="flex items-center gap-1.5 bg-green-500/10 border-green-500/30 text-green-400 px-3 py-1 rounded-full">
                <Circle weight="fill" className="w-2 h-2 animate-pulse" />
                {liveCount} live
              </Badge>
            </div>
            <p className="text-white/40 text-sm">Real-time traffic, engagement, and performance insights</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick day filters */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/8 p-1 rounded-2xl">
              {DAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setDays(opt.value); setDateRange({}) }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    days === opt.value && !dateRange.from
                      ? "bg-[#FF9900] text-black shadow-[0_0_10px_rgba(255,153,0,0.3)]"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom date range */}
            <Popover>
              <PopoverTrigger asChild>
                <button className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  dateRange.from && dateRange.to
                    ? "bg-[#FF9900] text-black border-[#FF9900]/50"
                    : "bg-white/5 border-white/8 text-white/50 hover:text-white hover:bg-white/10"
                }`}>
                  <CalendarBlank className="w-3.5 h-3.5" />
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d")}`
                    : "Custom"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border border-white/10 bg-[#0A0D14]" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange as any}
                  onSelect={(range) => setDateRange((range as any) ?? {})}
                  numberOfMonths={2}
                  className="text-white bg-[#0A0D14]"
                />
              </PopoverContent>
            </Popover>

            {/* Chart mode */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setChartMode(chartMode === "area" ? "bar" : "area")}
                  className="p-2 rounded-xl bg-white/5 border border-white/8 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Toggle chart type</TooltipContent>
            </Tooltip>

            {/* Export */}
            <button
              onClick={exportCSV}
              disabled={!data}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-bold disabled:opacity-40"
            >
              <DownloadSimple className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* ── Alert banners ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {alerts.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <BellRinging weight="fill" className="w-4 h-4 shrink-0" />
                {alert}
              </span>
              <button
                onClick={() => setAlerts((a) => a.filter((_, j) => j !== i))}
                className="text-amber-400/60 hover:text-amber-300 text-xs font-bold"
              >
                Dismiss
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── Overview KPI Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <OverviewCard
            title="Sessions"
            value={loading ? null : (data?.summary.totalVisits ?? 0).toLocaleString()}
            icon={<Users weight="fill" className="w-5 h-5" />}
            accentColor="#FF9900"
            growth={data?.summary.visitGrowth ?? null}
            subtitle="vs prior period"
            badge={
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <Circle weight="fill" className="w-1.5 h-1.5 text-green-400 animate-pulse" />
                <span className="text-[10px] font-bold text-green-400">{liveCount}</span>
              </div>
            }
            delay={0.05}
          />
          <OverviewCard
            title="Unique Visitors"
            value={loading ? null : (data?.summary.uniqueVisitors ?? 0).toLocaleString()}
            icon={<Globe weight="fill" className="w-5 h-5" />}
            accentColor="#0073BB"
            growth={null}
            subtitle="by device ID"
            delay={0.08}
          />
          <OverviewCard
            title="Page Views"
            value={loading ? null : (data?.summary.totalPageViews ?? 0).toLocaleString()}
            icon={<Eye weight="fill" className="w-5 h-5" />}
            accentColor="#7C3AED"
            growth={null}
            subtitle={`${data?.summary.pagesPerSession ?? 0} per session`}
            delay={0.11}
          />
          <OverviewCard
            title="Avg Duration"
            value={loading ? null : formatDuration(data?.summary.avgDuration ?? 0)}
            icon={<Clock weight="fill" className="w-5 h-5" />}
            accentColor="#16A34A"
            growth={data?.summary.durationGrowth ?? null}
            subtitle="engaged time"
            delay={0.14}
          />
          <OverviewCard
            title="Bounce Rate"
            value={loading ? null : `${data?.summary.bounceRate ?? 0}%`}
            icon={<ArrowBendRightDown weight="fill" className="w-5 h-5" />}
            accentColor="#EF4444"
            growth={data?.summary.bounceRateDelta ?? null}
            growthInverse
            subtitle="lower is better"
            delay={0.17}
          />
          <OverviewCard
            title="New Users"
            value={loading ? null : (data?.summary.newUsers ?? 0).toLocaleString()}
            icon={<ArrowSquareOut weight="fill" className="w-5 h-5" />}
            accentColor="#EC4899"
            growth={null}
            subtitle={`${data?.summary.returningUsers ?? 0} returning`}
            delay={0.20}
          />
        </div>

        {/* ── Main Tabbed Interface ─────────────────────────────────────── */}
        <Tabs defaultValue="traffic" className="w-full">
          <TabsList className="flex flex-wrap w-full bg-white/3 border border-white/6 p-1 rounded-2xl h-auto gap-1 mb-2">
            {[
              { id: "traffic",     label: "Traffic",      icon: <ChartLineUp className="w-4 h-4" />    },
              { id: "behavior",    label: "Behavior",     icon: <Path className="w-4 h-4" />           },
              { id: "geo",         label: "Geography",    icon: <Globe className="w-4 h-4" />          },
              { id: "devices",     label: "Devices",      icon: <DeviceMobile className="w-4 h-4" />   },
              { id: "performance", label: "Performance",  icon: <Gauge className="w-4 h-4" />          },
              { id: "funnel",      label: "Funnel",       icon: <Funnel className="w-4 h-4" />         },
              { id: "visitors",    label: "Log Explorer", icon: <Users className="w-4 h-4" />          },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white/40 hover:text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ══ TRAFFIC TAB ═════════════════════════════════════════════ */}
          <TabsContent value="traffic" className="flex flex-col gap-6 mt-4">
            <Card className="bg-[#0F1318]/80 border-white/8 rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#FF9900]/15 border border-white/5 text-[#FF9900]">
                    <ChartLineUp className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-white text-lg font-bold">Traffic Over Time</CardTitle>
                </div>
                <span className="text-xs text-white/30 font-mono">{data?.trafficTrends.length ?? 0} data points</span>
              </CardHeader>
              <CardContent>
                <TrafficChart data={data?.trafficTrends ?? []} loading={loading} mode={chartMode} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnalCard title="Traffic Sources" icon={<Globe className="w-5 h-5" />} accent="#0073BB">
                <DonutChart data={data?.trafficSources ?? []} loading={loading} label="total" />
              </AnalCard>

              <AnalCard title="Session Duration" icon={<Clock className="w-5 h-5" />} accent="#16A34A">
                <VerticalBarChart data={data?.durationDistribution ?? []} loading={loading} color="#16A34A" />
                <p className="text-xs text-white/30 mt-3 text-center">Distribution of engaged session lengths</p>
              </AnalCard>

              <AnalCard title="User Segments" icon={<Users className="w-5 h-5" />} accent="#EC4899">
                <DonutChart
                  data={[
                    { name: "New Users",  value: data?.summary.newUsers       ?? 0, color: "#EC4899" },
                    { name: "Returning",  value: data?.summary.returningUsers  ?? 0, color: "#F59E0B" },
                  ]}
                  loading={loading}
                  label="users"
                />
              </AnalCard>
            </div>

            <AnalCard title="Activity Heatmap" icon={<Lightning className="w-5 h-5" />} accent="#F59E0B">
              <p className="text-xs text-white/30 mb-4">Sessions by hour-of-day and day-of-week (UTC)</p>
              <Heatmap data={data?.heatmapData ?? []} loading={loading} />
            </AnalCard>
          </TabsContent>

          {/* ══ BEHAVIOR TAB ════════════════════════════════════════════ */}
          <TabsContent value="behavior" className="flex flex-col gap-6 mt-4">
            {/* Top Pages */}
            <AnalCard
              title="Most Visited Pages"
              icon={<Eye className="w-5 h-5" />}
              accent="#FF9900"
              actions={
                <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5">
                  <MagnifyingGlass className="w-3.5 h-3.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Filter pages…"
                    value={pageFilter}
                    onChange={(e) => setPageFilter(e.target.value)}
                    className="bg-transparent text-xs text-white placeholder-white/30 outline-none w-28"
                  />
                </div>
              }
            >
              {loading ? (
                <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8 rounded-xl" />)}</div>
              ) : filteredPages.length > 0 ? (
                <HorizontalBar data={filteredPages} nameKey="path" color="#FF9900" showAvgTime />
              ) : (
                <EmptyState message={pageFilter ? "No pages match your filter." : "No page views recorded yet."} />
              )}
            </AnalCard>

            {/* Scroll Depth */}
            <AnalCard title="Scroll Depth by Page" icon={<ArrowDown className="w-5 h-5" />} accent="#7C3AED">
              <p className="text-xs text-white/30 mb-4">Average max scroll depth reached per page</p>
              <ScrollDepthChart data={data?.scrollDepthByPage ?? []} loading={loading} />
            </AnalCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalCard title="Entry Pages" icon={<ArrowSquareOut className="w-5 h-5" />} accent="#16A34A">
                <p className="text-xs text-white/30 mb-4">Where users first land</p>
                {loading ? <SkeletonList /> : <HorizontalBar data={data?.entryPages ?? []} nameKey="path" color="#16A34A" />}
              </AnalCard>

              <AnalCard title="Exit Pages" icon={<Export className="w-5 h-5" />} accent="#EF4444">
                <p className="text-xs text-white/30 mb-4">Where users leave (flushed via sendBeacon)</p>
                {loading ? <SkeletonList /> : <HorizontalBar data={data?.exitPages ?? []} nameKey="path" color="#EF4444" />}
              </AnalCard>
            </div>

            {/* Navigation paths */}
            <AnalCard title="Navigation Paths" icon={<Path className="w-5 h-5" />} accent="#7C3AED">
              <p className="text-xs text-white/30 mb-4">Most common page-to-page journeys</p>
              {loading ? (
                <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
              ) : (data?.userFlow ?? []).length > 0 ? (
                <div className="space-y-2">
                  {(data?.userFlow ?? []).map((flow, i) => {
                    const [from, to] = flow.path.split(" → ")
                    const max = Math.max(...(data?.userFlow ?? []).map((f) => f.count), 1)
                    const pct = (flow.count / max) * 100
                    return (
                      <div key={i} className="relative flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all overflow-hidden">
                        <div className="absolute inset-0" style={{ width: `${pct}%`, background: "rgba(124,58,237,0.07)" }} />
                        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-[#7C3AED]/20 flex items-center justify-center text-[9px] font-black text-[#7C3AED] shrink-0">{i + 1}</span>
                          <span className="text-xs text-[#0073BB] truncate max-w-[120px]">{from?.trim()}</span>
                          <span className="text-white/20">→</span>
                          <span className="text-xs text-[#FF9900] truncate max-w-[120px]">{to?.trim()}</span>
                        </div>
                        <Badge variant="outline" className="relative z-10 text-[#7C3AED] border-[#7C3AED]/30 bg-[#7C3AED]/10 font-bold shrink-0">
                          {flow.count}×
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState message="Not enough multi-page sessions yet." />
              )}
            </AnalCard>

            {/* Top Clicks */}
            <AnalCard title="Top Clicked Elements" icon={<CursorClick className="w-5 h-5" />} accent="#F59E0B">
              <p className="text-xs text-white/30 mb-4">Most clicked elements across all pages</p>
              {loading ? (
                <SkeletonList />
              ) : (data?.topClicks ?? []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/8 hover:bg-transparent">
                      <TableHead className="text-white/40 text-xs uppercase tracking-wider">#</TableHead>
                      <TableHead className="text-white/40 text-xs uppercase tracking-wider">Element</TableHead>
                      <TableHead className="text-white/40 text-xs uppercase tracking-wider">Tag</TableHead>
                      <TableHead className="text-white/40 text-xs uppercase tracking-wider text-right">Clicks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.topClicks ?? []).map((c, i) => (
                      <TableRow key={i} className="border-white/5 hover:bg-white/3">
                        <TableCell className="text-white/30 text-xs font-mono">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm text-white truncate max-w-[220px]">{c.text || c.id || "—"}</span>
                            {c.id && <span className="text-xs text-white/30 font-mono">#{c.id}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px] border-white/10 text-white/50">{c.tag}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#F59E0B]">{c.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState message="No click events recorded yet. Clicks require real user visits." />
              )}
            </AnalCard>
          </TabsContent>

          {/* ══ GEO TAB ══════════════════════════════════════════════════ */}
          <TabsContent value="geo" className="flex flex-col gap-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalCard title="Top Countries" icon={<Globe className="w-5 h-5" />} accent="#EC4899">
                <p className="text-xs text-white/30 mb-4">Traffic by country (from edge headers)</p>
                {loading ? <SkeletonList /> : (data?.topCountries ?? []).length > 0 ? (
                  <HorizontalBar
                    data={(data?.topCountries ?? []).map((r) => ({ name: r.country, value: r.count }))}
                    color="#EC4899"
                  />
                ) : <EmptyState message="No geographic data yet. Requires Vercel edge deployment." />}
              </AnalCard>

              <AnalCard title="Top Cities" icon={<MapPin className="w-5 h-5" />} accent="#0073BB">
                <p className="text-xs text-white/30 mb-4">Traffic by city</p>
                {loading ? <SkeletonList /> : (data?.topCities ?? []).length > 0 ? (
                  <HorizontalBar
                    data={(data?.topCities ?? []).map((r) => ({ name: r.city, value: r.count }))}
                    color="#0073BB"
                  />
                ) : <EmptyState message="No city-level data yet." />}
              </AnalCard>
            </div>

            <AnalCard title="Screen Resolutions" icon={<DeviceTablet className="w-5 h-5" />} accent="#7C3AED">
              <p className="text-xs text-white/30 mb-4">Visitor screen dimensions</p>
              {loading ? <SkeletonList /> : (
                <HorizontalBar
                  data={(data?.screenResolutions ?? []).map((r) => ({ name: r.resolution, value: r.count }))}
                  color="#7C3AED"
                />
              )}
            </AnalCard>
          </TabsContent>

          {/* ══ DEVICES TAB ══════════════════════════════════════════════ */}
          <TabsContent value="devices" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            <AnalCard title="Device Types" icon={<Desktop className="w-5 h-5" />} accent="#0073BB">
              <DonutChart
                data={(data?.deviceBreakdown ?? []).map((d, i) => ({ ...d, color: ["#0073BB", "#FF9900", "#7C3AED"][i % 3] }))}
                loading={loading}
                label="devices"
              />
            </AnalCard>

            <AnalCard title="Browsers" icon={<Browser className="w-5 h-5" />} accent="#FF9900">
              <DonutChart
                data={(data?.browserBreakdown ?? []).map((d, i) => ({ ...d, color: ["#FF9900", "#16A34A", "#EC4899", "#7C3AED", "#0073BB"][i % 5] }))}
                loading={loading}
                label="browsers"
              />
            </AnalCard>

            <AnalCard title="Operating Systems" icon={<Gauge className="w-5 h-5" />} accent="#16A34A">
              <DonutChart
                data={(data?.osBreakdown ?? []).map((d, i) => ({ ...d, color: ["#16A34A", "#F59E0B", "#0073BB", "#EC4899", "#7C3AED"][i % 5] }))}
                loading={loading}
                label="systems"
              />
            </AnalCard>
          </TabsContent>

          {/* ══ PERFORMANCE TAB ══════════════════════════════════════════ */}
          <TabsContent value="performance" className="flex flex-col gap-6 mt-4">
            <AnalCard title="Core Web Vitals" icon={<Gauge className="w-5 h-5" />} accent="#FF9900">
              <p className="text-xs text-white/30 mb-5">Real measurements from user sessions. <span className="text-amber-400">N/A = no data collected yet for this period.</span></p>
              <PerformanceMetricsCard metrics={data?.performanceMetrics ?? null} loading={loading} />
            </AnalCard>

            <AnalCard title="Bounce Rate Over Time" icon={<ArrowBendRightDown className="w-5 h-5" />} accent="#7C3AED">
              {loading ? (
                <Skeleton className="h-[200px] rounded-xl" />
              ) : (
                <VerticalBarChart
                  data={(data?.trafficTrends ?? []).map((t) => ({
                    label: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    count: t.visits > 0 ? Math.round((t.bounces / t.visits) * 100) : 0,
                  }))}
                  color="#7C3AED"
                />
              )}
              <p className="text-xs text-white/30 mt-3 text-center">Bounce rate % per day</p>
            </AnalCard>
          </TabsContent>

          {/* ══ FUNNEL TAB ═══════════════════════════════════════════════ */}
          <TabsContent value="funnel" className="flex flex-col gap-6 mt-4">
            <AnalCard title="Conversion Funnel" icon={<Funnel className="w-5 h-5" />} accent="#FF9900" fullWidth>
              <p className="text-xs text-white/30 mb-5">Registration journey: Home → Tracks → Events → Register</p>
              <FunnelChart data={data?.funnelData ?? []} loading={loading} />
            </AnalCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalCard title="Top Entry Points" icon={<MapPin className="w-5 h-5" />} accent="#16A34A">
                <p className="text-xs text-white/30 mb-4">Where users begin their session</p>
                {loading ? <SkeletonList /> : <HorizontalBar data={data?.entryPages ?? []} nameKey="path" color="#16A34A" />}
              </AnalCard>

              <AnalCard title="Drop-off Points" icon={<Export className="w-5 h-5" />} accent="#EF4444">
                <p className="text-xs text-white/30 mb-4">Where users leave the funnel</p>
                {loading ? <SkeletonList /> : <HorizontalBar data={data?.exitPages ?? []} nameKey="path" color="#EF4444" />}
              </AnalCard>
            </div>
          </TabsContent>

          {/* ══ LOG EXPLORER TAB ═════════════════════════════════════════ */}
          <TabsContent value="visitors" className="mt-4">
            <AnalCard
              title="Recent Session Log"
              icon={<Users className="w-5 h-5" />}
              accent="#EC4899"
              actions={
                <Badge variant="outline" className="border-white/10 text-white/40 font-mono text-xs">
                  last 30 min · {data?.recentVisitors?.length ?? 0} sessions
                </Badge>
              }
            >
              <ScrollArea className="max-h-[520px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/8 hover:bg-transparent">
                      <TableHead className="text-white/40 text-xs uppercase tracking-wider">IP / Location</TableHead>
                      <TableHead className="text-white/40 text-xs uppercase tracking-wider">System</TableHead>
                      <TableHead className="text-white/40 text-xs uppercase tracking-wider">Last Page</TableHead>
                      <TableHead className="text-white/40 text-xs uppercase tracking-wider">Pages</TableHead>
                      <TableHead className="text-white/40 text-xs uppercase tracking-wider">Duration</TableHead>
                      <TableHead className="text-white/40 text-xs uppercase tracking-wider">Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      [...Array(6)].map((_, i) => (
                        <TableRow key={i} className="border-white/5">
                          {[...Array(6)].map((__, j) => (
                            <TableCell key={j}><Skeleton className="h-5 w-24 rounded" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (data?.recentVisitors ?? []).length > 0 ? (
                      data!.recentVisitors.map((v, i) => (
                        <TableRow key={i} className="border-white/5 hover:bg-white/3 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white font-mono">{v.ip}</span>
                              <span className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-pink-400" />
                                {v.location}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-white/60">{v.system}</TableCell>
                          <TableCell className="text-xs text-[#FF9900] font-mono max-w-[140px] truncate">{v.lastPage}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-white/10 text-white/50 text-xs">{v.pageCount}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-white/60">{formatDuration(v.duration)}</TableCell>
                          <TableCell className="text-sm text-white/50">
                            {format(new Date(v.lastActive), "HH:mm:ss")}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-16 text-center text-white/30 text-sm">
                          No active sessions in the last 30 minutes.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </AnalCard>
          </TabsContent>
        </Tabs>

        {/* ── User composition bar (always visible) ────────────────────── */}
        {data && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[#0F1318]/80 border-white/6 rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <ArrowsLeftRight className="w-4 h-4 text-white/40" />
                    <p className="text-sm font-bold text-white">User Composition</p>
                  </div>
                  <p className="text-xs text-white/30">{data.summary.totalVisits.toLocaleString()} total sessions</p>
                </div>
                <Progress
                  value={(data.summary.newUsers / Math.max(data.summary.totalVisits, 1)) * 100}
                  className="h-2.5 bg-white/8"
                />
                <div className="flex justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#EC4899] to-[#F59E0B]" />
                    <span className="text-xs text-white/50">New — {data.summary.newUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="text-xs text-white/50">Returning — {data.summary.returningUsers.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </TooltipProvider>
  )
}

// ─── Shared local helpers ──────────────────────────────────────────────────────
function AnalCard({
  title, icon, accent = "#FF9900", children, actions, fullWidth, className = "",
}: {
  title: string; icon: React.ReactNode; accent?: string; children: React.ReactNode
  actions?: React.ReactNode; fullWidth?: boolean; className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className={fullWidth ? "lg:col-span-2" : ""}
    >
      <Card
        className={`relative overflow-hidden bg-[#0F1318]/80 border-white/8 rounded-3xl gap-0 ${className}`}
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.2)" }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] opacity-50"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />
        {/* Custom header row: avoids CardHeader grid layout conflict */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-white/5"
              style={{ background: `${accent}15`, color: accent }}>
              {icon}
            </div>
            <p className="text-white text-base font-bold">{title}</p>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        <CardContent className="px-6 pb-6">{children}</CardContent>
      </Card>
    </motion.div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-white/30 text-sm border-2 border-dashed border-white/8 rounded-2xl">
      {message}
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-2.5">
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 rounded-xl" />)}
    </div>
  )
}
