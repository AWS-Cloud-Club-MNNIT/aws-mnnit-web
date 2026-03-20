"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRightIcon, GlobeHemisphereWestIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { AnimatedGrid } from "./AnimatedGrid";

export function Hero() {
  const router = useRouter();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("appLoadedHero")) {
        setIsReady(true);
      } else {
        const timer = setTimeout(() => {
          sessionStorage.setItem("appLoadedHero", "true");
          setIsReady(true);
        }, 2800); // Ready slightly before loader fully fades out (2.5s + 0.5s transition)
        return () => clearTimeout(timer);
      }
    }
  }, []);

  if (!isReady) {
    // Render a non-animated empty structural placeholder during loading screen
    return <section className="relative min-h-screen bg-transparent" />;
  }

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white dark:bg-gray-900 border-none">
      {/* Full Right Side Animated Grid Background */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[50%] z-0 pointer-events-none">
        <AnimatedGrid />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left py-10 lg:py-24 max-w-xl">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.05, type: "spring", bounce: 0.4 }}
              className="text-5xl md:text-6xl lg:text-[5.5rem] font-black font-sans tracking-tight text-gray-900 dark:text-white mb-8 leading-[1.1] drop-shadow-sm"
            >
              Learn.{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#7C3AED] via-[#A78BFA] to-[#7C3AED]">
                Build.
              </span>{" "}
              <br /> Grow with Cloud.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="text-lg md:text-xl text-gray-600 dark:text-white/70 mb-12 leading-relaxed lg:mx-0"
            >
              AWS Cloud Club MNNIT is a student-led community where we explore
              cloud computing, build real-world projects, and grow together.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center lg:justify-start gap-4"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-linear-to-r from-[#7C3AED] to-[#5B21B6] hover:opacity-90 transition-all border border-white/10 text-white rounded-full h-14 px-8 text-base font-semibold group flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)]"
                onClick={() => window.open('https://meetup.com/aws-cloud-club-at-nit-allahabad', '_blank')}
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
                onClick={() => router.push('/scd')}
              >
                Explore SCD '26
                <GlobeHemisphereWestIcon
                  weight="duotone"
                  className="transition-transform group-hover:rotate-12"
                />
              </Button>
            </motion.div>
          </div>

          {/* Spacer to push out content if needed, but grid is absolute background */}
          <div className="flex-1 hidden lg:block" />
        </div>
      </div>
    </section>
  );
}