'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Compass, 
  Users, 
  Crosshair, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  BookOpen,
  Info,
  ChevronDown
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  const [expandedTradition, setExpandedTradition] = useState<string | null>(null);
  const [showFullSundaContext, setShowFullSundaContext] = useState(false);
  const [showPillarsPhilosophy, setShowPillarsPhilosophy] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F5] text-[#070F18] selection:bg-[#F0D000] selection:text-black">
      <Navbar />


      <main className="flex-1">
        {/* SECTION 1: HERO — THE MANIFEST REALM & BROTHERHOOD */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Editorial Headline & Origin Statement */}
            <div className="lg:col-span-7 space-y-8">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block">
                FOUNDED IN BANDUNG • EST. 2026
              </span>

              <h1 className="font-serif-editorial text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#070F18] leading-[1.05]">
                THE MANIFEST<br />
                REALM,<br />
                <span className="italic font-normal font-serif text-[#0050A0]">&amp;</span><br />
                <span className="italic font-normal font-serif">BROTHERHOOD.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl font-normal">
                Founded in Bandung in 2026 by <strong>Adil Lothar Hasan</strong>. We are an exclusive brotherhood that honors the humanity in every member. We are motorcycle-agnostic and character-selective. A circle, not a crowd.
              </p>

              <div>
                <a 
                  href="#origin"
                  className="inline-block bg-[#070F18] text-white text-[11px] font-bold tracking-[0.25em] px-8 py-4 hover:bg-[#0050A0] transition-colors uppercase shadow-sm"
                >
                  DISCOVER ORIGIN
                </a>
              </div>
            </div>

            {/* Right Column: Dark Navy Graphic Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#070F18] text-white p-8 sm:p-10 border border-[#1E293B] shadow-xl flex flex-col justify-between min-h-[460px]">
                {/* Top Logo / Skull & Emblem Composition */}
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="relative w-40 h-40 mb-4 drop-shadow-[0_10px_25px_rgba(240,208,0,0.18)]">
                    <Image
                      src="/assets/sakala_emblem.png"
                      alt="SAKALA Emblem"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <span className="font-serif-editorial text-3xl font-black tracking-[0.2em] text-[#F0D000] block mb-1">
                    SAKALA
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#94A3B8] uppercase">
                    MOTORCYCLE CLUB
                  </span>
                </div>

                {/* Bottom Narrative Caption */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs text-[#94A3B8] leading-relaxed font-light">
                    Where metal meets spirit across the asphalt ribbons of the archipelago. We celebrate character over displacement, camaraderie over speed, and stories earned through rain, distance, and brotherhood.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE ALCHEMY OF SAKALA PHILOSOPHY */}
        <section id="origin" className="border-t border-[#E5E2D9] pt-20 pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
            <div>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold tracking-wider text-[#070F18] uppercase">
                THE ALCHEMY OF SAKALA PHILOSOPHY
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* Left Column: Cakra Rahayu Kencana Graphic Card */}
              <div className="lg:col-span-5">
                <div className="bg-[#070F18] text-white p-10 sm:p-12 border border-[#1E293B] shadow-md flex flex-col items-center justify-center text-center min-h-[440px]">
                  <div className="relative w-48 h-48 mb-6 drop-shadow-[0_15px_30px_rgba(240,208,0,0.22)]">
                    <Image
                      src="/assets/sakala_emblem.png"
                      alt="Cakra Rahayu Kencana"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <span className="font-serif-editorial text-sm font-bold tracking-[0.28em] text-[#F0D000] uppercase block">
                    CAKRA RAHAYU KANCANA
                  </span>
                  <span className="text-[10px] text-[#64748B] tracking-[0.16em] uppercase mt-1">
                    SUNDA-GALUH ANCIENT SYMBOLISM
                  </span>

                  {/* Context button */}
                  <button 
                    onClick={() => setShowFullSundaContext(!showFullSundaContext)}
                    className="mt-6 text-[10px] tracking-[0.2em] uppercase text-[#94A3B8] hover:text-[#F0D000] flex items-center gap-1.5 transition-colors"
                  >
                    <span>{showFullSundaContext ? 'Hide Prasasti Context' : 'Read Prasasti Kawali Context'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFullSundaContext ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Collapsible Deep Context on Cakra Rahayu Kencana */}
                {showFullSundaContext && (
                  <div className="mt-4 p-6 bg-white border border-[#E5E2D9] text-xs space-y-3 shadow-xs">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#0050A0] uppercase block">
                      PRASASTI KAWALI I &amp; VI • KERAJAAN SUNDA-GALUH
                    </span>
                    <p className="text-[#475569] leading-relaxed">
                      Peninggalan Maharaja Prabu Niskala Wastu Kancana:
                    </p>
                    <ul className="space-y-2 text-[#64748B] text-[11px]">
                      <li>• <strong>Bunga Padma 3 Helai:</strong> Bermakna <em>Tri Tangtu di Buana</em> (Karamaan, Karesian, Karatuan) — tatanan peradaban Sunda.</li>
                      <li>• <strong>4 Garis Bunga &amp; Pusat:</strong> <em>Papat Kalima Pancer</em> (4 penjuru angin: kaler, kulon, kidul, wetan) &amp; 4 unsur semesta (seuneu, cai, angin, taneuh) berpusat di tengah sebagai titik peradaban.</li>
                      <li>• <strong>Cakra &amp; Rahayu:</strong> Cakra = roda perputaran dan gerak; Rahayu = keselamatan serta keharmonisan dalam perjalanan; Kancana = emas dan kemuliaan karakter.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: 3 Historical Traditions */}
              <div className="lg:col-span-7 space-y-8">
                {/* 01 Sanskrit Tradition */}
                <div className="pb-8 border-b border-[#E5E2D9]">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                    01. SANSKRIT TRADITION
                  </span>
                  <h3 className="font-serif-editorial text-2xl font-bold text-[#070F18] mb-2">
                    Sa + Kala
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    The manifest, tangible, complete realm where spirit becomes action. Deliberate manifestation in the world.
                  </p>
                  <p className="text-xs text-[#64748B] mt-2 italic font-serif">
                    “Sa (with, together with) + Kala (parts, time, all elements). In Shaiva Siddhanta cosmology, Sakala is the state of deliberate manifestation: spirit choosing to engage, to be perceptible, to act in the world. (Found in Maitri Upanisad &amp; Mahabharata).”
                  </p>
                </div>

                {/* 02 Kawi Tradition */}
                <div className="pb-8 border-b border-[#E5E2D9]">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                    02. KAWI TRADITION
                  </span>
                  <h3 className="font-serif-editorial text-2xl font-bold text-[#070F18] mb-2">
                    The Actionable World
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    The realm of deeds that can be witnessed, measured, and recorded. Virtue rendered visible through action.
                  </p>
                  <p className="text-xs text-[#64748B] mt-2 italic font-serif">
                    “In Old Javanese (Kawi), sakala denotes the visible, actionable world — the realm of deeds recorded in kakawin chronicles. Majapahit court literature preserved it as a standard for virtue rendered visible through concrete action.”
                  </p>
                </div>

                {/* 03 Sundanese Philosophy */}
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                    03. SUNDANESE PHILOSOPHY
                  </span>
                  <h3 className="font-serif-editorial text-2xl font-bold text-[#070F18] mb-2">
                    Presence &amp; Completion
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Rhymes with the Sundanese ethic of “Cageur, Bageur, Bener, Pinter, Singer” — wholeness of character expressed in the visible world.
                  </p>
                  <p className="text-xs text-[#64748B] mt-2 italic font-serif">
                    “In Sundanese oral tradition, Sakala speaks to presence and completion — what is here, whole, accountable. Wholeness of character expressed in the physical realm, not merely intended.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CHAPTER II: IDENTITY ELEMENTS (COLOR STRUCTURE) */}
        <section className="border-t border-[#E5E2D9] pt-20 pb-24 bg-[#FAF9F5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-10">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#64748B] uppercase block">
              CHAPTER II: IDENTITY ELEMENTS
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Grounding Black */}
              <div className="bg-white border border-[#E5E2D9] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-full h-36 bg-[#000000] mb-6 shadow-inner" />
                  <h3 className="text-sm font-bold text-[#070F18] mb-1">
                    Grounding Black <span className="text-[#64748B] font-mono text-xs font-normal">(#000000)</span>
                  </h3>
                </div>
                <ul className="space-y-1.5 text-xs text-[#475569] uppercase font-semibold tracking-wider pt-4 border-t border-[#E5E2D9]">
                  <li>• STRUCTURE</li>
                  <li>• AUTHORITY</li>
                  <li>• STABILITY</li>
                </ul>
              </div>

              {/* Card 2: Sakala Royal Blue */}
              <div className="bg-white border border-[#E5E2D9] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-full h-36 bg-[#0050A0] mb-6 shadow-inner" />
                  <h3 className="text-sm font-bold text-[#070F18] mb-1">
                    Sakala Royal Blue <span className="text-[#64748B] font-mono text-xs font-normal">(#0050A0)</span>
                  </h3>
                </div>
                <ul className="space-y-1.5 text-xs text-[#475569] uppercase font-semibold tracking-wider pt-4 border-t border-[#E5E2D9]">
                  <li>• CALM BUT POWERFUL</li>
                  <li>• LOYALTY &amp; DISCIPLINE</li>
                  <li>• DEPTH / CONTROL</li>
                </ul>
              </div>

              {/* Card 3: Golden Yellow */}
              <div className="bg-white border border-[#E5E2D9] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-full h-36 bg-[#F0D000] mb-6 shadow-inner" />
                  <h3 className="text-sm font-bold text-[#070F18] mb-1">
                    Golden Yellow <span className="text-[#64748B] font-mono text-xs font-normal">(#F0D000)</span>
                  </h3>
                </div>
                <ul className="space-y-1.5 text-xs text-[#475569] uppercase font-semibold tracking-wider pt-4 border-t border-[#E5E2D9]">
                  <li>• ACHIEVEMENT</li>
                  <li>• BROTHERHOOD</li>
                  <li>• HONOR / VALUE</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: THE FOUNDATION & DIVISIONS */}
        <section id="values" className="border-t border-[#E5E2D9] pt-20 pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
            <div>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold tracking-wider text-[#070F18] uppercase">
                THE FOUNDATION &amp; DIVISIONS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-12">
              {/* Pillar 01 */}
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                  PILLAR 01
                </span>
                <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                  Loyalty
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  The bond is non-negotiable. You do not join and receive brotherhood. You demonstrate loyalty and earn the circle. Loyalty means showing up when it is inconvenient, telling a brother the truth when a lie is easier.
                </p>
              </div>

              {/* Pillar 02 */}
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                  PILLAR 02
                </span>
                <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                  Memanusiakan Manusia
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  To honor the humanity in another. Not a slogan but a lived daily expectation. Every interaction with members, sponsors, strangers on the road is conducted as if the other person's dignity is non-negotiable.
                </p>

                <button 
                  onClick={() => setShowPillarsPhilosophy(!showPillarsPhilosophy)}
                  className="mt-3 text-[10px] font-bold tracking-[0.2em] text-[#0050A0] hover:underline uppercase flex items-center gap-1"
                >
                  <span>{showPillarsPhilosophy ? 'Hide 4 Philosophical Roots' : 'View 4 Historical Pillars (Pancasila, Dewantara, Hatta, NU)'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showPillarsPhilosophy ? 'rotate-180' : ''}`} />
                </button>

                {showPillarsPhilosophy && (
                  <div className="mt-4 p-4 bg-white border border-[#E5E2D9] space-y-2 text-[11px] text-[#64748B]">
                    <div>• <strong>Pancasila Sila II:</strong> Kemanusiaan yang Adil dan Beradab. Just treatment and dignified engagement without exception.</div>
                    <div>• <strong>Ki Hajar Dewantara:</strong> <em>Ing ngarsa sung tuladha</em>. Leadership through exemplary humanization, not hollow command.</div>
                    <div>• <strong>Mohammad Hatta:</strong> Cooperative Humanism. Individual welfare rises only when the collective rises together.</div>
                    <div>• <strong>NU Rahmatan Lil 'Alamin:</strong> Mercy not only for one's own community, but for all creation.</div>
                  </div>
                )}
              </div>

              {/* Pillar 03 */}
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                  PILLAR 03
                </span>
                <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                  Kesejahteraan Circle
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Active investment in each other's future. When a brother builds, the circle invests. When a brother falters, the circle lifts. Welfare is not charity — it is mutual commitment, operationalized.
                </p>
              </div>

              {/* Pillar 04 */}
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                  PILLAR 04
                </span>
                <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                  Professionalism
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  We hold the line, always. Events are produced to industry standard. Partnerships are honored to the letter. SAKALA's word is binding. Memanusiakan Manusia is not suspended for commercial relationships.
                </p>
              </div>

              {/* Division 01 */}
              <div id="divisions">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                  DIVISION 01
                </span>
                <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                  Motor Division
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Weekend rides, long-distance touring, charity runs, and annual gatherings. Motor-agnostic: any brand welcome — what matters is the story behind the build. Member profile: Urban professional, 28–45. Any motorcycle. Character-first.
                </p>
              </div>

              {/* Division 02 */}
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                  DIVISION 02
                </span>
                <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                  Tactical Airsoft
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  MilSim operations, recreational skirmish, tactical training, and INASSOC-sanctioned tournaments. Affiliated directly with INASSOC Jabar &amp; KORMI for institutional legitimacy and tournament eligibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: GIANT DARK NAVY QUOTE SECTION */}
        <section className="bg-[#070F18] text-white py-24 lg:py-32 border-t border-[#1E293B] text-center px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="font-serif-editorial text-2xl sm:text-4xl lg:text-5xl font-light italic leading-tight text-white/95">
              “We do not ride for an audience. We ride because the sound of four pistons singing in unison through a Bandung valley mist at dawn is the only thing that silences the modern world.”
            </h2>

            <div className="text-[11px] font-bold tracking-[0.3em] text-[#F0D000] uppercase">
              — THE ROAD. THE RANGE. SAKALA.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/bikes"
                className="w-full sm:w-auto px-8 py-4 border border-white/40 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-[#F0D000] hover:text-[#F0D000] transition-colors"
              >
                EXPLORE GARAGE
              </Link>
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-[#F0D000] text-[#070F18] text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#C5AA00] transition-colors"
              >
                ENTER STORE
              </Link>
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
