"use client"

import { motion } from "framer-motion"

interface SectionCardProps {
  title: string
  icon: React.ReactNode
  accentColor?: string
  children: React.ReactNode
  delay?: number
  className?: string
  actions?: React.ReactNode
}

export function SectionCard({
  title,
  icon,
  accentColor = "#FF9900",
  children,
  delay = 0,
  className = "",
  actions,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`relative overflow-hidden rounded-3xl border border-white/8 bg-[#0F1318]/80 backdrop-blur-md p-6 ${className}`}
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.25)" }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-50"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border border-white/5"
            style={{ background: `${accentColor}15`, color: accentColor }}
          >
            {icon}
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {children}
    </motion.div>
  )
}
