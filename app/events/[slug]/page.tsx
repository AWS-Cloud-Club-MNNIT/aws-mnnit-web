import * as React from "react"
import { notFound } from "next/navigation"
import connectDB from "@/lib/db"
import Event from "@/models/event"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { CalendarBlank, MapPin, ShareNetwork } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB()
  const { slug } = await params
  const event = await Event.findOne({ slug })

  if (!event) return notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Banner Section */}
        <div className="relative h-[400px] md:h-[500px] w-full mt-20 border-b border-white/[0.05]">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover opacity-60" />
          
          <div className="absolute bottom-0 left-0 w-full z-20 pb-16">
            <div className="container mx-auto px-6 max-w-4xl">
              <div className="flex gap-2 mb-4">
                {event.tags.map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center gap-2 font-medium">
                  <CalendarBlank className="w-5 h-5 text-secondary" />
                  {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="w-5 h-5 text-aws-orange" />
                  MNNIT Allahabad
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-6 max-w-4xl py-16">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-2/3">
              <h3 className="text-2xl font-bold text-white mb-6">About this Event</h3>
              <div className="prose prose-invert prose-lg max-w-none text-white/70 leading-relaxed font-sans">
                {event.description.split('\n').map((paragraph: string, i: number) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div className="md:w-1/3">
              <div className="bg-card/20 border border-white/[0.05] rounded-3xl p-6 sticky top-32">
                <h4 className="text-lg font-bold text-white mb-6">Registration</h4>
                <p className="text-white/60 text-sm mb-6">RSVP now to secure your spot. Note that some events have limited capacity.</p>
                <Button className="w-full bg-secondary text-black hover:bg-secondary/90 font-bold h-12 rounded-xl mb-4">
                  Register Now
                </Button>
                <Button variant="outline" className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 h-12 rounded-xl flex items-center gap-2">
                  <ShareNetwork className="w-5 h-5" /> Share Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
