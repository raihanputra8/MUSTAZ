'use client';

import React from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/common/ScrollReveal';

export default function CultureSection() {
  return (
    <section id="culture" className="bg-[#070F18] text-white py-16 lg:py-24 border-b border-[#C5AA00]/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <ScrollReveal direction="up" delay={50} className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-end">
          <div className="lg:col-span-7">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase mb-2 block">
              04 / CULTURE — CLUB ACTIVITIES
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              BROTHERHOOD IN MOTION
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed border-l-2 border-[#C5AA00] pl-3">
              Bandung chapter gatherings, garage nights, and sacred club declarations.
            </p>
          </div>
        </ScrollReveal>

        {/* 4-Item Documentary Collage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Top Left: SAKALA MC Insignia Patch Artwork */}
          <ScrollReveal direction="up" delay={100} className="md:col-span-5">
            <div className="relative h-72 sm:h-80 rounded-xs overflow-hidden border border-[#C5AA00]/20 bg-[#0C1724] group card-interactive">
              <Image
                src="/assets/culture_patch.png"
                alt="Sakala MC Insignia"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </ScrollReveal>

          {/* Top Right: Padepokan Parukuyan Declaration Photo */}
          <ScrollReveal direction="up" delay={160} className="md:col-span-7">
            <div className="relative h-72 sm:h-80 rounded-xs overflow-hidden border border-[#C5AA00]/20 group card-interactive">
              <Image
                src="/assets/culture_ceremony.png"
                alt="Declaration of Sakala MC at Padepokan Parukuyan"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 transition-opacity duration-300">
                <p className="text-xs text-white font-medium max-w-lg leading-relaxed">
                  Padepokan Parukuyan. Standing strong with Indonesian local heritage and tradition.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Bottom Left: The Pack Formation */}
          <ScrollReveal direction="up" delay={220} className="md:col-span-5">
            <div className="relative h-64 sm:h-72 rounded-xs overflow-hidden border border-[#C5AA00]/20 group card-interactive">
              <Image
                src="/assets/culture_workshop.png"
                alt="Workshop Pack Formation"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
          </ScrollReveal>

          {/* Bottom Right: Brotherhood Monarchy Registry */}
          <ScrollReveal direction="up" delay={280} className="md:col-span-7">
            <div className="relative h-64 sm:h-72 rounded-xs overflow-hidden border border-[#C5AA00]/20 group card-interactive">
              <Image
                src="/assets/culture_members.png"
                alt="Sakala Brotherhood Members"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
