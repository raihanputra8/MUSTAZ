'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import EditableWrapper from '@/components/cms/EditableWrapper';

export default function HeroSection() {
  return (
    <section className="relative bg-[#070F18] text-white overflow-hidden border-b border-[#C5AA00]/25">
      {/* Top Editorial Masthead Bar */}
      <div className="border-b border-white/10 px-4 sm:px-6 lg:px-12 py-2.5 text-[10px] sm:text-xs text-[#94A3B8] font-medium tracking-wider flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5AA00]" />
          BANDUNG, JAWA BARAT
        </span>
        <span className="hidden sm:inline-block text-[#CBD5E1]">
          PERSAUDARAAN RODA DUA &amp; KUSTOM INDONESIA
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16 lg:py-20">
        <EditableWrapper
          item={{
            type: 'content',
            id: 'home_hero',
            data: {
              key: 'hero_title',
              label: 'Judul Utama Hero',
              value: 'SAKALA MOTORCYCLE CLUB',
              description:
                'Klub motor dan ruang karya dari Bandung. Berjalan bersama atas dasar persaudaraan, motor kustom, dan catatan perjalanan nyata.',
              image_url: '/assets/SAKALA_MC.PNG',
            },
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Editorial Lead & Ethos (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <span className="text-[11px] sm:text-xs font-bold text-[#C5AA00] uppercase tracking-widest mb-3 block">
                CATATAN PERJALANAN &amp; GARASI
              </span>

              <h1 className="font-serif-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.95] mb-4">
                SAKALA
                <span className="block text-2xl sm:text-4xl md:text-5xl font-light text-[#E2E8F0] tracking-normal mt-1">
                  MOTORCYCLE CLUB
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#CBD5E1] max-w-xl leading-relaxed mb-8 font-normal">
                Klub motor dan ruang karya dari Bandung. Berjalan bersama atas dasar persaudaraan, perawatan mesin kustom, dan catatan perjalanan nyata melintasi tanah Pasundan.
              </p>

              {/* Editorial Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="#garage"
                  className="inline-flex items-center gap-2.5 bg-[#0047AB] hover:bg-[#00388A] text-white px-5 sm:px-6 py-3 sm:py-3.5 text-xs font-bold tracking-wider uppercase rounded-xs transition-colors shadow-md"
                >
                  <span>GARASI &amp; SPESIFIKASI MOTOR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="#journal"
                  className="inline-flex items-center gap-2.5 bg-transparent hover:bg-white/5 text-white border border-white/20 hover:border-white px-5 sm:px-6 py-3 sm:py-3.5 text-xs font-bold tracking-wider uppercase rounded-xs transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-[#C5AA00]" />
                  <span>JURNAL PERJALANAN</span>
                </Link>
              </div>
            </div>

            {/* Right: Authentic Photograph Frame with Club Emblem (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full relative border border-white/15 bg-[#0C1724] p-3 sm:p-4 rounded-xs shadow-2xl">
                {/* Real Photo: Members riding on mountain route */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1E293B]">
                  <Image
                    src="/assets/culture_members.png"
                    alt="Anggota Sakala Motorcycle Club melintasi jalur kabut"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Real Club Patch Emblem Badge */}
                  <div className="absolute bottom-3 right-3 w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    <Image
                      src="/assets/SAKALA_MC.PNG"
                      alt="Logo Resmi Sakala MC"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Editorial Caption Tag */}
                <div className="pt-3 px-1 flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span className="font-mono text-[10px] text-[#C5AA00]">
                    DOKUMENTASI #01
                  </span>
                  <span className="italic truncate ml-2">
                    Jalur Kabut Tangkuban Perahu – Subang
                  </span>
                </div>
              </div>
            </div>
          </div>
        </EditableWrapper>
      </div>
    </section>
  );
}
