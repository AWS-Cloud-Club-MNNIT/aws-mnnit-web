"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ScrollEntry {
  path:     string
  avgDepth: number
  sessions: number
}

interface ScrollDepthChartProps {
  data:    ScrollEntry[]
  loading: boolean
}

const MILESTONES = [25, 50, 75, 100]

export function ScrollDepthChart({ data, loading }: ScrollDepthChartProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-white/30 text-sm border-2 border-dashed border-white/8 rounded-2xl">
        No scroll depth data yet. Requires real user visits with scroll tracking enabled.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((entry, i) => {
        const depth    = entry.avgDepth
        const segments = MILESTONES.map((m) => ({ milestone: m, reached: depth >= m }))

        return (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/60 truncate max-w-[200px] group-hover:text-white/90 transition-colors font-mono">
                {entry.path === "/" ? "/ (Home)" : entry.path}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30">{entry.sessions} sessions</span>
                <span className="text-xs font-bold text-[#7C3AED]">{depth}% avg</span>
              </div>
            </div>

            {/* Milestone segments */}
            <div className="flex gap-1">
              {segments.map(({ milestone, reached }) => (
                <Tooltip key={milestone}>
                  <TooltipTrigger asChild>
                    <div
                      className="flex-1 h-2.5 rounded-full transition-all duration-700 cursor-help"
                      style={{
                        background: reached
                          ? `linear-gradient(90deg, #7C3AED, #EC4899)`
                          : "rgba(255,255,255,0.06)",
                        opacity: reached ? 1 : 0.4,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {milestone}% — {reached ? "✓ reached on avg" : "✗ not reached"}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Milestone labels */}
            <div className="flex justify-between mt-1">
              {MILESTONES.map((m) => (
                <span key={m} className="text-[9px] text-white/20 font-mono">{m}%</span>
              ))}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-white/5 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-full" style={{ background: "linear-gradient(90deg, #7C3AED, #EC4899)" }} />
          <span className="text-[10px] text-white/30">Average reached</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-full bg-white/10" />
          <span className="text-[10px] text-white/30">Not reached</span>
        </div>
      </div>
    </div>
  )
}
