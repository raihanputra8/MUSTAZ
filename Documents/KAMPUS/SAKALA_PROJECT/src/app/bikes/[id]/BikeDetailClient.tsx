'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Wrench, 
  Eye, 
  Layers, 
  Calendar, 
  Tag, 
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Bike } from '@/types/database';
import EditableWrapper from '@/components/cms/EditableWrapper';
import { useInlineCMS } from '@/context/InlineCMSContext';

interface BikeDetailClientProps {
  bike: Bike;
  allBikes: Bike[];
}

export default function BikeDetailClient({ bike, allBikes }: BikeDetailClientProps) {
  const { isEditMode } = useInlineCMS();

  // Plates for the showcase stage
  const plates = [
    { id: 1, title: 'PRIMARY PROFILE', image: bike.image_url, subtitle: 'Studio / Field Monograph' },
    { id: 2, title: 'ENGINE ARCHITECTURE', image: '/assets/culture_workshop.png', subtitle: 'Displacement & Tuning' },
    { id: 3, title: 'CHASSIS & GEOMETRY', image: '/assets/journal_subang.png', subtitle: 'Bespoke Frame Geometry' },
    { id: 4, title: 'METAL FABRICATION', image: '/assets/culture_ceremony.png', subtitle: 'Hand-Hammered Bodywork' },
    { id: 5, title: 'COCKPIT & DIALS', image: '/assets/culture_members.png', subtitle: 'Precision Controls' },
  ];

  const [activePlate, setActivePlate] = useState(plates[0]);

  // Find previous and next bike from database
  const currentIndex = allBikes.findIndex((b) => b.id === bike.id);
  const prevBike = currentIndex > 0 ? allBikes[currentIndex - 1] : allBikes[allBikes.length - 1];
  const nextBike = currentIndex < allBikes.length - 1 ? allBikes[currentIndex + 1] : allBikes[0];

  return (
    <div className="flex-1">
      {/* Top Header / Breadcrumbs */}
      <section className="pt-8 pb-6 border-b border-[#E5E2D9] bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              href="/bikes"
              className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#64748B] hover:text-[#0047AB] uppercase transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO GARAGE ARCHIVE</span>
            </Link>

            <span className="text-[10px] font-mono tracking-widest text-[#94A3B8] uppercase px-2.5 py-1 bg-white border border-[#E5E2D9] rounded-xs">
              SPECIMEN ID: {bike.id.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold tracking-[0.25em] text-[#0047AB] uppercase">
                  {bike.year} {bike.make} {bike.model}
                </span>
                <span className="text-[#C5AA00]">•</span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 bg-[#070F18] text-[#C5AA00] rounded-xs">
                  {bike.status.replace('_', ' ')}
                </span>
              </div>

              <h1 className="font-serif-editorial text-4xl sm:text-6xl font-black text-[#070F18] tracking-tight leading-tight">
                {bike.title}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] max-w-md leading-relaxed font-normal">
              Bandung-built custom machine by SAKALA Atelier. Handcrafted fabrication, bespoke geometry, and race-tuned displacement.
            </p>
          </div>
        </div>
      </section>

      {/* Main Big Stage Showcase */}
      <section className="bg-[#EFECE6] py-10 border-b border-[#E5E2D9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Main Showcase Viewport */}
          <div className="relative h-[380px] sm:h-[540px] lg:h-[620px] w-full rounded-sm overflow-hidden bg-white border border-[#E5E2D9] shadow-sm mb-6 group">
            <Image
              src={activePlate.image}
              alt={`${bike.title} — ${activePlate.title}`}
              fill
              className="object-contain p-4 sm:p-8 transition-all duration-300"
              priority
            />

            {/* Corner Badge */}
            <div className="absolute top-4 left-4 bg-[#070F18]/90 backdrop-blur-xs text-white px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase rounded-xs">
              {activePlate.title}
            </div>

            {/* Atelier Watermark */}
            <div className="absolute bottom-6 right-6 text-right opacity-25 select-none pointer-events-none">
              <span className="font-serif-editorial text-xl sm:text-3xl font-black tracking-widest text-[#070F18]">
                SAKALA GARAGE • {bike.id.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Interactive Plate Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {plates.map((plate) => (
              <button
                key={plate.id}
                onClick={() => setActivePlate(plate)}
                className={`p-2.5 rounded-xs border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  activePlate.id === plate.id
                    ? 'bg-[#070F18] text-white border-[#070F18] shadow-sm'
                    : 'bg-white text-[#475569] border-[#E5E2D9] hover:border-[#C5AA00]'
                }`}
              >
                <div className="relative w-10 h-10 bg-gray-100 rounded-xs overflow-hidden flex-shrink-0">
                  <Image
                    src={plate.image}
                    alt={plate.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] tracking-[0.2em] font-bold block uppercase opacity-70">
                    PLATE 0{plate.id}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider truncate block uppercase">
                    {plate.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Chronicle Entry & Build Record Matrix */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-12 border-b border-[#E5E2D9]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Build Narrative & Philosophy */}
          <div className="lg:col-span-7">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#0047AB] uppercase block mb-3">
              CHRONICLE ENTRY • SAKALA BUILD ARCHIVE
            </span>

            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-extrabold text-[#070F18] leading-tight mb-6">
              THE PHILOSOPHY OF {bike.title.toUpperCase()}: DISPLACEMENT, GEOMETRY &amp; RAW METAL
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#475569] leading-relaxed mb-8">
              <p>
                Recovered and reconstituted within our Ciroyom guild, <strong>{bike.title}</strong> is an uncompromising mechanical synthesis built to conquer the steep climbs and punishing monsoon passes of West Java. Built on the foundation of a {bike.year} {bike.make} {bike.model}, every redundant component was stripped down to raw displacement.
              </p>
            </div>

            {/* Highlight Quote */}
            <div className="bg-[#FAF9F5] border-l-4 border-[#C5AA00] p-6 sm:p-8 rounded-r mb-8">
              <blockquote className="font-serif-editorial text-lg sm:text-xl font-bold text-[#070F18] italic leading-snug mb-3">
                “We don&apos;t build machines for static pedestals. Every bead of weld was laid down with the expectation of high oil temperatures, elevation changes, and midnight rides through the Cikole mist.”
              </blockquote>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase block">
                — SAKALA ATELIER FABRICATION TEAM • BANDUNG
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#475569] leading-relaxed">
              <p>
                From hand-shaped aluminum bodywork to custom stainless exhaust geometries, {bike.title} embodies our character-first ethos: an ode to vintage displacement balanced with modern road discipline.
              </p>
            </div>
          </div>

          {/* Right Column: Build Record Matrix (Synchronized directly with Database Specs) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E5E2D9] rounded-xs p-6 sm:p-8 shadow-xs sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9] mb-6">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase block">
                    ATELIER DOSSIER
                  </span>
                  <h3 className="font-serif-editorial text-xl font-black text-[#070F18] tracking-tight">
                    BUILD RECORD MATRIX
                  </h3>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#0047AB]" />
              </div>

              {/* Specs List pulled from Supabase Database */}
              <div className="divide-y divide-[#E5E2D9] text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                    BASE MACHINE
                  </span>
                  <span className="font-bold text-[#070F18]">
                    {bike.year} {bike.make} {bike.model}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                    STATUS
                  </span>
                  <span className="font-bold text-[#0047AB] uppercase">
                    {bike.status.replace('_', ' ')}
                  </span>
                </div>

                {Object.entries(bike.specs || {}).map(([key, val]) => (
                  <div key={key} className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                      {key}
                    </span>
                    <span className="font-bold text-[#070F18] text-right truncate max-w-[200px]">
                      {val}
                    </span>
                  </div>
                ))}

                <div className="py-2.5 flex items-center justify-between bg-[#0047AB]/5 px-2 rounded">
                  <span className="text-[#0047AB] uppercase tracking-wider font-bold text-[10px]">
                    ATELIER ORIGIN
                  </span>
                  <span className="font-extrabold text-[#0047AB]">SAKALA Ciroyom, Bandung</span>
                </div>
              </div>

              {/* Commission CTA */}
              <div className="mt-8 pt-6 border-t border-[#E5E2D9]">
                <Link
                  href="/#newsletter"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#070F18] hover:bg-[#0047AB] text-white py-3.5 text-xs font-bold tracking-[0.18em] uppercase rounded-xs transition-colors btn-tactile"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>INQUIRE COMMISSION BUILD</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Previous & Next Specimen Navigation (Synchronized with Database) */}
      <section className="py-12 bg-white border-b border-[#E5E2D9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E2D9]">
            {/* Previous Specimen */}
            {prevBike && (
              <Link 
                href={`/bikes/${prevBike.id}`}
                className="flex items-center gap-4 group cursor-pointer pr-4 hover:opacity-90 transition-opacity"
              >
                <div className="relative w-16 h-16 bg-[#EFECE6] rounded-xs overflow-hidden flex-shrink-0 border border-[#E5E2D9]">
                  <Image
                    src={prevBike.image_url}
                    alt={prevBike.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#64748B] uppercase block">
                    ← PREVIOUS SPECIMEN
                  </span>
                  <h4 className="font-serif-editorial text-base font-bold text-[#070F18] group-hover:text-[#0047AB] transition-colors">
                    {prevBike.year} {prevBike.make} {prevBike.title}
                  </h4>
                  <p className="text-[10px] text-[#94A3B8]">
                    {prevBike.model} • {prevBike.status.replace('_', ' ')}
                  </p>
                </div>
              </Link>
            )}

            {/* Next Specimen */}
            {nextBike && (
              <Link
                href={`/bikes/${nextBike.id}`}
                className="flex items-center justify-between gap-4 group cursor-pointer pt-6 sm:pt-0 sm:pl-8 hover:opacity-90 transition-opacity"
              >
                <div>
                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#0047AB] uppercase block">
                    NEXT SPECIMEN →
                  </span>
                  <h4 className="font-serif-editorial text-base font-bold text-[#070F18] group-hover:text-[#0047AB] transition-colors">
                    {nextBike.year} {nextBike.make} {nextBike.title}
                  </h4>
                  <p className="text-[10px] text-[#94A3B8]">
                    {nextBike.model} • {nextBike.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="relative w-16 h-16 bg-[#EFECE6] rounded-xs overflow-hidden flex-shrink-0 border border-[#E5E2D9]">
                  <Image
                    src={nextBike.image_url}
                    alt={nextBike.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
