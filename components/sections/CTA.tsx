"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { RocketLaunch } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-24 bg-background relative border-t border-white/[0.05] overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[300px] bg-gradient-to-r from-[#7C3AED]/30 to-[#A78BFA]/20 blur-[100px] pointer-events-none rounded-full" />
      </div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl overflow-hidden relative"
        >
          {/* Subtle Grid within Card */}
          <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]">Ignite Your Future?</span>
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join our vibrant community of innovators. Collaborate on cutting-edge projects, expand your skills, and connect with like-minded individuals.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] hover:opacity-90 transition-all border border-white/10 h-14 px-10 text-base font-black rounded-full text-white shadow-[0_0_20px_rgba(167,139,250,0.4)] hover:shadow-[0_0_40px_rgba(167,139,250,0.7)]">
                Join the Community <RocketLaunch weight="fill" className="ml-2 w-6 h-6" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
