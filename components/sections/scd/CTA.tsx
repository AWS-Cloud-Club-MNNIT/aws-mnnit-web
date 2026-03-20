"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CTA() {
  const router = useRouter();

  return (
    <section className="py-24 container mx-auto px-6 max-w-5xl relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden border border-white/10 rounded-[3rem] p-12 md:p-24 text-center group bg-[#090C15] shadow-2xl hover:shadow-[#7C3AED]/20 transition-shadow duration-700"
      >
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
          <div className="absolute top-[-50%] left-[-10%] w-[100%] h-[150%] bg-[#7C3AED]/30 blur-[100px] mix-blend-screen rounded-full" />
          <div className="absolute bottom-[-50%] right-[-10%] w-[100%] h-[150%] bg-[#00C2FF]/20 blur-[120px] mix-blend-screen rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Don't Miss Out.
          </h2>
          <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            Tickets are extremely limited and will sell out quickly. Secure your place
            at the frontier of cloud computing and build your network.
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/register')}
            className="bg-white text-black hover:bg-white/90 rounded-full h-16 px-12 text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all group-hover:-translate-y-1"
          >
            Register For SCD 2026
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
