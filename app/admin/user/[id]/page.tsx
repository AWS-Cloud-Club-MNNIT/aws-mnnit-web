"use client"

import { useEffect, useState, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import QRCode from "qrcode"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import {
  CaretLeft, CheckCircle, XCircle, QrCode, MapPin,
  EnvelopeSimple, IdentificationCard, ArrowSquareOut,
  Fingerprint, Phone, Clock, ShieldCheck, ShieldSlash, ShieldWarning, Trash
} from "@phosphor-icons/react"

interface Participant {
  _id: string
  participantId: string
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

const STATUS_CONFIG = {
  verified: {
    label: "Verified", color: "text-green-400", bg: "bg-green-500/10",
    border: "border-green-500/30", icon: <ShieldCheck weight="fill" className="w-5 h-5 text-green-400" />,
    glow: "shadow-[0_0_20px_rgba(74,222,128,0.2)]"
  },
  pending: {
    label: "Pending Review", color: "text-amber-400", bg: "bg-amber-500/10",
    border: "border-amber-500/30", icon: <ShieldWarning weight="fill" className="w-5 h-5 text-amber-400" />,
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]"
  },
  rejected: {
    label: "Rejected", color: "text-red-400", bg: "bg-red-500/10",
    border: "border-red-500/30", icon: <ShieldSlash weight="fill" className="w-5 h-5 text-red-400" />,
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]"
  },
}

export default function UserUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const router = useRouter()

  useEffect(() => { fetchParticipant() }, [id])

  const fetchParticipant = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/${id}`)
      const data = await res.json()
      if (res.ok) {
        setParticipant(data.participant)
        generateQR(data.participant.participantId)
      } else {
        toast.error("Failed to load participant")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }, [id])

  const generateQR = async (participantId: string) => {
    try {
      const url = `${window.location.origin}/ticket/${participantId}`
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300, margin: 1, color: { dark: "#000000", light: "#ffffff" },
      })
      setQrDataUrl(dataUrl)
    } catch { console.error("QR generation failed") }
  }

  const handleToggle = async (field: "present" | "food", value: boolean) => {
    if (!participant) return
    const previous = { ...participant }
    const updated = { ...participant, [field]: value }
    setParticipant(updated)
    setUpdating(field)
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ present: updated.present, food: updated.food }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to update"); setParticipant(previous) }
      else toast.success(`Action Authorized: ${field === "present" ? "Attendance" : "Meals"} updated`)
    } catch {
      toast.error("Network error during update")
      setParticipant(previous)
    } finally { setUpdating(null) }
  }

  const handleVerificationUpdate = async (status: "pending" | "verified" | "rejected") => {
    if (!participant) return
    const previous = { ...participant }
    setParticipant({ ...participant, verificationStatus: status })
    setUpdating("verification")
    try {
      const res = await fetch(`/api/participants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: status }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to update"); setParticipant(previous) }
      else {
        setParticipant(data.participant)
        toast.success(`Verification status set to "${status}"`)
      }
    } catch {
      toast.error("Network error")
      setParticipant(previous)
    } finally { setUpdating(null) }
  }

  const handleDelete = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      setTimeout(() => setConfirmingDelete(false), 4000)
      return
    }
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/participants/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.message || "Participant deleted")
      router.push("/admin/participants")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
      setIsDeleting(false)
      setConfirmingDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-white/5 rounded-lg" />
        <div className="h-80 bg-[#131920]/80 rounded-3xl border border-white/5" />
        <div className="h-40 bg-[#131920]/80 rounded-3xl border border-white/5" />
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="max-w-2xl mx-auto text-center py-32 bg-[#131920]/80 border border-white/5 rounded-3xl mt-12 shadow-2xl">
        <XCircle weight="duotone" className="w-24 h-24 text-red-500/30 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-white mb-3">Identity Not Found</h2>
        <p className="text-white/40 mb-8 max-w-sm mx-auto">No delegate record for ID: <span className="font-mono text-[#FF9900] font-bold bg-[#FF9900]/10 px-3 py-1 rounded-lg inline-block mt-2">{id}</span></p>
        <Link href="/admin/participants" className="inline-flex items-center bg-white text-black font-bold px-8 py-4 rounded-xl hover:scale-105 transition-all">
          Return to Registry
        </Link>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[participant.verificationStatus || "pending"]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin/participants"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition font-bold text-xs uppercase tracking-widest group">
          <CaretLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" weight="bold" />
          Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Fingerprint className="w-5 h-5 text-[#FF9900]/50" weight="duotone" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF9900]">Secure Ops</span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 ${
              confirmingDelete
                ? "bg-red-600/30 border-red-500/60 text-red-300 animate-pulse"
                : "bg-red-500/5 hover:bg-red-500/15 text-red-400/60 hover:text-red-400 border-red-500/10 hover:border-red-500/30"
            }`}
          >
            <Trash weight={confirmingDelete ? "fill" : "bold"} className="w-3.5 h-3.5" />
            {isDeleting ? "Deleting..." : confirmingDelete ? "Confirm Delete?" : "Delete"}
          </button>
        </div>
      </div>

      {/* ID Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-[#131920]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#FF9900] to-transparent opacity-80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF9900]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="p-10 flex flex-col md:flex-row gap-12 items-center md:items-start relative z-10">
          {/* QR Module */}
          <div className="shrink-0 flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF9900]/50 to-amber-300/30 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
              {qrDataUrl ? (
                <div className="relative bg-white p-3 rounded-2xl shadow-2xl border-[4px] border-white/10 hover:scale-105 transition-transform duration-300">
                  <img src={qrDataUrl} alt="QR Code" width={180} height={180} className="w-[180px] h-[180px]" />
                </div>
              ) : (
                <div className="w-[204px] h-[204px] bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-white/20 animate-pulse" />
                </div>
              )}
            </div>
            <Link href={`/ticket/${participant.participantId}`} target="_blank"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 hover:bg-[#FF9900]/20 transition-all w-full justify-center text-xs tracking-widest uppercase">
              <ArrowSquareOut weight="bold" className="w-4 h-4" /> Live Pass
            </Link>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 text-center md:text-left pt-2">
            <p className="font-mono text-white/40 bg-white/5 inline-flex px-3 py-1.5 rounded-lg text-xs font-bold tracking-[0.2em] mb-4 border border-white/10">
              <IdentificationCard className="w-4 h-4 mr-2 inline" weight="fill" />
              {participant.participantId}
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 tracking-tight mb-8">
              {participant.name}
            </h1>

            <div className="space-y-3 max-w-sm">
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <EnvelopeSimple weight="fill" className="w-4 h-4 text-white/60" />
                </div>
                <span className="text-white/80 font-medium truncate text-sm">{participant.email}</span>
              </div>

              {participant.mobile && (
                <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF9900]/10 flex items-center justify-center shrink-0">
                    <Phone weight="fill" className="w-4 h-4 text-[#FF9900]/80" />
                  </div>
                  <span className="text-white/80 font-mono text-sm">{participant.mobile}</span>
                </div>
              )}

              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-[#FF9900]/10 flex items-center justify-center shrink-0">
                  <MapPin weight="fill" className="w-4 h-4 text-[#FF9900]/80" />
                </div>
                <span className="text-white/80 font-medium truncate text-sm">{participant.college}</span>
              </div>
            </div>

            {/* Current Verification Badge */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-8">
              <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.glow}`}>
                {statusCfg.icon}
                <span className={`text-xs font-black uppercase tracking-widest ${statusCfg.color}`}>{statusCfg.label}</span>
              </div>
              {participant.verifiedBy && (
                <span className="text-white/30 text-xs">by {participant.verifiedBy}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Verification Control */}
      <div className="bg-[#131920]/80 border border-white/5 rounded-[2rem] p-8 shadow-xl">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#FF9900]" weight="fill" />
          Verification Control
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleVerificationUpdate("verified")}
            disabled={!!updating || participant.verificationStatus === "verified"}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
              participant.verificationStatus === "verified"
                ? "bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                : "bg-green-500/5 border-green-500/20 text-green-400/70 hover:bg-green-500/15 hover:border-green-500/40"
            }`}
          >
            <CheckCircle weight={participant.verificationStatus === "verified" ? "fill" : "duotone"} className="w-7 h-7" />
            <span className="text-sm uppercase tracking-widest">Verify</span>
            {participant.verificationStatus === "verified" && <span className="text-[10px] opacity-60">Current Status</span>}
          </button>

          <button
            onClick={() => handleVerificationUpdate("pending")}
            disabled={!!updating || participant.verificationStatus === "pending"}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
              participant.verificationStatus === "pending"
                ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                : "bg-amber-500/5 border-amber-500/20 text-amber-400/70 hover:bg-amber-500/15 hover:border-amber-500/40"
            }`}
          >
            <Clock weight={participant.verificationStatus === "pending" ? "fill" : "duotone"} className="w-7 h-7" />
            <span className="text-sm uppercase tracking-widest">Set Pending</span>
            {participant.verificationStatus === "pending" && <span className="text-[10px] opacity-60">Current Status</span>}
          </button>

          <button
            onClick={() => handleVerificationUpdate("rejected")}
            disabled={!!updating || participant.verificationStatus === "rejected"}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
              participant.verificationStatus === "rejected"
                ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                : "bg-red-500/5 border-red-500/20 text-red-400/70 hover:bg-red-500/15 hover:border-red-500/40"
            }`}
          >
            <XCircle weight={participant.verificationStatus === "rejected" ? "fill" : "duotone"} className="w-7 h-7" />
            <span className="text-sm uppercase tracking-widest">Reject</span>
            {participant.verificationStatus === "rejected" && <span className="text-[10px] opacity-60">Current Status</span>}
          </button>
        </div>
      </div>

      {/* Event-Day Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Label className={`flex flex-col p-8 rounded-[2rem] cursor-pointer transition-all duration-300 relative overflow-hidden border-2 ${
          participant.present ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20" : "bg-[#131920]/80 border-white/5 hover:border-white/10 backdrop-blur-xl"
        } ${updating === "present" ? "opacity-50 pointer-events-none" : ""}`}>
          {participant.present && <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 shadow-[0_0_20px_rgba(74,222,128,0.8)]" />}
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${participant.present ? "bg-green-500 text-black" : "bg-white/5 text-white/30"}`}>
              {participant.present ? <CheckCircle weight="bold" className="w-8 h-8" /> : <XCircle weight="duotone" className="w-8 h-8" />}
            </div>
            <div className="relative shrink-0">
              <input type="checkbox" checked={participant.present} disabled={!!updating} onChange={(e) => handleToggle("present", e.target.checked)} className="sr-only" />
              <div className={`w-16 h-8 rounded-full transition-colors duration-300 border-2 ${participant.present ? "bg-green-500 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]" : "bg-black/50 border-white/10"}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${participant.present ? "left-[34px]" : "left-1"}`} />
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Venue Entry</h3>
          <p className="text-white/40 text-sm font-medium leading-relaxed">
            {participant.present ? "Participant is inside the event perimeter." : "Authorize entry for this delegate."}
          </p>
        </Label>

        <Label className={`flex flex-col p-8 rounded-[2rem] cursor-pointer transition-all duration-300 relative overflow-hidden border-2 ${
          participant.food ? "bg-[#FF9900]/10 border-[#FF9900]/30 hover:bg-[#FF9900]/20" : "bg-[#131920]/80 border-white/5 hover:border-white/10 backdrop-blur-xl"
        } ${updating === "food" ? "opacity-50 pointer-events-none" : ""}`}>
          {participant.food && <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF9900] shadow-[0_0_20px_rgba(255,153,0,0.8)]" />}
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${participant.food ? "bg-[#FF9900] text-black" : "bg-white/5 text-white/30"}`}>
              {participant.food ? <CheckCircle weight="bold" className="w-8 h-8" /> : <XCircle weight="duotone" className="w-8 h-8" />}
            </div>
            <div className="relative shrink-0">
              <input type="checkbox" checked={participant.food} disabled={!!updating} onChange={(e) => handleToggle("food", e.target.checked)} className="sr-only" />
              <div className={`w-16 h-8 rounded-full transition-colors duration-300 border-2 ${participant.food ? "bg-[#FF9900] border-amber-400 shadow-[0_0_15px_rgba(255,153,0,0.4)]" : "bg-black/50 border-white/10"}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${participant.food ? "left-[34px]" : "left-1"}`} />
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Meal Status</h3>
          <p className="text-white/40 text-sm font-medium leading-relaxed">
            {participant.food ? "Meal protocol complete. Delegate has received food allocation." : "Issue meal rights to this delegate."}
          </p>
        </Label>
      </div>
    </div>
  )
}
