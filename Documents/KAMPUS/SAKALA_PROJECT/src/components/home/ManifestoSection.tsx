'use client';

import React from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/common/ScrollReveal';

export default function ManifestoSection() {
  return (
    <section id="manifesto" className="bg-[#F5F4EF] py-20 lg:py-28 border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: The Manifesto */}
          <ScrollReveal direction="up" delay={50} className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#0047AB] uppercase mb-4 block">
                — 01 — THE MANIFESTO
              </span>

              <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#070F18] leading-[1.15] mb-8">
                FORGED IN OIL, STEEL & UNCOMPROMISING SOLIDARITY.
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-[#475569] leading-relaxed">
                <p>
                  Sakala was founded in Bandung as a refuge for individuals who honor the tactile weight of mechanical machinery and the eternal code of brotherhood.
                </p>
                <p>
                  We do not measure our club in mass numbers or social validation. We measure it in cold midnight climbs through mountain passes, scarred knuckles in the Ciroyom workshop, and commitments kept without negotiation.
                </p>
              </div>
            </div>

            {/* Guild Insignia Badge */}
            <div className="mt-10 pt-6 border-t border-[#E5E2D9] flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#070F18] flex items-center justify-center p-1.5 flex-shrink-0 transition-transform hover:scale-110 duration-300">
                <Image
                  src="/assets/sakala_emblem.png"
                  alt="Guild Insignia"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-bold tracking-[0.16em] text-[#070F18] uppercase block">
                  SAKALA EMBLEM
                </span>
                <span className="text-[10px] tracking-[0.2em] text-[#64748B] uppercase block">
                  WEST JAVA HERITAGE GUILD
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: Canonical Credo & 3 Pillars */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <ScrollReveal direction="up" delay={150}>
              <div className="bg-[#FAF9F5] p-8 sm:p-10 border border-[#E5E2D9] rounded-sm mb-10 shadow-xs card-interactive">
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#C5AA00] uppercase mb-3 block">
                  CANONICAL CREDO
                </span>
                <blockquote className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#070F18] leading-snug mb-6">
                  “SAKALA IS MORE THAN A MOTORCYCLE. IT IS THE PEOPLE, THE ROAD, AND THE STORIES WE CREATE TOGETHER.”
                </blockquote>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Every motorcycle built under our roof carries a registry number, an immutable service plate, and the vow that no brother rides stranded. In an era of disposable digital trends, we practice physical permanence.
                </p>
              </div>
            </ScrollReveal>

            {/* 3 Pillars Cards with Staggered ScrollReveal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Pillar 01 */}
              <ScrollReveal direction="up" delay={200}>
                <div className="bg-white p-5 border border-[#E5E2D9] rounded-xs shadow-xs card-interactive h-full flex flex-col justify-between hover:border-[#070F18]">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase mb-2">
                      <span>01 / PILLAR</span>
                      <span className="w-1.5 h-1.5 bg-[#070F18]" />
                    </div>
                    <h3 className="font-serif-editorial text-base font-bold text-[#070F18] mb-2 tracking-wide">
                      BROTHERHOOD
                    </h3>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">
                      Unconditional allegiance on and off the asphalt. We ride as one unified column.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Pillar 02 */}
              <ScrollReveal direction="up" delay={280}>
                <div className="bg-white p-5 border border-[#E5E2D9] rounded-xs shadow-xs card-interactive h-full flex flex-col justify-between hover:border-[#0047AB]">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase mb-2">
                      <span>02 / PILLAR</span>
                      <span className="w-1.5 h-1.5 bg-[#0047AB]" />
                    </div>
                    <h3 className="font-serif-editorial text-base font-bold text-[#070F18] mb-2 tracking-wide">
                      LOYALTY
                    </h3>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">
                      Devotion to the craft, our brothers, and the discipline of custom motorcycling.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Pillar 03 */}
              <ScrollReveal direction="up" delay={360}>
                <div className="bg-white p-5 border border-[#E5E2D9] rounded-xs shadow-xs card-interactive h-full flex flex-col justify-between hover:border-[#C5AA00]">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase mb-2">
                      <span>03 / PILLAR</span>
                      <span className="w-1.5 h-1.5 bg-[#C5AA00]" />
                    </div>
                    <h3 className="font-serif-editorial text-base font-bold text-[#070F18] mb-2 tracking-wide">
                      CIRCLE
                    </h3>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">
                      A closed ecosystem of builders, artisans, and riders anchored in Bandung.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
