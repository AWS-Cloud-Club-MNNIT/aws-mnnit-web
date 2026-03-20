"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("appLoaded")) {
        setIsReady(true);
      } else {
        const timer = setTimeout(() => {
          sessionStorage.setItem("appLoaded", "true");
          setIsReady(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isReady) return null;

  const navLinks = [
    { name: "SCD '26", href: "/scd" },
    { name: "Events", href: "/events" },
    { name: "Tracks", href: "/tracks" },
    { name: "Team", href: "/team" },
    { name: "Blogs", href: "/blogs" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 w-full z-50 transition-colors duration-300 border-b border-white/[0.05] ${
        isScrolled
          ? "bg-background/70 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 120, damping: 14 }}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size={48} className="text-white" />
            <span className="font-sans font-bold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-white/70 ml-1">
              AWS Cloud Club <span className="text-aws-orange">MNNIT</span>
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1, type: "spring", stiffness: 100, damping: 12 }}
            >
              <Link
                href={link.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-all relative group hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] inline-flex items-center"
              >
                {link.name}
                {link.name === "SCD '26" && (
                  <span className="absolute -top-1 -right-2.5 w-1.5 h-1.5 bg-[#FF9900] rounded-full shadow-[0_0_8px_rgba(255,153,0,0.8)] animate-pulse" />
                )}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-[#7C3AED] to-[#A78BFA] transition-all group-hover:w-full shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
              </Link>
            </motion.div>

          ))}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 120, damping: 14 }}
          className="flex items-center gap-4"
        >
          <Button 
            className="hidden md:flex bg-linear-to-r from-[#7C3AED] to-[#5B21B6] hover:opacity-100 transition-all border border-white/10 text-white font-semibold rounded-full px-6 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]"
            onClick={() => window.open('https://meetup.com/aws-cloud-club-at-nit-allahabad', '_blank')}  
          >
            Join Us
          </Button>

          <button
            className="md:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={24} weight="bold" />
            ) : (
              <List size={24} weight="bold" />
            )}
          </button>
        </motion.div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-20 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-white/10 py-6 px-6 flex flex-col gap-4 shadow-2xl"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base flex items-center font-medium text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors relative"
            >
              {link.name}
              {link.name === "SCD '26" && (
                <span className="ml-2 w-1.5 h-1.5 bg-[#FF9900] rounded-full shadow-[0_0_8px_rgba(255,153,0,0.8)] animate-pulse" />
              )}
            </Link>
          ))}
          <Button 
            className="w-full mt-4 bg-linear-to-r from-[#7C3AED] to-[#00C2FF] text-white font-semibold border border-white/10 rounded-xl h-12 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all"
            onClick={() => window.open('https://meetup.com/aws-cloud-club-at-nit-allahabad', '_blank')}
          >
            Join Us
          </Button>
        </motion.div>
      )}
    </motion.header>
  );
}
