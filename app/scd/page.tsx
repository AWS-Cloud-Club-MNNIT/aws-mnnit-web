"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import {
  MicrophoneStage,
  MapPinLine,
  ClockCountdown,
  UsersThree,
  RocketLaunch,
} from "@phosphor-icons/react";

export default function SCDPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Dynamic Abstract Background for Premium Feel */}
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
        <div className="absolute top-[20%] left-[-200px] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 container mx-auto px-6 max-w-6xl text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-aws-orange text-sm font-bold tracking-widest uppercase mb-6">
              MNNIT's Largest Cloud Conference
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-tight mb-6">
              Student Community <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary bg-size-[200%_auto] animate-gradient">
                Day 2026
              </span>
            </h1>
            <p className="text-xl text-white/60 md:w-2/3 mx-auto mb-10 leading-relaxed">
              Join 500+ builders, AWS experts, and tech enthusiasts for a day of
              advanced cloud architectures, hands-on workshops, and deep tech
              networking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-black hover:bg-white/90 rounded-full h-14 px-10 text-lg font-bold"
              >
                Get Tickets Now For Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/5 rounded-full h-14 px-10 text-lg font-bold"
              >
                Become a Sponsor
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                  <ClockCountdown weight="duotone" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wider">
                    When
                  </p>
                  <p className="text-white font-semibold">11th April, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-aws-orange">
                  <MapPinLine weight="duotone" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wider">
                    Where
                  </p>
                  <p className="text-white font-semibold">
                    Multipurpose Hall
                  </p>
                  <p className="text-white font-semibold">
                    MNNIT Allahabad
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary">
                  <UsersThree weight="duotone" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wider">
                    Who
                  </p>
                  <p className="text-white font-semibold">500+ Attendees</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* What to Expect */}
        <section className="py-24 bg-card/10 border-y border-white/5 relative z-10">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                What to Expect
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <MicrophoneStage weight="duotone" className="w-8 h-8" />
                  ),
                  title: "Expert Keynotes",
                  desc: "Hear directly from AWS Heroes and senior cloud architects.",
                },
                {
                  icon: <RocketLaunch weight="duotone" className="w-8 h-8" />,
                  title: "Live Build Sessions",
                  desc: "Code alongside experts deploying serverless apps in real-time.",
                },
                {
                  icon: <UsersThree weight="duotone" className="w-8 h-8" />,
                  title: "Networking Hub",
                  desc: "Connect with recruiters from top tech companies and startups.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-8 bg-card/20 border border-white/5 rounded-3xl hover:bg-card/40 transition-colors text-center flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-white/80 mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Box */}
        <section className="py-32 container mx-auto px-6 max-w-4xl relative z-10">
          <div className="bg-linear-to-r from-primary/20 to-secondary/20 border border-white/10 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/40 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Don't Miss Out.
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
                Tickets are limited and will sell out quickly. Secure your place
                at the frontier of cloud computing.
              </p>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 rounded-full h-14 px-10 text-lg font-bold shadow-2xl shadow-white/10"
              >
                Register For SCD 2026
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
