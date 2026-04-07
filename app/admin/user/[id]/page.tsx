"use client";

import { useEffect, useState, use } from "react";
import { toast } from "sonner";
import Link from "next/link";
import QRCode from "qrcode";
import {
  CaretLeft,
  CheckCircle,
  XCircle,
  QrCode,
  DownloadSimple,
  MapPin,
  EnvelopeSimple,
  IdentificationCard,
  ArrowSquareOut,
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

export default function UserUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    fetchParticipant();
  }, [id]);

  const fetchParticipant = async () => {
    try {
      const res = await fetch(`/api/user/${id}`);
      const data = await res.json();
      if (res.ok) {
        setParticipant(data.participant);
        generateQR(data.participant.participantId);
      } else {
        toast.error("Failed to load participant");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async (participantId: string) => {
    try {
      const url = `${window.location.origin}/ticket/${participantId}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
    } catch {
      console.error("QR generation failed");
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl || !participant) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${participant.participantId}.png`;
    a.click();
  };

  const handleToggle = async (field: "present" | "food", value: boolean) => {
    if (!participant) return;
    const previous = { ...participant };
    const updated = { ...participant, [field]: value };
    setParticipant(updated);
    setUpdating(field);

    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ present: updated.present, food: updated.food }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update");
        setParticipant(previous);
      } else {
        toast.success(`${field === "present" ? "Attendance" : "Food"} updated`);
      }
    } catch {
      toast.error("Network error during update");
      setParticipant(previous);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-40 bg-white/5 rounded-lg" />
        <div className="h-64 bg-[#1A222D] rounded-2xl border border-white/5" />
        <div className="h-40 bg-[#1A222D] rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="text-center py-24">
        <XCircle weight="fill" className="w-16 h-16 text-red-500/40 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Participant Not Found</h2>
        <p className="text-white/40 mb-6">No record found for ID: <span className="font-mono text-[#FF9900]">{id}</span></p>
        <Link href="/admin/participants" className="text-[#FF9900] hover:underline text-sm font-semibold">
          ← Back to Participants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back nav */}
      <Link
        href="/admin/participants"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition text-sm font-medium group"
      >
        <CaretLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Participants
      </Link>

      {/* Profile card */}
      <div className="bg-[#1A222D] border border-white/5 rounded-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9900] via-amber-400 to-[#FF9900]/30" />

        <div className="p-8 flex flex-col sm:flex-row gap-8 items-start">
          {/* QR Code */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            {qrDataUrl ? (
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <img src={qrDataUrl} alt="QR Code" width={160} height={160} />
              </div>
            ) : (
              <div className="w-[184px] h-[184px] bg-white/5 rounded-2xl flex items-center justify-center">
                <QrCode className="w-10 h-10 text-white/20 animate-pulse" />
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={downloadQR}
                disabled={!qrDataUrl}
                title="Download QR"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 disabled:opacity-40 transition"
              >
                <DownloadSimple weight="bold" className="w-3.5 h-3.5" /> Download
              </button>
              <Link
                href={`/ticket/${participant.participantId}`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" /> View Ticket
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[#FF9900] text-xs font-bold tracking-widest mb-1">
              {participant.participantId}
            </p>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-4">
              {participant.name}
            </h1>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <EnvelopeSimple weight="fill" className="w-4 h-4 text-white/25 mt-0.5 shrink-0" />
                <span className="text-white/60 break-all">{participant.email}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin weight="fill" className="w-4 h-4 text-white/25 mt-0.5 shrink-0" />
                <span className="text-white/60">{participant.college}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <IdentificationCard weight="fill" className="w-4 h-4 text-white/25 mt-0.5 shrink-0" />
                <span className="text-white/60">Event Participant — SCD 2026</span>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex gap-2 mt-5 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  participant.present
                    ? "bg-green-500/15 text-green-400 border border-green-500/25"
                    : "bg-white/5 text-white/30 border border-white/10"
                }`}
              >
                {participant.present ? "✓ Checked In" : "Not Checked In"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  participant.food
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                    : "bg-white/5 text-white/30 border border-white/10"
                }`}
              >
                {participant.food ? "✓ Food Collected" : "Food Not Taken"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Update controls */}
      <div className="bg-[#1A222D] border border-white/5 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-5">Event Status Controls</h2>
        <div className="space-y-3">
          {/* Present toggle */}
          <label
            className={`flex items-center justify-between p-5 rounded-xl cursor-pointer transition-all border ${
              participant.present
                ? "bg-green-500/8 border-green-500/20"
                : "bg-white/[0.02] border-white/5 hover:border-white/10"
            } ${updating === "present" ? "opacity-60 pointer-events-none" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  participant.present ? "bg-green-500/20" : "bg-white/5"
                }`}
              >
                {participant.present ? (
                  <CheckCircle weight="fill" className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle weight="fill" className="w-5 h-5 text-white/20" />
                )}
              </div>
              <div>
                <p className="text-white font-semibold">Mark as Present</p>
                <p className="text-white/30 text-xs mt-0.5">
                  {participant.present ? "Participant is checked in" : "Participant has not checked in yet"}
                </p>
              </div>
            </div>
            <div className="relative shrink-0">
              <input
                type="checkbox"
                checked={participant.present}
                disabled={!!updating}
                onChange={(e) => handleToggle("present", e.target.checked)}
                className="sr-only peer"
                id="toggle-present"
              />
              <div
                onClick={() => !updating && handleToggle("present", !participant.present)}
                className={`w-12 h-6 rounded-full transition-all duration-300 cursor-pointer relative ${
                  participant.present ? "bg-green-500" : "bg-white/10"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                    participant.present ? "left-7" : "left-1"
                  }`}
                />
              </div>
            </div>
          </label>

          {/* Food toggle */}
          <label
            className={`flex items-center justify-between p-5 rounded-xl cursor-pointer transition-all border ${
              participant.food
                ? "bg-emerald-500/8 border-emerald-500/20"
                : "bg-white/[0.02] border-white/5 hover:border-white/10"
            } ${updating === "food" ? "opacity-60 pointer-events-none" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  participant.food ? "bg-emerald-500/20" : "bg-white/5"
                }`}
              >
                {participant.food ? (
                  <CheckCircle weight="fill" className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle weight="fill" className="w-5 h-5 text-white/20" />
                )}
              </div>
              <div>
                <p className="text-white font-semibold">Food Collected</p>
                <p className="text-white/30 text-xs mt-0.5">
                  {participant.food ? "Meal has been collected" : "Meal has not been collected yet"}
                </p>
              </div>
            </div>
            <div className="relative shrink-0">
              <div
                onClick={() => !updating && handleToggle("food", !participant.food)}
                className={`w-12 h-6 rounded-full transition-all duration-300 cursor-pointer relative ${
                  participant.food ? "bg-emerald-500" : "bg-white/10"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                    participant.food ? "left-7" : "left-1"
                  }`}
                />
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
