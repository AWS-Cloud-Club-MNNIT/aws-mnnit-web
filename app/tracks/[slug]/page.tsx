import { notFound } from "next/navigation"
import connectDB from "@/lib/db"
import Track from "@/models/track"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import Markdown from "react-markdown"
import Link from "next/link"
import { CaretLeft } from "@phosphor-icons/react/dist/ssr"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await connectDB()
  const track = await Track.findOne({ slug })
  if (!track) return { title: "Track Not Found" }
  return { title: `${track.title} Roadmap | AWS Cloud Club` }
}

export default async function TrackRoadmap({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await connectDB()
  const track = await Track.findOne({ slug })

  if (!track) return notFound()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="pt-32 pb-20 relative">
        <div className="absolute top-0 w-full h-96 bg-primary/10 blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 max-w-4xl">
          <Link href="/tracks" className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-8 group font-medium">
            <CaretLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Tracks
          </Link>

          <header className="mb-12 border-b border-white/[0.05] pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-6">
               {track.isFree && <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-green-500/10">Free Track</span>}
               <span className="text-white/50 text-sm font-medium tracking-wide">ROADMAP</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
              {track.title}
            </h1>
            <p className="text-xl text-white/70 leading-relaxed mb-10 max-w-3xl">
              {track.description}
            </p>
            
            <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
              <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
          </header>

          <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-white/80 prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white prose-code:text-secondary prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
            <h2 className="text-3xl font-bold mb-8">Curriculum Roadmap</h2>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12">
              <Markdown>{track.roadmap}</Markdown>
            </div>
          </article>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}
