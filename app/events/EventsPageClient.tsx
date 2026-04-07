"use client"

import * as React from "react"
import Image from "next/image"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import Link from "next/link"
import {
  CalendarBlank, MapPin, ArrowRight, Clock, Star, Users
} from "@phosphor-icons/react"

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!mounted) return null

  const pads = (n: number) => String(n).padStart(2, "0")
  const units = [
    { label: "Days", val: timeLeft.days },
    { label: "Hours", val: timeLeft.hours },
    { label: "Mins", val: timeLeft.minutes },
    { label: "Secs", val: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center gap-3">
      {units.map(({ label, val }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-black text-white tabular-nums">{pads(val)}</span>
            <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">{label}</span>
          </div>
          {i < 3 && <span className="text-white/30 text-2xl font-bold mb-3">:</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Registration Badge ───────────────────────────────────────────────────────
function RegBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: "Registration Open", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
    closed: { label: "Registration Closed", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
    coming_soon: { label: "Coming Soon", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  }
  const info = map[status] || map.coming_soon
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${info.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
      {info.label}
    </span>
  )
}

const REG_STATUS_BG: Record<string, string> = {
  open: "bg-green-500 hover:bg-green-400 text-black",
  closed: "bg-white/10 text-white/40 cursor-not-allowed",
  coming_soon: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 cursor-not-allowed",
}

interface EventCardProps { event: any }

function EventCard({ event }: EventCardProps) {
  const isPast = new Date(event.date) < new Date()
  const isUpcoming = !isPast

  return (
    <div className={`group relative flex flex-col bg-card/30 rounded-3xl border overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl shadow-black/50 ${event.featured ? "border-primary/30 hover:border-primary/60" : "border-white/[0.05] hover:border-white/20"}`}>
      {event.featured && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[9px] font-bold uppercase px-2 py-1 rounded-full backdrop-blur-md">
          <Star className="w-3 h-3" weight="fill" /> Featured
        </div>
      )}

      <div className="relative h-52 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
        <Image
          src={event.banner}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 z-20">
          <RegBadge status={event.registrationStatus} />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 relative z-20">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(event.tags || []).slice(0, 3).map((t: string) => (
            <span key={t} className="text-[9px] font-bold uppercase px-2 py-0.5 bg-white/[0.04] text-white/40 rounded">{t}</span>
          ))}
        </div>

        <h2 className="text-xl font-bold text-white mb-4 line-clamp-2">{event.title}</h2>

        <div className="flex flex-col gap-2 mb-6 text-sm text-white/60">
          <div className="flex items-center gap-2.5">
            <CalendarBlank className="w-4 h-4 text-secondary flex-shrink-0" />
            <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-aws-orange flex-shrink-0" />
            <span>{event.location || "MNNIT Allahabad"}</span>
          </div>
          {event.sections?.length > 0 && (
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{event.sections.length} section{event.sections.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Countdown for upcoming events */}
        {isUpcoming && (
          <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Starts in</p>
            <CountdownTimer targetDate={event.date} />
          </div>
        )}

        <div className="mt-auto pt-5 border-t border-white/[0.05]">
          <Link
            href={`/events/${event.slug}`}
            className="flex items-center justify-between text-white/80 group-hover:text-white transition-colors"
          >
            <span className="font-semibold text-sm">View Details</span>
            <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function EventsPageClient({ events }: { events: any[] }) {
  const [filter, setFilter] = React.useState<"all" | "upcoming" | "featured">("all")

  const filtered = events.filter(e => {
    if (filter === "featured") return e.featured
    if (filter === "upcoming") return new Date(e.date) >= new Date()
    return true
  })

  const featuredEvents = events.filter(e => e.featured)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Community <span className="text-aws-orange">Events</span>
            </h1>
            <p className="text-lg md:text-xl md:w-2/3 mx-auto text-white/50">
              Join us for workshops, hackathons, and guest lectures from industry veterans. Enhance your skills and build your network.
            </p>
          </div>

          {/* Featured Banner (if any featured) */}
          {featuredEvents.length > 0 && filter === "all" && (
            <div className="mb-12 relative rounded-3xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10">
              <div className="absolute inset-0">
                <Image src={featuredEvents[0].banner} alt={featuredEvents[0].title} fill className="object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              </div>
              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 flex items-center gap-1.5"><Star className="w-3 h-3" weight="fill" /> Featured Event</span>
                    <RegBadge status={featuredEvents[0].registrationStatus} />
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white mb-3">{featuredEvents[0].title}</h2>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1.5"><CalendarBlank className="w-4 h-4 text-secondary" />{new Date(featuredEvents[0].date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-aws-orange" />{featuredEvents[0].location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-4">
                  {new Date(featuredEvents[0].date) > new Date() && (
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Starts in</p>
                      <CountdownTimer targetDate={featuredEvents[0].date} />
                    </div>
                  )}
                  <Link href={`/events/${featuredEvents[0].slug}`} className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
                    View Event <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Filter tabs */}
          {events.length > 0 && (
            <div className="flex gap-2 mb-8">
              {(["all", "upcoming", "featured"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? "bg-primary text-white" : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"}`}>
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Events Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-card/20 border border-white/[0.05] rounded-3xl">
              <CalendarBlank weight="duotone" className="w-12 h-12 text-white/20 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">
                {filter === "featured" ? "No Featured Events" : filter === "upcoming" ? "No Upcoming Events" : "No Events Yet"}
              </h3>
              <p className="text-white/50 text-center max-w-sm">
                {filter !== "all" ? <button onClick={() => setFilter("all")} className="text-primary underline text-sm">View all events</button> : "We are finalizing the schedule. Please check back later."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
