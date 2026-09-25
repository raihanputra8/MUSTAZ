'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#070F18] text-white border-t border-white/10 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Main Content Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-white/10">
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="relative w-9 h-9 shrink-0">
              <Image
                src="/assets/sakala_emblem.png"
                alt="SAKALA Emblem"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-serif-editorial text-lg font-bold tracking-[0.16em] text-white block leading-none mb-1">
                SAKALA
              </span>
              <span className="text-[9px] tracking-[0.22em] text-[#94A3B8] uppercase block">
                EST. 2026 • BANDUNG
              </span>
            </div>
          </div>

          {/* Simple Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold tracking-[0.14em] uppercase text-[#94A3B8]">
            <Link href="/shop" className="hover:text-[#C5AA00] transition-colors">
              Shop
            </Link>
            <Link href="/bikes" className="hover:text-[#C5AA00] transition-colors">
              Bikes
            </Link>
            <Link href="/journal" className="hover:text-[#C5AA00] transition-colors">
              Journal
            </Link>
            <Link href="/about" className="hover:text-[#C5AA00] transition-colors">
              About
            </Link>
            <Link href="/tracking" className="hover:text-[#C5AA00] transition-colors">
              Tracking
            </Link>
            <Link href="/account" className="hover:text-[#C5AA00] transition-colors">
              Account
            </Link>
          </nav>
        </div>

        {/* Bottom Bar: Copyright & Creed */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#64748B] text-center sm:text-left">
          <span>
            © 2026 SAKALA MOTORCYCLE CLUB. All rights reserved.
          </span>
          <span className="italic font-serif text-[#94A3B8]">
            “A circle, not a crowd.”
          </span>
        </div>
      </div>
    </footer>
  );
}
