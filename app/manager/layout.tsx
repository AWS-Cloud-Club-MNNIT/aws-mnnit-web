"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  IdentificationCard,
  SignOut,
  SquaresFour
} from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { managerLogoutAction } from "@/app/manager/login/actions"

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { name: "Participants", href: "/manager/participants", icon: <IdentificationCard weight="fill" className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen w-full bg-[#0F1115] text-white flex font-sans selection:bg-[#FF9900]/30 relative">
      
      {/* Fixed Sidebar */}
      <aside className="fixed top-0 left-0 w-[280px] h-screen border-r border-white/5 bg-[#1A222D] flex flex-col z-50">
        <div className="p-8 flex items-center gap-4 border-b border-white/5 shadow-sm">
          <img src="/logo.svg" alt="AWS Logo" className="h-12 w-auto object-contain drop-shadow-md shrink-0" />
          <div>
             <h2 className="font-bold text-lg text-white tracking-tight leading-none">Event Desk</h2>
             <p className="text-[10px] text-[#FF9900] font-bold tracking-widest uppercase mt-1">Manager Mode</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? "text-[#FF9900] font-semibold" 
                    : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-[#FF9900]/10 border border-[#FF9900]/30 rounded-xl" 
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 transition-colors ${isActive ? "text-[#FF9900]" : "text-white/40 group-hover:text-white"}`}>
                  {link.icon}
                </span>
                <span className="relative z-10 tracking-wide">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <form action={managerLogoutAction}>
            <button 
              type="submit"
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium group cursor-pointer"
            >
              <SignOut weight="fill" className="w-5 h-5 group-hover:text-red-400 transition-colors" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Column (offset by sidebar width) */}
      <div className="flex-1 ml-[280px] min-h-screen flex flex-col bg-[#0F1115]">
        {/* Sticky Top Header */}
        <header className="h-16 shrink-0 border-b border-white/5 bg-[#1A222D]/90 backdrop-blur-md sticky top-0 z-40 flex items-center px-10 justify-between w-full shadow-sm">
          <div className="flex items-center gap-4">
             <h1 className="text-lg font-bold text-white/90 tracking-tight">
               Registration Desk
             </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-white/50 hidden md:block">Connected to DB</span>
             <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
          </div>
        </header>

        {/* Natural Scrolling Content */}
        <main className="p-8 md:p-12 w-full flex-1">
          <div className="max-w-7xl mx-auto">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
