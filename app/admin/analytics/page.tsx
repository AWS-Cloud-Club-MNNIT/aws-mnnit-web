"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  TrendUp, 
  Clock, 
  Eye, 
  SignIn, 
  ListNumbers,
  ChartLineUp,
  Circle
} from "@phosphor-icons/react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

type AnalyticsSummary = {
  totalVisits: number;
  totalPageViews: number;
  avgDuration: number;
  bounceRate: number;
  pagesPerSession: number;
}

type TrafficTrend = {
  date: string;
  visits: number;
  pageViews: number;
}

type TopPage = {
  path: string;
  hits: number;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function AnalyticsDashboard() {
  const [days, setDays] = React.useState(7)
  const [loading, setLoading] = React.useState(true)
  
  const [summary, setSummary] = React.useState<AnalyticsSummary | null>(null)
  const [trends, setTrends] = React.useState<TrafficTrend[]>([])
  const [topPages, setTopPages] = React.useState<TopPage[]>([])
  const [activeUsers, setActiveUsers] = React.useState(0)

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/analytics/summary?days=${days}`)
        const data = await res.json()
        
        if (data.summary) {
          setSummary(data.summary)
          setTrends(data.trafficTrends)
          setTopPages(data.topPages)
          setActiveUsers(data.activeUsers)
        }
      } catch (error) {
        console.error("Error fetching analytics", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [days])

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Website Analytics</h1>
          <p className="text-white/50 font-medium text-lg">Monitor traffic, engagement, and realtime activity.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#1A222D] border border-white/10 p-2 rounded-2xl">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                days === d 
                  ? "bg-[#FF9900] text-black shadow-[0_0_15px_rgba(255,153,0,0.4)]" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Primary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="relative overflow-hidden bg-[#1A222D]/80 backdrop-blur-md border border-[#FF9900]/30 rounded-3xl p-8 hover:bg-[#232F3E] transition-all duration-300 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="p-4 rounded-2xl bg-[#232F3E] border border-white/5 group-hover:scale-110 transition-transform">
              <Users weight="fill" className="w-8 h-8 text-[#FF9900]" />
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
              <Circle weight="fill" className="w-2 h-2 text-green-400 animate-pulse" />
              <span className="text-xs font-bold text-green-400">{activeUsers} Active</span>
            </div>
          </div>
          <h3 className="text-white/50 font-bold text-xs tracking-widest uppercase mb-1">Total Visits</h3>
          <div className="text-5xl font-black text-white tracking-tight">
            {loading ? <span className="animate-pulse">--</span> : summary?.totalVisits.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="relative overflow-hidden bg-[#1A222D]/80 backdrop-blur-md border border-[#0073BB]/30 rounded-3xl p-8 hover:bg-[#232F3E] transition-all duration-300 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="p-4 rounded-2xl bg-[#232F3E] border border-white/5 group-hover:scale-110 transition-transform">
              <Eye weight="fill" className="w-8 h-8 text-[#0073BB]" />
            </div>
            <TrendUp weight="bold" className="w-6 h-6 text-white/20 group-hover:text-white/60" />
          </div>
          <h3 className="text-white/50 font-bold text-xs tracking-widest uppercase mb-1">Page Views</h3>
          <div className="text-5xl font-black text-white tracking-tight">
             {loading ? <span className="animate-pulse">--</span> : summary?.totalPageViews.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="relative overflow-hidden bg-[#1A222D]/80 backdrop-blur-md border border-[#16A34A]/30 rounded-3xl p-8 hover:bg-[#232F3E] transition-all duration-300 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="p-4 rounded-2xl bg-[#232F3E] border border-white/5 group-hover:scale-110 transition-transform">
              <Clock weight="fill" className="w-8 h-8 text-[#16A34A]" />
            </div>
          </div>
          <h3 className="text-white/50 font-bold text-xs tracking-widest uppercase mb-1">Avg Session</h3>
          <div className="text-4xl font-black text-white tracking-tight">
             {loading ? <span className="animate-pulse">--</span> : formatDuration(summary?.avgDuration || 0)}
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="relative overflow-hidden bg-[#1A222D]/80 backdrop-blur-md border border-[#7C3AED]/30 rounded-3xl p-8 hover:bg-[#232F3E] transition-all duration-300 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="p-4 rounded-2xl bg-[#232F3E] border border-white/5 group-hover:scale-110 transition-transform">
              <SignIn weight="fill" className="w-8 h-8 text-[#7C3AED]" />
            </div>
          </div>
          <h3 className="text-white/50 font-bold text-xs tracking-widest uppercase mb-1">Bounce Rate</h3>
          <div className="text-5xl font-black text-white tracking-tight">
            {loading ? <span className="animate-pulse">--</span> : `${summary?.bounceRate}%`}
          </div>
        </motion.div>
      </div>

      {/* Chart & Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="lg:col-span-2 bg-[#1A222D] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
           {/* Ambient Glow */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/5 rounded-full blur-[80px]" />
           
           <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                 <ChartLineUp weight="duotone" className="w-6 h-6 text-[#7C3AED]" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Traffic Trends</h2>
           </div>

           <div className="h-[400px] w-full mt-4">
              {loading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                   <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                   <p className="text-white/40 font-mono text-sm">Aggregating timeline...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF9900" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FF9900" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="#ffffff33" 
                      tick={{ fill: '#ffffff80', fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => {
                         const d = new Date(val);
                         return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
                      }}
                    />
                    <YAxis 
                      stroke="#ffffff33" 
                      tick={{ fill: '#ffffff80', fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#131920', borderColor: '#ffffff20', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                       itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    <Area type="monotone" dataKey="visits" name="Visits" stroke="#FF9900" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
           </div>
        </motion.div>

        {/* Top Pages List */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
           className="bg-[#1A222D] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col"
        >
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF9900]/5 rounded-full blur-[80px]" />

           <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                 <ListNumbers weight="duotone" className="w-6 h-6 text-[#FF9900]" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Top Routes</h2>
           </div>

           <div className="flex-1 relative z-10">
             {loading ? (
                <div className="space-y-4">
                   {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-14 w-full bg-white/5 rounded-xl animate-pulse" />
                   ))}
                </div>
             ) : topPages.length > 0 ? (
                <div className="space-y-3">
                   {topPages.map((page, i) => (
                     <div key={page.path} className="flex items-center justify-between p-4 bg-[#0F1115] rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/50 group-hover:text-white transition-colors">
                              {i + 1}
                           </div>
                           <span className="text-sm font-medium text-white/80 truncate">
                              {page.path === "/" ? "/ (Home)" : page.path}
                           </span>
                        </div>
                        <div className="text-sm font-bold text-[#FF9900] bg-[#FF9900]/10 px-3 py-1 rounded-full whitespace-nowrap">
                           {page.hits.toLocaleString()}
                        </div>
                     </div>
                   ))}
                </div>
             ) : (
                <div className="h-full flex items-center justify-center text-white/40 text-sm py-10 border-2 border-dashed border-white/10 rounded-2xl">
                   No page views recorded yet
                </div>
             )}
           </div>
        </motion.div>
      </div>
    </div>
  )
}
