"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import {
  MagnifyingGlass, UsersThree, CheckCircle, XCircle, CaretRight,
  UserFocus, Clock, Phone, Buildings, Funnel, Trash
} from "@phosphor-icons/react"

interface Participant {
  _id: string
  participantId: string
  name: string
  email: string
  mobile?: string
  college: string
  present: boolean
  food: boolean
  verificationStatus: "pending" | "verified" | "rejected"
}

const STATUS_CONFIG = {
  verified: { label: "Verified", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", dot: "bg-green-400" },
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" },
  rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-400" },
}

export default function ManagerParticipantsPage() {
  const [query, setQuery] = useState("")
  const [allParticipants, setAllParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "rejected">("pending")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => { fetchParticipants() }, [])
  useEffect(() => { setCurrentPage(1); setSelectedIds(new Set()) }, [query, activeTab])

  const fetchParticipants = async () => {
    try {
      const res = await fetch("/api/participants")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAllParticipants(data.participants || [])
    } catch {
      toast.error("Failed to load participants")
    } finally {
      setLoading(false)
    }
  }

  const filteredByTab = allParticipants.filter(p =>
    (p.verificationStatus || "pending") === activeTab
  )

  const filtered = filteredByTab.filter(p => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.participantId.toLowerCase().includes(q) ||
      p.college.toLowerCase().includes(q) ||
      (p.mobile || "").includes(q)
    )
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const counts = {
    total: allParticipants.length,
    verified: allParticipants.filter(p => (p.verificationStatus || "pending") === "verified").length,
    pending: allParticipants.filter(p => (p.verificationStatus || "pending") === "pending").length,
    rejected: allParticipants.filter(p => (p.verificationStatus || "pending") === "rejected").length,
  }

  const handleVerificationUpdate = async (participantId: string, status: "pending" | "verified" | "rejected") => {
    setUpdating(participantId)
    try {
      const res = await fetch(`/api/participants/${participantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAllParticipants(prev => prev.map(p =>
        p.participantId === participantId ? { ...p, verificationStatus: status } : p
      ))
      toast.success(`Participant ${status === "verified" ? "verified ✓" : status === "rejected" ? "rejected ✗" : "moved to pending"}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    } finally {
      setUpdating(null)
    }
  }

  const handleBulkAction = async (status: "pending" | "verified" | "rejected") => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    try {
      const res = await fetch("/api/participants/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds: ids, verificationStatus: status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAllParticipants(prev => prev.map(p =>
        ids.includes(p.participantId) ? { ...p, verificationStatus: status } : p
      ))
      setSelectedIds(new Set())
      toast.success(data.message)
    } catch (err: any) {
      toast.error(err.message || "Bulk action failed")
    }
  }

  const handleDelete = async (participantId: string) => {
    if (confirmDelete !== participantId) {
      setConfirmDelete(participantId)
      setTimeout(() => setConfirmDelete(null), 3000)
      return
    }
    setConfirmDelete(null)
    setDeleting(participantId)
    try {
      const res = await fetch(`/api/participants/${participantId}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAllParticipants(prev => prev.filter(p => p.participantId !== participantId))
      toast.success(data.message || "Participant deleted")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setDeleting(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} participant(s)? This cannot be undone.`)) return
    const ids = Array.from(selectedIds)
    setBulkDeleting(true)
    try {
      const res = await fetch("/api/participants/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds: ids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAllParticipants(prev => prev.filter(p => !ids.includes(p.participantId)))
      setSelectedIds(new Set())
      toast.success(data.message)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed")
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginated.map(p => p.participantId)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const renderTable = (participants: Participant[]) => (
    <div className="flex flex-col">
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 mt-4 p-4 bg-[#FF9900]/10 border border-[#FF9900]/30 rounded-2xl flex flex-wrap items-center gap-3"
          >
            <span className="text-[#FF9900] font-bold text-sm">{selectedIds.size} selected</span>
            <div className="flex gap-2 ml-auto flex-wrap">
              {activeTab !== "verified" && (
                <button onClick={() => handleBulkAction("verified")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 font-bold text-xs hover:bg-green-500/30 transition">
                  <CheckCircle weight="fill" className="w-4 h-4" /> Bulk Verify
                </button>
              )}
              {activeTab !== "rejected" && (
                <button onClick={() => handleBulkAction("rejected")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs hover:bg-red-500/30 transition">
                  <XCircle weight="fill" className="w-4 h-4" /> Bulk Reject
                </button>
              )}
              {activeTab !== "pending" && (
                <button onClick={() => handleBulkAction("pending")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs hover:bg-amber-500/30 transition">
                  <Clock weight="fill" className="w-4 h-4" /> Move to Pending
                </button>
              )}
              <button onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 text-white/50 border border-white/10 font-bold text-xs hover:bg-white/10 transition">
                <XCircle weight="bold" className="w-4 h-4" /> Clear
              </button>
              <button onClick={handleBulkDelete} disabled={bulkDeleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-900/40 text-red-300 border border-red-700/40 font-bold text-xs hover:bg-red-900/60 transition disabled:opacity-50">
                <Trash weight="fill" className="w-4 h-4" /> {bulkDeleting ? "Deleting..." : "Delete Selected"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <Table className="w-full text-left border-collapse">
          <TableHeader className="sticky top-0 z-20 shadow-md">
            <TableRow className="border-b border-white/5 bg-[#1A222D]">
              <TableHead className="px-6 py-5 w-12">
                <input
                  type="checkbox"
                  checked={paginated.length > 0 && selectedIds.size === paginated.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-[#FF9900] rounded cursor-pointer"
                />
              </TableHead>
              <TableHead className="px-4 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Delegate Info & Phone</TableHead>
              <TableHead className="px-4 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase hidden sm:table-cell">Email</TableHead>
              <TableHead className="px-4 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase hidden lg:table-cell">Institution</TableHead>
              <TableHead className="px-4 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Status</TableHead>
              <TableHead className="px-4 py-5 text-right text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/5">
            <AnimatePresence>
              {participants.map((p, index) => {
                const statusCfg = STATUS_CONFIG[p.verificationStatus || "pending"]
                const isSelected = selectedIds.has(p.participantId)
                const isUpdating = updating === p.participantId
                return (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index < 15 ? index * 0.02 : 0 }}
                    key={p._id}
                    className={`group transition-colors cursor-pointer ${isSelected ? "bg-[#FF9900]/5" : "hover:bg-white/[0.02]"} ${isUpdating ? "opacity-50" : ""}`}
                  >
                    <TableCell className="px-6 py-4 align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(p.participantId)}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 accent-[#FF9900] rounded cursor-pointer"
                      />
                    </TableCell>

                    <TableCell className="px-4 py-4 align-middle" onClick={() => window.location.href = `/manager/user/${p.participantId}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm shrink-0 bg-white/5 border-white/10 text-white/30">
                          <UserFocus weight="fill" className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-[#FF9900] transition-colors text-sm">{p.name}</div>
                          <div className="font-mono text-[10px] text-white/40 mt-0.5 uppercase tracking-widest">{p.participantId}</div>
                          {p.mobile && (
                            <div className="flex items-center gap-1 mt-1">
                              <Phone weight="fill" className="w-3 h-3 text-[#FF9900]/70 shrink-0" />
                              <span className="text-[11px] font-mono text-[#FF9900]/80 font-medium">{p.mobile}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4 align-middle hidden sm:table-cell" onClick={() => window.location.href = `/manager/user/${p.participantId}`}>
                      <div className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors truncate max-w-[200px]">{p.email}</div>
                    </TableCell>

                    <TableCell className="px-4 py-4 align-middle hidden lg:table-cell" onClick={() => window.location.href = `/manager/user/${p.participantId}`}>
                      <div className="flex items-center gap-1.5">
                        <Buildings weight="fill" className="w-3.5 h-3.5 text-white/30 shrink-0" />
                        <span className="inline-block max-w-[180px] truncate text-sm font-medium text-white/50">{p.college}</span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4 align-middle">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4 align-middle text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        {(p.verificationStatus || "pending") !== "verified" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleVerificationUpdate(p.participantId, "verified") }}
                            disabled={isUpdating}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/25 text-green-400 border border-green-500/20 font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                          >
                            <CheckCircle weight="fill" className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Verify</span>
                          </button>
                        )}
                        {(p.verificationStatus || "pending") !== "rejected" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleVerificationUpdate(p.participantId, "rejected") }}
                            disabled={isUpdating}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                          >
                            <XCircle weight="fill" className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Reject</span>
                          </button>
                        )}
                        {(p.verificationStatus || "pending") !== "pending" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleVerificationUpdate(p.participantId, "pending") }}
                            disabled={isUpdating}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/20 font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                          >
                            <Clock weight="fill" className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Link
                          href={`/manager/user/${p.participantId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest transition-all"
                        >
                          <CaretRight weight="bold" className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(p.participantId) }}
                          disabled={deleting === p.participantId}
                          title={confirmDelete === p.participantId ? "Click again to confirm" : "Delete participant"}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 ${
                            confirmDelete === p.participantId
                              ? "bg-red-600/30 border-red-500/60 text-red-300 animate-pulse"
                              : "bg-red-500/5 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 border-red-500/10 hover:border-red-500/30"
                          }`}
                        >
                          <Trash weight={confirmDelete === p.participantId ? "fill" : "bold"} className="w-3.5 h-3.5" />
                          {confirmDelete === p.participantId && <span className="hidden xl:inline">Confirm?</span>}
                        </button>
                      </div>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-center rounded-b-3xl">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(currentPage - page) <= 1)
                .map((page, i, arr) => (
                  <React.Fragment key={page}>
                    {i > 0 && arr[i - 1] !== page - 1 && (<PaginationItem><PaginationEllipsis /></PaginationItem>)}
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))}
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, icon: <UsersThree weight="fill" className="w-5 h-5 text-blue-400" />, color: "text-white", accent: "bg-blue-500/10 border-blue-500/20" },
          { label: "Verified", value: counts.verified, icon: <CheckCircle weight="fill" className="w-5 h-5 text-green-400" />, color: "text-green-400", accent: "bg-green-500/10 border-green-500/20" },
          { label: "Pending", value: counts.pending, icon: <Clock weight="fill" className="w-5 h-5 text-amber-400" />, color: "text-amber-400", accent: "bg-amber-500/10 border-amber-500/20" },
          { label: "Rejected", value: counts.rejected, icon: <XCircle weight="fill" className="w-5 h-5 text-red-400" />, color: "text-red-400", accent: "bg-red-500/10 border-red-500/20" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-[#131920]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${card.accent}`}>{card.icon}</div>
            <div>
              <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-0.5">{card.label}</p>
              <h3 className={`text-2xl font-black leading-none ${card.color}`}>{loading ? "—" : card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-[#131920]/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9900]/0 via-[#FF9900] to-[#FF9900]/0 opacity-30 rounded-t-3xl" />

        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/20 rounded-t-3xl">
          <div className="relative w-full sm:max-w-sm group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MagnifyingGlass weight="bold" className="w-4 h-4 text-[#FF9900]/50 group-focus-within:text-[#FF9900] transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Search name, email, phone, college..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#FF9900]/50 focus:ring-1 focus:ring-[#FF9900]/50 transition-all font-medium placeholder:text-white/20"
            />
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
            <Funnel weight="fill" className="w-3.5 h-3.5" />
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setCurrentPage(1) }}>
          <div className="px-5 pt-4">
            <TabsList className="bg-black/30 border border-white/10 p-1 rounded-xl">
              <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 text-white/50 rounded-lg font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all">
                Pending <span className="ml-2 bg-amber-500/20 text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded-md">{counts.pending}</span>
              </TabsTrigger>
              <TabsTrigger value="verified" className="data-[state=active]:bg-green-500/15 data-[state=active]:text-green-400 text-white/50 rounded-lg font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all">
                Verified <span className="ml-2 bg-green-500/20 text-green-400 text-[10px] font-black px-1.5 py-0.5 rounded-md">{counts.verified}</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500/15 data-[state=active]:text-red-400 text-white/50 rounded-lg font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all">
                Rejected <span className="ml-2 bg-red-500/20 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded-md">{counts.rejected}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <TabsContent value="pending" className="mt-0 pb-2">
                {paginated.length === 0
                  ? <div className="p-16 text-center"><Clock className="w-14 h-14 text-amber-400/20 mx-auto mb-4" weight="fill" /><h3 className="text-xl font-bold text-white mb-2">No Pending Delegates</h3></div>
                  : renderTable(paginated)}
              </TabsContent>
              <TabsContent value="verified" className="mt-0 pb-2">
                {paginated.length === 0
                  ? <div className="p-16 text-center"><CheckCircle className="w-14 h-14 text-green-400/20 mx-auto mb-4" weight="fill" /><h3 className="text-xl font-bold text-white mb-2">No Verified Delegates Yet</h3></div>
                  : renderTable(paginated)}
              </TabsContent>
              <TabsContent value="rejected" className="mt-0 pb-2">
                {paginated.length === 0
                  ? <div className="p-16 text-center"><XCircle className="w-14 h-14 text-red-400/20 mx-auto mb-4" weight="fill" /><h3 className="text-xl font-bold text-white mb-2">No Rejected Delegates</h3></div>
                  : renderTable(paginated)}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}
