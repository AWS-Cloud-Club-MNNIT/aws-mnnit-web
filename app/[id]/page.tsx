"use client";

import { useEffect, useState, use } from "react";
import QRCode from "qrcode";
import Image from "next/image"; // wait, the generated QR is a data URL so we can use next/image or native img
import { CheckCircle, MapPin, IdentificationBadge } from "@phosphor-icons/react";

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
      const url = `${window.location.origin}/${participantId}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-pulse w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
           <div className="w-8 h-8 bg-orange-500 rounded-full animate-ping"></div>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Ticket Not Found</h2>
          <p className="text-gray-400">The ticket ID you provided is invalid or does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4 font-sans py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Ticket Header Logo area */}
        <div className="bg-gray-900 border border-gray-800 rounded-t-3xl p-6 text-center space-y-2 border-b border-dashed border-gray-700 relative">
          {/* Simulated punch holes for ticket styling */}
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gray-950 rounded-full border-r border-gray-800"></div>
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-950 rounded-full border-l border-gray-800"></div>
          
          <span className="inline-block px-3 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-widest rounded-full mb-2">
            Event Pass
          </span>
          <h1 className="text-3xl font-black bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">AWS SCD</h1>
          <p className="text-sm font-mono text-gray-400 uppercase tracking-widest">{participant.participantId}</p>
        </div>

        {/* Ticket Body */}
        <div className="bg-gray-900 border border-gray-800 border-t-0 rounded-b-3xl p-8 shadow-2xl flex flex-col items-center relative">
          
          {qrCodeDataUrl ? (
            <div className="bg-white p-3 rounded-2xl shadow-inner mb-6 mx-auto transform hover:scale-105 transition duration-300">
               <img src={qrCodeDataUrl} alt="Ticket QR Code" width={220} height={220} className="block" />
            </div>
          ) : (
            <div className="w-[220px] h-[220px] bg-gray-800 rounded-2xl mb-6 flex flex-col items-center justify-center animate-pulse">
               <p className="text-sm text-gray-400 text-center">Generating<br/>QR Code...</p>
            </div>
          )}

          <div className="w-full space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{participant.name}</h2>
              <div className="flex items-center justify-center text-gray-400 text-sm">
                 <MapPin weight="fill" className="mr-1 text-orange-400" />
                 <span className="truncate max-w-[250px]">{participant.college}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800/80 flex flex-col items-center gap-3">
              {participant.present && (
                <div className="flex items-center text-green-400 bg-green-500/10 px-4 py-2 rounded-full w-full justify-center shadow-inner shadow-green-500/5">
                  <CheckCircle weight="fill" size={20} className="mr-2" />
                  <span className="font-medium text-sm">Checked In</span>
                </div>
              )}
              {participant.food && (
                <div className="flex items-center text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full w-full justify-center shadow-inner shadow-emerald-500/5">
                  <CheckCircle weight="fill" size={20} className="mr-2" />
                  <span className="font-medium text-sm">Meals Collected</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Info text at bottom */}
        <p className="text-center text-gray-500 text-xs mt-8">Please present this QR code at the registration desk.</p>
      </div>
    </div>
  );
}
