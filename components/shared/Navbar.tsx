"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { Cloud, List, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Events", href: "/events" },
    { name: "SCD '26", href: "/scd" },
    { name: "Tracks", href: "/tracks" },
    { name: "Team", href: "/team" },
    { name: "Blogs", href: "/blogs" },
  ]

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/[0.05] ${
        isScrolled
          ? "bg-background/70 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image 
            src="/logo.svg" 
            alt="AWS Cloud Club Logo" 
            width={56}
            height={56}
            className="h-14 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-md" 
          />
          <span className="font-sans font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 ml-1">
            AWS Cloud Club <span className="text-aws-orange">MNNIT</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-white/70 hover:text-white transition-all relative group hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all group-hover:w-full shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
            </Link>
          ))}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Button
            className="hidden md:flex bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:opacity-100 transition-all border border-white/10 text-white font-semibold rounded-full px-6 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]"
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
        </div>
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
              className="text-base font-medium text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Button className="w-full mt-4 bg-gradient-to-r from-[#7C3AED] to-[#00C2FF] text-white font-semibold border border-white/10 rounded-xl h-12 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all">
            Join Us
          </Button>
        </motion.div>
      )}
    </header>
  )
}
