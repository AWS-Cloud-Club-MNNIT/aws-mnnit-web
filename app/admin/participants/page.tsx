"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import Link from "next/link";
import QRCode from "qrcode";
import JSZip from "jszip";
import {
  UploadSimple,
  MagnifyingGlass,
  QrCode,
  DownloadSimple,
  CheckCircle,
  XCircle,
  ArrowSquareOut,
  Users,
} from "@phosphor-icons/react";

interface Participant {
  _id: string;
  participantId: string;
  name: string;
  email: string;
  college: string;
  present: boolean;
  food: boolean;
}

export default function ParticipantsAdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingZip, setGeneratingZip] = useState(false);
  const [generatingPrint, setGeneratingPrint] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchParticipants = async () => {
    try {
      const res = await fetch("/api/participants");
      const data = await res.json();
      if (res.ok) {
        setParticipants(data.participants);
      } else {
        toast.error("Failed to load participants");
      }
    } catch {
      toast.error("An error occurred while loading participants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const processCSV = () => {
    if (!file) return;
    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const mapped = (results.data as any[])
          .map((row) => ({
            name: row["Candidate's Name"] || row["name"] || row["Name"] || "",
            email: row["Candidate's Email"] || row["email"] || row["Email"] || "",
            college:
              row["Candidate's Organisation"] ||
              row["college"] ||
              row["College"] ||
              row["Institution"] ||
              "",
          }))
          .filter((p) => p.name && p.email);

        if (mapped.length === 0) {
          toast.error("No valid rows found in CSV");
          setUploading(false);
          return;
        }

        try {
          const res = await fetch("/api/participants/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ participants: mapped }),
          });
          const data = await res.json();
          if (res.ok) {
            const skippedMsg = data.skipped > 0 ? ` (${data.skipped} duplicate(s) skipped)` : "";
            toast.success(`✅ ${data.count} participant(s) uploaded${skippedMsg}`);
            fetchParticipants();
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          } else {
            toast.error(data.error || "Upload failed");
          }
        } catch {
          toast.error("Network error during upload");
        } finally {
          setUploading(false);
        }
      },
      error: () => {
        toast.error("Failed to parse CSV file");
        setUploading(false);
      },
    });
  };

  const downloadZip = async () => {
    if (participants.length === 0) return;
    setGeneratingZip(true);
    toast.info("Generating ZIP… this may take a moment.");

    try {
      const zip = new JSZip();
      const origin = window.location.origin;

      for (const p of participants) {
        const url = `${origin}/ticket/${p.participantId}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
        // Strip data URL prefix to get raw base64
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
        const safeName = p.name.replace(/[^a-z0-9]/gi, "_");
        zip.file(`${p.participantId}_${safeName}.png`, base64, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aws-scd-2026-qrcodes.zip";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("ZIP downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate ZIP");
    } finally {
      setGeneratingZip(false);
    }
  };

  const printQRCodes = async () => {
    if (participants.length === 0) return;
    setGeneratingPrint(true);
    toast.info("Preparing print view…");

    const origin = window.location.origin;
    let html = `<html><head><title>QR Codes — AWS SCD 2026</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; background: #fff; display: flex; flex-wrap: wrap; gap: 16px; padding: 24px; }
  .card { border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center; width: 200px; page-break-inside: avoid; }
  .card img { display: block; margin: 0 auto 8px; }
  .id { font-family: monospace; font-size: 11px; color: #6b7280; margin-bottom: 4px; }
  .name { font-size: 13px; font-weight: 700; color: #111827; }
  .college { font-size: 10px; color: #9ca3af; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style></head><body>`;

    for (const p of participants) {
      const url = `${origin}/ticket/${p.participantId}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 180, margin: 1 });
      html += `<div class="card">
        <img src="${dataUrl}" width="160" height="160" alt="QR ${p.participantId}" />
        <p class="id">${p.participantId}</p>
        <p class="name">${p.name}</p>
        <p class="college">${p.college}</p>
      </div>`;
    }

    html += "</body></html>";

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
    setGeneratingPrint(false);
  };

  const filtered = participants.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.participantId?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.college?.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = participants.filter((p) => p.present).length;
  const foodCount = participants.filter((p) => p.food).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Participants</h1>
          <p className="text-white/40 mt-1 text-sm">Manage SCD 2026 attendees and QR codes</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={downloadZip}
            disabled={generatingZip || participants.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0073BB]/15 border border-[#0073BB]/30 text-[#0073BB] hover:bg-[#0073BB]/25 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-sm"
          >
            <DownloadSimple weight="bold" className="w-4 h-4" />
            {generatingZip ? "Generating…" : "Download ZIP"}
          </button>
          <button
            onClick={printQRCodes}
            disabled={generatingPrint || participants.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF9900]/15 border border-[#FF9900]/30 text-[#FF9900] hover:bg-[#FF9900]/25 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-sm"
          >
            <QrCode weight="bold" className="w-4 h-4" />
            {generatingPrint ? "Preparing…" : "Print QR Codes"}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: participants.length, color: "text-white", bg: "border-white/10" },
          { label: "Present", value: presentCount, color: "text-green-400", bg: "border-green-500/20" },
          { label: "Absent", value: participants.length - presentCount, color: "text-red-400", bg: "border-red-500/20" },
          { label: "Food Taken", value: foodCount, color: "text-emerald-400", bg: "border-emerald-500/20" },
        ].map((s) => (
          <div key={s.label} className={`bg-[#1A222D] border ${s.bg} rounded-2xl p-5`}>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>
              {loading ? <span className="animate-pulse opacity-30">—</span> : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* CSV Upload */}
      <div className="bg-[#1A222D] border border-white/5 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <UploadSimple weight="bold" className="text-[#FF9900] w-5 h-5" /> Upload CSV
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
              Select CSV File
            </label>
            <input
              id="csv-upload"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full border border-white/10 bg-[#0F1115] text-white/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF9900]/50 transition file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#FF9900]/10 file:text-[#FF9900] file:text-xs file:font-semibold hover:file:bg-[#FF9900]/20 cursor-pointer"
            />
            {file && (
              <p className="text-xs text-white/30 mt-1.5">
                Selected: <span className="text-white/60">{file.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={processCSV}
            disabled={!file || uploading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF9900] hover:bg-[#FF9900]/85 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm transition shrink-0"
          >
            <UploadSimple weight="bold" className="w-4 h-4" />
            {uploading ? "Uploading…" : "Process & Upload"}
          </button>
        </div>
        <p className="text-white/25 text-xs mt-3">
          Expected columns: <span className="font-mono">Candidate&apos;s Name</span>,{" "}
          <span className="font-mono">Candidate&apos;s Email</span>,{" "}
          <span className="font-mono">Candidate&apos;s Organisation</span> (or{" "}
          <span className="font-mono">name / email / college</span>)
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass
          weight="bold"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by name, ID, email, or college…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1A222D] border border-white/5 text-white placeholder:text-white/25 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF9900]/40 transition"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1A222D] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-white/40 text-xs font-semibold uppercase tracking-widest">
                <th className="px-6 py-4 text-left">Participant ID</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left hidden md:table-cell">College</th>
                <th className="px-6 py-4 text-center">Present</th>
                <th className="px-6 py-4 text-center">Food</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-white/30">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>
                      {search ? "No participants match your search." : "No participants yet. Upload a CSV to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-[#FF9900] font-semibold text-xs">
                      {p.participantId}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                    <td className="px-6 py-4 text-white/40 hidden md:table-cell max-w-xs truncate">
                      {p.college}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.present ? (
                        <CheckCircle weight="fill" className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <XCircle weight="fill" className="w-5 h-5 text-white/15 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.food ? (
                        <CheckCircle weight="fill" className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle weight="fill" className="w-5 h-5 text-white/15 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/user/${p.participantId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 transition text-xs font-semibold"
                      >
                        Manage
                        <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-white/5 text-white/25 text-xs">
            Showing {filtered.length} of {participants.length} participant(s)
          </div>
        )}
      </div>
    </div>
  );
}
