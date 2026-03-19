"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CalendarBlank, Clock, MapPin, ArrowUpRight } from "@phosphor-icons/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const events = [
  {
    id: 1,
    title: "Intro to AWS Core Services",
    type: "Workshop",
    date: "Mar 25, 2026",
    time: "6:00 PM - 8:00 PM",
    mode: "Virtual",
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Serverless Hackathon",
    type: "Hackathon",
    date: "Apr 10, 2026",
    time: "48 Hours",
    mode: "In-Person (CC-3)",
    status: "Registration Open",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Kubernetes Beyond Basics",
    type: "Tech Talk",
    date: "Apr 18, 2026",
    time: "5:30 PM",
    mode: "Seminar Hall",
    status: "Coming Soon",
    image: "https://images.unsplash.com/photo-1620825313460-2646d51d2fde?q=80&w=2069&auto=format&fit=crop",
  },
]

export function Events() {
  return (
    <section id="events" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-sm font-bold text-[#A78BFA] uppercase tracking-widest mb-3">Community Events</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">Learn, Build, Network.</h3>
            <p className="text-lg text-white/70">Join our hands-on sessions and learn by doing.</p>
          </div>
          <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-full px-6 text-white/80 transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]">
            View All Events
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative flex flex-col bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-[#7C3AED]/50 overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.2)] hover:-translate-y-1"
            >
              {/* Image Header */}
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent z-10" />
                <Image 
                  src={event.image} 
                  alt={event.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10">
                    {event.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6 relative z-20 -mt-10">
                <h4 className="text-2xl font-bold text-white mb-4 line-clamp-2">{event.title}</h4>
                
                <div className="flex flex-col gap-3 mb-8">
                  <div className="flex items-center gap-3 text-white/50 text-sm">
                    <CalendarBlank className="w-5 h-5 text-[#7C3AED]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/50 text-sm">
                    <Clock className="w-5 h-5 text-[#A78BFA]" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/50 text-sm">
                    <MapPin className="w-5 h-5 text-[#7C3AED]" />
                    <span>{event.mode}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/[0.05]">
                  <span className="text-sm font-medium text-white/80">{event.status}</span>
                  <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all">
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
