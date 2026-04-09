"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Eye, Clock, ArrowBendRightDown, ChartLineUp, Globe,
  DeviceMobile, Desktop, DeviceTablet, Browser, Path, ArrowSquareOut,
  Lightning, Funnel, Export, MagnifyingGlass, BellRinging,
  Circle, ArrowsLeftRight, Gauge, MapPin, ChartBar,
  SlidersHorizontal, DownloadSimple, CalendarBlank
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { OverviewCard } from "./components/OverviewCard"
import { SectionCard } from "./components/SectionCard"
import { TrafficChart } from "./components/TrafficChart"
import { DonutChart } from "./components/DonutChart"
import { HorizontalBar, VerticalBarChart } from "./components/BarCharts"
import { FunnelChart } from "./components/FunnelChart"
import { PerformanceMetricsCard } from "./components/PerformanceMetrics"
import { Heatmap } from "./components/Heatmap"

// ─── Types ────────────────────────────────────────────────────────────────────
type AdvancedAnalytics = {
  summary: {
    totalVisits: number
    totalPageViews: number
    avgDuration: number
    bounceRate: number
    pagesPerSession: number
    newUsers: number
    returningUsers: number
    visitGrowth: number | null
    bounceRateDelta: number
    durationGrowth: number | null
  }
  trafficTrends: { date: string; visits: number; pageViews: number; bounces: number; avgDuration: number }[]
  topPages: { path: string; hits: number; avgTime: number }[]
  activeUsers: number
  deviceBreakdown: { name: string; value: number }[]
  browserBreakdown: { name: string; value: number }[]
  osBreakdown: { name: string; value: number }[]
  trafficSources: { name: string; value: number; color: string }[]
  durationDistribution: { label: string; count: number }[]
  entryPages: { path: string; count: number }[]
  exitPages: { path: string; count: number }[]
  userFlow: { path: string; count: number }[]
  performanceMetrics: {
    lcp: number; cls: number; fid: number; inp: number
    ttfb: number; errorRate4xx: number; errorRate5xx: number
  }
  funnelData: { label: string; count: number; path: string }[]
  screenResolutions: { resolution: string; count: number }[]
  topCountries: { country: string; count: number }[]
  heatmapData: { hour: number; dow: number; count: number }[]
  recentVisitors: { ip: string; deviceId: string; location: string; system: string; duration: number; lastActive: string }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDuration = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

const DAY_OPTIONS = [
  { label: "Today", value: 1 },
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-white/5 rounded-xl animate-pulse ${className}`} />
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
function AlertBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <BellRinging weight="fill" className="w-4 h-4 shrink-0" />
        {message}
      </div>
      <button onClick={onDismiss} className="text-amber-400/60 hover:text-amber-300 text-xs font-bold">Dismiss</button>
    </motion.div>
  )
}

// ─── Export helper ────────────────────────────────────────────────────────────
function exportCSV(data: AdvancedAnalytics) {
  const rows = [
    ["Date", "Sessions", "Page Views", "Avg Duration (s)", "Bounces"],
    ...data.trafficTrends.map((t) => [t.date, t.visits, t.pageViews, t.avgDuration, t.bounces]),
  ]
  const csv = rows.map((r) => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `analytics-export-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [days, setDays] = React.useState(7)
  const [dateRange, setDateRange] = React.useState<{from?: Date, to?: Date}>({})
  const [chartMode, setChartMode] = React.useState<"area" | "bar">("area")
  const [activeTab, setActiveTab] = React.useState("traffic")
  const [pageFilter, setPageFilter] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<AdvancedAnalytics | null>(null)
  const [alerts, setAlerts] = React.useState<string[]>([])
  const [lastActive, setLastActive] = React.useState(0)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      let url = `/api/analytics/advanced?days=${days}`
      if (dateRange.from && dateRange.to) {
        url = `/api/analytics/advanced?start=${dateRange.from.toISOString()}&end=${dateRange.to.toISOString()}`
      }
      const res = await fetch(url)
      const json: AdvancedAnalytics = await res.json()
      setData(json)

      // Anomaly detection: >50% traffic spike vs average
      if (json.summary.visitGrowth !== null && json.summary.visitGrowth > 50) {
        setAlerts((a) => [
          ...a.filter((x) => !x.includes("spike")),
          `🚀 Traffic spike detected! Sessions up ${json.summary.visitGrowth}% vs previous period.`,
        ])
      } else if (json.summary.visitGrowth !== null && json.summary.visitGrowth < -40) {
        setAlerts((a) => [
          ...a.filter((x) => !x.includes("drop")),
          `⚠️ Traffic drop detected! Sessions down ${Math.abs(json.summary.visitGrowth ?? 0)}% vs previous period.`,
        ])
      }

      setLastActive(json.activeUsers)
    } catch (e) {
      console.error("Failed to load analytics", e)
    } finally {
      setLoading(false)
    }
  }, [days, dateRange])

  React.useEffect(() => { fetchData() }, [fetchData])

  // Live refresh every 60s for active users
  React.useEffect(() => {
    const id = setInterval(async () => {
      try {
        let url = `/api/analytics/advanced?days=${days}`
        if (dateRange.from && dateRange.to) {
          url = `/api/analytics/advanced?start=${dateRange.from.toISOString()}&end=${dateRange.to.toISOString()}`
        }
        const res = await fetch(url)
        const json: AdvancedAnalytics = await res.json()
        setLastActive(json.activeUsers)
      } catch { /* silent */ }
    }, 60_000)
    return () => clearInterval(id)
  }, [days, dateRange])

  const filteredPages = (data?.topPages ?? []).filter((p) =>
    pageFilter === "" || p.path.toLowerCase().includes(pageFilter.toLowerCase())
  )

  const TABS = [
    { id: "traffic", label: "Traffic", icon: <ChartLineUp className="w-4 h-4" /> },
    { id: "behavior", label: "Behavior", icon: <Path className="w-4 h-4" /> },
    { id: "devices", label: "Devices", icon: <DeviceMobile className="w-4 h-4" /> },
    { id: "visitors", label: "Log Explorer", icon: <Users className="w-4 h-4" /> },
    { id: "performance", label: "Performance", icon: <Gauge className="w-4 h-4" /> },
    { id: "funnel", label: "Funnel", icon: <Funnel className="w-4 h-4" /> },
  ]

  return (
    <div className="flex flex-col gap-8 pb-24 min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-[#FF9900]/15 border border-[#FF9900]/20">
              <ChartBar weight="duotone" className="w-5 h-5 text-[#FF9900]" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Analytics</h1>
            {/* Live pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 ml-1">
              <Circle weight="fill" className="w-2 h-2 text-green-400 animate-pulse" />
              <span className="text-xs font-bold text-green-400">{lastActive} live</span>
            </div>
          </div>
          <p className="text-white/40 text-sm">Deep insights into traffic, engagement, and performance</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date filter */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/8 p-1 rounded-2xl">
            {DAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setDays(opt.value); setDateRange({}); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  days === opt.value && !dateRange.from
                    ? "bg-[#FF9900] text-black shadow-[0_0_12px_rgba(255,153,0,0.35)]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/8 text-xs font-bold transition-all ${
                  dateRange.from && dateRange.to 
                  ? "bg-[#FF9900] text-black border-[#FF9900]/50" 
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                <CalendarBlank className="w-4 h-4" />
                {dateRange.from && dateRange.to 
                  ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                  : "Custom Range"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-white/10 bg-[#0A0D14]" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange as any}
                onSelect={(range) => {
                  setDateRange(range as any);
                }}
                numberOfMonths={2}
                className="text-white bg-[#0A0D14]"
              />
            </PopoverContent>
          </Popover>

          {/* Chart mode toggle */}
          <button
            onClick={() => setChartMode(chartMode === "area" ? "bar" : "area")}
            title="Toggle chart type"
            className="p-2.5 rounded-xl bg-white/5 border border-white/8 text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Export CSV */}
          <button
            onClick={() => data && exportCSV(data)}
            disabled={!data}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-bold disabled:opacity-40"
          >
            <DownloadSimple className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Alerts ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {alerts.map((alert, i) => (
          <AlertBanner key={i} message={alert} onDismiss={() => setAlerts((a) => a.filter((_, j) => j !== i))} />
        ))}
      </AnimatePresence>

      {/* ── Overview Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <OverviewCard
          title="Sessions"
          value={loading ? "--" : (data?.summary.totalVisits ?? 0).toLocaleString()}
          icon={<Users weight="fill" className="w-5 h-5" />}
          accentColor="#FF9900"
          growth={data?.summary.visitGrowth ?? null}
          subtitle="vs prior period"
          badge={
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <Circle weight="fill" className="w-2 h-2 text-green-400 animate-pulse" />
              <span className="text-[10px] font-bold text-green-400">{lastActive}</span>
            </div>
          }
          delay={0.05}
          loading={loading}
        />
        <OverviewCard
          title="Page Views"
          value={loading ? "--" : (data?.summary.totalPageViews ?? 0).toLocaleString()}
          icon={<Eye weight="fill" className="w-5 h-5" />}
          accentColor="#0073BB"
          growth={null}
          subtitle={`${data?.summary.pagesPerSession ?? 0} pages/session`}
          delay={0.10}
          loading={loading}
        />
        <OverviewCard
          title="Avg Duration"
          value={loading ? "--" : formatDuration(data?.summary.avgDuration ?? 0)}
          icon={<Clock weight="fill" className="w-5 h-5" />}
          accentColor="#16A34A"
          growth={data?.summary.durationGrowth ?? null}
          subtitle="per session"
          delay={0.15}
          loading={loading}
        />
        <OverviewCard
          title="Bounce Rate"
          value={loading ? "--" : `${data?.summary.bounceRate ?? 0}%`}
          icon={<ArrowBendRightDown weight="fill" className="w-5 h-5" />}
          accentColor="#7C3AED"
          growth={data?.summary.bounceRateDelta ?? null}
          growthInverse
          subtitle="lower is better"
          delay={0.20}
          loading={loading}
        />
        <OverviewCard
          title="New Users"
          value={loading ? "--" : (data?.summary.newUsers ?? 0).toLocaleString()}
          icon={<ArrowSquareOut weight="fill" className="w-5 h-5" />}
          accentColor="#EC4899"
          growth={null}
          subtitle="first-time visitors"
          delay={0.25}
          loading={loading}
        />
        <OverviewCard
          title="Returning"
          value={loading ? "--" : (data?.summary.returningUsers ?? 0).toLocaleString()}
          icon={<ArrowsLeftRight weight="fill" className="w-5 h-5" />}
          accentColor="#F59E0B"
          growth={null}
          subtitle="repeat visitors"
          delay={0.30}
          loading={loading}
        />
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white/3 border border-white/6 p-1 rounded-2xl w-full overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeAnalyticsTab"
                className="absolute inset-0 bg-white/8 border border-white/10 rounded-xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ══ TRAFFIC TAB ══════════════════════════════════════════════════ */}
        {activeTab === "traffic" && (
          <motion.div
            key="traffic"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* Main trend chart */}
            <SectionCard
              title="Traffic Over Time"
              icon={<ChartLineUp className="w-5 h-5" />}
              accentColor="#FF9900"
              actions={
                <span className="text-xs text-white/30 font-mono">
                  {data?.trafficTrends.length ?? 0} data points
                </span>
              }
            >
              <TrafficChart data={data?.trafficTrends ?? []} loading={loading} mode={chartMode} />
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Sources */}
              <SectionCard
                title="Traffic Sources"
                icon={<Globe className="w-5 h-5" />}
                accentColor="#0073BB"
              >
                <DonutChart
                  data={data?.trafficSources ?? []}
                  loading={loading}
                  label="total"
                />
              </SectionCard>

              {/* Session Duration Distribution */}
              <SectionCard
                title="Session Duration"
                icon={<Clock className="w-5 h-5" />}
                accentColor="#16A34A"
              >
                <VerticalBarChart
                  data={data?.durationDistribution ?? []}
                  loading={loading}
                  color="#16A34A"
                />
                <p className="text-xs text-white/30 mt-3 text-center">Distribution of session lengths</p>
              </SectionCard>

              {/* New vs Returning */}
              <SectionCard
                title="User Segments"
                icon={<Users className="w-5 h-5" />}
                accentColor="#EC4899"
              >
                <DonutChart
                  data={[
                    { name: "New Users", value: data?.summary.newUsers ?? 0, color: "#EC4899" },
                    { name: "Returning", value: data?.summary.returningUsers ?? 0, color: "#F59E0B" },
                  ]}
                  loading={loading}
                  label="users"
                />
              </SectionCard>
            </div>

            {/* Activity Heatmap */}
            <SectionCard
              title="Activity Heatmap"
              icon={<Lightning className="w-5 h-5" />}
              accentColor="#F59E0B"
            >
              <p className="text-xs text-white/30 mb-4">Sessions by hour-of-day and day-of-week</p>
              <Heatmap data={data?.heatmapData ?? []} loading={loading} />
            </SectionCard>
          </motion.div>
        )}

        {/* ══ BEHAVIOR TAB ══════════════════════════════════════════════════ */}
        {activeTab === "behavior" && (
          <motion.div
            key="behavior"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* Top Pages with search */}
            <SectionCard
              title="Most Visited Pages"
              icon={<Eye className="w-5 h-5" />}
              accentColor="#FF9900"
              actions={
                <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5">
                  <MagnifyingGlass className="w-3.5 h-3.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Filter pages…"
                    value={pageFilter}
                    onChange={(e) => setPageFilter(e.target.value)}
                    className="bg-transparent text-xs text-white placeholder-white/30 outline-none w-32"
                  />
                </div>
              }
            >
              {loading ? (
                <div className="space-y-2.5">
                  {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8" />)}
                </div>
              ) : filteredPages.length > 0 ? (
                <HorizontalBar
                  data={filteredPages}
                  nameKey="path"
                  color="#FF9900"
                  showAvgTime
                />
              ) : (
                <div className="text-center py-12 text-white/30 text-sm border-2 border-dashed border-white/8 rounded-2xl">
                  {pageFilter ? "No pages match your filter." : "No page views recorded yet."}
                </div>
              )}
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Entry Pages */}
              <SectionCard
                title="Entry Pages"
                icon={<ArrowSquareOut className="w-5 h-5" />}
                accentColor="#16A34A"
              >
                <p className="text-xs text-white/30 mb-4">Where users first land on your site</p>
                {loading ? (
                  <div className="space-y-2.5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
                ) : (
                  <HorizontalBar data={data?.entryPages ?? []} nameKey="path" color="#16A34A" />
                )}
              </SectionCard>

              {/* Exit Pages */}
              <SectionCard
                title="Exit Pages"
                icon={<ArrowBendRightDown className="w-5 h-5" />}
                accentColor="#ef4444"
              >
                <p className="text-xs text-white/30 mb-4">Where users leave your site</p>
                {loading ? (
                  <div className="space-y-2.5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
                ) : (
                  <HorizontalBar data={data?.exitPages ?? []} nameKey="path" color="#ef4444" />
                )}
              </SectionCard>
            </div>

            {/* User Flow */}
            <SectionCard
              title="Navigation Paths"
              icon={<Path className="w-5 h-5" />}
              accentColor="#7C3AED"
            >
              <p className="text-xs text-white/30 mb-4">Most common page-to-page journeys</p>
              {loading ? (
                <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
              ) : (data?.userFlow ?? []).length > 0 ? (
                <div className="space-y-2">
                  {(data?.userFlow ?? []).map((flow, i) => {
                    const [from, to] = flow.path.split(" → ")
                    const maxCount = Math.max(...(data?.userFlow ?? []).map((f) => f.count), 1)
                    const pct = (flow.count / maxCount) * 100
                    return (
                      <div key={i} className="group relative flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all">
                        <div
                          className="absolute inset-0 rounded-xl transition-all duration-500"
                          style={{ width: `${pct}%`, background: "rgba(124,58,237,0.08)" }}
                        />
                        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-[#7C3AED]/20 flex items-center justify-center text-[9px] font-black text-[#7C3AED] shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-xs text-[#0073BB] truncate max-w-[120px]">{from?.trim()}</span>
                          <span className="text-white/20">→</span>
                          <span className="text-xs text-[#FF9900] truncate max-w-[120px]">{to?.trim()}</span>
                        </div>
                        <span className="relative z-10 text-xs font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2.5 py-1 rounded-full shrink-0">
                          {flow.count}×
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-white/30 text-sm border-2 border-dashed border-white/8 rounded-2xl">
                  Not enough multi-page sessions yet.
                </div>
              )}
            </SectionCard>
          </motion.div>
        )}

        {/* ══ DEVICES TAB ══════════════════════════════════════════════════ */}
        {activeTab === "devices" && (
          <motion.div
            key="devices"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <SectionCard
              title="Device Types"
              icon={<Desktop className="w-5 h-5" />}
              accentColor="#0073BB"
            >
              <DonutChart
                data={(data?.deviceBreakdown ?? []).map((d, i) => ({
                  ...d,
                  color: ["#0073BB", "#FF9900", "#7C3AED"][i % 3],
                }))}
                loading={loading}
                label="devices"
              />
            </SectionCard>

            <SectionCard
              title="Browsers"
              icon={<Browser className="w-5 h-5" />}
              accentColor="#FF9900"
            >
              <DonutChart
                data={(data?.browserBreakdown ?? []).map((d, i) => ({
                  ...d,
                  color: ["#FF9900", "#16A34A", "#EC4899", "#7C3AED", "#0073BB"][i % 5],
                }))}
                loading={loading}
                label="browsers"
              />
            </SectionCard>

            <SectionCard
              title="Operating Systems"
              icon={<Gauge className="w-5 h-5" />}
              accentColor="#16A34A"
            >
              <DonutChart
                data={(data?.osBreakdown ?? []).map((d, i) => ({
                  ...d,
                  color: ["#16A34A", "#F59E0B", "#0073BB", "#EC4899", "#7C3AED"][i % 5],
                }))}
                loading={loading}
                label="systems"
              />
            </SectionCard>

            {/* Country Demographics */}
            <SectionCard
              title="Top Countries"
              icon={<MapPin className="w-5 h-5" />}
              accentColor="#EC4899"
              className="md:col-span-1 lg:col-span-2"
            >
              {loading ? (
                <div className="space-y-2.5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
              ) : (data?.topCountries?.length ?? 0) > 0 ? (
                <HorizontalBar
                  data={(data?.topCountries ?? []).map((r) => ({ name: r.country, value: r.count }))}
                  color="#EC4899"
                />
              ) : (
                <div className="text-center py-8 text-white/30 text-sm border-2 border-dashed border-white/8 rounded-2xl">
                  No geographic data yet.
                </div>
              )}
            </SectionCard>

            {/* Screen Resolutions */}
            <SectionCard
              title="Screen Resolutions"
              icon={<DeviceTablet className="w-5 h-5" />}
              accentColor="#7C3AED"
            >
              {loading ? (
                <div className="space-y-2.5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
              ) : (
                <HorizontalBar
                  data={(data?.screenResolutions ?? []).map((r) => ({ name: r.resolution, value: r.count }))}
                  color="#7C3AED"
                />
              )}
            </SectionCard>
          </motion.div>
        )}

        {/* ══ PERFORMANCE TAB ══════════════════════════════════════════════ */}
        {activeTab === "performance" && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            <SectionCard
              title="Core Web Vitals & Errors"
              icon={<Gauge className="w-5 h-5" />}
              accentColor="#FF9900"
            >
              <PerformanceMetricsCard metrics={data?.performanceMetrics ?? null} loading={loading} />
            </SectionCard>

            {/* Bounce rate over time */}
            <SectionCard
              title="Bounce Rate Over Time"
              icon={<ArrowBendRightDown className="w-5 h-5" />}
              accentColor="#7C3AED"
            >
              {loading ? (
                <div className="h-[200px] bg-white/3 rounded-xl animate-pulse" />
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
            </SectionCard>
          </motion.div>
        )}

        {/* ══ FUNNEL TAB ══════════════════════════════════════════════════ */}
        {activeTab === "funnel" && (
          <motion.div
            key="funnel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <SectionCard
              title="Conversion Funnel"
              icon={<Funnel className="w-5 h-5" />}
              accentColor="#FF9900"
              className="lg:col-span-2"
            >
              <p className="text-xs text-white/30 mb-5">Track users through the registration journey</p>
              <FunnelChart data={data?.funnelData ?? []} loading={loading} />
            </SectionCard>

            {/* Entry pages funnel */}
            <SectionCard
              title="Top Entry Points"
              icon={<MapPin className="w-5 h-5" />}
              accentColor="#16A34A"
            >
              <p className="text-xs text-white/30 mb-4">Where users begin their session</p>
              {loading ? (
                <div className="space-y-2.5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
              ) : (
                <HorizontalBar data={data?.entryPages ?? []} nameKey="path" color="#16A34A" />
              )}
            </SectionCard>

            {/* Exit pages */}
            <SectionCard
              title="Drop-off Points"
              icon={<Export className="w-5 h-5" />}
              accentColor="#ef4444"
            >
              <p className="text-xs text-white/30 mb-4">Where users leave the funnel</p>
              {loading ? (
                <div className="space-y-2.5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
              ) : (
                <HorizontalBar data={data?.exitPages ?? []} nameKey="path" color="#ef4444" />
              )}
            </SectionCard>
          </motion.div>
        )}

        {/* ══ VISITORS TAB ══════════════════════════════════════════════════ */}
        {activeTab === "visitors" && (
          <motion.div
            key="visitors"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <SectionCard
              title="Recent Log Explorer"
              icon={<Users className="w-5 h-5" />}
              accentColor="#EC4899"
              actions={
                <span className="text-xs text-white/30 font-mono">
                  {data?.recentVisitors?.length ?? 0} active sessions
                </span>
              }
            >
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 font-medium">IP Address / Location</th>
                      <th className="py-3 px-4 font-medium">Device Profile</th>
                      <th className="py-3 px-4 font-medium">Device ID</th>
                      <th className="py-3 px-4 font-medium">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td className="py-4 px-4"><Skeleton className="h-6 w-32" /></td>
                          <td className="py-4 px-4"><Skeleton className="h-6 w-24" /></td>
                          <td className="py-4 px-4"><Skeleton className="h-6 w-32" /></td>
                          <td className="py-4 px-4"><Skeleton className="h-6 w-16" /></td>
                        </tr>
                      ))
                    ) : (data?.recentVisitors ?? []).length > 0 ? (
                      data!.recentVisitors.map((v, i) => (
                        <tr key={i} className="hover:bg-white/2 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{v.ip}</span>
                              <span className="text-xs text-white/40 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-pink-400" /> {v.location}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-white/70">
                            {v.system}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-white/50">
                            {v.deviceId}
                          </td>
                          <td className="py-3 px-4 text-sm text-white/60">
                            <div className="flex flex-col">
                              <span>{format(new Date(v.lastActive), "MMM d, HH:mm:ss")}</span>
                              <span className="text-[10px] text-white/30 uppercase tracking-wider">{v.duration}s session</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-sm text-white/30 border-2 border-dashed border-white/8 rounded-2xl">
                          No visitor logs available for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Returning vs New comparison bar (always visible) ──────────── */}
      {data && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl border border-white/6 bg-[#0F1318]/80 p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">User Composition</p>
            <p className="text-xs text-white/30">{data.summary.totalVisits.toLocaleString()} total sessions</p>
          </div>
          <div className="relative h-5 rounded-full overflow-hidden bg-white/5">
            <div
              className="absolute inset-y-0 left-0 rounded-l-full transition-all duration-1000"
              style={{
                width: `${((data.summary.newUsers / Math.max(data.summary.totalVisits, 1)) * 100).toFixed(1)}%`,
                background: "linear-gradient(90deg, #EC4899, #F59E0B)",
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#EC4899] to-[#F59E0B]" />
              <span className="text-xs text-white/50">New — {data.summary.newUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="text-xs text-white/50">Returning — {data.summary.returningUsers.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
