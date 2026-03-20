"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gear, ArrowLeft } from "@phosphor-icons/react";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-[#050812] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
      
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-gradient-to-br from-[#7C3AED]/10 to-[#FF9900]/10 blur-[120px] pointer-events-none rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 max-w-2xl mx-auto"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 mx-auto mb-8 relative text-[#A78BFA]"
        >
          <Gear weight="duotone" className="w-full h-full" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Provisioning</span> Resources
        </h1>

        <p className="text-[#8892B0] text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
          Our CI/CD pipelines are currently deploying a massive update for this zone. 
          Grab a coffee, the infrastructure will be up and running shortly.
        </p>

        {/* Progress Bar Mockup */}
        <div className="w-full max-w-md mx-auto mb-12 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm shadow-2xl">
          <div className="flex justify-between text-xs font-mono text-white/50 mb-3 uppercase tracking-widest">
            <span>Building containers...</span>
            <span className="text-[#FF9900]">76%</span>
          </div>
          <div className="h-2 w-full bg-white/5 flex rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "76%" }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#FF9900] to-[#A78BFA] rounded-full"
            />
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-[#A78BFA]/10 hover:border-[#A78BFA]/30 hover:text-[#A78BFA] text-white transition-all duration-300 font-semibold text-sm group shadow-xl"
        >
          <ArrowLeft weight="bold" className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Return to Active Zone
        </Link>
      </motion.div>
    </div>
  );
}
