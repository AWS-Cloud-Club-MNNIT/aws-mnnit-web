"use client"

import { CheckCircle, Warning, XCircle } from "@phosphor-icons/react"

interface PerformanceMetrics {
  lcp: number
  cls: number
  fid: number
  ttfb: number
  inp: number
  errorRate4xx: number
  errorRate5xx: number
}

interface MetricGaugeProps {
  label: string
  value: number
  unit: string
  good: number
  poor: number
  lowerIsBetter?: boolean
  description?: string
}

function MetricGauge({ label, value, unit, good, poor, lowerIsBetter = true, description }: MetricGaugeProps) {
  let status: "good" | "needs-improvement" | "poor"
  if (lowerIsBetter) {
    status = value <= good ? "good" : value <= poor ? "needs-improvement" : "poor"
  } else {
    status = value >= good ? "good" : value >= poor ? "needs-improvement" : "poor"
  }

  const config = {
    good: { color: "#22c55e", bg: "#22c55e20", icon: <CheckCircle weight="fill" className="w-4 h-4" />, label: "Good" },
    "needs-improvement": { color: "#F59E0B", bg: "#F59E0B20", icon: <Warning weight="fill" className="w-4 h-4" />, label: "Needs Work" },
    poor: { color: "#ef4444", bg: "#ef444420", icon: <XCircle weight="fill" className="w-4 h-4" />, label: "Poor" },
  }

  const { color, bg, icon, label: statusLabel } = config[status]

  const maxVal = lowerIsBetter ? poor * 1.5 : good * 1.5
  const pct = lowerIsBetter
    ? Math.min((value / maxVal) * 100, 100)
    : Math.min((value / maxVal) * 100, 100)
  const barPct = lowerIsBetter ? pct : 100 - pct

  return (
    <div className="p-4 rounded-2xl border border-white/5 bg-white/3 hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-white/40 font-bold tracking-widest uppercase">{label}</p>
          {description && <p className="text-xs text-white/25 mt-0.5">{description}</p>}
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold"
          style={{ background: bg, color }}
        >
          {icon}
          {statusLabel}
        </div>
      </div>
      <div className="text-3xl font-black text-white mb-3">
        {typeof value === "number" ? value.toLocaleString() : value}
        <span className="text-sm font-bold text-white/40 ml-1">{unit}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${100 - barPct}%`, background: `linear-gradient(90deg, #22c55e, #F59E0B ${good / poor * 100}%, #ef4444)` }}
        />
      </div>
    </div>
  )
}

interface PerformanceMetricsCardProps {
  metrics: PerformanceMetrics | null
  loading?: boolean
}

export function PerformanceMetricsCard({ metrics, loading }: PerformanceMetricsCardProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <MetricGauge label="LCP" value={metrics.lcp} unit="s" good={2.5} poor={4.0} description="Largest Contentful Paint" />
      <MetricGauge label="CLS" value={metrics.cls} unit="" good={0.1} poor={0.25} description="Cumulative Layout Shift" />
      <MetricGauge label="FID" value={metrics.fid} unit="ms" good={100} poor={300} description="First Input Delay" />
      <MetricGauge label="INP" value={metrics.inp} unit="ms" good={200} poor={500} description="Interaction to Next Paint" />
      <MetricGauge label="TTFB" value={metrics.ttfb} unit="ms" good={600} poor={1800} description="Time To First Byte" />
      <MetricGauge label="4xx Errors" value={metrics.errorRate4xx} unit="%" good={2} poor={5} description="Client error rate" />
      <MetricGauge label="5xx Errors" value={metrics.errorRate5xx} unit="%" good={0.5} poor={2} description="Server error rate" />
    </div>
  )
}
