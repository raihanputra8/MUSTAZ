'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, Wrench, Eye } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const PLATES = [
  { id: 1, title: 'FULL RIGHT PROFILE', image: '/assets/bike_cb550.png' },
  { id: 2, title: 'COCKPIT & SPEEDO', image: '/assets/culture_workshop.png' },
  { id: 3, title: 'QUAD CR29 STACKS', image: '/assets/culture_ceremony.png' },
  { id: 4, title: 'TIG PIE-CUT WELDS', image: '/assets/journal_subang.png' },
  { id: 5, title: 'KUJANG LEAF EMBOSS', image: '/assets/culture_members.png' },
];

const EVIDENCE_CARDS = [
  {
    tag: 'PLATE A.1 — 304 STAINLESS TIG SEAM',
    desc: 'Purged pie-cuts on the 4-into-1 collector showing uniform weld bead penetration and natural heat bloom before final passivation.',
    image: '/assets/culture_workshop.png',
  },
  {
    tag: 'PLATE A.2 — JAVANESE VEG-TAN SEAT',
    desc: '4mm thick local vegetable-tanned hide hand-stitched over high-density closed-cell neoprene foam with raw brass rivets.',
    image: '/assets/manifesto_thumb.png',
  },
  {
    tag: 'PLATE A.3 — INITIAL RECOVERY (CIREBON)',
    desc: 'Day 01 documentation of chassis #1029482 prior to chemical strip, acoustic ultrasonic cleaning, and crack inspection.',
    image: '/assets/journal_subang.png',
  },
  {
    tag: 'PLATE A.4 — 24K LEAF EMBOSSMENT',
    desc: 'Master artisan applying Japanese gold foil leaves onto hand-burnished size varnish along the contoured tank flank.',
    image: '/assets/culture_ceremony.png',
  },
  {
    tag: 'PLATE A.5 — SHAKEDOWN AT ELEVATION',
    desc: '5:45 AM thermal shakedown run at 1,350m elevation. Air temp 14°C, barometric pressure 86 kPa. Carburation confirmed crisp.',
    image: '/assets/bike_sportster.png',
  },
  {
    tag: 'PLATE A.6 — CNC COCKPIT MACHINING',
    desc: 'Top-down perspective of the flush-integrated Motoscope Tiny dial within our 5-axis CNC 6061-T6 steering yoke plate.',
    image: '/assets/bike_xs650.png',
  },
];

export default function BikeDetailPage() {
  const [activePlate, setActivePlate] = useState(PLATES[0]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F5]">
      <Navbar />

      <main className="flex-1">
        {/* Top Header */}
        <section className="pt-10 pb-6 border-b border-[#E5E2D9]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <Link
              href="/#garage"
              className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#64748B] hover:text-[#070F18] uppercase mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO GARAGE ARCHIVE</span>
            </Link>

            <h1 className="font-serif-editorial text-4xl sm:text-6xl font-black text-[#070F18] tracking-tight leading-tight mb-4">
              1978 HONDA CB550 FOUR <span className="italic text-[#0047AB]">"KUJANG GOLD"</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#475569] max-w-3xl leading-relaxed">
              Forged to dominate the jagged elevation changes between Lembang, Tangkuban Perahu, and the Subang tea escarpment. An uncompromising mechanical synthesis of Sundanese bladecraft and Japanese four-cylinder precision.
            </p>
          </div>
        </section>

        {/* Big Stage Showcase */}
        <section className="bg-[#EFECE6] py-10 border-b border-[#E5E2D9]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="relative h-[420px] sm:h-[560px] w-full rounded-sm overflow-hidden bg-white border border-[#E5E2D9] shadow-inner mb-6">
              <Image
                src={activePlate.image}
                alt={activePlate.title}
                fill
                className="object-contain p-4 transition-all duration-300"
                priority
              />

              {/* Watermark Tag */}
              <div className="absolute bottom-6 right-6 text-right opacity-30 select-none pointer-events-none">
                <span className="font-serif-editorial text-2xl sm:text-3xl font-black tracking-widest text-black">
                  SAKALA SPEED • 01
                </span>
              </div>
            </div>

            {/* Plate Selector Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {PLATES.map((plate) => (
                <button
                  key={plate.id}
                  onClick={() => setActivePlate(plate)}
                  className={`p-2.5 rounded-xs border text-left flex items-center gap-3 transition-all ${
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
        <section className="py-20 max-w-7xl mx-auto px-6 lg:px-12 border-b border-[#E5E2D9]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column: Chronicle & Narrative */}
            <div className="lg:col-span-7">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#0047AB] uppercase block mb-3">
                CHRONICLE ENTRY — CHAPTER 01 • BANDUNG SPEED ARCHIVES
              </span>

              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-extrabold text-[#070F18] leading-tight mb-6">
                THE PHILOSOPHY OF KUJANG GOLD: SUNDANESE METALLURGY & 9,000 RPM RESILIENCE
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-[#475569] leading-relaxed mb-8">
                <p>
                  The donor machine was recovered from an open-air timber warehouse outside Cirebon in late 2024. Half-submerged in clay silt, its cylinder heads locked by thirty years of tropical humidity, the 1978 CB550 had surrendered its dignity to the elements. Most custom shops would have stripped its side-covers and sold the frame for scrap. For SAKALA, it represented the rawest possible substrate: an engine architectural lineage engineered for sustained high-rpm breath, paired with a silhouette begging to be purged of 1970s bloat.
                </p>
              </div>

              {/* Highlight Quote */}
              <div className="bg-[#FAF9F5] border-l-4 border-[#C5AA00] p-6 sm:p-8 rounded-r mb-8">
                <blockquote className="font-serif-editorial text-lg sm:text-xl font-bold text-[#070F18] italic leading-snug mb-3">
                  “We don't build machines to sit under showroom halogen spotlights. Every seam was fused with the hard expectation of monsoon mud, high oil pressure, and full-throttle climbs through the mist of Tangkuban Perahu.”
                </blockquote>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase block">
                  — M. DARMADI, HEAD FABRICATOR AT SAKALA CIROYOM
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#475569] leading-relaxed">
                <p>
                  Over 14 months and 840 documented workshop hours, the mill was bored to 588cc using bespoke Wiseco forged slugs, balanced against a lightened and micro-polished crankshaft. The Sundanese Kujang—a ceremonial curved blade symbolizing courage and spiritual sovereignty in Parahyangan lore—governed the machine's physical gesture. The handcrafted tank line swoops like the spine of the traditional dagger, crowned with genuine 24-karat gold leaf beaten into the bare aluminum grain before being lacquered in petrol-resistant satin clear.
                </p>
                <p>
                  Suspension was re-engineered not for the flat promenades of European capitals, but for the undulating, rain-gutted asphalt of the Subang canyon. Showa 41mm inverted legs were shortened and re-valved with progressive hydraulic bump-stops, then mated to our in-house CNC triple-tree with 28mm offset. The result is a machine that does not merely turn; it bites into mountain pavement like tempered high-carbon steel.
                </p>
              </div>
            </div>

            {/* Right Column: Build Record Matrix */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#E5E2D9] rounded-xs p-6 sm:p-8 shadow-xs sticky top-28">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9] mb-6">
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase block">
                      ATELIER IDENTITY
                    </span>
                    <h3 className="font-serif-editorial text-xl font-black text-[#070F18] tracking-tight">
                      BUILD RECORD MATRIX
                    </h3>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#0047AB]" />
                </div>

                <div className="divide-y divide-[#E5E2D9] text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                      GUILD WORKSHOP
                    </span>
                    <span className="font-bold text-[#070F18]">SAKALA Ciroyom Guild, Bandung</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                      LEAD FABRICATOR
                    </span>
                    <span className="font-bold text-[#070F18]">M. Darmadi</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                      ENGINE MACHINIST
                    </span>
                    <span className="font-bold text-[#070F18]">Hendra Kusuma (HK Racing)</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                      LEAF & LACQUER
                    </span>
                    <span className="font-bold text-[#070F18]">Studio 26 Bandung</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between bg-[#0047AB]/5 px-2 rounded">
                    <span className="text-[#0047AB] uppercase tracking-wider font-bold text-[10px]">
                      LABOR TIME
                    </span>
                    <span className="font-extrabold text-[#0047AB]">840 Certified Hours</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                      DONOR MACHINE
                    </span>
                    <span className="font-bold text-[#070F18]">1978 CB550F Super Sport</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                      ACQUISITION LOC
                    </span>
                    <span className="font-bold text-[#070F18]">Cirebon, West Java (Barn Find)</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                      CURB WEIGHT (WET)
                    </span>
                    <span className="font-bold text-[#070F18]">164 KG (-38 KG vs Stock)</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                      WEIGHT BIAS
                    </span>
                    <span className="font-bold text-[#070F18]">51% Front / 49% Rear</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[10px]">
                      COMPRESSION RATIO
                    </span>
                    <span className="font-bold text-[#C5AA00]">10.5:1 (High Octane 98 RON)</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E5E2D9]">
                  <Link
                    href="/#circle"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#070F18] hover:bg-[#0047AB] text-white py-3.5 text-xs font-bold tracking-[0.18em] uppercase rounded-xs transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>INQUIRE COMMISSION BUILD</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Essay: Material Evidence & Field Tests */}
        <section className="py-20 bg-[#F5F4EF] border-b border-[#E5E2D9]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#0047AB] uppercase block mb-2">
                  BUILD CHRONOLOGY ARCHIVE — PHOTO ESSAY
                </span>
                <h2 className="font-serif-editorial text-3xl sm:text-4xl font-black text-[#070F18] tracking-tight">
                  MATERIAL EVIDENCE & FIELD TESTS
                </h2>
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase">
                LOCATION: BANDUNG • CIROYOM • SUBANG PASS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {EVIDENCE_CARDS.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs group"
                >
                  <div className="relative h-60 w-full bg-[#E5E2D9] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.tag}
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[9px] font-bold tracking-[0.2em] text-[#0047AB] uppercase block mb-2">
                      {item.tag}
                    </span>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Previous & Next Specimen Navigation */}
        <section className="py-12 bg-white border-b border-[#E5E2D9]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E2D9]">
              {/* Previous */}
              <div className="flex items-center gap-4 group cursor-pointer pr-4">
                <div className="relative w-16 h-16 bg-gray-100 rounded-xs overflow-hidden flex-shrink-0 border border-[#E5E2D9]">
                  <Image
                    src="/assets/bike_sportster.png"
                    alt="1982 BMW R80/7"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#64748B] uppercase block">
                    ← PREVIOUS SPECIMEN — BUILD 18 OF 18
                  </span>
                  <h4 className="font-serif-editorial text-base font-bold text-[#070F18] group-hover:text-[#0047AB] transition-colors">
                    1982 BMW R80/7 'BADAK HITAM'
                  </h4>
                  <p className="text-[10px] text-[#94A3B8]">
                    Heavyweight boxer enduro with 1000cc Siebenrock big-bore conversion.
                  </p>
                </div>
              </div>

              {/* Next */}
              <div className="flex items-center justify-between gap-4 group cursor-pointer pt-6 sm:pt-0 sm:pl-8">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#0047AB] uppercase block">
                    NEXT SPECIMEN — BUILD 02 OF 18 →
                  </span>
                  <h4 className="font-serif-editorial text-base font-bold text-[#070F18] group-hover:text-[#0047AB] transition-colors">
                    1982 YAMAHA XS650 'NIGHT CRAWLER'
                  </h4>
                  <p className="text-[10px] text-[#94A3B8]">
                    Parallel twin street tracker engineered for nocturnal Bandung urban sprints.
                  </p>
                </div>
                <div className="relative w-16 h-16 bg-gray-100 rounded-xs overflow-hidden flex-shrink-0 border border-[#E5E2D9]">
                  <Image
                    src="/assets/bike_xs650.png"
                    alt="1982 Yamaha XS650"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
