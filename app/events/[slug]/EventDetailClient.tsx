"use client"

import * as React from "react"
import { Navbar } from "@/components/shared/Navbar"
import Image from "next/image"
import { Footer } from "@/components/shared/Footer"
import Link from "next/link"
import {
  CalendarBlank, MapPin, ShareNetwork, ArrowSquareOut, CaretDown,
  CaretLeft, Clock, Star, TwitterLogo, LinkedinLogo, GithubLogo,
  Globe, YoutubeLogo
} from "@phosphor-icons/react"

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return m ? m[1] : null
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [t, setT] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [started, setStarted] = React.useState(false)
  React.useEffect(() => {
    setStarted(true)
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setT({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setT({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) })
    }
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id)
  }, [targetDate])
  if (!started) return null
  const p = (n: number) => String(n).padStart(2, "0")
  return (
    <div className="flex items-center gap-2">
      {[{ l: "Days", v: t.days }, { l: "Hrs", v: t.hours }, { l: "Min", v: t.minutes }, { l: "Sec", v: t.seconds }].map(({ l, v }, i) => (
        <React.Fragment key={l}>
          <div className="text-center">
            <div className="text-2xl font-black text-white tabular-nums">{p(v)}</div>
            <div className="text-[9px] uppercase tracking-widest text-white/40">{l}</div>
          </div>
          {i < 3 && <span className="text-white/30 text-xl font-bold pb-4">:</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Registration status badge ────────────────────────────────────────────────
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

// ─── Section Renderers ────────────────────────────────────────────────────────
function OverviewSection({ data }: { data: any }) {
  return (
    <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-white/70 prose-a:text-secondary prose-strong:text-white"
      dangerouslySetInnerHTML={{ __html: data.html || "" }} />
  )
}

function ScheduleSection({ data }: { data: any }) {
  const slots: any[] = (data.slots || [])
  return (
    <div className="space-y-3">
      {slots.length === 0 && <p className="text-white/30 text-sm">No schedule added yet.</p>}
      {slots.map((slot: any) => (
        <div key={slot.id} className="flex gap-4 items-start p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-white/[0.04] transition-colors">
          <div className="w-20 flex-shrink-0 text-center">
            <div className="bg-primary/20 text-primary border border-primary/20 rounded-xl px-2 py-2 font-mono text-sm font-bold">{slot.time}</div>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold mb-1">{slot.title}</h4>
            <div className="flex flex-wrap gap-3 text-xs text-white/50">
              {slot.speaker && <span className="flex items-center gap-1"><Star className="w-3 h-3" weight="fill" />{slot.speaker}</span>}
              {slot.room && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{slot.room}</span>}
            </div>
            {slot.description && <p className="text-white/40 text-sm mt-2">{slot.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function SpeakersSection({ data, onImageClick }: { data: any; onImageClick: (url: string) => void }) {
  const speakers: any[] = data.speakers || []
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {speakers.length === 0 && <p className="text-white/30 text-sm col-span-2">No speakers added yet.</p>}
      {speakers.map((sp: any) => (
        <div key={sp.id} className="flex gap-4 p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-white/15 transition-colors">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 relative"
               onClick={() => sp.photo && onImageClick(sp.photo)}
               style={{ cursor: sp.photo ? "pointer" : "default" }}>
            {sp.photo
              ? <Image src={sp.photo} alt={sp.name} fill className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl font-black">{sp.name?.[0]}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold">{sp.name}</h4>
            <p className="text-primary text-sm mb-2">{sp.role}</p>
            {sp.bio && <p className="text-white/50 text-xs leading-relaxed line-clamp-3">{sp.bio}</p>}
            <div className="flex gap-2 mt-3">
              {sp.social?.twitter && <a href={sp.social.twitter} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-[#1DA1F2] transition-colors"><TwitterLogo className="w-4 h-4" /></a>}
              {sp.social?.linkedin && <a href={sp.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-[#0A66C2] transition-colors"><LinkedinLogo className="w-4 h-4" /></a>}
              {sp.social?.github && <a href={sp.social.github} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors"><GithubLogo className="w-4 h-4" /></a>}
              {sp.social?.website && <a href={sp.social.website} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-secondary transition-colors"><Globe className="w-4 h-4" /></a>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const TIER_STYLES: Record<string, string> = {
  platinum: "border-slate-400/30 bg-slate-400/5",
  gold: "border-yellow-400/30 bg-yellow-400/5",
  silver: "border-slate-300/20 bg-slate-300/5",
  bronze: "border-orange-700/20 bg-orange-700/5",
  community: "border-white/10 bg-white/[0.02]",
}
const TIER_ORDER = ["platinum", "gold", "silver", "bronze", "community"]

function SponsorsSection({ data }: { data: any }) {
  const sponsors: any[] = data.sponsors || []
  if (sponsors.length === 0) return <p className="text-white/30 text-sm">No sponsors added yet.</p>
  const grouped = TIER_ORDER.reduce((acc, tier) => {
    const group = sponsors.filter(s => s.tier === tier)
    if (group.length) acc[tier] = group
    return acc
  }, {} as Record<string, any[]>)
  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([tier, group]) => (
        <div key={tier}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 capitalize">{tier} {tier !== "community" ? "Sponsors" : "Partners"}</p>
          <div className="flex flex-wrap gap-4">
            {group.map((sp: any) => (
              <a key={sp.id} href={sp.website || "#"} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center p-4 rounded-2xl border transition-all hover:scale-105 h-20 min-w-[120px] relative ${TIER_STYLES[sp.tier] || TIER_STYLES.community}`}>
                <Image src={sp.logo} alt={sp.name} fill className="max-h-10 max-w-[120px] object-contain filter brightness-90 hover:brightness-110 transition-all" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function FAQsSection({ data }: { data: any }) {
  const [open, setOpen] = React.useState<string | null>(null)
  const faqs: any[] = data.faqs || []
  return (
    <div className="space-y-3">
      {faqs.length === 0 && <p className="text-white/30 text-sm">No FAQs added yet.</p>}
      {faqs.map((faq: any) => (
        <div key={faq.id} className="border border-white/[0.08] rounded-2xl overflow-hidden">
          <button type="button" onClick={() => setOpen(open === faq.id ? null : faq.id)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.03] transition-colors">
            <span className="font-semibold text-white pr-4">{faq.question}</span>
            <CaretDown className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-300 ${open === faq.id ? "rotate-180" : ""}`} />
          </button>
          {open === faq.id && (
            <div className="px-5 pb-5 border-t border-white/[0.06]">
              <p className="text-white/60 text-sm leading-relaxed pt-4">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function GallerySection({ data, onImageClick }: { data: any; onImageClick: (url: string) => void }) {
  const items: any[] = data.items || []
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.length === 0 && <p className="text-white/30 text-sm col-span-3">No gallery items added yet.</p>}
      {items.map((item: any) => (
        <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] aspect-video bg-black/30">
          {item.type === "image" && item.url ? (
            <Image src={item.url} alt={item.caption || ""} fill onClick={() => onImageClick(item.url)} className="object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" />
          ) : item.type === "video" && item.url ? (
            (() => {
              const vid = getYouTubeId(item.url)
              return vid ? (
                <iframe src={`https://www.youtube.com/embed/${vid}`} title={item.caption || "Video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
              ) : <div className="flex items-center justify-center h-full"><YoutubeLogo className="w-8 h-8 text-red-400/60" /></div>
            })()
          ) : null}
          {item.caption && <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-white text-xs">{item.caption}</p></div>}
        </div>
      ))}
    </div>
  )
}

const SECTION_META: Record<string, { label: string; emoji: string }> = {
  overview: { label: "About", emoji: "📋" },
  schedule: { label: "Schedule", emoji: "🗓️" },
  speakers: { label: "Speakers", emoji: "🎤" },
  sponsors: { label: "Sponsors", emoji: "🤝" },
  faqs: { label: "FAQs", emoji: "❓" },
  gallery: { label: "Gallery", emoji: "🖼️" },
}

function renderSection(section: any, onImageClick: (url: string) => void) {
  switch (section.type) {
    case "overview": return <OverviewSection key={section.id} data={section.data} />
    case "schedule": return <ScheduleSection key={section.id} data={section.data} />
    case "speakers": return <SpeakersSection key={section.id} data={section.data} onImageClick={onImageClick} />
    case "sponsors": return <SponsorsSection key={section.id} data={section.data} />
    case "faqs": return <FAQsSection key={section.id} data={section.data} />
    case "gallery": return <GallerySection key={section.id} data={section.data} onImageClick={onImageClick} />
    default: return null
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EventDetailClient({ event }: { event: any }) {
  const [maximizedImage, setMaximizedImage] = React.useState<string | null>(null)
  const sortedSections = [...(event.sections || [])].sort((a, b) => a.order - b.order)
  const isUpcoming = new Date(event.date) > new Date()
  const regLinks: any[] = event.registrationLinks || []

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Banner */}
        <div className="relative h-[50vh] md:h-[65vh] w-full mt-20">
          <div className="absolute inset-0">
            <Image src={event.banner} alt={event.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 w-full z-10 pb-10 md:pb-16">
            <div className="container mx-auto px-6 max-w-6xl">
              <Link href="/events" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm mb-6 group">
                <CaretLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> All Events
              </Link>

              {/* Tags + featured */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {event.featured && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-full">
                    <Star className="w-3 h-3" weight="fill" /> Featured
                  </span>
                )}
                {(event.tags || []).map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-white/10 text-white/70 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">{t}</span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-5 max-w-3xl">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-white/70 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <CalendarBlank className="w-5 h-5 text-secondary" />
                  {new Date(event.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="w-5 h-5 text-aws-orange" />
                  {event.location || "MNNIT Allahabad"}
                </div>
                <RegBadge status={event.registrationStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 max-w-6xl py-10">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Sections */}
            {/* Main Sections */}
            <div className="flex-1 min-w-0">
              {/* All Sections */}
              {sortedSections.length > 0 ? (
                <div className="space-y-12">
                  {sortedSections.map(section => (
                    <section key={section.id} id={section.id} className="scroll-mt-24">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>{SECTION_META[section.type]?.emoji}</span> {SECTION_META[section.type]?.label || section.type}
                      </h2>
                      {renderSection(section, setMaximizedImage)}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-white/30">
                  <CalendarBlank className="w-10 h-10 mx-auto mb-4 opacity-30" />
                  <p>No content sections available for this event.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Countdown */}
                {isUpcoming && (
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Event Starts In
                    </p>
                    <CountdownTimer targetDate={event.date} />
                  </div>
                )}

                {/* Registration Box */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-bold">Registration</h4>
                    <RegBadge status={event.registrationStatus} />
                  </div>

                  {regLinks.length === 0 ? (
                    <p className="text-white/40 text-sm">Registration details will be announced soon.</p>
                  ) : (
                    <div className="space-y-2">
                      {regLinks.map((link: any) => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-sm transition-all group ${event.registrationStatus === "open" ? "bg-primary hover:bg-primary/90 text-white" : "bg-white/[0.04] text-white/50 border border-white/[0.08]"}`}>
                          {link.label}
                          <ArrowSquareOut className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  )}

                  {regLinks.length > 1 && (
                    <p className="text-white/40 text-xs mt-3 text-center">
                      * Register on all platforms to secure your spot.
                    </p>
                  )}
                </div>

                {/* Quick Info */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 space-y-3">
                  <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest">Event Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2.5 text-white/60">
                      <CalendarBlank className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">{new Date(event.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
                        <p className="text-white/40 text-xs">{new Date(event.date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-white/60">
                      <MapPin className="w-4 h-4 text-aws-orange mt-0.5 flex-shrink-0" />
                      <p className="text-white font-medium">{event.location || "MNNIT Allahabad"}</p>
                    </div>
                  </div>
                </div>

                {/* Share */}
                <button type="button" onClick={share}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04] transition-all text-sm font-medium">
                  <ShareNetwork className="w-4 h-4" /> Share Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Lightbox / Maximized Image View */}
      {maximizedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setMaximizedImage(null)}>
          <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
            <Image src={maximizedImage} alt="Maximized view" fill className="rounded-2xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
          <button type="button" onClick={() => setMaximizedImage(null)} className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md transition-all z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
          </button>
        </div>
      )}
    </>
  )
}
