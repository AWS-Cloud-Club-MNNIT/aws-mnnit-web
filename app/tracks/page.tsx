import * as React from "react"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import connectDB from "@/lib/db"
import Track from "@/models/track"
import Link from "next/link"
import { MapTrifold } from "@phosphor-icons/react/dist/ssr"

// Dynamic Server Component to fetch fresh tracks
export const dynamic = 'force-dynamic'

export default async function TracksPage() {
  await connectDB()
  const tracks = await Track.find({}).sort({ createdAt: -1 })

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />

      <section className="pt-32 pb-20 relative min-h-screen">
        <div className="absolute inset-0 z-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background via-background/90 to-background" />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Tracks</span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed">
              Choose your domain. Master the cloud. We offer specialized learning paths designed by industry experts to accelerate your tech career.
            </p>
          </div>

          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-card/20 border border-white/[0.05] rounded-3xl mb-12">
              <MapTrifold weight="duotone" className="w-12 h-12 text-white/20 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Curating Learning Paths</h3>
              <p className="text-white/50 text-center max-w-sm">
                Our industry experts are designing specialized learning paths to accelerate your tech career. New tracks will be available soon.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map((track, i) => (
                <Link href={`/tracks/${track.slug}`} key={track._id.toString()}>
                  <div
                    className="group relative h-full overflow-hidden rounded-3xl bg-card border border-white/5 p-8 transition-all hover:bg-white/[0.04] duration-500 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-8 flex flex-col"
                    style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500 shrink-0 bg-black/50 relative">
                      <Image 
                        src={track.image} 
                        alt={track.title} 
                        fill
                        sizes="64px"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{track.title}</h3>
                    {track.isFree && <span className="inline-block bg-green-500/10 text-green-400 text-[10px] font-extrabold px-2 py-1 rounded w-fit mb-4 uppercase tracking-widest border border-green-500/20">Free Track</span>}
                    <p className="text-white/60 leading-relaxed mb-8 flex-1">
                      {track.description}
                    </p>
                    
                    <div className="text-primary font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                      View Roadmap <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </div>

                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="mt-20 text-center flex flex-col items-center justify-center pb-20 animate-in fade-in duration-1000 delay-500 fill-mode-both">
            <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-2 mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
              <span className="text-sm font-medium text-white/70">Registration for all tracks opening soon</span>
            </div>
            <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bold rounded-xl h-14 px-8">
              Join the Waitlist
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
