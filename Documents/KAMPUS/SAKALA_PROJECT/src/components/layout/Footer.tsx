'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#070F18] text-white pt-16 pb-12 border-t border-[#C5AA00]/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top Header in Footer */}
        <div className="mb-14 pb-8 border-b border-white/10">
          <span className="font-serif-editorial text-3xl font-black tracking-[0.16em] text-white block mb-1">
            SAKALA
          </span>
          <span className="text-[10px] tracking-[0.25em] text-[#64748B] uppercase font-semibold">
            ARCHIVAL SPEED CULTURE & CUSTOM GUILD • BANDUNG, ID
          </span>
        </div>

        {/* Directory Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16 text-xs">
          {/* Shop Column */}
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#C5AA00] uppercase block mb-4">
              SUPPLY & SHOP
            </span>
            <ul className="space-y-2.5 text-[#94A3B8]">
              <li>
                <Link href="/shop" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  All Goods & Apparel
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-[#C5AA00] hover:text-white hover:translate-x-1 inline-block transition-all duration-200 font-medium">
                  Track Dispatch / Resi
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Member Portal & Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Cart & Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Garage • Bikes */}
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#C5AA00] uppercase block mb-4">
              THE GARAGE • BIKES
            </span>
            <ul className="space-y-2.5 text-[#94A3B8]">
              <li>
                <Link href="/bikes/bike-01" className="hover:text-white transition-colors">
                  Build Archives
                </Link>
              </li>
              <li>
                <Link href="/bikes/bike-01" className="hover:text-white transition-colors">
                  Specs Registry
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Philosophy & Ethos
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  SAKALA MC Wing
                </Link>
              </li>
            </ul>
          </div>

          {/* Journal */}
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#C5AA00] uppercase block mb-4">
              CHRONICLE • JOURNAL
            </span>
            <ul className="space-y-2.5 text-[#94A3B8]">
              <li>
                <Link href="/journal" className="hover:text-white transition-colors">
                  All Dispatches
                </Link>
              </li>
              <li>
                <Link href="/journal/the-ascent-of-tangkuban-perahu-at-0300-wib" className="hover:text-white transition-colors">
                  Tangkuban Perahu 03:00 WIB
                </Link>
              </li>
              <li>
                <Link href="/journal/ciroyom-midnight-run-monograph" className="hover:text-white transition-colors">
                  Ciroyom Midnight Run
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Brotherhood Ethos
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Culture */}
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#C5AA00] uppercase block mb-4">
              ETHOS • ABOUT
            </span>
            <ul className="space-y-2.5 text-[#94A3B8]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Manifesto & History
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Four Pillars of SAKALA
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Divisions (MC & Tactical)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Monarchy & Hierarchy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#64748B]">
          <span>
            © 2026 SAKALA. All rights reserved. A circle, not a crowd.
          </span>

          <div className="flex items-center gap-6 tracking-[0.16em] uppercase">
            <Link href="/about" className="hover:text-white transition-colors">
              MANIFESTO
            </Link>
            <span>•</span>
            <Link href="/tracking" className="hover:text-white transition-colors">
              TRACK DISPATCH
            </Link>
            <span>•</span>
            <Link href="/journal" className="hover:text-white transition-colors">
              DISPATCHES
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
