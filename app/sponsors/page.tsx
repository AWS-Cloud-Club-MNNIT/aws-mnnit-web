"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ArrowUpRight, Handshake, InstagramLogo, LinkedinLogo, XLogo } from "@phosphor-icons/react";

interface Sponsor {
  _id: string;
  companyName: string;
  category: string;
  priority: number;
  sponsorType: string;
  logo: string;
  specialNote?: string;
  websiteLink: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch("/api/sponsor");
        const data = await res.json();
        if (Array.isArray(data)) {
          setSponsors(data);
        }
      } catch (error) {
        console.error("Failed to fetch sponsors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsors();
  }, []);

  // Group sponsors by priority and sponsorType
  const groupedSponsors = React.useMemo(() => {
    const groups: { [key: number]: { type: string; sponsors: Sponsor[] } } = {};
    
    sponsors.forEach(sponsor => {
      if (!groups[sponsor.priority]) {
        groups[sponsor.priority] = {
          type: sponsor.sponsorType,
          sponsors: []
        };
      }
      groups[sponsor.priority].sponsors.push(sponsor);
    });

    // Sort by priority ascending
    return Object.entries(groups)
      .map(([priority, data]) => ({
        priority: Number(priority),
        type: data.type,
        sponsors: data.sponsors
      }))
      .sort((a, b) => a.priority - b.priority);
  }, [sponsors]);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans selection:bg-[#7C3AED]/30">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#7C3AED]/10 blur-[120px] animate-pulse" />
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#c084fc]/10 blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="mt-8 mb-20 text-center max-w-4xl mx-auto flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-primary mb-6 shadow-[0_0_20px_rgba(124,58,237,0.15)]"
            >
              <Handshake weight="duotone" className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold tracking-wide uppercase">Our Partners</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-white via-white to-white/60"
            >
              Fueling the <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-[#c084fc] drop-shadow-[0_0_30px_rgba(124,58,237,0.4)]">Innovation</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              AWS Cloud Club MNNIT is proudly supported by industry leaders who believe in empowering the next generation of cloud builders.
            </motion.p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-32">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Sponsors Listing */}
          {!loading && groupedSponsors.length === 0 && (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
              <p className="text-white/50 text-lg">New partnerships are being forged. Check back soon!</p>
            </div>
          )}

          {!loading && groupedSponsors.map((group, groupIndex) => {
            // Priority 1 gets special large treatment
            const isTopPriority = groupIndex === 0 && group.priority <= 2;
            
            return (
              <motion.div 
                key={group.priority}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="mb-24 last:mb-0"
              >
                <div className="flex flex-col items-center justify-center gap-4 mb-16 text-center">
                  <h2 className={`font-black uppercase tracking-widest ${isTopPriority ? 'text-4xl md:text-5xl text-transparent bg-clip-text bg-linear-to-r from-primary to-[#c084fc] drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]' : 'text-3xl text-white/90 drop-shadow-md'}`}>
                    {group.type}
                  </h2>
                  <div className="w-24 h-1 bg-linear-to-r from-primary to-[#c084fc] rounded-full opacity-50" />
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  {group.sponsors.map((sponsor, sponsorIndex) => (
                    <motion.div
                      key={sponsor._id}
                      onClick={() => window.open(sponsor.websiteLink, '_blank')}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: sponsorIndex * 0.1 }}
                      className={`cursor-pointer group relative rounded-3xl overflow-hidden border transition-all duration-500 bg-white/2 flex flex-col mx-auto w-full max-w-[300px] min-h-[300px] ${
                        isTopPriority 
                          ? 'border-primary/30 hover:border-primary shadow-[0_0_30px_rgba(124,58,237,0.1)] hover:shadow-[0_0_50px_rgba(124,58,237,0.25)]' 
                          : 'border-white/5 hover:border-white/20 hover:bg-white/4'
                      }`}
                    >
                      {/* Inner Logo Container */}
                      <div className={`relative aspect-square w-full flex items-center justify-center overflow-hidden bg-white/2 backdrop-blur-sm transition-colors duration-500`}>
                        {/* Decorative texture: subtle grid lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                        
                        {/* Ambient glow behind the logo */}
                        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[40px] pointer-events-none z-0 transition-opacity duration-700 opacity-50 group-hover:opacity-100 mix-blend-screen ${isTopPriority ? 'w-32 h-32 bg-primary/50' : 'w-24 h-24 bg-[#c084fc]/40'}`} />
                        
                        <div className="absolute inset-0 bg-linear-to-b from-transparent to-background/90 z-0 pointer-events-none" />
                        
                        {/* Inner fluid bounding box preserving aspect ratio inside the 300px limit */}
                        <div className={`relative z-10 w-full h-full transition-transform duration-700 group-hover:scale-105`}>
                          <Image 
                            src={sponsor.logo} 
                            alt={sponsor.companyName}
                            fill
                            className="object-cover drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                          />
                        </div>
                      </div>

                      {/* Content Container */}
                      <div className="p-4 relative z-20 shrink-0 bg-background/80 backdrop-blur-xl border-t border-white/5 flex flex-col items-center justify-center text-center">
                        <h3 className={`font-black text-white tracking-tight line-clamp-1 w-full text-2xl mb-1`}>
                          {sponsor.companyName}
                        </h3>
                        <p className="text-primary font-bold text-sm uppercase tracking-widest mb-1">{sponsor.category}</p>

                        {sponsor.specialNote && (
                          <p className="text-white/80 text-sm mt-3 bg-white/5 px-3 py-2.5 rounded-lg italic w-full border border-white/10 leading-relaxed shadow-inner">
                            &quot;{sponsor.specialNote}&quot;
                          </p>
                        )}
                        
                        {/* Social Links */}
                        {(sponsor.instagram || sponsor.linkedin || sponsor.twitter) && (
                          <div className="flex items-center gap-4 mt-4 mb-2">
                            {sponsor.instagram && (
                              <a href={sponsor.instagram} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#E1306C] transition-all hover:scale-110" onClick={(e) => e.stopPropagation()}>
                                <InstagramLogo weight="duotone" className="w-7 h-7" />
                              </a>
                            )}
                            {sponsor.linkedin && (
                              <a href={sponsor.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#0A66C2] transition-all hover:scale-110" onClick={(e) => e.stopPropagation()}>
                                <LinkedinLogo weight="duotone" className="w-7 h-7" />
                              </a>
                            )}
                            {sponsor.twitter && (
                              <a href={sponsor.twitter} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-all hover:scale-110" onClick={(e) => e.stopPropagation()}>
                                <XLogo weight="duotone" className="w-7 h-7" />
                              </a>
                            )}
                          </div>
                        )}
                        
                        {/* Hover interaction pop-up element */}
                        <div className="absolute top-0 right-0 -mt-3 mr-4 w-7 h-7 rounded-full bg-background border border-white/10 flex items-center justify-center text-white/40 group-hover:text-primary group-hover:border-primary/50 transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0)] group-hover:shadow-[0_0_10px_rgba(124,58,237,0.4)] z-30 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                          <ArrowUpRight weight="bold" className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      
                      {/* Hover Gradient Effect */}
                      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
