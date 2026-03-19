"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Users, CalendarCheck, CodeBlock, GlobeX } from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    icon: <Users weight="duotone" className="w-8 h-8 text-[#7C3AED]" />,
    value: "500+",
    label: "Students",
    color: "group-hover:shadow-[0_0_40px_-5px_rgba(124,58,237,0.4)]",
  },
  {
    icon: <CalendarCheck weight="duotone" className="w-8 h-8 text-[#A78BFA]" />,
    value: "20+",
    label: "Events Hosted",
    color: "group-hover:shadow-[0_0_40px_-5px_rgba(167,139,250,0.3)]",
  },
  {
    icon: <CodeBlock weight="duotone" className="w-8 h-8 text-[#7C3AED]" />,
    value: "10+",
    label: "Projects Built",
    color: "group-hover:shadow-[0_0_40px_-5px_rgba(124,58,237,0.4)]",
  },
  {
    icon: <GlobeX weight="duotone" className="w-8 h-8 text-[#A78BFA]" />,
    value: "Active",
    label: "Community",
    color: "group-hover:shadow-[0_0_40px_-5px_rgba(167,139,250,0.3)]",
  },
]

export function Stats() {
  return (
    <section className="py-20 bg-background relative z-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className={`group relative overflow-hidden bg-white/5 backdrop-blur-md border-white/10 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 ${stat.color}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <CardContent className="p-6 md:p-8 flex flex-col items-center text-center gap-4">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] shadow-inner">
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-medium text-white/60 uppercase tracking-widest">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
