"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  MagnifyingGlass,
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

export default function ManagerParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Delegates</h1>
          <p className="text-white/40 mt-1 text-sm">Scan passes or search manually to check people in.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: participants.length, color: "text-white", bg: "border-white/10" },
          { label: "Present", value: presentCount, color: "text-green-400", bg: "border-green-500/20" },
          { label: "Absent", value: participants.length - presentCount, color: "text-red-400", bg: "border-red-500/20" },
          { label: "Food Taken", value: foodCount, color: "text-[#FF9900]", bg: "border-[#FF9900]/20" },
        ].map((s) => (
          <div key={s.label} className={`bg-[#1A222D] border ${s.bg} rounded-2xl p-5`}>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>
              {loading ? <span className="animate-pulse opacity-30">—</span> : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass
          weight="bold"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search manually by name, ID, email, or college…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1A222D] border border-white/5 text-white placeholder:text-white/25 rounded-xl pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-[#FF9900]/40 transition shadow-inner"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1A222D] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-white/40 text-xs font-semibold uppercase tracking-widest bg-white/[0.02]">
                <th className="px-6 py-4 text-left">Delegate ID</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left hidden md:table-cell">College</th>
                <th className="px-6 py-4 text-center">Checked In</th>
                <th className="px-6 py-4 text-center">Meals</th>
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
                      {search ? "No delegates match your search." : "No delegates loaded in the system yet."}
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
                        <CheckCircle weight="fill" className="w-5 h-5 text-[#FF9900] mx-auto" />
                      ) : (
                        <XCircle weight="fill" className="w-5 h-5 text-white/15 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/manager/user/${p.participantId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF9900] text-black hover:bg-[#FF9900]/80 transition text-xs font-bold"
                      >
                        Check-In
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
          <div className="px-6 py-3 border-t border-white/5 text-white/25 text-xs bg-white/[0.01]">
            Showing {filtered.length} of {participants.length} delegate(s)
          </div>
        )}
      </div>
    </div>
  );
}
