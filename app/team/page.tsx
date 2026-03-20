import * as React from "react"
import connectDB from "@/lib/db"
import Team from "@/models/team"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import Image from "next/image"
import { GithubLogo, LinkedinLogo, TwitterLogo, UsersThree } from "@phosphor-icons/react/dist/ssr"

export const dynamic = "force-dynamic"

export default async function TeamPage() {
  await connectDB()
  const members = await Team.find().sort({ createdAt: 1 })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-20 md:w-2/3 mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Architects</span>.
            </h1>
            <p className="text-lg text-white/60">
              The passionate engineers, developers, and cloud enthusiasts orchestrating events, building massive projects, and leading the tech community at MNNIT.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {members.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-card/20 border border-white/[0.05] rounded-3xl">
                <UsersThree weight="duotone" className="w-12 h-12 text-white/20 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Team Assembly in Progress</h3>
                <p className="text-white/50 text-center max-w-sm">
                  We are currently onboarding the core architects and community leaders. The roster will be published shortly.
                </p>
              </div>
            ) : members.map((member) => (
              <div 
                key={member._id.toString()} 
                className="group relative h-[380px] bg-card/40 overflow-hidden border border-white/[0.05] hover:border-white/20 transition-all rounded-[2rem] shadow-xl shadow-black/40"
              >
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="w-full h-full object-cover object-center grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity z-10" />

                <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                  <p className="text-white/60 font-medium text-sm mb-4">{member.role}</p>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {member.socials?.github && (
                      <a href={member.socials.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                        <GithubLogo className="w-5 h-5" />
                      </a>
                    )}
                    {member.socials?.linkedin && (
                      <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#0A66C2] transition-colors">
                        <LinkedinLogo className="w-5 h-5" />
                      </a>
                    )}
                    {member.socials?.twitter && (
                      <a href={member.socials.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#1DA1F2] transition-colors">
                        <TwitterLogo className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
