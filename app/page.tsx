import { Navbar } from "@/components/shared/Navbar"
import { Hero } from "@/components/sections/Hero"
import { Services } from "@/components/sections/Services"
import { Blog } from "@/components/sections/Blog"
import { Footer } from "@/components/shared/Footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col bg-background">
        <Hero />
        <Services />
        <Blog />
      </main>
      <Footer />
    </>
  )
}
