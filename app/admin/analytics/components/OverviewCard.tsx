"use client"

import { motion } from "framer-motion"
import { TrendUp, TrendDown } from "@phosphor-icons/react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface OverviewCardProps {
  title:         string
  value:         string | number | null   // null = loading
  icon:          React.ReactNode
  accentColor:   string
  growth?:       number | null
  growthInverse?: boolean
  subtitle?:     string
  badge?:        React.ReactNode
  delay?:        number
}

export function OverviewCard({
  title, value, icon, accentColor, growth, growthInverse = false,
  subtitle, badge, delay = 0,
}: OverviewCardProps) {
  const isLoading  = value === null
  const isPositive = growthInverse ? (growth ?? 0) < 0 : (growth ?? 0) > 0
  const isNegative = growthInverse ? (growth ?? 0) > 0 : (growth ?? 0) < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card
        className="relative overflow-hidden border-white/8 bg-[#0F1318]/80 backdrop-blur-md group hover:border-white/15 transition-all duration-500"
        style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.2)` }}
      >
        {/* Accent glow top */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)` }}
        />
        {/* Corner glow */}
        <div
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
          style={{ background: accentColor }}
        />

        <CardContent className="p-6">
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

          <div className="text-3xl font-black text-white tracking-tight leading-none mb-2">
            {isLoading ? <Skeleton className="h-9 w-24 rounded-xl" /> : value}
          </div>

          <div className="flex items-center gap-2 mt-3">
            {!isLoading && growth !== null && growth !== undefined && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                isPositive ? "bg-green-500/10 text-green-400 border-green-500/20"
                : isNegative ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-white/5 text-white/40 border-white/10"
              }`}>
                {isPositive ? <TrendUp weight="bold" className="w-3 h-3" />
                  : isNegative ? <TrendDown weight="bold" className="w-3 h-3" /> : null}
                {Math.abs(growth)}%
              </div>
            )}
            {subtitle && <span className="text-white/30 text-xs">{subtitle}</span>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
