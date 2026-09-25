'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-[#070F18] text-white overflow-hidden py-8 sm:py-14 lg:py-20 border-b border-[#C5AA00]/20">
      {/* Background Subtle Gradient & Arch lines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0047AB] via-[#070F18] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-12 gap-3 sm:gap-8 lg:gap-12 items-center">
          {/* Left Column: Monograph Typography & CTAs (Col 7) */}
          <div className="col-span-7 flex flex-col justify-center animate-fade-in-up">
            {/* Main Brand Title */}
            <h1 className="font-serif-editorial text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tight text-white leading-none mb-1 sm:mb-2">
              SAKALA
            </h1>

            {/* Subtitle */}
            <p className="text-[8px] xs:text-[9.5px] sm:text-xs md:text-sm font-semibold tracking-[0.18em] sm:tracking-[0.25em] text-[#94A3B8] uppercase mb-2 sm:mb-4">
              MOTORCYCLE CLUB
            </p>

            {/* Concise On-Point Description */}
            <p className="text-[10px] xs:text-[11px] sm:text-sm lg:text-base text-[#CBD5E1] max-w-lg leading-relaxed mb-3 sm:mb-6 font-normal">
              Bandung-born motorcycle collective & custom atelier. Built on fraternity, raw displacement, and Indonesian motorcycle heritage.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 xs:gap-2 sm:gap-4">
              <Link
                href="#garage"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-3 bg-[#0047AB] hover:bg-[#00388A] text-white px-2.5 py-2 xs:px-3 xs:py-2.5 sm:px-5 sm:py-3.5 text-[8.5px] xs:text-[10px] sm:text-xs font-bold tracking-[0.1em] sm:tracking-[0.16em] uppercase rounded-xs transition-all duration-300 shadow-md shadow-[#0047AB]/25 btn-tactile group text-center"
              >
                <span>EXPLORE GARAGE</span>
                <ArrowRight className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </Link>

              <Link
                href="#supply"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-3 bg-white hover:bg-[#F5F4EF] text-[#070F18] px-2.5 py-2 xs:px-3 xs:py-2.5 sm:px-5 sm:py-3.5 text-[8.5px] xs:text-[10px] sm:text-xs font-bold tracking-[0.1em] sm:tracking-[0.16em] uppercase rounded-xs transition-all duration-300 shadow-sm btn-tactile group text-center"
              >
                <ShoppingBag className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-[#070F18] group-hover:scale-110 transition-transform duration-200" />
                <span>SAKALA SUPPLY</span>
              </Link>
            </div>
          </div>

          {/* Right Column: SAKALA MC Official Colors Patch (Col 5) */}
          <div className="col-span-5 flex justify-center items-center relative">
            {/* Subtle Atmospheric Glow */}
            <div className="absolute w-28 h-28 xs:w-36 xs:h-36 sm:w-60 sm:h-60 lg:w-96 lg:h-96 rounded-full bg-[#0047AB]/20 blur-2xl pointer-events-none self-center" />
            <div className="absolute w-20 h-20 xs:w-28 xs:h-28 sm:w-44 sm:h-44 lg:w-72 lg:h-72 rounded-full bg-[#C5AA00]/15 blur-xl pointer-events-none self-center" />

            <div className="relative w-full aspect-[2075/2338] max-w-[155px] xs:max-w-[185px] sm:max-w-[280px] lg:max-w-[420px] animate-fade-in animate-float-gentle will-change-transform">
              <Image
                src="/assets/SAKALA_MC.PNG"
                alt="SAKALA Motorcycle Club Indonesia Official Emblem"
                fill
                sizes="(max-width: 640px) 185px, (max-width: 1024px) 280px, 450px"
                className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] transition-transform duration-500 hover:scale-103"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
