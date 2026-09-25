'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Eye, X, Pencil } from 'lucide-react';
import { Bike } from '@/types/database';
import ScrollReveal from '@/components/common/ScrollReveal';
import EditableWrapper from '@/components/cms/EditableWrapper';
import { useInlineCMS } from '@/context/InlineCMSContext';
import { supabase } from '@/lib/supabase/client';
import { resolveAssetUrl } from '@/lib/supabase/data';

export default function GarageSection({ bikes: initialBikes }: { bikes: Bike[] }) {
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [bikes, setBikes] = useState<Bike[]>(initialBikes);
  const { isEditMode, refreshKey } = useInlineCMS();

  // Re-fetch data when CMS triggers a refresh
  const refetchBikes = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('bikes').select('*').order('year', { ascending: true });
      if (!error && data && data.length > 0) {
        setBikes((data as Bike[]).map(b => ({ ...b, image_url: resolveAssetUrl(b.image_url) })));
      }
    } catch {
      // keep existing data
    }
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      refetchBikes();
    }
  }, [refreshKey, refetchBikes]);

  return (
    <section id="garage" className="bg-[#FAF9F5] py-20 lg:py-28 border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={50} className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#0047AB] uppercase mb-3 block">
              02 — THE GARAGE & ATELIER
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#070F18] tracking-tight leading-tight">
              MACHINES WITH STORIES
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2">
              Built by hand. Ridden without apology. Each machine is a one-of-one archival specimen.
            </p>
          </div>

          <Link
            href="#garage"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-[#070F18] hover:text-[#C5AA00] transition-colors uppercase flex-shrink-0 group"
          >
            <span>EXPLORE ALL GARAGE BUILDS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
          </Link>
        </ScrollReveal>

        {/* 3 Bikes Grid with Staggered ScrollReveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bikes.map((bike, idx) => (
            <ScrollReveal key={bike.id} direction="up" delay={120 + idx * 120}>
              <EditableWrapper
                item={{ type: 'bike', id: bike.id, data: bike as unknown as Record<string, unknown> }}
              >
                <div className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs card-interactive flex flex-col group h-full hover:border-[#070F18]">
                  {/* Bike Image Container */}
                  <div className="relative h-60 w-full bg-[#EFECE6] overflow-hidden border-b border-[#E5E2D9]">
                    <Image
                      src={bike.image_url}
                      alt={`${bike.year} ${bike.make} ${bike.model}`}
                      fill
                      className="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 bg-[#070F18]/85 text-white text-[9px] font-bold tracking-[0.18em] px-2.5 py-1 uppercase rounded-xs backdrop-blur-xs transition-colors group-hover:bg-[#0047AB]">
                      {bike.status}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase block mb-1">
                        {bike.year} {bike.make} {bike.model}
                      </span>
                      <h3 className="font-serif-editorial text-2xl font-black text-[#070F18] mb-5 tracking-tight group-hover:text-[#0047AB] transition-colors">
                        {bike.title}
                      </h3>

                      {/* Technical Specs Table */}
                      <div className="divide-y divide-[#E5E2D9]/80 text-[11px] mb-6">
                        {Object.entries(bike.specs).map(([key, val]) => (
                          <div key={key} className="py-2 flex items-center justify-between transition-colors hover:bg-slate-50 px-1 rounded-xs">
                            <span className="font-semibold text-[#64748B] uppercase tracking-wider">
                              {key}
                            </span>
                            <span className="font-medium text-[#070F18] text-right">
                              {val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* View Specs Button */}
                    {!isEditMode && (
                      <button
                        onClick={() => setSelectedBike(bike)}
                        className="w-full flex items-center justify-center gap-2 bg-[#070F18] hover:bg-[#0047AB] text-white py-3 text-[11px] font-bold tracking-[0.18em] uppercase rounded-xs btn-tactile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>VIEW BUILD SPECS</span>
                      </button>
                    )}
                  </div>
                </div>
              </EditableWrapper>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Build Specs Modal with Smooth Animation */}
      {selectedBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#FAF9F5] border border-[#C5AA00]/40 max-w-2xl w-full rounded-sm overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 bg-[#070F18] text-white flex items-center justify-between border-b border-[#C5AA00]/30">
              <div>
                <span className="text-[10px] tracking-[0.22em] text-[#C5AA00] font-bold uppercase block">
                  BUILD DOSSIER ARCHIVE
                </span>
                <h4 className="font-serif-editorial text-xl font-bold">
                  {selectedBike.year} {selectedBike.make} {selectedBike.model} {selectedBike.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedBike(null)}
                className="text-gray-400 hover:text-white p-1.5 rounded transition-colors btn-tactile"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative h-64 w-full rounded overflow-hidden mb-6 border border-[#E5E2D9]">
                <Image
                  src={selectedBike.image_url}
                  alt={selectedBike.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                {Object.entries(selectedBike.specs).map(([key, val]) => (
                  <div key={key} className="bg-white p-3 border border-[#E5E2D9] rounded shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">
                      {key}
                    </span>
                    <span className="font-semibold text-[#070F18]">{val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedBike(null)}
                  className="px-6 py-2.5 bg-[#070F18] hover:bg-[#0047AB] text-white text-xs font-bold tracking-[0.16em] uppercase rounded-xs btn-tactile"
                >
                  CLOSE DOSSIER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
