import * as React from "react"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { CommitteeSection } from "@/components/sections/Committee"
import { UsersThree } from "@phosphor-icons/react/dist/ssr"

export const metadata = {
  title: "Committee | AWS Cloud Club MNNIT",
  description: "Meet the leaders and faculty members guiding the AWS Cloud Club at MNNIT.",
}

export default function CommitteePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-20 md:w-2/3 mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Committee</span>.
            </h1>
            <p className="text-lg text-white/60">
              The esteemed faculty members and student leaders who guide, support, and drive the vision of AWS Cloud Club MNNIT.
            </p>
          </div>

          <CommitteeSection />
        </div>
      </main>
      <Footer />
    </>
  )
}
