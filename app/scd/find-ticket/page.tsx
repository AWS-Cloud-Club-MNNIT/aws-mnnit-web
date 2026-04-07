"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ticket, MagnifyingGlass, ArrowRight, EnvelopeSimple } from "@phosphor-icons/react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export default function FindTicketPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/participants/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Ticket found!");
        router.push(`/ticket/${data.participantId}`);
      } else {
        toast.error(data.error || "No ticket found for this email");
      }
    } catch (err) {
      toast.error("An error occurred while searching");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#05070A] text-white selection:bg-[#FF9900]/30 relative flex items-center justify-center font-sans overflow-hidden py-24">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#FF9900]/10 rounded-full blur-[100px] mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#0073BB]/10 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        <div className="relative z-10 w-full max-w-lg px-6">
          <div className="bg-[#1A222D]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            {/* Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9900] via-amber-400 to-[#FF9900]/30" />
            
            <div className="w-16 h-16 bg-[#FF9900]/10 rounded-2xl flex items-center justify-center mb-8 mx-auto xl:mx-0 shadow-inner border border-[#FF9900]/20">
              <Ticket className="w-8 h-8 text-[#FF9900] transform -rotate-12" weight="duotone" />
            </div>

            <div className="text-center xl:text-left mb-10">
              <h1 className="text-3xl font-extrabold tracking-tight mb-3">Find Your Ticket</h1>
              <p className="text-white/50 text-base leading-relaxed">
                Enter the email address you used during SCD 2026 registration to retrieve your digital pass and QR code.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeSimple className="w-5 h-5 text-white/30" weight="fill" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#0F1115] border border-white/10 text-white placeholder:text-white/30 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#FF9900]/50 focus:ring-1 focus:ring-[#FF9900]/50 transition duration-300 disabled:opacity-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold py-4 rounded-2xl transition duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,153,0,0.15)]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <MagnifyingGlass weight="bold" className="w-5 h-5" />
                    Search Ticket
                    <ArrowRight weight="bold" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
          
          <p className="text-center text-white/30 text-sm mt-8">
            Having trouble finding your ticket? Contact the organizing team at <a href="mailto:awscloudclubmnnit@gmail.com" className="text-[#FF9900] hover:underline">awscloudclubmnnit@gmail.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
