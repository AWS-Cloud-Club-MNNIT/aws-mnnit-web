"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const COLORS = ["#FF9900", "#0073BB", "#7C3AED", "#16A34A", "#EC4899", "#F59E0B"]

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[]
  loading?: boolean
  label?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-[#070B10] border border-white/10 rounded-xl p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.payload.fill }} />
        <span className="text-white text-sm font-bold">{item.name}</span>
        <span className="text-white/60 text-sm">{item.value.toLocaleString()}</span>
      </div>
    </div>
  )
}

export function DonutChart({ data, loading, label }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (loading) {
    return <div className="h-[240px] w-full bg-white/3 rounded-2xl animate-pulse" />
  }

  return (
    <div className="relative h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "#ffffff70", paddingTop: "8px" }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: "-12px" }}>
        <div className="text-2xl font-black text-white">{total.toLocaleString()}</div>
        {label && <div className="text-white/40 text-xs mt-0.5">{label}</div>}
      </div>
    </div>
  )
}
