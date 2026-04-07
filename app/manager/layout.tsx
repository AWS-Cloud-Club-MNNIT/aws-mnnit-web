"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { SignOut } from "@phosphor-icons/react"
import { managerLogoutAction } from "@/app/manager/login/actions"

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { name: "Live Check-in Desk", href: "/manager/participants" },
  ]

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-[#FF9900]/30 relative flex flex-col">
      {/* Ambient Glowing Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#FF9900]/15 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[5%] w-[400px] h-[400px] bg-[#FF9900]/10 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Floating Horizontal Navigation */}
      <header className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-6 mb-8">
        <div className="max-w-5xl mx-auto bg-[#131920]/80 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden">
          {/* Top Highlight border map */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF9900]/70 to-transparent opacity-60" />

          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-white p-1.5 rounded-lg shadow-inner">
               <img src="/logo.svg" alt="AWS Logo" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <h2 className="font-black text-sm text-white tracking-widest uppercase leading-none">Operations</h2>
              <p className="text-[9px] text-[#FF9900] font-bold tracking-[0.2em] uppercase mt-1">Manager</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-1 px-1 py-1 rounded-xl bg-black/20 border border-white/5">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                    isActive ? "text-[#FF9900]" : "text-white/40 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTopNavManager"
                      className="absolute inset-0 bg-[#FF9900]/10 border border-[#FF9900]/20 rounded-lg shadow-[inset_0_0_12px_rgba(255,153,0,0.1)]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                     {link.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-4 shrink-0">
            <form action={managerLogoutAction}>
              <button 
                type="submit" 
                className="flex items-center justify-center group w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all shadow-md"
              >
                <SignOut weight="bold" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Feature View */}
      <main className="flex-1 w-full relative z-10 px-4 sm:px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
             key={pathname}
             initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
             transition={{ duration: 0.5, ease: "easeOut" }}
          >
             {children}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
