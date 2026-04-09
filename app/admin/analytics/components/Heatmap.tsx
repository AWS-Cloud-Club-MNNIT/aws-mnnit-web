"use client"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`
)

interface HeatmapEntry {
  hour: number
  dow: number  // 1=Sun, 7=Sat
  count: number
}

interface HeatmapProps {
  data: HeatmapEntry[]
  loading?: boolean
}

export function Heatmap({ data, loading }: HeatmapProps) {
  if (loading) {
    return <div className="h-[180px] rounded-xl bg-white/3 animate-pulse" />
  }

  // Build 7×24 grid (dow 1-7, hour 0-23)
  const grid: Record<string, number> = {}
  let maxVal = 0
  for (const d of data) {
    const key = `${d.dow}-${d.hour}`
    grid[key] = (grid[key] ?? 0) + d.count
    if (grid[key] > maxVal) maxVal = grid[key]
  }

  const getColor = (count: number) => {
    if (count === 0) return "bg-white/3"
    const pct = count / (maxVal || 1)
    if (pct < 0.25) return "bg-[#FF9900]/20"
    if (pct < 0.5)  return "bg-[#FF9900]/40"
    if (pct < 0.75) return "bg-[#FF9900]/65"
    return "bg-[#FF9900]/90"
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hour labels */}
        <div className="flex gap-px mb-1 ml-10">
          {HOURS.map((h, i) => (
            <div key={i} className="flex-1 text-center text-[8px] text-white/25 font-mono">
              {[0, 6, 12, 18].includes(i) ? h : ""}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {DAYS.map((day, di) => (
          <div key={di} className="flex items-center gap-px mb-px">
            <div className="w-9 text-[9px] text-white/30 font-bold text-right pr-2 shrink-0">{day}</div>
            {HOURS.map((_, hi) => {
              const dow = di + 1 // 1=Sun
              const count = grid[`${dow}-${hi}`] ?? 0
              return (
                <div
                  key={hi}
                  className={`flex-1 h-5 rounded-[2px] cursor-pointer transition-all hover:ring-1 hover:ring-white/30 ${getColor(count)}`}
                  title={`${day} ${HOURS[hi]}: ${count} sessions`}
                />
              )
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-10">
          <span className="text-[9px] text-white/30">Less</span>
          {["bg-white/3", "bg-[#FF9900]/20", "bg-[#FF9900]/40", "bg-[#FF9900]/65", "bg-[#FF9900]/90"].map((c, i) => (
            <div key={i} className={`w-4 h-4 rounded-[2px] ${c}`} />
          ))}
          <span className="text-[9px] text-white/30">More</span>
        </div>
      </div>
    </div>
  )
}
