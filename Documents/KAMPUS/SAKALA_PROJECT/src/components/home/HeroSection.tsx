'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-[#070F18] text-white overflow-hidden py-10 sm:py-14 lg:py-20 border-b border-[#C5AA00]/20">
      {/* Background Subtle Gradient & Arch lines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0047AB] via-[#070F18] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Monograph Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center animate-fade-in-up">
            {/* Title & Mobile-Only Emblem beside SAKALA */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="font-serif-editorial text-[34px] xs:text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none">
                  SAKALA
                </h1>
                <p className="text-[10px] xs:text-xs sm:text-sm font-semibold tracking-[0.22em] sm:tracking-[0.3em] text-[#94A3B8] uppercase mt-2">
                  MOTORCYCLE CLUB
                </p>
              </div>

              {/* Mobile-Only Emblem beside SAKALA */}
              <div className="lg:hidden shrink-0 relative w-32 h-36 xs:w-36 xs:h-40 sm:w-44 sm:h-48">
                {/* Atmospheric Glow */}
                <div className="absolute inset-0 bg-[#0047AB]/25 rounded-full blur-xl pointer-events-none" />
                <Image
                  src="/assets/SAKALA_MC.PNG"
                  alt="SAKALA Motorcycle Club Indonesia"
                  fill
                  sizes="(max-width: 640px) 160px, 200px"
                  className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] relative z-10"
                  priority
                />
              </div>
            </div>

            {/* Concise On-Point Description */}
            <p className="text-sm sm:text-base text-[#CBD5E1] max-w-lg leading-relaxed mb-6 sm:mb-8 font-normal">
              Bandung-born motorcycle collective & custom atelier. Built on fraternity, raw displacement, and Indonesian motorcycle heritage.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href="#garage"
                className="inline-flex items-center justify-center gap-3 bg-[#0047AB] hover:bg-[#00388A] text-white px-6 py-3.5 text-xs font-bold tracking-[0.16em] uppercase rounded-xs transition-all duration-300 shadow-lg shadow-[#0047AB]/25 btn-tactile group text-center"
              >
                <span>EXPLORE GARAGE</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </Link>

              <Link
                href="#supply"
                className="inline-flex items-center justify-center gap-3 bg-white hover:bg-[#F5F4EF] text-[#070F18] px-6 py-3.5 text-xs font-bold tracking-[0.16em] uppercase rounded-xs transition-all duration-300 shadow-md btn-tactile group text-center"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#070F18] group-hover:scale-110 transition-transform duration-200" />
                <span>SAKALA SUPPLY</span>
              </Link>
            </div>
          </div>

          {/* Right Column: SAKALA MC Official Colors Patch (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 justify-center lg:justify-end relative">
            {/* Subtle Atmospheric Glow */}
            <div className="absolute w-60 h-60 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] rounded-full bg-[#0047AB]/20 blur-3xl pointer-events-none self-center" />
            <div className="absolute w-44 h-44 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-full bg-[#C5AA00]/15 blur-2xl pointer-events-none self-center" />

            <div className="relative lg:w-[420px] lg:h-[470px] animate-fade-in animate-float-gentle will-change-transform">
              <Image
                src="/assets/SAKALA_MC.PNG"
                alt="SAKALA Motorcycle Club Indonesia Official Emblem"
                fill
                sizes="450px"
                className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:scale-103"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
