"use client"

import { motion } from "framer-motion"
import { TrendUp, TrendDown } from "@phosphor-icons/react"

interface OverviewCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  accentColor: string
  growth?: number | null
  growthInverse?: boolean // For bounce rate: lower is better
  subtitle?: string
  badge?: React.ReactNode
  delay?: number
  loading?: boolean
}

export function OverviewCard({
  title,
  value,
  icon,
  accentColor,
  growth,
  growthInverse = false,
  subtitle,
  badge,
  delay = 0,
  loading = false,
}: OverviewCardProps) {
  const isPositive = growthInverse ? (growth ?? 0) < 0 : (growth ?? 0) > 0
  const isNegative = growthInverse ? (growth ?? 0) > 0 : (growth ?? 0) < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#0F1318]/80 backdrop-blur-md p-6 group hover:border-white/15 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]"
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.2)` }}
    >
      {/* Accent glow top */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)` }}
      />
      {/* Corner glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: accentColor }}
      />

      <div className="flex items-start justify-between mb-5">
        <div
          className="p-3 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform duration-300"
          style={{ background: `${accentColor}18` }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
        {badge}
      </div>

      <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">{title}</p>

      <div className="text-4xl font-black text-white tracking-tight leading-none mb-2">
        {loading ? (
          <div className="h-10 w-24 bg-white/5 rounded-xl animate-pulse" />
        ) : (
          value
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        {growth !== null && growth !== undefined && !loading && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              isPositive
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : isNegative
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-white/5 text-white/40 border border-white/10"
            }`}
          >
            {isPositive ? (
              <TrendUp weight="bold" className="w-3 h-3" />
            ) : isNegative ? (
              <TrendDown weight="bold" className="w-3 h-3" />
            ) : null}
            {Math.abs(growth)}%
          </div>
        )}
        {subtitle && (
          <span className="text-white/30 text-xs">{subtitle}</span>
        )}
      </div>
    </motion.div>
  )
}
