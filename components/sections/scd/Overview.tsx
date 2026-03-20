"use client";

import { motion } from "framer-motion";
import { Cpu, Globe, ChartBar, Cloud, Circuitry } from "@phosphor-icons/react";

export function Overview() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#090C15]/50">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#7C3AED]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Side: Layered Architectural Visual */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] md:h-[500px] flex items-center justify-center"
          >
            {/* Background "OVERVIEW" text - subtle watermark */}
            <h2 className="absolute top-0 left-0 text-[8rem] md:text-[12rem] font-black text-white/[0.03] leading-none pointer-events-none select-none uppercase tracking-tighter">
              Overview
            </h2>

            {/* Layered Panes */}
            <div className="relative w-full max-w-md aspect-square">
              {/* Back Layer: Grid Pattern Pane */}
              <div className="absolute top-0 left-0 w-4/5 h-4/5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm -rotate-6 transform transition-transform group-hover:rotate-0 duration-700">
                <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
              </div>

              {/* Middle Layer: Decorative Cloud & Icon Pane */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[2.5rem] backdrop-blur-md rotate-3 shadow-2xl flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <Cloud weight="duotone" className="w-24 h-24 text-primary relative z-10 opacity-80" />
                </div>
                
                {/* Decorative small circuitry icon */}
                <div className="absolute bottom-10 right-10 text-white/10">
                  <Circuitry weight="duotone" className="w-16 h-16" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-10"
          >
            <div className="space-y-6">
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                Empowering the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[size:200%_auto] animate-gradient">
                  Generation of Builders
                </span>
              </h3>
            </div>

            <div className="flex flex-col gap-8">
              <p className="text-[#8892B0] text-lg md:text-xl leading-relaxed font-medium">
                AWS Cloud Club Student Community Day is a one-day, student-led flagship event 
                aimed at bringing AWS learning opportunities, technical training, and career 
                development resources directly to students.
              </p>
              
              {/* Highlight Block: Subtle Glass instead of hard bar */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative p-8 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-sm">
                  <p className="text-white/70 text-lg leading-relaxed relative z-10">
                    Organized and led by Cloud Club Captains, the event creates a dynamic 
                    platform for knowledge sharing and skill-building in cloud computing. 
                    It features a diverse range of activities including hands-on workshops, 
                    expert-led sessions, and interactive discussions.
                  </p>
                </div>
              </div>

              <p className="text-[#8892B0] text-base leading-relaxed">
                Networking opportunities allow students to connect with industry professionals, 
                mentors, and like-minded peers, helping them explore career pathways and stay 
                aligned with emerging trends in cloud architecture.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
