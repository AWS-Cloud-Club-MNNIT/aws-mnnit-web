"use client";

import { useEffect, useState, use } from "react";
import QRCode from "qrcode";
import { CheckCircle, MapPin, EnvelopeSimple, CalendarBlank, Clock, IdentificationCard, XCircle } from "@phosphor-icons/react";

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    fetchParticipant();
  }, [id]);

  const fetchParticipant = async () => {
    try {
      const res = await fetch(`/api/user/${id}`);
      const data = await res.json();
      if (res.ok) {
        setParticipant(data.participant);
        generateQRCode(data.participant.participantId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (participantId: string) => {
    try {
      const url = `${window.location.origin}/ticket/${participantId}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 320,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error("Error generating QR", err);
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
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[20%] left-[-10%] w-[800px] h-[800px] bg-[#FF9900]/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0073BB]/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Responsive Horizontal Pass Card */}
      <div className="w-full max-w-4xl bg-[#1A222D] rounded-[2rem] border border-white/10 shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Attendee Information */}
        <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 relative">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9900] via-amber-400 to-[#FF9900]/30" />
          
          <div className="flex items-center gap-3 mb-8">
            <IdentificationCard weight="duotone" className="w-8 h-8 text-[#FF9900]" />
            <div>
              <p className="text-[#FF9900] tracking-widest text-xs font-black uppercase">AWS Cloud Club</p>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Student Community Day 2026</h1>
            </div>
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
                <EnvelopeSimple weight="fill" className="w-4 h-4 text-white/60"/>
              </div>
              <div className="min-w-0">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Email Contact</p>
                <p className="text-white/90 text-sm font-medium truncate" title={participant.email}>{participant.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <MapPin weight="fill" className="w-4 h-4 text-white/60"/>
              </div>
              <div className="min-w-0">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Institute / College</p>
                <p className="text-white/90 text-sm font-medium truncate" title={participant.college}>{participant.college}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <CalendarBlank weight="fill" className="w-4 h-4 text-white/60"/>
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Date</p>
                <p className="text-white/90 text-sm font-medium">11th April, 2026</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <Clock weight="fill" className="w-4 h-4 text-white/60"/>
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Time</p>
                <p className="text-white/90 text-sm font-medium">8:00 AM - 7:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: QR & Status Block */}
        <div className="md:w-[340px] flex flex-col p-8 md:p-10 shrink-0 bg-[#0F1115]/50 relative">
          
          <div className="flex-1 flex flex-col items-center justify-center mb-8">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-center">Scan at Registration</p>
            {qrCodeDataUrl ? (
              <div className="bg-white p-4 rounded-3xl shadow-xl transform transition-transform hover:scale-[1.03] duration-300">
                <img src={qrCodeDataUrl} alt="Participant QR Code" width={180} height={180} className="block" />
              </div>
            ) : (
              <div className="w-[212px] h-[212px] bg-white/5 rounded-3xl flex flex-col items-center justify-center border border-white/10 animate-pulse">
                <div className="w-8 h-8 border-2 border-[#FF9900] border-t-transparent rounded-full animate-spin mb-3"></div>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-auto">
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${participant.present ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/5'}`}>
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${participant.present ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'}`}>
                    {participant.present ? <CheckCircle weight="fill" size={18} /> : <XCircle weight="fill" size={18} />}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${participant.present ? 'text-green-400' : 'text-white/30'}`}>
                      {participant.present ? 'Present' : 'Not Checked In'}
                    </p>
                  </div>
               </div>
               <span className={`text-[10px] uppercase font-bold tracking-wider ${participant.present ? 'text-green-400/50' : 'text-white/20'}`}>
                 ENTRY
               </span>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-2xl border ${participant.food ? 'bg-[#FF9900]/10 border-[#FF9900]/30' : 'bg-white/5 border-white/5'}`}>
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${participant.food ? 'bg-[#FF9900]/20 text-[#FF9900]' : 'bg-white/5 text-white/30'}`}>
                    {participant.food ? <CheckCircle weight="fill" size={18} /> : <XCircle weight="fill" size={18} />}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${participant.food ? 'text-[#FF9900]' : 'text-white/30'}`}>
                      {participant.food ? 'Food Collected' : 'Food Pending'}
                    </p>
                  </div>
               </div>
               <span className={`text-[10px] uppercase font-bold tracking-wider ${participant.food ? 'text-[#FF9900]/50' : 'text-white/20'}`}>
                 MEALS
               </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
