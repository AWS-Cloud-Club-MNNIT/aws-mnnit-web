"use client"

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"

interface TrafficTrend {
  date: string
  visits: number
  pageViews: number
  bounces: number
  avgDuration: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = new Date(label)
  const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return (
    <div className="bg-[#070B10] border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[160px]">
      <p className="text-white/50 text-xs font-bold mb-3">{formatted}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center justify-between gap-6 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-white/60 text-xs">{p.name}</span>
          </div>
          <span className="text-white font-bold text-sm">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

interface TrafficChartProps {
  data: TrafficTrend[]
  loading: boolean
  mode: "area" | "bar"
}

export function TrafficChart({ data, loading, mode }: TrafficChartProps) {
  if (loading) {
    return (
      <div className="w-full h-[320px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/30 text-xs font-mono">Loading chart…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {mode === "area" ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9900" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="transparent"
              tick={{ fill: "#ffffff40", fontSize: 11 }}
              tickFormatter={(v) => {
                const d = new Date(v)
                return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`
              }}
            />
            <YAxis stroke="transparent" tick={{ fill: "#ffffff40", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", color: "#ffffff80", paddingTop: "16px" }} />
            <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#7C3AED" strokeWidth={2.5} fill="url(#gViews)" dot={false} activeDot={{ r: 5, fill: "#7C3AED" }} />
            <Area type="monotone" dataKey="visits" name="Sessions" stroke="#FF9900" strokeWidth={2.5} fill="url(#gVisits)" dot={false} activeDot={{ r: 5, fill: "#FF9900" }} />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis dataKey="date" stroke="transparent" tick={{ fill: "#ffffff40", fontSize: 11 }}
              tickFormatter={(v) => {
                const d = new Date(v)
                return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`
              }}
            />
            <YAxis stroke="transparent" tick={{ fill: "#ffffff40", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", color: "#ffffff80", paddingTop: "16px" }} />
            <Bar dataKey="visits" name="Sessions" fill="#FF9900" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
            <Bar dataKey="pageViews" name="Page Views" fill="#7C3AED" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
