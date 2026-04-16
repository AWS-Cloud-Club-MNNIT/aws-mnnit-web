"use client";

import { motion } from "framer-motion";
import { User, Question } from "@phosphor-icons/react";

export function Speakers() {
  const mysterySpeakers = [1, 2, 3, 4];

  return (
    <section className="py-24 relative overflow-hidden bg-[#090C15]/30">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Meet the Visionaries
          </h2>
          <p className="text-[#8892B0] text-lg max-w-2xl mx-auto font-medium">
            We&apos;re gathering a world-class lineup of AWS Heroes, cloud architects, 
            and industry leaders. The official reveal is just around the corner.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mysterySpeakers.map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group relative"
            >
              <div className="relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 aspect-[4/5] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 hover:border-primary/40 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-primary/10">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090C15] via-transparent to-transparent opacity-60" />

                {/* Speaker Silhouette/Placeholder */}
                <div className="relative mb-8 pt-4">
                  <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative shadow-inner">
                    <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <User weight="duotone" className="w-16 h-16 text-white/5 group-hover:text-primary transition-colors duration-500 z-10" />
                    <div className="absolute -top-1 -right-1 w-10 h-10 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-primary z-20 shadow-lg animate-pulse">
                      <Question weight="bold" className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-center relative z-10 w-full">
                  <div className="h-6 w-3/4 bg-white/10 rounded-full mx-auto animate-pulse" />
                  <div className="h-4 w-1/2 bg-white/5 rounded-full mx-auto" />
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Revealing Soon</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Big Reveal Tagline */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col items-center">
             <span className="text-white/20 text-sm font-bold uppercase tracking-[0.8em] mb-4">Lineup Drops</span>
             <div className="text-2xl md:text-3xl font-black text-white/60 flex items-center gap-4">
               APRIL <span className="w-2 h-2 bg-primary rounded-full" /> 2026
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
