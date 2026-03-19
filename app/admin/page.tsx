"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CalendarCheck, Article, Users, TrendUp, Database, CheckCircle, Cloud } from "@phosphor-icons/react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({ events: 0, blogs: 0, team: 0 })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, blogsRes, teamRes] = await Promise.all([
          fetch("/api/event").then(res => res.json()),
          fetch("/api/blog").then(res => res.json()),
          fetch("/api/team").then(res => res.json()),
        ])
        
        setStats({
          events: Array.isArray(eventsRes) ? eventsRes.length : 0,
          blogs: Array.isArray(blogsRes) ? blogsRes.length : 0,
          team: Array.isArray(teamRes) ? teamRes.length : 0,
        })
      } catch (error) {
        console.error("Error fetching stats", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { title: "Total Events", value: stats.events, icon: <CalendarCheck weight="fill" className="w-8 h-8 text-[#FF9900]" />, bg: "bg-[#232F3E]", border: "border-[#FF9900]/30 hover:border-[#FF9900]/80", link: "/admin/events", trend: "+2 this week" },
    { title: "Published Blogs", value: stats.blogs, icon: <Article weight="fill" className="w-8 h-8 text-[#0073BB]" />, bg: "bg-[#232F3E]", border: "border-[#0073BB]/30 hover:border-[#0073BB]/80", link: "/admin/blogs", trend: "Active readers" },
    { title: "Core Members", value: stats.team, icon: <Users weight="fill" className="w-8 h-8 text-[#16A34A]" />, bg: "bg-[#232F3E]", border: "border-[#16A34A]/30 hover:border-[#16A34A]/80", link: "/admin/team", trend: "Fully staffed" },
  ]

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Overview</h1>
        <p className="text-white/50 font-medium text-lg">Welcome to your AWS Cloud Club command center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Link href={card.link}>
              <div className={`relative overflow-hidden bg-[#1A222D] border rounded-3xl p-8 hover:bg-[#232F3E] transition-all duration-300 cursor-pointer shadow-lg group ${card.border}`}>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className={`p-4 rounded-2xl ${card.bg} border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                    {card.icon}
                  </div>
                  <div className="text-white/20 group-hover:text-white/60 transition-colors">
                    <TrendUp weight="bold" className="w-6 h-6" />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-white/50 font-bold text-xs tracking-widest uppercase mb-1">{card.title}</h3>
                  <div className="text-5xl font-black text-white tracking-tight mb-2">
                    {loading ? <span className="animate-pulse text-white/20">--</span> : card.value}
                  </div>
                  <div className="text-sm font-medium text-white/40 flex items-center gap-2">
                    <TrendUp weight="bold" className="w-4 h-4 text-[#16A34A]" />
                    {card.trend}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">System Infrastructure</h2>
        <div className="bg-[#1A222D] border border-[#232F3E] rounded-3xl p-8 lg:p-10 grid lg:grid-cols-2 gap-8 relative overflow-hidden shadow-2xl">
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-[#0F1115] border border-white/5 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <Database weight="duotone" className="w-6 h-6 text-[#0073BB]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">MongoDB Atlas</h4>
                  <p className="text-sm text-white/50">Primary Data Source</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-400 font-bold text-sm bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                <CheckCircle weight="fill" /> Online
              </div>
            </div>

            <div className="flex items-center justify-between p-6 rounded-2xl bg-[#0F1115] border border-white/5 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <Cloud weight="duotone" className="w-6 h-6 text-[#FF9900]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Cloudinary CDN</h4>
                  <p className="text-sm text-white/50">Media Storage Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-400 font-bold text-sm bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                <CheckCircle weight="fill" /> Active
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-4 relative z-10">
             <div className="p-8 rounded-3xl bg-[#232F3E] border border-white/5 relative overflow-hidden h-full flex flex-col justify-center shadow-inner">
                <h3 className="text-2xl font-extrabold text-[#FF9900] mb-3 tracking-tight">Administrative HQ</h3>
                <p className="text-white/70 leading-relaxed text-base">
                  This administrative panel controls the entire AWS Cloud Club MNNIT architecture. Create events, write rich-text markdown blogs, manage core team members, and orchestrate curriculum tracks all from this unified, high-performance interface.
                </p>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
