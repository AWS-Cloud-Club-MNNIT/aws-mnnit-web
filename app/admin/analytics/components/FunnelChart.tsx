"use client"

import { ArrowRight, ArrowDown } from "@phosphor-icons/react"

interface FunnelStep {
  label: string
  count: number
  path: string
}

interface FunnelChartProps {
  data: FunnelStep[]
  loading?: boolean
}

export function FunnelChart({ data, loading }: FunnelChartProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-2">
      {data.map((step, i) => {
        const pct = (step.count / max) * 100
        const dropoff = i > 0 && data[i - 1].count > 0
          ? (((data[i - 1].count - step.count) / data[i - 1].count) * 100).toFixed(0)
          : null

        const colors = ["#FF9900", "#F59E0B", "#7C3AED", "#0073BB"]
        const color = colors[i % colors.length]

        return (
          <div key={i}>
            {i > 0 && dropoff !== null && (
              <div className="flex items-center gap-2 py-1 pl-6">
                <ArrowDown className="w-3 h-3 text-red-400/70" weight="bold" />
                <span className="text-xs text-red-400/70 font-mono">-{dropoff}% drop-off</span>
              </div>
            )}
            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-white/3 hover:bg-white/5 transition-colors group">
              {/* Fill bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-2xl transition-all duration-700"
                style={{ width: `${pct}%`, background: `${color}20` }}
              />
              <div className="relative flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: `${color}25`, color }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{step.label}</div>
                    <div className="text-xs text-white/30">{step.path}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-black" style={{ color }}>{step.count.toLocaleString()}</div>
                    <div className="text-xs text-white/30">{pct.toFixed(0)}% of top</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
