"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"

interface HorizontalBarProps {
  data: { name?: string; label?: string; value?: number; count?: number; path?: string; hits?: number; avgTime?: number }[]
  valueKey?: string
  nameKey?: string
  color?: string
  loading?: boolean
  showAvgTime?: boolean
  formatValue?: (v: number) => string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, showAvgTime }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#070B10] border border-white/10 rounded-xl p-3 shadow-xl max-w-[220px]">
      <p className="text-white/50 text-xs mb-2 truncate">{d.name || d.label || d.path}</p>
      <p className="text-white font-bold text-sm">{(d.value ?? d.count ?? d.hits ?? 0).toLocaleString()} visits</p>
      {showAvgTime && d.avgTime !== undefined && (
        <p className="text-white/50 text-xs mt-1">Avg time: {Math.floor(d.avgTime / 60)}m {d.avgTime % 60}s</p>
      )}
    </div>
  )
}

export function HorizontalBar({ data, color = "#FF9900", loading, showAvgTime, nameKey = "name" }: HorizontalBarProps) {
  // Normalize data
  const normalized = data.map((d) => ({
    name: d[nameKey as keyof typeof d] as string || d.label || d.path || "",
    value: d.value ?? d.count ?? d.hits ?? 0,
    avgTime: d.avgTime,
  }))

  const max = Math.max(...normalized.map((d) => d.value), 1)

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {normalized.map((item, i) => {
        const pct = (item.value / max) * 100
        return (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/60 truncate max-w-[200px] group-hover:text-white/90 transition-colors">
                {item.name === "/" ? "/ (Home)" : item.name}
              </span>
              <div className="flex items-center gap-2">
                {showAvgTime && item.avgTime !== undefined && (
                  <span className="text-xs text-white/30">{Math.floor(item.avgTime / 60)}m {item.avgTime % 60}s</span>
                )}
                <span className="text-xs font-bold" style={{ color }}>{item.value.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface VerticalBarChartProps {
  data: { label: string; count: number }[]
  color?: string
  loading?: boolean
}

export function VerticalBarChart({ data, color = "#7C3AED", loading }: VerticalBarChartProps) {
  if (loading) {
    return <div className="h-[200px] bg-white/3 rounded-xl animate-pulse" />
  }
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
          <XAxis dataKey="label" stroke="transparent" tick={{ fill: "#ffffff50", fontSize: 10 }} />
          <YAxis stroke="transparent" tick={{ fill: "#ffffff50", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#070B10", borderColor: "#ffffff15", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
          />
          <Bar dataKey="count" name="Sessions" radius={[4, 4, 0, 0]} fill={color} fillOpacity={0.85}>
            {data.map((_, i) => (
              <Cell key={i} fill={color} fillOpacity={0.6 + (i / data.length) * 0.4} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
