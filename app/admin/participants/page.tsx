"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import Link from "next/link"
import {
  MagnifyingGlass,
  ArrowSquareOut,
  UploadSimple,
  DownloadSimple,
  QrCode,
  UsersThree,
  CheckCircle,
  XCircle,
  CaretRight,
  UserFocus
} from "@phosphor-icons/react"
import Papa from "papaparse"
import JSZip from "jszip"
import QRCode from "qrcode"

interface Participant {
  _id: string
  participantId: string
  name: string
  email: string
  college: string
  present: boolean
  food: boolean
}

export default function ParticipantsPage() {
  const [query, setQuery] = useState("")
  const [allParticipants, setAllParticipants] = useState<Participant[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [generatingQR, setGeneratingQR] = useState(false)

  useEffect(() => {
    fetchParticipants()
  }, [])

  useEffect(() => {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/participants/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: results.data }),
          })
          const responseData = await res.json()
          if (!res.ok) throw new Error(responseData.error)
          
          toast.success(`Successfully added ${responseData.insertedCount} delegates!`)
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

  const handleGenerateQRs = async () => {
    setGeneratingQR(true)
    toast.loading("Generating High-Res QRs...")
    try {
      const zip = new JSZip()
      for (const p of allParticipants) {
        const url = `${window.location.origin}/ticket/${p.participantId}`
        const dataUrl = await QRCode.toDataURL(url, {
          width: 512,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        })
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "")
        zip.file(`${p.participantId}_${p.name.replace(/[^a-z0-9]/gi, "_")}.png`, base64Data, { base64: true })
      }
      const content = await zip.generateAsync({ type: "blob" })
      const downloadUrl = window.URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = "AWS_SCD_2026_QRCodes.zip"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.dismiss()
      toast.success("QR Archive Downloaded successfully!")
    } catch {
      toast.dismiss()
      toast.error("Failed to generate QR archive")
    } finally {
      setGeneratingQR(false)
    }
  }

  const handleExportCSV = () => {
    const csv = Papa.unparse(allParticipants)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "aws_scd_2026_participants.csv"
    link.click()
  }

  const presences = allParticipants.filter(p => p.present).length

  return (
    <div className="space-y-6">
      
      {/* 
        Stats & Header Actions 
      */}
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

        {/* Global Toolbar Actions */}
        <div className="flex gap-3 w-full xl:w-auto overflow-x-auto pb-4 xl:pb-0 hide-scrollbar">
           <label className={`cursor-pointer shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              {uploading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <UploadSimple weight="bold" className="w-5 h-5" />
              )}
              {uploading ? "Importing Data..." : "Upload CSV"}
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={uploading} />
           </label>
           
           <button 
             onClick={handleGenerateQRs}
             disabled={generatingQR || allParticipants.length === 0}
             className="shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(255,153,0,0.2)] hover:shadow-[0_0_30px_rgba(255,153,0,0.4)] hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none"
           >
             <QrCode weight="bold" className="w-5 h-5" />
             {generatingQR ? "Zipping Codes..." : "Export QRs (ZIP)"}
           </button>

           <button 
             onClick={handleExportCSV}
             disabled={allParticipants.length === 0}
             className="shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm tracking-wide transition-all hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none"
           >
             <DownloadSimple weight="bold" className="w-5 h-5 text-white/60" />
             Raw Data
           </button>
        </div>
      </div>

      {/* Database View Core */}
      <div className="bg-[#131920]/80 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9900]/0 via-[#FF9900] to-[#FF9900]/0 opacity-30" />
        
        {/* Filtering & Search Header */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-black/20">
          <div className="relative w-full md:max-w-md group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MagnifyingGlass weight="bold" className="w-5 h-5 text-[#FF9900]/50 group-focus-within:text-[#FF9900] transition-colors" />
            </div>
            <input
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
            <h3 className="text-xl font-bold text-white mb-2">Registry is Empty</h3>
            <p className="text-white/40 max-w-sm mx-auto">Either no match was found for your search, or you haven't imported the CSV manifest yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/40">
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Delegate Info</th>
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase hidden sm:table-cell">Contact</th>
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase hidden md:table-cell">Institution</th>
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Status</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {participants.map((p, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index < 15 ? index * 0.03 : 0 }}
                      key={p._id} 
                      className="group hover:bg-[#FF9900]/[0.02] transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/admin/user/${p.participantId}`}
                    >
                      {/* Name & ID */}
                      <td className="px-6 py-5 align-middle">
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
                      </td>
                      
                      {/* Contact */}
                      <td className="px-6 py-5 align-middle hidden sm:table-cell">
                        <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">
                          {p.email}
                        </span>
                      </td>

                      {/* College */}
                      <td className="px-6 py-5 align-middle hidden md:table-cell">
                        <span className="inline-block max-w-[200px] lg:max-w-xs truncate text-sm font-medium text-white/50">
                          {p.college}
                        </span>
                      </td>

                      {/* Status Badges */}
                      <td className="px-6 py-5 align-middle">
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
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 align-middle text-right">
                        <Link 
                          href={`/admin/user/${p.participantId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold text-[10px] uppercase tracking-widest border border-white/10 transition-all hover:scale-105"
                        >
                          Manage <CaretRight weight="bold" className="w-3 h-3" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
