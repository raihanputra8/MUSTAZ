'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Wrench, 
  Maximize2,
  Camera,
  Layers,
  Sparkles,
  ChevronRight
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

  // Detail macro plates for photography showcase
  const defaultPlates = [
    { title: 'FULL MONOGRAPH PROFILE', image: bike.image_url, subtitle: 'Studio / Side Profile' },
    { title: 'ENGINE & DISPLACEMENT', image: (bike.gallery && bike.gallery[1]) || '/assets/culture_workshop.png', subtitle: 'Rebuilt Powerplant & Mechanical Geometry' },
    { title: 'TANK CRAFT & FINISH', image: (bike.gallery && bike.gallery[2]) || '/assets/journal_subang.png', subtitle: 'Hand-Beaten Tank & Bespoke Colorway' },
    { title: 'COCKPIT & BESPOKE DIALS', image: (bike.gallery && bike.gallery[3]) || '/assets/culture_ceremony.png', subtitle: 'Handcrafted Controls & Custom Cockpit' },
    { title: 'CHASSIS WELDS & SADDLE', image: (bike.gallery && bike.gallery[4]) || '/assets/culture_members.png', subtitle: 'De-Tabbed Frame & Hand-Stitched Leather' },
    { title: 'EXHAUST & RUNNING GEAR', image: (bike.gallery && bike.gallery[5]) || '/assets/sakala_emblem.png', subtitle: 'Bespoke Megaphone & Spoke Lacing' },
  ];

  const [activePhoto, setActivePhoto] = useState(defaultPlates[0]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Find previous and next bike from database
  const currentIndex = allBikes.findIndex((b) => b.id === bike.id);
  const prevBike = currentIndex > 0 ? allBikes[currentIndex - 1] : allBikes[allBikes.length - 1];
  const nextBike = currentIndex < allBikes.length - 1 ? allBikes[currentIndex + 1] : allBikes[0];

  return (
    <div className="flex-1">
      {/* Top Header / Garis Besar Build */}
      <section className="pt-8 pb-8 border-b border-[#E5E2D9] bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Breadcrumb Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              href="/bikes"
              className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#64748B] hover:text-[#0047AB] uppercase transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>KEMBALI KE GARAGE ARCHIVE</span>
            </Link>

            <span className="text-[10px] font-mono tracking-widest text-[#94A3B8] uppercase px-2.5 py-1 bg-white border border-[#E5E2D9] rounded-xs">
              SPECIMEN ID: {bike.id.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold tracking-[0.25em] text-[#0047AB] uppercase">
                  {bike.year} {bike.make} {bike.model}
                </span>
                <span className="text-[#C5AA00]">•</span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 bg-[#070F18] text-[#C5AA00] rounded-xs">
                  {bike.status.replace('_', ' ')}
                </span>
              </div>

              <h1 className="font-serif-editorial text-4xl sm:text-6xl font-black text-[#070F18] tracking-tight leading-tight mb-3">
                {bike.title}
              </h1>

              {/* Garis Besar Motor (Ringkas & Padat) */}
              <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-2xl font-normal">
                {bike.description || `${bike.title} adalah hasil rancang bangun atelier SAKALA Bandung berbasis ${bike.year} ${bike.make} ${bike.model}, mengedepankan reduksi bobot, geometri custom, dan performa displacement murni.`}
              </p>
            </div>

            {/* Quick Specs Highlight Chips */}
            <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end">
              {bike.specs?.displacement && (
                <div className="px-3 py-1.5 bg-white border border-[#E5E2D9] rounded-xs text-[10px] text-[#070F18]">
                  <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider font-bold">Displacement</span>
                  <strong>{bike.specs.displacement}</strong>
                </div>
              )}
              {bike.specs?.frame && (
                <div className="px-3 py-1.5 bg-white border border-[#E5E2D9] rounded-xs text-[10px] text-[#070F18]">
                  <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider font-bold">Chassis / Frame</span>
                  <strong>{bike.specs.frame}</strong>
                </div>
              )}
              {bike.specs?.workshop && (
                <div className="px-3 py-1.5 bg-white border border-[#E5E2D9] rounded-xs text-[10px] text-[#070F18]">
                  <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider font-bold">Atelier</span>
                  <strong>{bike.specs.workshop}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Big Stage Showcase */}
      <section className="bg-[#EFECE6] py-10 border-b border-[#E5E2D9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Main Showcase Viewport */}
          <div className="relative h-[380px] sm:h-[540px] lg:h-[620px] w-full rounded-sm overflow-hidden bg-white border border-[#E5E2D9] shadow-sm mb-6 group">
            <Image
              src={activePhoto.image}
              alt={`${bike.title} — ${activePhoto.title}`}
              fill
              className="object-contain p-4 sm:p-8 transition-all duration-300"
              priority
            />

            {/* Corner Badge */}
            <div className="absolute top-4 left-4 bg-[#070F18]/90 backdrop-blur-xs text-white px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase rounded-xs flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-[#C5AA00]" />
              <span>{activePhoto.title}</span>
            </div>

            {/* Zoom Lightbox Trigger */}
            <button
              onClick={() => setLightboxImage(activePhoto.image)}
              className="absolute top-4 right-4 bg-[#070F18]/80 hover:bg-[#0047AB] text-white p-2 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Perbesar Foto"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Atelier Watermark */}
            <div className="absolute bottom-6 right-6 text-right opacity-25 select-none pointer-events-none">
              <span className="font-serif-editorial text-xl sm:text-3xl font-black tracking-widest text-[#070F18]">
                SAKALA ARCHIVE • {bike.id.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Thumbnail Selector Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {defaultPlates.map((plate, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhoto(plate)}
                className={`p-2 rounded-xs border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  activePhoto.image === plate.image && activePhoto.title === plate.title
                    ? 'bg-[#070F18] text-white border-[#070F18] shadow-sm'
                    : 'bg-white text-[#475569] border-[#E5E2D9] hover:border-[#C5AA00]'
                }`}
              >
                <div className="relative w-11 h-11 bg-gray-100 rounded-xs overflow-hidden flex-shrink-0">
                  <Image
                    src={plate.image}
                    alt={plate.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] tracking-[0.2em] font-bold block uppercase opacity-70">
                    FOTO 0{idx + 1}
                  </span>
                  <span className="text-[9.5px] font-bold tracking-wider truncate block uppercase">
                    {plate.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GALERI FOTO DETAIL RESOLUSI TINGGI (DETAIL & MACRO ARCHIVE) */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-12 border-b border-[#E5E2D9]">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#0047AB] uppercase">
              GALLERY SHOWCASE
            </span>
            <span className="text-[#C5AA00]">•</span>
            <span className="text-[11px] text-[#64748B] uppercase tracking-wider">
              {defaultPlates.length} FOTO DETAIL
            </span>
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-extrabold text-[#070F18] tracking-tight">
            DETAIL &amp; MACRO PHOTOGRAPHY
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mt-2 leading-relaxed">
            Koleksi foto detail komponen, pengerjaan metal, geometri knalpot, hingga cockpit setiap motor yang dirancang bangun oleh guild SAKALA.
          </p>
        </div>

        {/* Photography Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {defaultPlates.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs hover:border-[#070F18] transition-all group flex flex-col cursor-pointer"
              onClick={() => {
                setActivePhoto(item);
                setLightboxImage(item.image);
              }}
            >
              <div className="relative h-64 w-full bg-[#EFECE6] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#070F18]/85 backdrop-blur-xs text-[#C5AA00] px-2 py-0.5 text-[8.5px] font-bold tracking-widest uppercase rounded-xs">
                  0{idx + 1} • DETAIL
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white p-1.5 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif-editorial text-base font-bold text-[#070F18] group-hover:text-[#0047AB] transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Build Record Matrix Specs Table */}
        <div className="mt-16 bg-white border border-[#E5E2D9] rounded-xs p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E5E2D9] mb-6 gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase block mb-1">
                TECHNICAL SPECIFICATION SHEET
              </span>
              <h3 className="font-serif-editorial text-2xl font-black text-[#070F18] tracking-tight">
                GARIS BESAR &amp; SPESIFIKASI BUILD
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0047AB]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#070F18]">
                AUTHENTICATED GUILD SPECIMEN
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-[#FAF9F5] border border-[#E5E2D9] rounded-xs">
              <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Base Platform</span>
              <strong className="text-sm text-[#070F18]">{bike.year} {bike.make} {bike.model}</strong>
            </div>

            <div className="p-4 bg-[#FAF9F5] border border-[#E5E2D9] rounded-xs">
              <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Build Status</span>
              <strong className="text-sm text-[#0047AB] uppercase">{bike.status.replace('_', ' ')}</strong>
            </div>

            {Object.entries(bike.specs || {}).map(([k, v]) => (
              <div key={k} className="p-4 bg-[#FAF9F5] border border-[#E5E2D9] rounded-xs">
                <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">{k}</span>
                <strong className="text-sm text-[#070F18]">{v}</strong>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5E2D9] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#64748B]">
              Tertarik membangun motor kustom dengan konsep serupa? Konsultasikan langsung dengan tim builder kami.
            </p>
            <a
              href="https://wa.me/6282126262026?text=Halo%20SAKALA,%20saya%20tertarik%20dengan%20build%20motor"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#070F18] hover:bg-[#0047AB] text-white text-xs font-bold tracking-widest uppercase rounded-xs transition-colors shrink-0"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>KONSULTASI BUILD MOTOR</span>
            </a>
          </div>
        </div>
      </section>

      {/* Previous & Next Specimen Navigation */}
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
                    ← PREVIOUS MOTOR
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
                    NEXT MOTOR →
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

      {/* Lightbox Modal for High-Res Detail Inspection */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={lightboxImage}
              alt="Detail Inspection"
              fill
              className="object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-xs font-bold tracking-widest uppercase rounded-xs"
            >
              TUTUP (ESC)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
