import { Navbar } from "@/components/shared/Navbar"
import { Hero } from "@/components/sections/Hero"
import { Services } from "@/components/sections/Services"
import { Blog } from "@/components/sections/Blog"
import { Footer } from "@/components/shared/Footer"

export const metadata = {
  title: "AWS Cloud Club MNNIT | Student Developer Community",
  description: "The official student-led AWS Cloud Club at MNNIT Allahabad. Learn. Build. Grow. Connecting students with cloud technologies, hands-on workshops, and industry-ready projects.",
  alternates: {
    canonical: "https://www.awscloudclub.mnnit.ac.in",
  },
};

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
