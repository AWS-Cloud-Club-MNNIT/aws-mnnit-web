import * as React from "react"
import connectDB from "@/lib/db"
import Team, { ITeam } from "@/models/team"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import Image from "next/image"
import { GithubLogo, LinkedinLogo, TwitterLogo, InstagramLogo, UsersThree } from "@phosphor-icons/react/dist/ssr"

export const dynamic = "force-dynamic"

type TeamGroup = {
  priority: number;
  category: string;
  members: ITeam[];
};

export default async function TeamPage() {
  await connectDB()
  const members = await Team.find().sort({ priority: 1, createdAt: 1 })

  const groupsRecord: Record<number, TeamGroup> = {};
  members.forEach((m: ITeam) => {
    if (!groupsRecord[m.priority]) {
      groupsRecord[m.priority] = {
        priority: m.priority,
        category: m.category,
        members: []
      };
    }
    groupsRecord[m.priority].members.push(m);
  });
  const groupedTeams = Object.values(groupsRecord).sort((a: TeamGroup, b: TeamGroup) => a.priority - b.priority);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Page header */}
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Meet the <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">Architects</span>.
            </h1>
            <p className="text-lg text-white/60">
              The passionate engineers, developers, and cloud enthusiasts orchestrating events, building massive projects, and leading the tech community at MNNIT.
            </p>
          </div>

          {/* Empty state */}
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-card/20 border border-white/5 rounded-3xl">
              <UsersThree weight="duotone" className="w-12 h-12 text-white/20 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Team Assembly in Progress</h3>
              <p className="text-white/50 text-center max-w-sm">
                We are currently onboarding the core architects and community leaders. The roster will be published shortly.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-24">
              {groupedTeams.map((group: TeamGroup, groupIndex: number) => {
                const isTopPriority = groupIndex === 0 && group.priority <= 2;
                return (
                  <section key={group.priority}>
                    {/* Section heading */}
                    <div className="flex flex-col items-center gap-3 text-center mb-12">
                      <h2 className={`font-black uppercase tracking-widest ${isTopPriority ? 'text-4xl md:text-5xl text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary' : 'text-2xl md:text-3xl text-white/90'}`}>
                        {group.category}
                      </h2>
                      <div className="w-16 h-0.5 bg-linear-to-r from-primary to-secondary rounded-full opacity-60" />
                    </div>

                    {/* Members grid – centered, wraps naturally */}
                    <div className="flex flex-wrap justify-center gap-5">
                      {group.members.map((member: ITeam) => (
                        <div
                          key={member._id.toString()}
                          className="group w-40 sm:w-44 lg:w-48 shrink-0 bg-card/40 border border-white/5 hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 flex flex-col"
                        >
                          {/* Photo area */}
                          <div className="relative w-full aspect-square overflow-hidden">
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              className="object-cover object-top group-hover:scale-105 transition-all duration-500"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-card via-card/20 to-transparent" />

                            {/* Social links – revealed on hover */}
                            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/50 backdrop-blur-sm">
                              {member.socials?.github && (
                                <a href={member.socials.github} target="_blank" rel="noreferrer"
                                  className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                                  <GithubLogo className="w-4 h-4" />
                                </a>
                              )}
                              {member.socials?.linkedin && (
                                <a href={member.socials.linkedin} target="_blank" rel="noreferrer"
                                  className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-colors">
                                  <LinkedinLogo className="w-4 h-4" />
                                </a>
                              )}
                              {member.socials?.twitter && (
                                <a href={member.socials.twitter} target="_blank" rel="noreferrer"
                                  className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-colors">
                                  <TwitterLogo className="w-4 h-4" />
                                </a>
                              )}
                              {member.socials?.instagram && (
                                <a href={member.socials.instagram} target="_blank" rel="noreferrer"
                                  className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-pink-600 hover:border-pink-600 transition-colors">
                                  <InstagramLogo className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Text info – always visible */}
                          <div className="p-4 flex flex-col items-center gap-1 text-center">
                            {member.specialNote && (
                              <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 mb-1">
                                {member.specialNote}
                              </span>
                            )}
                            <h3 className="font-bold text-white text-base leading-tight group-hover:text-primary transition-colors">{member.name}</h3>
                            <p className="text-white/50 text-sm">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}


