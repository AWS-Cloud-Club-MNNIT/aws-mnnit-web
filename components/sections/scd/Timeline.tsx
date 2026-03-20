"use client";

import { motion } from "framer-motion";
import { 
  Clock, 
  ShootingStar, 
  PresentationChart, 
  UsersThree, 
  Plug, 
  ShieldCheck 
} from "@phosphor-icons/react";

export function Timeline() {
  const highlights = [
    {
      title: "Speaker Sessions",
      icon: <PresentationChart weight="duotone" className="w-8 h-8" />,
      color: "text-[#00C2FF]",
      bg: "bg-[#00C2FF]/10",
      delay: 0.1
    },
    {
      title: "Networking Lunch",
      icon: <UsersThree weight="duotone" className="w-8 h-8" />,
      color: "text-[#FF9900]",
      bg: "bg-[#FF9900]/10",
      delay: 0.2
    },
    {
      title: "Connectivity Hub",
      icon: <Plug weight="duotone" className="w-8 h-8" />,
      color: "text-[#7C3AED]",
      bg: "bg-[#7C3AED]/10",
      delay: 0.3
    },
    {
      title: "Industry Grade Experience",
      icon: <ShieldCheck weight="duotone" className="w-8 h-8" />,
      color: "text-[#10B981]",
      bg: "bg-[#10B981]/10",
      delay: 0.4
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start text-left"
          >
            <h2 className="text-sm font-bold text-secondary uppercase tracking-[0.3em] mb-4">
              The Schedule
            </h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-8">
              Event Highlights
            </h3>

            <p className="text-[#8892B0] text-lg leading-relaxed mb-10 font-medium">
              We're orchestrating the ultimate cloud-native experience, featuring world-class 
              speaker sessions, high-value networking lunches, and a dedicated connectivity 
              hub—all designed to provide an industry-grade professional environment for every builder.
            </p>
          </motion.div>

          {/* Right Content - Floating Cards */}
          <div className="relative h-full">
            {/* Background decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 w-full sm:py-12">
              {highlights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: item.delay }}
                  className={`${i % 2 !== 0 ? 'sm:mt-12' : ''}`}
                >
                  <div className="bg-[#090C15]/80 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 hover:-translate-y-2 group shadow-2xl h-full flex flex-col justify-center">
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <h4 className="text-xl md:text-2xl font-bold text-white leading-tight">
                      {item.title}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
