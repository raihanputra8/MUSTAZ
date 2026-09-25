'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Eye, Wrench, Shield, Filter } from 'lucide-react';
import { Bike } from '@/types/database';
import EditableWrapper from '@/components/cms/EditableWrapper';
import { useInlineCMS } from '@/context/InlineCMSContext';

interface BikesArchiveClientProps {
  initialBikes: Bike[];
}

export default function BikesArchiveClient({ initialBikes }: BikesArchiveClientProps) {
  const { isEditMode } = useInlineCMS();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredBikes = selectedStatus === 'all'
    ? initialBikes
    : initialBikes.filter((b) => b.status.toLowerCase() === selectedStatus.toLowerCase());

  return (
    <div className="flex-1 py-12 max-w-7xl mx-auto px-6 lg:px-12 w-full">
      {/* Archive Header */}
      <div className="mb-10 pb-8 border-b border-[#E5E2D9]">
        <span className="text-[11px] font-bold tracking-[0.25em] text-[#0047AB] uppercase mb-2 block">
          02 / BUILDS — THE ATELIER
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif-editorial text-4xl sm:text-6xl font-black text-[#070F18] tracking-tight leading-tight mb-3">
              THE SAKALA GARAGE
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
              Every motorcycle built within our Bandung guild is an uncompromising synthesis of Indonesian heritage and raw displacement. Built for mountain passes, monsoon squalls, and lifelong brotherhood.
            </p>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'ALL BUILDS' },
              { id: 'archival', label: 'ARCHIVAL' },
              { id: 'commissioned', label: 'COMMISSIONED' },
              { id: 'private_collection', label: 'PRIVATE COLLECTION' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-xs transition-all cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-[#070F18] text-white shadow-xs'
                    : 'bg-white border border-[#E5E2D9] text-[#64748B] hover:text-[#070F18] hover:border-[#070F18]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Builds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredBikes.map((bike) => (
          <EditableWrapper
            key={bike.id}
            item={{ type: 'bike', id: bike.id, data: bike as unknown as Record<string, unknown> }}
          >
            <div className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs hover:border-[#070F18] hover:shadow-md transition-all duration-300 flex flex-col group h-full">
              {/* Bike Image with Link */}
              <Link href={`/bikes/${bike.id}`} className="relative h-64 w-full bg-[#EFECE6] overflow-hidden block border-b border-[#E5E2D9]">
                <Image
                  src={bike.image_url}
                  alt={`${bike.year} ${bike.make} ${bike.model} - ${bike.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 left-3 bg-[#070F18]/85 backdrop-blur-xs text-[#C5AA00] px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] uppercase rounded-xs">
                  {bike.status.replace('_', ' ')}
                </div>
              </Link>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase block mb-1">
                    {bike.year} {bike.make} {bike.model}
                  </span>
                  
                  <Link href={`/bikes/${bike.id}`}>
                    <h2 className="font-serif-editorial text-2xl font-black text-[#070F18] mb-4 tracking-tight group-hover:text-[#0047AB] transition-colors">
                      {bike.title}
                    </h2>
                  </Link>

                  {/* Specs List */}
                  <div className="divide-y divide-[#E5E2D9]/80 text-[11px] mb-6">
                    {Object.entries(bike.specs || {}).map(([key, val]) => (
                      <div key={key} className="py-2 flex items-center justify-between">
                        <span className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">
                          {key}
                        </span>
                        <span className="font-medium text-[#070F18] text-right truncate max-w-[170px]">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explore Button */}
                <Link
                  href={`/bikes/${bike.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#070F18] group-hover:bg-[#0047AB] text-white py-3 text-[10px] font-bold tracking-[0.2em] uppercase rounded-xs transition-colors btn-tactile"
                >
                  <span>EXPLORE BUILD DOSSIER</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </EditableWrapper>
        ))}
      </div>

      {/* Atelier Bespoke Commission Banner */}
      <div className="mt-16 p-8 sm:p-12 bg-[#070F18] text-white rounded-xs border border-[#C5AA00]/30 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase block mb-2">
            ATELIER COMMISSION WORK
          </span>
          <h3 className="font-serif-editorial text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            COMMISSION A BESPOKE BUILD
          </h3>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-6">
            We accept limited custom commissions each calendar year. Every project starts with a donor machine consultation, chassis geometry analysis, and custom fabrication roadmap.
          </p>
          <Link
            href="/#newsletter"
            className="inline-flex items-center gap-3 bg-[#0047AB] hover:bg-[#00388A] text-white px-6 py-3.5 text-xs font-bold tracking-[0.16em] uppercase rounded-xs transition-all duration-300 shadow-lg shadow-[#0047AB]/25 btn-tactile"
          >
            <Wrench className="w-4 h-4" />
            <span>START A COMMISSION INQUIRY</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
