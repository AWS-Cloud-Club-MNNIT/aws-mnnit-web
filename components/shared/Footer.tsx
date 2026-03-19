"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GithubLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
} from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="bg-background pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-16 h-16">
                <Image
                  src="/club-logo.png"
                  alt="AWS Cloud Club Logo"
                  fill
                  className="object-contain"
                  // Add this if your logo has dark colors that need to be visible on dark background
                  style={{ filter: 'brightness(0) invert(1)' }} // This will make dark logos white
                  // Remove the filter if your logo already has light colors
                />
              </div>
              <span className="font-sans font-bold text-xl tracking-tight text-white">
                AWS Cloud Club <span className="text-[#FF9900]">MNNIT</span>
              </span>
            </div>
            
            <p className="text-white/50 text-base max-w-sm mb-8 leading-relaxed">
              Empowering the next generation of cloud architects, developers,
              and DevOps engineers through experiential learning.
            </p>
            
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com/company/aws-cloud-club-mnnit-allahabad"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinLogoIcon className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/awscloudclubmnnit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <InstagramLogoIcon className="w-5 h-5" />
              </a>
              {/* Meetup Logo - Using a custom SVG since Phosphor doesn't have Meetup */}
              <a
                href="https://meetup.com/aws-cloud-club-at-nit-allahabad"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-colors group"
                aria-label="Meetup"
              >
                <Image
                  src="/meetup-svgrepo-com.svg"
                  alt="Meetup"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Explore</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/events"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/privacy"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/code-of-conduct"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Code of Conduct
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} AWS Cloud Club MNNIT. All rights
            reserved.
          </p>
          <p className="text-white/40 text-sm flex items-center gap-2">
            Built with{" "}
            <span className="text-red-500" aria-label="love">❤️</span> by AWS
            Cloud Club MNNIT
          </p>
        </div>
      </div>

      {/* Subtle Glow Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[100px] bg-[#FF9900]/20 blur-[100px] pointer-events-none" />
    </footer>
  );
}