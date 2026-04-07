"use client"

import { useEffect, useState, use } from "react"
import { toast } from "sonner"
import Link from "next/link"
import QRCode from "qrcode"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CaretLeft,
  CheckCircle,
  XCircle,
  QrCode,
  MapPin,
  EnvelopeSimple,
  IdentificationCard,
  ArrowSquareOut,
  Fingerprint
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

export default function UserUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState("")

  useEffect(() => {
    fetchParticipant()
  }, [id])

  const fetchParticipant = async () => {
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
  }

  const generateQR = async (participantId: string) => {
    try {
      const url = `${window.location.origin}/ticket/${participantId}`
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      })
      setQrDataUrl(dataUrl)
    } catch {
      console.error("QR generation failed")
    }
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
      if (!res.ok) {
        toast.error(data.error || "Failed to update")
        setParticipant(previous)
      } else {
        toast.success(`Action Authorized: ${field === "present" ? "Attendance" : "Meals"} updated`)
      }
    } catch {
      toast.error("Network error during update")
      setParticipant(previous)
    } finally {
      setUpdating(null)
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
      <div className="max-w-2xl mx-auto text-center py-32 bg-[#131920]/80 backdrop-blur-3xl border border-white/5 rounded-3xl mt-12 shadow-2xl">
        <XCircle weight="duotone" className="w-24 h-24 text-red-500/30 mx-auto mb-6 drop-shadow-lg" />
        <h2 className="text-3xl font-black text-white mb-3">Identity Not Found</h2>
        <p className="text-white/40 mb-8 max-w-sm mx-auto text-lg leading-relaxed">No matching delegate record exists for biometric ID: <br/><span className="font-mono text-[#FF9900] font-bold mt-2 inline-block bg-[#FF9900]/10 px-4 py-2 rounded-lg">{id}</span></p>
        <Link href="/admin/participants" className="inline-flex items-center justify-center bg-white text-black font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105">
          Return to Registry
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/participants"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition font-bold text-xs uppercase tracking-widest group"
        >
          <CaretLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" weight="bold" />
          Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Fingerprint className="w-5 h-5 text-[#FF9900]/50" weight="duotone" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF9900]">Secure Ops</span>
        </div>
      </div>

      {/* Cyberpunk ID Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-[#131920]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#FF9900] to-transparent opacity-80" />
        
        {/* Glow Effects inside card */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF9900]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="p-10 flex flex-col md:flex-row gap-12 items-center md:items-start relative z-10">
          
          {/* Enhanced QR Module */}
          <div className="shrink-0 flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF9900]/50 to-amber-300/30 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
              {qrDataUrl ? (
                <div className="relative bg-white p-3 rounded-2xl shadow-2xl border-[4px] border-white/10 hover:scale-105 transition-transform duration-300">
                  <img src={qrDataUrl} alt="QR Code" width={180} height={180} className="w-[180px] h-[180px]" />
                </div>
              ) : (
                <div className="w-[204px] h-[204px] bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center backdrop-blur-md">
                  <QrCode className="w-12 h-12 text-white/20 animate-pulse" />
                </div>
              )}
            </div>
            
            <Link
              href={`/ticket/${participant.participantId}`}
              target="_blank"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20 hover:bg-[#FF9900]/20 transition-all w-full justify-center shadow-lg text-xs tracking-widest uppercase"
            >
              <ArrowSquareOut weight="bold" className="w-4 h-4" /> Live Pass
            </Link>
          </div>

          {/* User Details Box */}
          <div className="flex-1 min-w-0 text-center md:text-left pt-2">
            <p className="font-mono text-white/40 bg-white/5 inline-flex px-3 py-1.5 rounded-lg text-xs font-bold tracking-[0.2em] mb-4 border border-white/10">
              <IdentificationCard className="w-4 h-4 mr-2 inline" weight="fill" />
              {participant.participantId}
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 tracking-tight mb-8 drop-shadow-sm">
              {participant.name}
            </h1>

            <div className="space-y-4 max-w-sm">
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <EnvelopeSimple weight="fill" className="w-4 h-4 text-white/60" />
                </div>
                <span className="text-white/80 font-medium truncate">{participant.email}</span>
              </div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-[#FF9900]/10 flex items-center justify-center shrink-0">
                  <MapPin weight="fill" className="w-4 h-4 text-[#FF9900]/80" />
                </div>
                <span className="text-white/80 font-medium truncate">{participant.college}</span>
              </div>
            </div>
            
            {/* Contextual Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-8">
               <div className="px-4 py-1.5 bg-[#FF9900]/10 border border-[#FF9900]/20 rounded-full flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#FF9900] animate-pulse shadow-[0_0_8px_rgba(255,153,0,0.8)]" />
                 <span className="text-[10px] font-bold text-[#FF9900] uppercase tracking-widest">SCD '26 Ticket Active</span>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Present Toggle Button Component */}
        <Label
          className={`flex flex-col p-8 rounded-[2rem] cursor-pointer transition-all duration-300 relative overflow-hidden group border-2 ${
            participant.present
              ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
              : "bg-[#131920]/80 border-white/5 hover:border-white/10 backdrop-blur-xl"
          } ${updating === "present" ? "opacity-50 pointer-events-none" : ""}`}
        >
          {participant.present && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 shadow-[0_0_20px_rgba(74,222,128,0.8)]" />
          )}

          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
              participant.present ? "bg-green-500 text-black" : "bg-white/5 text-white/30"
            }`}>
              {participant.present ? <CheckCircle weight="bold" className="w-8 h-8" /> : <XCircle weight="duotone" className="w-8 h-8" />}
            </div>
            {/* Modern switch visual */}
            <div className="relative shrink-0">
              <input
                type="checkbox"
                checked={participant.present}
                disabled={!!updating}
                onChange={(e) => handleToggle("present", e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-16 h-8 rounded-full transition-colors duration-300 border-2 ${
                participant.present ? "bg-green-500 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]" : "bg-black/50 border-white/10"
              }`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                  participant.present ? "left-[34px]" : "left-1"
                }`} />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-black text-white mb-2">Venue Entry</h3>
          <p className="text-white/40 text-sm font-medium leading-relaxed">
            {participant.present ? "Participant is inside the event perimeter. Toggle off to revoke access." : "Authorize entry for this delegate by activating this security protocol."}
          </p>
        </Label>

        {/* Food Toggle Button Component */}
        <Label
          className={`flex flex-col p-8 rounded-[2rem] cursor-pointer transition-all duration-300 relative overflow-hidden group border-2 ${
            participant.food
              ? "bg-[#FF9900]/10 border-[#FF9900]/30 hover:bg-[#FF9900]/20"
              : "bg-[#131920]/80 border-white/5 hover:border-white/10 backdrop-blur-xl"
          } ${updating === "food" ? "opacity-50 pointer-events-none" : ""}`}
        >
          {participant.food && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF9900] shadow-[0_0_20px_rgba(255,153,0,0.8)]" />
          )}

          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
              participant.food ? "bg-[#FF9900] text-black" : "bg-white/5 text-white/30"
            }`}>
              {participant.food ? <CheckCircle weight="bold" className="w-8 h-8" /> : <XCircle weight="duotone" className="w-8 h-8" />}
            </div>
            {/* Modern switch visual */}
            <div className="relative shrink-0">
              <input
                type="checkbox"
                checked={participant.food}
                disabled={!!updating}
                onChange={(e) => handleToggle("food", e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-16 h-8 rounded-full transition-colors duration-300 border-2 ${
                participant.food ? "bg-[#FF9900] border-amber-400 shadow-[0_0_15px_rgba(255,153,0,0.4)]" : "bg-black/50 border-white/10"
              }`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                  participant.food ? "left-[34px]" : "left-1"
                }`} />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-black text-white mb-2">Meal Status</h3>
          <p className="text-white/40 text-sm font-medium leading-relaxed">
            {participant.food ? "Meal protocol complete. Delegate has received their food allocation." : "Issue meal rights to this delegate. Toggle to confirm physical distribution."}
          </p>
        </Label>
      </div>
    </div>
  )
}
