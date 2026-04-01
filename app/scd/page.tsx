"use client";

import * as React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Hero } from "@/components/sections/scd/Hero";
import { Overview } from "@/components/sections/scd/Overview";
import { Experience } from "@/components/sections/scd/Experience";
import { Speakers } from "@/components/sections/scd/Speakers";
import { Timeline } from "@/components/sections/scd/Timeline";
import { CTA } from "@/components/sections/scd/CTA";

export default function SCDPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#05070A] text-white selection:bg-primary/30 selection:text-primary-foreground relative overflow-hidden font-sans">
        {/* Subtle Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[140px] mix-blend-screen animate-pulse delay-700" />
        </div>

        <Hero />
        <Overview />
        <Experience />
        <Speakers />
        <Timeline />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
