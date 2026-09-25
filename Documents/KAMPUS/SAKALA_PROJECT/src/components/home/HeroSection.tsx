'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-[#070F18] text-white overflow-hidden py-16 lg:py-24 border-b border-[#C5AA00]/20">
      {/* Background Subtle Gradient & Arch lines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0047AB] via-[#070F18] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Monograph Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center animate-fade-in-up">
            {/* Main Brand Title */}
            <h1 className="font-serif-editorial text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#C5AA00] leading-none mb-4 transition-transform duration-300">
              SAKALA
            </h1>

            {/* Credo Subtitle */}
            <p className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-[#E2E8F0] uppercase mb-6 flex items-center gap-2">
              <span>BROTHERHOOD</span>
              <span className="text-[#C5AA00]">•</span>
              <span>LOYALTY</span>
              <span className="text-[#C5AA00]">•</span>
              <span>CIRCLE</span>
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl leading-relaxed mb-10 font-normal">
              A cultural collective and custom engineering atelier built around the philosophy of lifelong fraternity, raw displacement, and Indonesian archival motorcycle heritage.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link
                href="#garage"
                className="inline-flex items-center gap-3 bg-[#0047AB] hover:bg-[#00388A] text-white px-7 py-3.5 text-xs font-bold tracking-[0.16em] uppercase rounded-sm transition-all duration-300 shadow-lg shadow-[#0047AB]/25 btn-tactile group"
              >
                <span>EXPLORE THE GARAGE</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </Link>

              <Link
                href="#supply"
                className="inline-flex items-center gap-3 bg-white hover:bg-[#F5F4EF] text-[#070F18] px-7 py-3.5 text-xs font-bold tracking-[0.16em] uppercase rounded-sm transition-all duration-300 shadow-md btn-tactile group"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#070F18] group-hover:scale-110 transition-transform duration-200" />
                <span>SHOP SAKALA SUPPLY</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Sacred Cakra Rahayu Kencana Emblem */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            {/* Glowing Golden Aura (GPU accelerated) */}
            <div className="absolute w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full bg-[#C5AA00]/15 blur-3xl pointer-events-none self-center" />

            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] animate-fade-in animate-float-gentle will-change-transform">
              <Image
                src="/assets/cakra_rahayu_kencana.png"
                alt="Cakra Rahayu Kencana — Sacred Sunda-Galuh Emblem"
                fill
                className="object-contain transition-transform duration-500 hover:scale-103"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
