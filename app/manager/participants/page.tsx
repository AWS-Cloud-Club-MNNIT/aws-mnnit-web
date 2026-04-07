"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  MagnifyingGlass,
  UsersThree,
  CheckCircle,
  CaretRight,
  UserFocus
} from "@phosphor-icons/react"

interface Participant {
  _id: string
  participantId: string
  name: string
  email: string
  college: string
  present: boolean
  food: boolean
}

export default function ManagerParticipantsPage() {
  const [query, setQuery] = useState("")
  const [allParticipants, setAllParticipants] = useState<Participant[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    fetchParticipants()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    if (query.trim() === "") {
      setParticipants(allParticipants)
    } else {
      const q = query.toLowerCase()
      setParticipants(
        allParticipants.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.participantId.toLowerCase().includes(q) ||
            p.college.toLowerCase().includes(q)
        )
      )
    }
  }, [query, allParticipants])

  const fetchParticipants = async () => {
    try {
      const res = await fetch("/api/participants")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAllParticipants(data.participants || [])
      setParticipants(data.participants || [])
    } catch {
      toast.error("Failed to load participants")
    } finally {
      setLoading(false)
    }
  }

  const presences = allParticipants.filter(p => p.present).length

  const totalPages = Math.ceil(participants.length / itemsPerPage)
  const currentParticipants = participants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6">
      
      {/* Stats & Header Actions */}
      <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-end justify-between">
        
        {/* Stat Cards */}
        <div className="flex gap-4 w-full xl:w-auto">
          <div className="bg-[#131920]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-5 flex-1 min-w-[200px] shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <UsersThree weight="fill" className="w-24 h-24" />
             </div>
             <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
               <UsersThree weight="fill" className="w-6 h-6 text-blue-400" />
             </div>
             <div>
               <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-1">Total Delegates</p>
               <h3 className="text-3xl font-black text-white leading-none">{allParticipants.length}</h3>
             </div>
          </div>
          <div className="bg-[#131920]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-5 flex-1 min-w-[200px] shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <CheckCircle weight="fill" className="w-24 h-24" />
             </div>
             <div className="w-12 h-12 bg-[#FF9900]/10 rounded-xl flex items-center justify-center border border-[#FF9900]/20 shrink-0">
               <UserFocus weight="fill" className="w-6 h-6 text-[#FF9900]" />
             </div>
             <div>
               <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-1">Checked In Live</p>
               <div className="flex items-baseline gap-2">
                 <h3 className="text-3xl font-black text-[#FF9900] leading-none">{presences}</h3>
                 <span className="text-sm font-bold text-white/30">/ {allParticipants.length || 0}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Database View Core */}
      <div className="bg-[#131920]/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9900]/0 via-[#FF9900] to-[#FF9900]/0 opacity-30 rounded-t-3xl" />
        
        {/* Filtering & Search Header */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-black/20 rounded-t-3xl">
          <div className="relative w-full md:max-w-md group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MagnifyingGlass weight="bold" className="w-5 h-5 text-[#FF9900]/50 group-focus-within:text-[#FF9900] transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Search by ID, name, email or college..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#FF9900]/50 focus:ring-1 focus:ring-[#FF9900]/50 transition-all font-medium placeholder:text-white/20 shadow-inner"
            />
          </div>
        </div>

        {/* Data Grid Body */}
        {loading ? (
           <div className="p-12 flex justify-center">
             <div className="w-8 h-8 border-4 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin shadow-[0_0_15px_rgba(255,153,0,0.5)]" />
           </div>
        ) : participants.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner border border-white/10 rotate-12">
               <UsersThree className="w-10 h-10 text-white/20 transform -rotate-12" weight="duotone" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Matching Delegates</h3>
            <p className="text-white/40 max-w-sm mx-auto">Try typing a different name or checking their QR code.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <Table className="w-full text-left border-collapse relative">
                <TableHeader className="sticky top-0 z-20 shadow-md">
                  <TableRow className="border-b border-white/5 bg-[#1A222D]">
                    <TableHead className="px-6 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Delegate Info</TableHead>
                    <TableHead className="px-6 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase hidden sm:table-cell">Contact</TableHead>
                    <TableHead className="px-6 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase hidden md:table-cell">Institution</TableHead>
                    <TableHead className="px-6 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Status</TableHead>
                    <TableHead className="px-6 py-5 text-right text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {currentParticipants.map((p, index) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index < 15 ? index * 0.03 : 0 }}
                        key={p._id}
                        className="group hover:bg-[#FF9900]/[0.02] transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/manager/user/${p.participantId}`}
                      >
                        {/* Name & ID */}
                        <TableCell className="px-6 py-5 align-middle">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0 transition-colors ${
                              p.present ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-white/30'
                            }`}>
                              <UserFocus weight="fill" className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-[#FF9900] transition-colors flex items-center gap-2">
                                {p.name}
                              </div>
                              <div className="font-mono text-[10px] text-white/40 mt-1 uppercase tracking-widest">
                                {p.participantId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Contact */}
                        <TableCell className="px-6 py-5 align-middle hidden sm:table-cell">
                          <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">
                            {p.email}
                          </span>
                        </TableCell>

                        {/* College */}
                        <TableCell className="px-6 py-5 align-middle hidden md:table-cell">
                          <span className="inline-block max-w-[200px] lg:max-w-xs truncate text-sm font-medium text-white/50">
                            {p.college}
                          </span>
                        </TableCell>

                        {/* Status Badges */}
                        <TableCell className="px-6 py-5 align-middle">
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                              p.present 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]' 
                                : 'bg-white/5 text-white/30 border-white/10'
                            }`}>
                              {p.present ? "Checked-In" : "Away"}
                            </span>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                              p.food 
                                ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20 shadow-[0_0_10px_rgba(255,153,0,0.1)]' 
                                : 'bg-white/5 text-white/30 border-white/10'
                            }`}>
                              {p.food ? "Meal Fed" : "No Meal"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Action */}
                        <TableCell className="px-6 py-5 align-middle text-right">
                          <Link 
                            href={`/manager/user/${p.participantId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold text-[10px] uppercase tracking-widest border border-white/10 transition-all hover:scale-105"
                          >
                            Check In <CaretRight weight="bold" className="w-3 h-3" />
                          </Link>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5 bg-black/20 flex justify-center rounded-b-3xl">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPages || Math.abs(currentPage - page) <= 1)
                      .map((page, i, arr) => (
                        <React.Fragment key={page}>
                          {i > 0 && arr[i - 1] !== page - 1 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink 
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
