"use client";

import { useEffect, useState, use, useRef } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import {
  CheckCircle, MapPin, EnvelopeSimple, CalendarBlank, Clock,
  IdentificationCard, ArrowRight, ShieldCheck, Lock, DownloadSimple, Spinner
} from "@phosphor-icons/react";
import Image from "next/image";

// ─── Canvas helpers ──────────────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [participant, setParticipant] = useState<Record<string, string> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notVerified, setNotVerified] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  // kept for future use — not used by canvas renderer
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const res = await fetch(`/api/user/${id}`);
        const data = await res.json();
        if (res.status === 403) {
          setNotVerified(true);
        } else if (res.ok) {
          setParticipant(data.participant);
          setIsAdmin(!!data.isAdmin);
          setIsManager(!!data.isManager);
          generateQRCode(data.participant.participantId);
        }
      } catch {
        console.error("Error fetching participant");
      } finally {
        setLoading(false);
      }
    };
    fetchParticipant();
  }, [id]);

  const generateQRCode = async (participantId: string) => {
    try {
      const url = `${window.location.origin}/ticket/${participantId}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 320, margin: 1, color: { dark: "#000000", light: "#ffffff" }
      });
      setQrCodeDataUrl(dataUrl);
    } catch { console.error("Error generating QR"); }
  };

  const handleDownload = async () => {
    if (!participant || !qrCodeDataUrl) return;
    setDownloading(true);
    try {
      const DPR = 2;
      const W = 900, H = 500;
      const SPLIT = 578;

      const canvas = document.createElement("canvas");
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(DPR, DPR);

      // ── Card background ──────────────────────────────────────────────────
      roundRect(ctx, 0, 0, W, H, 32);
      ctx.fillStyle = "#1A222D";
      ctx.fill();

      // ── Top amber bar ────────────────────────────────────────────────────
      const barGrad = ctx.createLinearGradient(0, 0, W, 0);
      barGrad.addColorStop(0,   "#FF9900");
      barGrad.addColorStop(0.5, "#FFB84D");
      barGrad.addColorStop(1,   "rgba(255,153,0,0.15)");
      ctx.fillStyle = barGrad;
      ctx.fillRect(0, 0, W, 5);

      // ── Divider ──────────────────────────────────────────────────────────
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(SPLIT, 20);
      ctx.lineTo(SPLIT, H - 20);
      ctx.stroke();

      // ═══════════════════ LEFT SECTION ════════════════════════════════════
      const LX = 48;

      // "AWS CLOUD CLUB" label
      ctx.fillStyle = "#FF9900";
      ctx.font = "bold 10px Arial";
      ctx.fillText("AWS CLOUD CLUB", LX, 52);

      // Event title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 22px Arial";
      ctx.fillText("Student Community Day 2026", LX, 78);

      // Verified badge
      ctx.fillStyle = "rgba(74,222,128,0.12)";
      roundRect(ctx, LX, 96, 200, 30, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(74,222,128,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#4ADE80";
      ctx.font = "bold 10px Arial";
      ctx.fillText("✓  VERIFIED ATTENDEE", LX + 14, 116);

      // "DELEGATE" micro-label
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "600 9px Arial";
      ctx.fillText("DELEGATE", LX, 162);

      // Participant name – amber gradient
      const nameGrad = ctx.createLinearGradient(LX, 168, LX + 440, 215);
      nameGrad.addColorStop(0, "#FF9900");
      nameGrad.addColorStop(1, "#FFF3D0");
      ctx.fillStyle = nameGrad;
      ctx.font = "bold 38px Arial";
      const safeName = truncate(ctx, participant.name || "Participant", SPLIT - LX - 20);
      ctx.fillText(safeName, LX, 208);

      // Thin separator
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(LX, 222);
      ctx.lineTo(SPLIT - 20, 222);
      ctx.stroke();

      // Participant ID
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "13px 'Courier New'";
      ctx.fillText("ID:", LX, 242);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px 'Courier New'";
      ctx.fillText(participant.participantId, LX + 30, 242);

      // Info grid (2×2)
      const infoItems = [
        { label: "EMAIL",   value: participant.email   || "" },
        { label: "COLLEGE", value: participant.college || "" },
        { label: "DATE",    value: "11th April, 2026"         },
        { label: "TIME",    value: "8:00 AM – 7:00 PM"        },
      ];
      const COL_W = 255;
      infoItems.forEach((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const gx = LX + col * COL_W;
        const gy = 278 + row * 68;

        // Circle icon
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.beginPath(); ctx.arc(gx + 14, gy + 8, 13, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.font = "600 9px Arial";
        ctx.fillText(item.label, gx + 33, gy + 3);

        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.font = "500 12px Arial";
        ctx.fillText(truncate(ctx, item.value, COL_W - 40), gx + 33, gy + 20);
      });

      // ═══════════════════ RIGHT SECTION ═══════════════════════════════════
      const RX = SPLIT;
      const RW = W - RX;

      // Right bg tint
      ctx.fillStyle = "rgba(10,12,16,0.45)";
      ctx.fillRect(RX, 0, RW, H);

      // "SCAN AT REGISTRATION" label
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "bold 9px Arial";
      ctx.textAlign = "center";
      ctx.fillText("SCAN AT REGISTRATION", RX + RW / 2, 46);

      // QR code image
      await new Promise<void>((resolve) => {
        const qrImg = new window.Image();
        qrImg.onload = () => {
          const qrSize = 186;
          const qrX = RX + (RW - qrSize) / 2;
          const qrY = 58;
          // White card around QR
          ctx.fillStyle = "#FFFFFF";
          roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 18);
          ctx.fill();
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          resolve();
        };
        qrImg.onerror = () => resolve();
        qrImg.src = qrCodeDataUrl;
      });

      // Verified status pill
      roundRect(ctx, RX + 18, H - 96, RW - 36, 40, 12);
      ctx.fillStyle = "rgba(74,222,128,0.10)";
      ctx.fill();
      ctx.strokeStyle = "rgba(74,222,128,0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#4ADE80";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("✓  Registration Verified", RX + RW / 2, H - 70);

      // Reset
      ctx.textAlign = "left";

      // ── Trigger download ─────────────────────────────────────────────────
      const link = document.createElement("a");
      link.download = `ticket-${participant.participantId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070A]">
        <div className="animate-pulse w-20 h-20 bg-[#FF9900]/20 rounded-full flex items-center justify-center">
          <div className="w-10 h-10 bg-[#FF9900] rounded-full animate-ping"></div>
        </div>
      </div>
    );
  }

  // Ticket not verified state
  if (notVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070A] p-6">
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="bg-[#1A222D] border border-amber-500/20 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl relative z-10">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <Lock weight="fill" className="w-9 h-9 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Ticket Not Available</h2>
          <p className="text-white/50 leading-relaxed mb-6">
            Your registration is under review. Your ticket will be accessible once it has been verified by our team.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
            <p className="text-amber-400 text-sm font-medium">
              If you believe this is an error, please contact the event organizers with your registration ID.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition border border-white/10">
            <ArrowRight weight="bold" className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070A] p-6">
        <div className="bg-[#1A222D] border border-white/10 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-500 text-3xl">✖</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Pass Not Found</h2>
          <p className="text-white/50 leading-relaxed">The event ID you provided is invalid or does not exist in our system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070A] p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[20%] left-[-10%] w-[800px] h-[800px] bg-[#FF9900]/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0073BB]/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Ticket Card — wrapped in ref for capture */}
      <div
        ref={ticketRef}
        className="w-full max-w-4xl bg-[#1A222D] rounded-[2rem] border border-white/10 shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden"
      >
        {/* Left: Attendee Info */}
        <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9900] via-amber-400 to-[#FF9900]/30" />

          <div className="flex items-center gap-3 mb-8">
            <IdentificationCard weight="duotone" className="w-8 h-8 text-[#FF9900]" />
            <div>
              <p className="text-[#FF9900] tracking-widest text-xs font-black uppercase">AWS Cloud Club</p>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none">Student Community Day 2026</h1>
            </div>
          </div>

          {/* Verified Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/15 border border-green-500/30 rounded-xl mb-6 shadow-[0_0_20px_rgba(74,222,128,0.15)]">
            <ShieldCheck weight="fill" className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-black text-xs uppercase tracking-widest">Verified Attendee</span>
          </div>

          <div className="mb-10">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Delegate</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FF9900] to-amber-200">
              {participant.name}
            </h2>
            <p className="font-mono text-white/50 text-sm mt-3 pt-3 border-t border-white/5 inline-block">
              ID: <span className="text-white font-bold">{participant.participantId}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <EnvelopeSimple weight="fill" className="w-4 h-4 text-white/60" />
              </div>
              <div className="min-w-0">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Email Contact</p>
                <p className="text-white/90 text-sm font-medium truncate" title={participant.email}>{participant.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <MapPin weight="fill" className="w-4 h-4 text-white/60" />
              </div>
              <div className="min-w-0">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Institute / College</p>
                <p className="text-white/90 text-sm font-medium truncate" title={participant.college}>{participant.college}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <CalendarBlank weight="fill" className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Date</p>
                <p className="text-white/90 text-sm font-medium">11th April, 2026</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <Clock weight="fill" className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Time</p>
                <p className="text-white/90 text-sm font-medium">8:00 AM – 7:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR & Status */}
        <div className="md:w-[320px] flex flex-col p-8 md:p-10 shrink-0 bg-[#0F1115]/50 relative">

          <div className="flex-1 flex flex-col items-center justify-center mb-8">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-center">Scan at Registration</p>
            {qrCodeDataUrl ? (
              <div className="bg-white p-4 rounded-3xl shadow-xl hover:scale-[1.03] transition-transform duration-300">
                <Image src={qrCodeDataUrl} alt="Participant QR Code" width={200} height={200} className="block mt-0" />
              </div>
            ) : (
              <div className="w-[232px] h-[232px] bg-white/5 rounded-3xl flex flex-col items-center justify-center border border-white/10 animate-pulse">
                <div className="w-8 h-8 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin mb-3"></div>
              </div>
            )}
          </div>

          {/* Verified status block */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                <CheckCircle weight="fill" size={18} />
              </div>
              <p className="font-bold text-sm text-green-400">Registration Verified</p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-green-400/50">✓</span>
          </div>

          {(isAdmin || isManager) && (
            <Link
              href={isAdmin ? `/admin/user/${participant.participantId}` : `/manager/user/${participant.participantId}`}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/30 hover:bg-[#FF9900]/30 transition shadow-lg"
            >
              <span className="font-bold text-sm tracking-wide">Manage Profile</span>
              <ArrowRight weight="bold" />
            </Link>
          )}
        </div>
      </div>

      {/* Download Button — outside the captured area */}
      <div className="relative z-10 mt-6">
        <button
          onClick={handleDownload}
          disabled={downloading || !qrCodeDataUrl}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300
            bg-gradient-to-r from-[#FF9900] to-amber-500 text-black
            hover:from-amber-400 hover:to-[#FF9900] hover:shadow-[0_0_30px_rgba(255,153,0,0.4)]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
            active:scale-95 shadow-lg"
        >
          {downloading ? (
            <>
              <Spinner className="w-5 h-5 animate-spin" weight="bold" />
              Generating Ticket…
            </>
          ) : (
            <>
              <DownloadSimple className="w-5 h-5" weight="bold" />
              Download Ticket
            </>
          )}
        </button>
        <p className="text-white/30 text-xs text-center mt-2">Saves as a PNG image</p>
      </div>
    </div>
  );
}
