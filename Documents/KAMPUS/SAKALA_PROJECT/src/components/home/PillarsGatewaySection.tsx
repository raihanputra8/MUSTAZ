'use client';

import React from 'react';
import Image from 'next/image';

import bannerImg from '../../../public/assets/sakala_pillars_banner_v2.png';

export default function PillarsGatewaySection() {
  return (
    <section 
      aria-label="SAKALA Four Pillars Gateway"
      className="w-full relative bg-[#002243] overflow-hidden p-0 m-0 border-b border-[#C5AA00]/30"
    >
      {/* 
        High-Fidelity Archival Gateway with Skull Watermark
        Uses object-contain with matching #002243 background so the complete artwork 
        (all 4 pillars from capital crowns to base pedestals, plus the skull and SAKALA MC emblem)
        is 100% visible without any cropping or cut-off on all screen ratios.
      */}
      <div className="w-full relative flex items-center justify-center bg-[#002243] py-4 sm:py-6 lg:py-8 px-2 sm:px-6">
        <div className="w-full max-w-[1920px] aspect-[16/9] max-h-[85vh] relative overflow-hidden select-none">
          <Image
            src={bannerImg}
            alt="SAKALA Motorcycle Club — Four Pillars Archival Gateway"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-contain w-full h-full block select-none"
          />
        </div>
      </div>

      {/* Subtle bottom decorative line highlight */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5AA00]/40 to-transparent pointer-events-none" />
    </section>
  );
}
