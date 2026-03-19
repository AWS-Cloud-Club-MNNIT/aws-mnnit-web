"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { GithubLogo, LinkedinLogo, TwitterLogo } from "@phosphor-icons/react"
import Image from "next/image"
import { Card } from "@/components/ui/card"

const team = [
  {
    name: "Alex Cloud",
    role: "President & AI Lead",
    image: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=2000&auto=format&fit=crop",
  },
  {
    name: "Sarah Serverless",
    role: "Vice President",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2000&auto=format&fit=crop",
  },
  {
    name: "David Deploy",
    role: "DevOps Engineer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop",
  },
  {
    name: "Mia Microservice",
    role: "Cloud Architect",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2000&auto=format&fit=crop",
  },
]

export function Team() {
  return (
    <section id="team" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-sm font-bold text-[#A78BFA] uppercase tracking-widest mb-3">Core Team</h2>
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Meet the Leaders.</h3>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            The students orchestrating events, building projects, and leading the tech community at MNNIT.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="group relative h-[400px] bg-white/5 overflow-hidden border-white/10 hover:border-[#7C3AED]/50 transition-all rounded-[2rem] hover:shadow-[0_0_40px_rgba(124,58,237,0.2)]">
                {/* Image */}
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="w-full h-full object-cover object-center grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity z-10" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 z-20 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="text-2xl font-black text-white mb-1">{member.name}</h4>
                  <p className="text-[#A78BFA] font-bold text-sm w-full mb-4 uppercase tracking-wider">{member.role}</p>

                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-white/70 hover:bg-[#7C3AED] hover:text-white hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all">
                      <GithubLogo className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-white/70 hover:bg-[#0A66C2] hover:text-white hover:shadow-[0_0_15px_rgba(10,102,194,0.5)] transition-all">
                      <LinkedinLogo className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-white/70 hover:bg-[#1DA1F2] hover:text-white hover:shadow-[0_0_15px_rgba(29,161,242,0.5)] transition-all">
                      <TwitterLogo className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
