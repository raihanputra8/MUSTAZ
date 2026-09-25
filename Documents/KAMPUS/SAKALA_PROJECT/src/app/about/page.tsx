'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EditableWrapper from '@/components/cms/EditableWrapper';
import { useInlineCMS } from '@/context/InlineCMSContext';

export default function AboutPage() {
  const { getContent } = useInlineCMS();

  // Dynamic Content with live CMS updates
  const heroContent = getContent('about_hero', {
    label: 'FOUNDED IN BANDUNG • EST. 2026',
    title: 'THE MANIFEST REALM, & BROTHERHOOD.',
    description: 'Founded in Bandung in 2026 by Adil Lothar Hasan. We are an exclusive brotherhood that honors the humanity in every member. We are motorcycle-agnostic and character-selective. A circle, not a crowd.',
    cta_text: 'DISCOVER ORIGIN',
  });

  const heroImgContent = getContent('about_hero_image', {
    image_url: '/assets/sakala_emblem.png',
    label: 'Hero Visual Display',
    title: 'SAKALA Official Graphic',
  });

  const originImgContent = getContent('about_origin_image', {
    image_url: '/assets/sakala_emblem.png',
    label: 'Cakra Rahayu Kencana',
    title: 'Ancient Sunda-Galuh Symbolism',
  });

  const sanskritContent = getContent('about_sanskrit', {
    label: '01. SANSKRIT TRADITION',
    title: 'Sa + Kala',
    description: 'The manifest, tangible, complete realm where spirit becomes action. Deliberate manifestation in the world.',
  });

  const kawiContent = getContent('about_kawi', {
    label: '02. KAWI TRADITION',
    title: 'The Actionable World',
    description: 'The realm of deeds that can be witnessed, measured, and recorded. Virtue rendered visible through action.',
  });

  const sundaContent = getContent('about_sunda', {
    label: '03. SUNDANESE PHILOSOPHY',
    title: 'Presence & Completion',
    description: 'Rhymes with the Sundanese ethic of “Cageur, Bageur, Bener, Pinter, Singer” — wholeness of character expressed in the visible world.',
  });

  const pillar1 = getContent('about_pillar_1', {
    label: 'PILLAR 01',
    title: 'Loyalty',
    description: 'The bond is non-negotiable. You do not join and receive brotherhood. You demonstrate loyalty and earn the circle. Loyalty means showing up when it is inconvenient, telling a brother the truth when a lie is easier.',
  });

  const pillar2 = getContent('about_pillar_2', {
    label: 'PILLAR 02',
    title: 'Memanusiakan Manusia',
    description: "To honor the humanity in another. Not a slogan but a lived daily expectation. Every interaction with members, sponsors, strangers on the road is conducted as if the other person's dignity is non-negotiable.",
  });

  const pillar3 = getContent('about_pillar_3', {
    label: 'PILLAR 03',
    title: 'Kesejahteraan Circle',
    description: "Active investment in each other's future. When a brother builds, the circle invests. When a brother falters, the circle lifts. Welfare is not charity — it is mutual commitment, operationalized.",
  });

  const pillar4 = getContent('about_pillar_4', {
    label: 'PILLAR 04',
    title: 'Professionalism',
    description: "We hold the line, always. Events are produced to industry standard. Partnerships are honored to the letter. SAKALA's word is binding. Memanusiakan Manusia is not suspended for commercial relationships.",
  });

  const div1 = getContent('about_div_1', {
    label: 'DIVISION 01',
    title: 'Motor Division',
    description: 'Weekend rides, long-distance touring, charity runs, and annual gatherings. Motor-agnostic: any brand welcome — what matters is the story behind the build. Member profile: Urban professional, 28–45. Any motorcycle. Character-first.',
  });

  const div2 = getContent('about_div_2', {
    label: 'DIVISION 02',
    title: 'Tactical Airsoft',
    description: 'MilSim operations, recreational skirmish, tactical training, and INASSOC-sanctioned tournaments. Affiliated directly with INASSOC Jabar & KORMI for institutional legitimacy and tournament eligibility.',
  });

  const quoteContent = getContent('about_quote', {
    label: '— THE ROAD. THE RANGE. SAKALA.',
    title: '“We do not ride for an audience. We ride because the sound of four pistons singing in unison through a Bandung valley mist at dawn is the only thing that silences the modern world.”',
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F5] text-[#070F18] selection:bg-[#F0D000] selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* SECTION 1: HERO — THE MANIFEST REALM & BROTHERHOOD */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Editorial Headline & Origin Statement */}
            <div className="lg:col-span-7">
              <EditableWrapper
                item={{
                  type: 'content',
                  id: 'about_hero',
                  data: heroContent,
                }}
              >
                <div className="space-y-8">
                  <span className="text-[11px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block">
                    {heroContent.label}
                  </span>

                  <h1 className="font-serif-editorial text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#070F18] leading-[1.05]">
                    {heroContent.title}
                  </h1>

                  <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl font-normal whitespace-pre-line">
                    {heroContent.description}
                  </p>

                  <div>
                    <a 
                      href="#origin"
                      className="inline-block bg-[#070F18] text-white text-[11px] font-bold tracking-[0.25em] px-8 py-4 hover:bg-[#0050A0] transition-colors uppercase shadow-sm"
                    >
                      {heroContent.cta_text || 'DISCOVER ORIGIN'}
                    </a>
                  </div>
                </div>
              </EditableWrapper>
            </div>

            {/* Right Column: Full Graphic / Picture Display Card (No text underneath) */}
            <div className="lg:col-span-5">
              <EditableWrapper
                item={{
                  type: 'content',
                  id: 'about_hero_image',
                  data: heroImgContent,
                }}
              >
                <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] bg-[#070F18] border border-[#1E293B] shadow-2xl rounded-sm overflow-hidden flex items-center justify-center p-6 sm:p-10 group">
                  <div className="relative w-full h-full">
                    <Image
                      src={heroImgContent.image_url || '/assets/sakala_emblem.png'}
                      alt={heroImgContent.title || 'SAKALA Image'}
                      fill
                      className="object-contain drop-shadow-[0_20px_50px_rgba(240,208,0,0.28)] transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  </div>
                </div>
              </EditableWrapper>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Full Emblem / Graphic Showcase (No text underneath) */}
              <div className="lg:col-span-5">
                <EditableWrapper
                  item={{
                    type: 'content',
                    id: 'about_origin_image',
                    data: originImgContent,
                  }}
                >
                  <div className="relative w-full h-[420px] sm:h-[480px] bg-[#070F18] border border-[#1E293B] shadow-xl rounded-sm overflow-hidden flex items-center justify-center p-6 sm:p-10 group">
                    <div className="relative w-full h-full">
                      <Image
                        src={originImgContent.image_url || '/assets/sakala_emblem.png'}
                        alt={originImgContent.title || 'Cakra Rahayu Kencana'}
                        fill
                        className="object-contain drop-shadow-[0_20px_45px_rgba(240,208,0,0.25)] transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </EditableWrapper>
              </div>

              {/* Right Column: 3 Historical Traditions */}
              <div className="lg:col-span-7 space-y-8">
                {/* 01 Sanskrit Tradition */}
                <EditableWrapper
                  item={{
                    type: 'content',
                    id: 'about_sanskrit',
                    data: sanskritContent,
                  }}
                >
                  <div className="pb-8 border-b border-[#E5E2D9]">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                      {sanskritContent.label}
                    </span>
                    <h3 className="font-serif-editorial text-2xl font-bold text-[#070F18] mb-2">
                      {sanskritContent.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                      {sanskritContent.description}
                    </p>
                  </div>
                </EditableWrapper>

                {/* 02 Kawi Tradition */}
                <EditableWrapper
                  item={{
                    type: 'content',
                    id: 'about_kawi',
                    data: kawiContent,
                  }}
                >
                  <div className="pb-8 border-b border-[#E5E2D9]">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                      {kawiContent.label}
                    </span>
                    <h3 className="font-serif-editorial text-2xl font-bold text-[#070F18] mb-2">
                      {kawiContent.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                      {kawiContent.description}
                    </p>
                  </div>
                </EditableWrapper>

                {/* 03 Sundanese Philosophy */}
                <EditableWrapper
                  item={{
                    type: 'content',
                    id: 'about_sunda',
                    data: sundaContent,
                  }}
                >
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                      {sundaContent.label}
                    </span>
                    <h3 className="font-serif-editorial text-2xl font-bold text-[#070F18] mb-2">
                      {sundaContent.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                      {sundaContent.description}
                    </p>
                  </div>
                </EditableWrapper>
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
              <EditableWrapper item={{ type: 'content', id: 'about_pillar_1', data: pillar1 }}>
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                    {pillar1.label}
                  </span>
                  <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                    {pillar1.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {pillar1.description}
                  </p>
                </div>
              </EditableWrapper>

              {/* Pillar 02 */}
              <EditableWrapper item={{ type: 'content', id: 'about_pillar_2', data: pillar2 }}>
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                    {pillar2.label}
                  </span>
                  <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                    {pillar2.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {pillar2.description}
                  </p>
                </div>
              </EditableWrapper>

              {/* Pillar 03 */}
              <EditableWrapper item={{ type: 'content', id: 'about_pillar_3', data: pillar3 }}>
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                    {pillar3.label}
                  </span>
                  <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                    {pillar3.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {pillar3.description}
                  </p>
                </div>
              </EditableWrapper>

              {/* Pillar 04 */}
              <EditableWrapper item={{ type: 'content', id: 'about_pillar_4', data: pillar4 }}>
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                    {pillar4.label}
                  </span>
                  <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                    {pillar4.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {pillar4.description}
                  </p>
                </div>
              </EditableWrapper>

              {/* Division 01 */}
              <EditableWrapper item={{ type: 'content', id: 'about_div_1', data: div1 }}>
                <div id="divisions">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                    {div1.label}
                  </span>
                  <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                    {div1.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {div1.description}
                  </p>
                </div>
              </EditableWrapper>

              {/* Division 02 */}
              <EditableWrapper item={{ type: 'content', id: 'about_div_2', data: div2 }}>
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#0050A0] uppercase block mb-1">
                    {div2.label}
                  </span>
                  <h3 className="font-serif-editorial text-xl font-bold text-[#070F18] mb-2">
                    {div2.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {div2.description}
                  </p>
                </div>
              </EditableWrapper>
            </div>
          </div>
        </section>

        {/* SECTION 5: GIANT DARK NAVY QUOTE SECTION */}
        <section className="bg-[#070F18] text-white py-24 lg:py-32 border-t border-[#1E293B] text-center px-6">
          <EditableWrapper
            item={{
              type: 'content',
              id: 'about_quote',
              data: quoteContent,
            }}
          >
            <div className="max-w-4xl mx-auto space-y-10">
              <h2 className="font-serif-editorial text-2xl sm:text-4xl lg:text-5xl font-light italic leading-tight text-white/95">
                {quoteContent.title}
              </h2>

              <div className="text-[11px] font-bold tracking-[0.3em] text-[#F0D000] uppercase">
                {quoteContent.label}
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
          </EditableWrapper>
        </section>
      </main>

      <Footer />
    </div>
  );
}
