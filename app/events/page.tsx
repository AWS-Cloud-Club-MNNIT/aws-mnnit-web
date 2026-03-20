import * as React from "react"
import Link from "next/link"
import connectDB from "@/lib/db"
import Event from "@/models/event"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import Image from "next/image"
import { CalendarBlank, MapPin, ArrowRight } from "@phosphor-icons/react/dist/ssr"

export const dynamic = "force-dynamic" // Ensure fresh data

export default async function EventsPage() {
  await connectDB()
  const events = await Event.find().sort({ date: 1 }) // Upcoming first

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Community <span className="text-aws-orange">Events</span>
            </h1>
            <p className="text-lg md:text-xl md:w-2/3 mx-auto text-white/50">
              Join us for workshops, hackathons, and guest lectures from industry veterans. Enhance your skills and build your network.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-card/20 border border-white/[0.05] rounded-3xl">
              <CalendarBlank weight="duotone" className="w-12 h-12 text-white/20 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">No Upcoming Events</h3>
              <p className="text-white/50 text-center max-w-sm">
                We are finalizing the schedule for our next batch of workshops and hackathons. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event._id.toString()} className="group relative flex flex-col bg-card/30 rounded-3xl border border-white/[0.05] hover:border-white/20 overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl shadow-black/50">
                  <div className="relative h-48 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
                    <Image 
                      src={event.banner} 
                      alt={event.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="flex flex-col flex-1 p-6 relative z-20">
                    <h2 className="text-2xl font-bold text-white mb-4 line-clamp-2">{event.title}</h2>
                    
                    <div className="flex flex-col gap-3 mb-8 text-sm text-white/60">
                      <div className="flex items-center gap-3">
                        <CalendarBlank className="w-5 h-5 text-secondary" />
                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span>MNNIT Allahabad</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/[0.05]">
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
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
