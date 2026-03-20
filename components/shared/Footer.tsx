"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "./Logo";
import {
  InstagramLogoIcon,
  LinkedinLogoIcon,
} from "@phosphor-icons/react";

import { ArrowRight } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="bg-[#090C15] pt-24 pb-8 relative overflow-hidden">
      {/* Top Gradient Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-br from-[#7C3AED]/10 via-transparent to-[#FF9900]/5 blur-[120px] pointer-events-none opacity-50" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20 block">
          
          {/* Brand - 6 columns */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-4 mb-6">
              <Logo size={48} className="text-white" />
              <div className="flex flex-col">
                <span className="font-sans font-bold text-2xl tracking-tight text-white leading-none">
                  AWS Cloud Club
                </span>
                <span className="font-sans font-extrabold text-xl tracking-tight text-[#FF9900] uppercase mt-1 leading-none">
                  MNNIT
                </span>
              </div>
            </div>
            
            <p className="text-[#8892B0] text-base max-w-sm mb-10 leading-relaxed">
              Empowering the next generation of cloud architects, developers,
              and DevOps engineers through experiential learning.
            </p>
            
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com/company/aws-cloud-club-mnnit-allahabad"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#A78BFA] hover:bg-[#A78BFA]/10 hover:border-[#A78BFA]/30 transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <LinkedinLogoIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a
                href="https://instagram.com/awscloudclubmnnit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#A78BFA] hover:bg-[#A78BFA]/10 hover:border-[#A78BFA]/30 transition-all duration-300 group"
                aria-label="Instagram"
              >
                <InstagramLogoIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a
                href="https://meetup.com/aws-cloud-club-at-nit-allahabad"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#FF9900] hover:bg-[#FF9900]/10 hover:border-[#FF9900]/30 transition-all duration-300 group"
                aria-label="Meetup"
              >
                <Image
                  src="/meetup-svgrepo-com.svg"
                  alt="Meetup"
                  width={20}
                  height={20}
                  className="object-contain opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 filter group-hover:brightness-0 group-hover:invert-[.6] group-hover:sepia-[1] group-hover:saturate-[5000%] group-hover:hue-rotate-[10deg]"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </a>
            </div>
          </div>

          {/* Quick Links - 3 columns */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-[0.2em] mb-6">Explore</h4>
            <ul className="space-y-4">
              {[
                { name: "SCD '26", path: '/scd', isNew: true },
                { name: 'Events', path: '/events' },
                { name: 'Projects', path: '/coming-soon' },
                { name: 'Team', path: '/team' },
                { name: 'Blogs', path: '/blogs' }
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="group flex items-center text-[#8892B0] hover:text-white transition-colors duration-300 w-fit"
                  >
                    <ArrowRight weight="bold" className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 group-hover:mr-2 text-[#A78BFA] transition-all duration-300" />
                    <span className="transition-transform duration-300 group-hover:translate-x-1 flex items-center gap-1.5">
                      {item.name}
                      {item.isNew && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9900]/60 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF9900]"></span>
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal - 3 columns */}
          <div className="lg:col-span-3">
             <h4 className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-[0.2em] mb-6">Legal</h4>
            <ul className="space-y-4">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Code of Conduct', path: '/code-of-conduct' }
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="group flex items-center text-[#8892B0] hover:text-white transition-colors duration-300 w-fit"
                  >
                    <ArrowRight weight="bold" className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 group-hover:mr-2 text-[#A78BFA] transition-all duration-300" />
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#8892B0] text-sm">
            &copy; {new Date().getFullYear()} AWS Cloud Club MNNIT. All rights reserved.
          </p>
          <p className="text-[#8892B0] text-sm flex items-center gap-2">
            Built with{" "}
            <span className="text-red-500 animate-pulse" aria-label="love">❤️</span> by AWS
            Cloud Club MNNIT
          </p>
        </div>
      </div>

      {/* Deep Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[100px] bg-[#FF9900]/10 blur-[100px] pointer-events-none" />
    </footer>
  );
}