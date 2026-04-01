"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050812] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
      
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-red-500/10 blur-[120px] pointer-events-none rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="bg-[#090C15]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 text-center text-white/40 text-xs font-mono">
              root@aws-cloud-club-mnnit:~
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-8 font-mono text-sm md:text-base leading-relaxed">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[#FF9900] mb-2"
            >
              $ ping target-url...
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-red-400 mb-6"
            >
              PING target-url... [FAILED]
              <br />
              Request timeout for icmp_seq 0
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-white/80"
            >
              <span className="text-red-500 font-bold">ERROR 404:</span> VPC ROUTE NOT FOUND.
              <br />
              The instance you are looking for has been terminated or never existed.
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
              className="mt-10 flex items-center gap-2"
            >
              <span className="text-[#A78BFA]">$</span>
              <span className="text-white/40 animate-pulse">_</span>
            </motion.div>
          </div>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-[#A78BFA]/10 hover:border-[#A78BFA]/30 hover:text-[#A78BFA] text-white transition-all duration-300 font-semibold text-sm group"
          >
            <ArrowLeft weight="bold" className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Init Return_To_Base()
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
