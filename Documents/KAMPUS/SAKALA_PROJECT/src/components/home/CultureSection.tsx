'use client';

import React from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/common/ScrollReveal';

export default function CultureSection() {
  return (
    <section id="culture" className="bg-[#070F18] text-white py-20 lg:py-28 border-b border-[#C5AA00]/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <ScrollReveal direction="up" delay={50} className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14 items-end">
          <div className="lg:col-span-7">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase mb-3 block">
              04 — COMMUNITY & FELLOWSHIP
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              MORE THAN A BRAND — A LIVING CULTURE
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed italic border-l-2 border-[#C5AA00] pl-4">
              “The machine gives you speed; the circle gives you purpose.” An unfiltered look into rides, garage midnight shifts, and the brotherhood.
            </p>
          </div>
        </ScrollReveal>

        {/* 4-Item Documentary Collage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Top Left: SAKALA MC Insignia Patch Artwork */}
          <ScrollReveal direction="up" delay={120} className="md:col-span-5">
            <div className="relative h-80 sm:h-96 rounded-xs overflow-hidden border border-[#C5AA00]/20 bg-[#0C1724] group card-interactive">
              <Image
                src="/assets/culture_patch.png"
                alt="Sakala MC Insignia"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </ScrollReveal>

          {/* Top Right: Padepokan Parukuyan Declaration Photo */}
          <ScrollReveal direction="up" delay={200} className="md:col-span-7">
            <div className="relative h-80 sm:h-96 rounded-xs overflow-hidden border border-[#C5AA00]/20 group card-interactive">
              <Image
                src="/assets/culture_ceremony.png"
                alt="Declaration of Sakala MC at Padepokan Parukuyan"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-8 transition-opacity duration-300">
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#C5AA00] uppercase mb-1">
                  SUNDAY, JULY 5, 2026
                </span>
                <p className="text-xs sm:text-sm text-white font-medium max-w-lg leading-relaxed">
                  The declaration of Sakala MC was successfully held at Padepokan Parukuyan. Standing strong hand-in-hand with the beauty of local arts and culture.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Bottom Left: The Pack Formation */}
          <ScrollReveal direction="up" delay={260} className="md:col-span-4">
            <div className="relative h-72 sm:h-80 rounded-xs overflow-hidden border border-[#C5AA00]/20 group card-interactive">
              <Image
                src="/assets/culture_workshop.png"
                alt="Workshop Pack Formation"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-4 left-4 bg-black/80 px-2.5 py-1 rounded-xs backdrop-blur-xs border border-white/10">
                <span className="text-[9px] font-bold tracking-[0.2em] text-white uppercase">
                  THE PACK FORMATION
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* Bottom Right: Brotherhood Monarchy Registry */}
          <ScrollReveal direction="up" delay={320} className="md:col-span-8">
            <div className="relative h-72 sm:h-80 rounded-xs overflow-hidden border border-[#C5AA00]/20 group card-interactive">
              <Image
                src="/assets/culture_members.png"
                alt="Sakala Brotherhood Members"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-4 left-4 bg-black/80 px-2.5 py-1 rounded-xs backdrop-blur-xs border border-[#C5AA00]/30">
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#C5AA00] uppercase">
                  BANDUNG CHAPTER • FOUNDING DIVISION
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
