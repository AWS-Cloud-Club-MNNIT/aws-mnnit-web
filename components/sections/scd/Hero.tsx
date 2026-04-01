"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ClockCountdown, MapPinLine, UsersThree, ArrowRight } from "@phosphor-icons/react";

export function Hero() {

  return (
    <section className="relative pt-40 pb-20 container mx-auto px-6 max-w-6xl text-center z-10 flex flex-col items-center">
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
          }
        }}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center w-full"
      >
        {/* Animated Pill */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
          }}
          className="inline-flex items-center gap-3 py-2 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9900]/60 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF9900]"></span>
          </span>
          <span className="text-white/80 text-xs font-bold tracking-[0.2em] uppercase">
            MNNIT&apos;s Largest Cloud Conference
          </span>
        </motion.div>

        {/* Premium Title */}
        <motion.h1 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
          }}
          className="text-5xl md:text-[5.5rem] font-black tracking-tighter leading-[1.05] text-white mb-8 relative"
        >
          <span className="absolute -inset-4 bg-[#7C3AED]/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
          Student Community <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#00C2FF] to-[#7C3AED] bg-[length:200%_auto] animate-gradient">
            Day 2026
          </span>
        </motion.h1>

        <motion.p 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
          }}
          className="text-lg md:text-xl text-[#8892B0] md:w-2/3 mx-auto mb-12 leading-relaxed font-medium"
        >
          Join 500+ builders, AWS experts, and tech enthusiasts for a day of
          advanced cloud architectures, hands-on workshops, and deep tech
          networking.
        </motion.p>

        {/* Call to Actions */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
          }}
          className="flex flex-col items-center justify-center mb-12 w-full"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-4">
            <Button
              size="lg"
              onClick={() => window.open('https://unstop.com/workshops-webinars/aws-student-community-day-mnnit-motilal-nehru-national-institute-of-technology-1667724', '_blank')}
              className="group relative w-full sm:w-auto bg-white text-black hover:bg-white/90 rounded-full h-14 px-8 text-sm font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Register on Unstop
                <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>

            <Button
              size="lg"
              onClick={() => window.open('https://www.meetup.com/aws-cloud-club-at-nit-allahabad/events/314034890/', '_blank')}
              className="group relative w-full sm:w-auto bg-[#e0393e] text-white hover:bg-[#e0393e]/90 rounded-full h-14 px-8 text-sm font-bold shadow-[0_0_30px_rgba(224,57,62,0.15)] hover:shadow-[0_0_40px_rgba(224,57,62,0.3)] transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Register on Meetup
                <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open('https://forms.gle/9QfnYXeLU7Dmnqph6', '_blank')}
              className="w-full sm:w-auto bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 rounded-full h-14 px-8 text-sm font-bold transition-all"
            >
              Become a Sponsor
            </Button>
          </div>
          <p className="text-[#8892B0] text-sm mt-2 text-center max-w-lg font-medium">
            * Note: It is <strong>mandatory</strong> to register on both Unstop and Meetup to secure your spot.
          </p>
        </motion.div>

        {/* floating bar metadata */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.6 } }
          }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 md:px-12 w-full max-w-4xl shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/5 via-transparent to-[#FF9900]/5 rounded-[2rem] pointer-events-none" />
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto z-10 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#090C15]/80 border border-white/5 flex items-center justify-center text-[#00C2FF] shadow-inner mb-2 md:mb-0 md:absolute md:left-8 md:top-8 md:-ml-0">
              <ClockCountdown weight="duotone" className="w-7 h-7" />
            </div>
            <div className="md:pl-20">
              <p className="text-[#8892B0] text-xs font-bold uppercase tracking-widest mb-1">
                When
              </p>
              <p className="text-white font-bold text-lg">11th April, 2026</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto z-10 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#090C15]/80 border border-white/5 flex items-center justify-center text-[#FF9900] shadow-inner mb-2 md:mb-0 md:absolute md:left-1/2 md:-translate-x-32 md:top-8">
              <MapPinLine weight="duotone" className="w-7 h-7" />
            </div>
            <div className="md:pl-16">
              <p className="text-[#8892B0] text-xs font-bold uppercase tracking-widest mb-1">
                Where
              </p>
              <p className="text-white font-bold text-lg leading-tight">
                Multipurpose Hall<br/>
                <span className="text-sm font-medium text-white/60">MNNIT Allahabad</span>
              </p>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto z-10 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#090C15]/80 border border-white/5 flex items-center justify-center text-[#7C3AED] shadow-inner mb-2 md:mb-0 md:absolute md:right-8 md:top-8 md:-mr-0">
              <UsersThree weight="duotone" className="w-7 h-7" />
            </div>
            <div className="md:pr-10 text-right md:text-left">
              <p className="text-[#8892B0] text-xs font-bold uppercase tracking-widest mb-1">
                Who
              </p>
              <p className="text-white font-bold text-lg">500+ Attendees</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
