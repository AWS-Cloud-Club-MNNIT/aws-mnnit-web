"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import {
  MagnifyingGlass, UploadSimple, DownloadSimple,
  QrCode, UsersThree, CheckCircle, XCircle, CaretRight, UserFocus,
  Clock, Phone, Buildings, Funnel, ClockCounterClockwise, Trash
} from "@phosphor-icons/react"
import Papa from "papaparse"
import JSZip from "jszip"
import QRCode from "qrcode"

interface Participant {
  _id: string
  participantId: string
  registrationId?: string
  name: string
  email: string
  mobile?: string
  college: string
  location?: string
  present: boolean
  food: boolean
  verificationStatus: "pending" | "verified" | "rejected"
  verifiedBy?: string
  verifiedAt?: string
}

interface ActivityLog {
  _id: string
  participantId: string
  participantName: string
  action: "verified" | "rejected" | "pending"
  performedBy: string
  timestamp: string
  note?: string
}

const STATUS_CONFIG = {
  verified: { label: "Verified", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", dot: "bg-green-400" },
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" },
  rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-400" },
}

export default function ParticipantsPage() {
  const [query, setQuery] = useState("")
  const [allParticipants, setAllParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [generatingQR, setGeneratingQR] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "verified" | "rejected">("all")
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [showLogs, setShowLogs] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => { fetchParticipants() }, [])
  useEffect(() => { setCurrentPage(1); setSelectedIds(new Set()) }, [query, activeTab])

  useEffect(() => {
    const eventSource = new EventSource("/api/participants/stream")

    eventSource.addEventListener("update", (e) => {
      try {
        const updatedParticipant = JSON.parse(e.data)
        setAllParticipants(prev => {
          const exists = prev.find(p => p.participantId === updatedParticipant.participantId)
          if (exists) {
            return prev.map(p => p.participantId === updatedParticipant.participantId ? updatedParticipant : p)
          }
          return [updatedParticipant, ...prev]
        })
      } catch (err) {
        console.log(err);
      }
    })

    eventSource.addEventListener("delete", (e) => {
      try {
        const { participantId } = JSON.parse(e.data)
        setAllParticipants(prev => prev.filter(p => p.participantId !== participantId))
      } catch (err) {
        console.log(err);
      }
    })

    return () => {
      eventSource.close()
    }
  }, [])

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

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/participants/logs?limit=100")
      const data = await res.json()
      setLogs(data.logs || [])
    } catch {
      toast.error("Failed to load activity logs")
    }
  }

  const toggleLogs = () => {
    if (!showLogs) fetchLogs()
    setShowLogs(!showLogs)
  }

  const filteredByTab = activeTab === "all" ? allParticipants : allParticipants.filter(p =>
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const mappedData = results.data.map((row: any) => ({
            registrationId: row["Registration ID"] || row["Reg ID"] || "",
            name: row["Candidate's Name"] || row["Name"] || row["name"] || "",
            email: row["Candidate's Email"] || row["Email"] || row["email"] || "",
            mobile: row["Candidate's Mobile"] || row["Mobile"] || row["Phone"] || row["mobile"] || "",
            college:
              row["Course / College"] ||
              row["Candidate's Organisation"] ||
              row["Candidate's College"] ||
              row["Organisation"] ||
              row["College"] ||
              row["college"] ||
              "Unknown Institution",
            location: row["Candidate's Location"] || row["Location"] || row["City"] || "",
          })).filter((row: any) => row.name && row.email)

          const res = await fetch("/api/participants/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ participants: mappedData }),
          })
          const responseData = await res.json()
          if (!res.ok) throw new Error(responseData.error)
          toast.success(responseData.message || `Successfully added ${responseData.count} delegates!`)
          fetchParticipants()
        } catch (err: any) {
          toast.error(err.message || "Bulk upload failed")
        } finally {
          setUploading(false)
          e.target.value = ""
        }
      },
    })
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

  const handleGenerateQRs = async () => {
    setGeneratingQR(true)
    toast.loading("Generating High-Res QRs...")
    try {
      const zip = new JSZip()
      for (const p of allParticipants) {
        const url = `${window.location.origin}/ticket/${p.participantId}`
        const dataUrl = await QRCode.toDataURL(url, {
          width: 512, margin: 2, color: { dark: "#000000", light: "#ffffff" },
        })
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "")
        zip.file(`${p.participantId}_${p.name.replace(/[^a-z0-9]/gi, "_")}.png`, base64Data, { base64: true })
      }
      const content = await zip.generateAsync({ type: "blob" })
      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(content)
      link.download = "AWS_SCD_2026_QRCodes.zip"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.dismiss()
      toast.success("QR Archive Downloaded!")
    } catch {
      toast.dismiss()
      toast.error("Failed to generate QR archive")
    } finally {
      setGeneratingQR(false)
    }
  }

  const handleExportCSV = (status?: string) => {
    const url = status ? `/api/participants/export?status=${status}` : `/api/participants/export`
    window.open(url, "_blank")
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
      {/* Bulk Action Bar */}
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

                    {/* Name, ID & Phone (always visible) */}
                    <TableCell className="px-4 py-4 align-middle" onClick={() => window.location.href = `/admin/user/${p.participantId}`}>
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

                    {/* Email */}
                    <TableCell className="px-4 py-4 align-middle hidden sm:table-cell" onClick={() => window.location.href = `/admin/user/${p.participantId}`}>
                      <div className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors truncate max-w-[200px]">{p.email}</div>
                    </TableCell>

                    {/* College */}
                    <TableCell className="px-4 py-4 align-middle hidden lg:table-cell" onClick={() => window.location.href = `/admin/user/${p.participantId}`}>
                      <div className="flex items-center gap-1.5">
                        <Buildings weight="fill" className="w-3.5 h-3.5 text-white/30 shrink-0" />
                        <span className="inline-block max-w-[180px] truncate text-sm font-medium text-white/50">{p.college}</span>
                      </div>
                    </TableCell>

                    {/* Verification Status */}
                    <TableCell className="px-4 py-4 align-middle">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-4 align-middle text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        {(p.verificationStatus || "pending") !== "verified" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleVerificationUpdate(p.participantId, "verified") }}
                            disabled={isUpdating}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/25 text-green-400 border border-green-500/20 font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                            title="Verify"
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
                            title="Reject"
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
                            title="Set Pending"
                          >
                            <Clock weight="fill" className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Link
                          href={`/admin/user/${p.participantId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest transition-all"
                          title="Manage"
                        >
                          <CaretRight weight="bold" className="w-3.5 h-3.5" />
                        </Link>
                        {/* Delete - 2-step confirm */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(p.participantId) }}
                          disabled={deleting === p.participantId}
                          title={confirmDelete === p.participantId ? "Click again to confirm delete" : "Delete participant"}
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
        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-center">
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Delegates", value: counts.total, icon: <UsersThree weight="fill" className="w-5 h-5 text-blue-400" />, color: "text-white", accent: "bg-blue-500/10 border-blue-500/20" },
          { label: "Verified", value: counts.verified, icon: <CheckCircle weight="fill" className="w-5 h-5 text-green-400" />, color: "text-green-400", accent: "bg-green-500/10 border-green-500/20" },
          { label: "Pending", value: counts.pending, icon: <Clock weight="fill" className="w-5 h-5 text-amber-400" />, color: "text-amber-400", accent: "bg-amber-500/10 border-amber-500/20" },
          { label: "Rejected", value: counts.rejected, icon: <XCircle weight="fill" className="w-5 h-5 text-red-400" />, color: "text-red-400", accent: "bg-red-500/10 border-red-500/20" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#131920]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-lg"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${card.accent}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-0.5">{card.label}</p>
              <h3 className={`text-2xl font-black leading-none ${card.color}`}>{loading ? "—" : card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap">
        <Label className={`cursor-pointer shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          {uploading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <UploadSimple weight="bold" className="w-4 h-4" />}
          {uploading ? "Importing..." : "Upload CSV"}
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={uploading} />
        </Label>

        <button onClick={handleGenerateQRs} disabled={generatingQR || allParticipants.length === 0}
          className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold text-sm tracking-wide transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(255,153,0,0.2)]">
          <QrCode weight="bold" className="w-4 h-4" />
          {generatingQR ? "Zipping..." : "Export QRs"}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button disabled={allParticipants.length === 0}
              className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm tracking-wide transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] focus:outline-none">
              <DownloadSimple weight="bold" className="w-4 h-4 text-white/60" />
              Export CSV
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-48 bg-[#131920]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <DropdownMenuItem onClick={() => handleExportCSV()} className="text-sm font-bold text-white/70 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white rounded-lg cursor-pointer px-3 py-2.5 outline-none transition-colors">
              All Participants
            </DropdownMenuItem>
            <div className="h-px bg-white/5 my-1 mx-2" />
            <DropdownMenuItem onClick={() => handleExportCSV("verified")} className="text-sm font-bold text-green-400/70 hover:text-green-400 hover:bg-green-500/10 focus:bg-green-500/10 focus:text-green-400 rounded-lg cursor-pointer px-3 py-2.5 outline-none transition-colors">
              Verified Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportCSV("pending")} className="text-sm font-bold text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10 focus:bg-amber-500/10 focus:text-amber-400 rounded-lg cursor-pointer px-3 py-2.5 outline-none transition-colors">
              Pending Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportCSV("rejected")} className="text-sm font-bold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 rounded-lg cursor-pointer px-3 py-2.5 outline-none transition-colors">
              Rejected Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button onClick={toggleLogs}
          className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl border font-bold text-sm tracking-wide transition-all hover:-translate-y-0.5 ${showLogs ? "bg-purple-500/15 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`}>
          <ClockCounterClockwise weight="bold" className="w-4 h-4" />
          Activity Log
        </button>
      </div>

      {/* Activity Log Panel */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#131920]/80 backdrop-blur-2xl border border-purple-500/20 rounded-3xl shadow-2xl">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black text-white flex items-center gap-2">
                  <ClockCounterClockwise weight="fill" className="w-5 h-5 text-purple-400" />
                  Verification Activity Log
                </h3>
                <span className="text-xs text-white/40">{logs.length} entries</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-white/30 font-medium">No activity logged yet.</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {logs.map((log) => {
                      const cfg = STATUS_CONFIG[log.action]
                      return (
                        <div key={log._id} className="flex items-center gap-4 px-5 py-3">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-white text-sm">{log.participantName}</span>
                            <span className="text-white/40 text-xs ml-2">({log.participantId})</span>
                          </div>
                          <span className={`text-xs font-bold uppercase ${cfg.color}`}>{log.action}</span>
                          <span className="text-white/30 text-xs shrink-0">{log.performedBy}</span>
                          <span className="text-white/20 text-xs shrink-0 hidden md:block">
                            {new Date(log.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tabbed Table */}
      <div className="bg-[#131920]/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9900]/0 via-[#FF9900] to-[#FF9900]/0 opacity-30 rounded-t-3xl" />

        {/* Search + Filter */}
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
            <TabsList className="bg-black/30 border border-white/10 p-1 rounded-xl flex-wrap">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/30 text-white/50 rounded-lg font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all">
                All
                <span className="ml-2 bg-blue-500/20 text-blue-400 text-[10px] font-black px-1.5 py-0.5 rounded-md">{counts.total}</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/30 text-white/50 rounded-lg font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all">
                Pending
                <span className="ml-2 bg-amber-500/20 text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded-md">{counts.pending}</span>
              </TabsTrigger>
              <TabsTrigger value="verified" className="data-[state=active]:bg-green-500/15 data-[state=active]:text-green-400 data-[state=active]:border-green-500/30 text-white/50 rounded-lg font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all">
                Verified
                <span className="ml-2 bg-green-500/20 text-green-400 text-[10px] font-black px-1.5 py-0.5 rounded-md">{counts.verified}</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500/15 data-[state=active]:text-red-400 data-[state=active]:border-red-500/30 text-white/50 rounded-lg font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all">
                Rejected
                <span className="ml-2 bg-red-500/20 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded-md">{counts.rejected}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#FF9900]/20 border-t-[#FF9900] rounded-full animate-spin shadow-[0_0_15px_rgba(255,153,0,0.5)]" />
            </div>
          ) : (
            <>
              <TabsContent value="all" className="mt-0 pb-2">
                {paginated.length === 0 ? (
                  <div className="p-16 text-center">
                    <UsersThree className="w-14 h-14 text-blue-400/20 mx-auto mb-4" weight="fill" />
                    <h3 className="text-xl font-bold text-white mb-2">No Delegates</h3>
                    <p className="text-white/40 max-w-sm mx-auto">Upload delegates to get started.</p>
                  </div>
                ) : renderTable(paginated)}
              </TabsContent>
              <TabsContent value="pending" className="mt-0 pb-2">
                {paginated.length === 0 ? (
                  <div className="p-16 text-center">
                    <Clock className="w-14 h-14 text-amber-400/20 mx-auto mb-4" weight="fill" />
                    <h3 className="text-xl font-bold text-white mb-2">No Pending Delegates</h3>
                    <p className="text-white/40 max-w-sm mx-auto">All participants have been processed.</p>
                  </div>
                ) : renderTable(paginated)}
              </TabsContent>
              <TabsContent value="verified" className="mt-0 pb-2">
                {paginated.length === 0 ? (
                  <div className="p-16 text-center">
                    <CheckCircle className="w-14 h-14 text-green-400/20 mx-auto mb-4" weight="fill" />
                    <h3 className="text-xl font-bold text-white mb-2">No Verified Delegates Yet</h3>
                    <p className="text-white/40 max-w-sm mx-auto">Verify participants from the Pending tab.</p>
                  </div>
                ) : renderTable(paginated)}
              </TabsContent>
              <TabsContent value="rejected" className="mt-0 pb-2">
                {paginated.length === 0 ? (
                  <div className="p-16 text-center">
                    <XCircle className="w-14 h-14 text-red-400/20 mx-auto mb-4" weight="fill" />
                    <h3 className="text-xl font-bold text-white mb-2">No Rejected Delegates</h3>
                    <p className="text-white/40 max-w-sm mx-auto">No participants have been rejected.</p>
                  </div>
                ) : renderTable(paginated)}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}
