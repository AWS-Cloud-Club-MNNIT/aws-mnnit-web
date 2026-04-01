"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import mayankPandeyData from "./commitee/Chairman/mayankpandey.json";
import sarsijData from "./commitee/Convener/sarsijtripathi.json";
import kanishkData from "./commitee/cloudcaptain/kanishk.json";
import ashishData from "./commitee/facultymembers/ashish.json";
import ranvijayData from "./commitee/facultymembers/ranvijay.json";
import shashankData from "./commitee/facultymembers/shashank.json";

interface CommitteeMember {
  name: string;
  designation: string;
  aws_designation: string;
  department: string;
  image: string;
  redirect_url?: string;
}

const members: Record<string, CommitteeMember[]> = {
  Chairman: [
    {
      name: mayankPandeyData.name,
      designation: mayankPandeyData.designation,
      aws_designation: mayankPandeyData.aws_designation,
      department: mayankPandeyData.department,
      image: "/commitee/Chairman/mayankPandey.png",
      redirect_url: mayankPandeyData.redirect_url,
    },
  ],
  "Cloud Captain": [
    {
      name: kanishkData.name,
      designation: "",
      aws_designation: kanishkData.aws_designation,
      department: kanishkData.department,
      image: "/commitee/cloudcaptain/kanishk.png",
      redirect_url: kanishkData.redirect_url,
    },
  ],
  Convener: [
    {
      name: sarsijData.name,
      designation: sarsijData.designation,
      aws_designation: sarsijData.aws_designation,
      department: sarsijData.department,
      image: "/commitee/Convener/sarsij ripathi.png",
      redirect_url: sarsijData.redirect_url,
    },
  ],
  "Faculty Members": [
    {
      name: ashishData.name,
      designation: ashishData.designation,
      aws_designation: ashishData.aws_designation,
      department: ashishData.department,
      image: "/commitee/facultymember/ashish.png",
      redirect_url: ashishData.redirect_url,
    },
    {
      name: ranvijayData.name,
      designation: ranvijayData.designation,
      aws_designation: ranvijayData.aws_designation,
      department: ranvijayData.department,
      image: "/commitee/facultymember/ranvijay.png",
      redirect_url: ranvijayData.redirect_url,
    },
    {
      name: shashankData.name,
      designation: shashankData.designation,
      aws_designation: shashankData.aws_designation,
      department: shashankData.department,
      image: "/commitee/facultymember/shashank.png",
      redirect_url: shashankData.redirect_url,
    },
  ],
};

function MemberCard({ member, index }: { member: CommitteeMember; index: number }) {
  return (
    <motion.a
      href={member.redirect_url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        opacity: { duration: 0.5, delay: index * 0.1 },
        y: { duration: 0.5, delay: index * 0.1, ease: "easeOut" }
      }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="w-full sm:w-[320px] group relative h-[440px] rounded-[2rem] overflow-hidden bg-background/90 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-colors duration-500 shadow-2xl shadow-black/80 select-none will-change-transform block cursor-pointer"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Animated Gradient Overlay (Internal) */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
      
      {/* Glow effect that follows hover */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b w-full from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20 mix-blend-overlay" />

      <div className="relative h-[280px] w-full overflow-hidden shrink-0 bg-white/[0.02]">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover object-top filter grayscale contrast-125 transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 group-hover:contrast-100 z-10"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority={index < 4}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-20 transition-transform duration-700 group-hover:translate-y-4" />
      </div>

      <div className="px-6 pb-6 pt-2 flex flex-col flex-1 justify-end z-30 transition-transform duration-500 translate-y-[-2rem] group-hover:translate-y-[-1rem]">
        <h3 className="text-xl font-bold text-white/90 mb-1 group-hover:text-white transition-colors">
          {member.name}
        </h3>
        {member.designation && (
          <p className="text-white/70 font-medium text-sm mb-1">{member.designation}</p>
        )}
        <p className="text-white/40 text-xs mb-4 line-clamp-2">{member.department}</p>
        
        <div className="flex items-center gap-2 mt-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300 w-fit">
            <span className="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase">MNNIT</span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export function CommitteeSection() {
  const sections = ["Chairman", "Convener", "Faculty Members", "Cloud Captain"];

  return (
    <div className="w-full flex flex-col gap-24">
      {sections.map((sectionTitle) => (
        <div key={sectionTitle} className="flex flex-col gap-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-center gap-4"
          >
            <div className="h-[1px] w-8 sm:w-16 md:w-32 bg-gradient-to-l from-white/20 to-transparent" />
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight text-center">
              {sectionTitle}
            </h2>
            <div className="h-[1px] w-8 sm:w-16 md:w-32 bg-gradient-to-r from-white/20 to-transparent" />
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8">
            {members[sectionTitle].map((member, idx) => (
              <MemberCard key={idx} member={member} index={idx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

