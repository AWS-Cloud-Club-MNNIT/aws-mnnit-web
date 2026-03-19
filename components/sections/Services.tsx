"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CloudArrowUp, TerminalWindow, Brain, Lightning, ArrowRight } from "@phosphor-icons/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

const services = [
  {
    id: "compute",
    title: "Cloud Computing",
    description: "Learn how to architect scalable systems on AWS. Master EC2, S3, and modern cloud infrastructure.",
    icon: <CloudArrowUp weight="duotone" className="w-10 h-10" />,
    theme: "from-[#7C3AED]/20 to-[#A78BFA]/10 border-[#7C3AED]/30 text-[#A78BFA]",
  },
  {
    id: "devops",
    title: "DevOps",
    description: "Build automated pipelines and master containerization with Docker, Kubernetes, and GitHub Actions.",
    icon: <TerminalWindow weight="duotone" className="w-10 h-10" />,
    theme: "from-[#7C3AED]/20 to-[#5B21B6]/10 border-[#7C3AED]/30 text-[#7C3AED]",
  },
  {
    id: "backend",
    title: "Backend Systems",
    description: "Design robust APIs and database architectures. Explore Node.js, Python, and serverless logic.",
    icon: <Lightning weight="duotone" className="w-10 h-10" />,
    theme: "from-[#A78BFA]/20 to-[#7C3AED]/10 border-[#A78BFA]/30 text-[#A78BFA]",
  },
  {
    id: "ml",
    title: "Machine Learning",
    description: "Bring AI to the cloud. Deploy and scale ML models using AWS SageMaker and intelligent services.",
    icon: <Brain weight="duotone" className="w-10 h-10" />,
    theme: "from-[#7C3AED]/20 to-[#A78BFA]/10 border-[#7C3AED]/30 text-[#7C3AED]",
  },
]

export function Services() {
  return (
    <section id="services" className="py-24 bg-background relative border-t border-white/[0.05]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-16 md:w-2/3">
          <h2 className="text-sm font-bold text-[#A78BFA] uppercase tracking-widest mb-3">Community Tracks</h2>
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">What You&apos;ll Learn</h3>
          <p className="text-lg text-white/70 leading-relaxed">
            We focus on hands-on learning, building real projects, and mastering the technologies that power the modern web.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="group relative h-full bg-white/5 backdrop-blur-md border-white/10 hover:border-[#7C3AED]/50 transition-all duration-500 overflow-hidden cursor-pointer hover:shadow-[0_0_40px_rgba(124,58,237,0.2)] hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${service.theme.split('border-')[0]}`} />
                <CardHeader className="relative z-10 pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-[#0B0F1A]/80 border-white/10 flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all ${service.theme.split(' ').slice(2).join(' ')}`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base text-white/50 group-hover:text-white/70 transition-colors duration-300">
                    {service.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-8 text-sm font-bold text-white/40 group-hover:text-[#A78BFA] transition-colors duration-300 uppercase tracking-wider">
                    Explore Track <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
