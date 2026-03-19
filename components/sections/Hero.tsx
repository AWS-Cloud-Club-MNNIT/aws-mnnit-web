"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, GlobeHemisphereWestIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-white dark:bg-gray-900">
      {/* Simple Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-linear-to-t from-purple-100 via-purple-50 to-transparent dark:from-purple-900/20 dark:via-purple-900/10 dark:to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Subtle Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 dark:bg-white/3 border border-gray-200 dark:border-white/8 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-aws-orange animate-ping" />
              <Badge className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-white/80 bg-transparent">
                Welcome to the Future of Cloud
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black font-sans tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]"
            >
              Learn.{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#7C3AED] via-[#A78BFA] to-[#7C3AED]">
                Build.
              </span>{" "}
              Grow with Cloud.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 dark:text-white/70 max-w-2xl mb-12 leading-relaxed lg:mx-0"
            >
              AWS Cloud Club MNNIT is a student-led community where we explore
              cloud computing, build real-world projects, and grow together.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center lg:justify-start gap-4"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-linear-to-r from-[#7C3AED] to-[#5B21B6] border border-white/10 hover:opacity-90 rounded-full h-14 px-8 text-base font-semibold group flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] transition-all text-white"
              >
                Join the Community
                <ArrowRightIcon
                  weight="bold"
                  className="transition-transform group-hover:translate-x-1"
                />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-gray-100/80 dark:bg-white/5 backdrop-blur-md border-gray-300 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-full h-14 px-8 text-base font-semibold group flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] transition-all"
              >
                Explore Events
                <GlobeHemisphereWestIcon
                  weight="duotone"
                  className="transition-transform group-hover:rotate-12"
                />
              </Button>
            </motion.div>
          </div>

          {/* Right Content - Club Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-2xl aspect-square">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  <Image
                    src="/club-logo.png"
                    alt="AWS Cloud Club MNNIT"
                    width={1240}
                    height={1240}
                    className="rounded-full"
                    priority
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-white via-white/50 to-transparent dark:from-gray-900 dark:via-gray-900/50 dark:to-transparent pointer-events-none" />
    </section>
  );
}