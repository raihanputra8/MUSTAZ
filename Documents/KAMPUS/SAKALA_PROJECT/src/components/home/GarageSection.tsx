'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Eye, Wrench, X } from 'lucide-react';
import { Bike } from '@/types/database';
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

  const featuredBike = bikes[0];
  const otherBikes = bikes.slice(1);

  return (
    <section id="garage" className="bg-[#FAF9F5] py-14 sm:py-20 lg:py-24 border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 pb-6 border-b border-[#E5E2D9] gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#0047AB] uppercase mb-2 block">
              KARYA GARASI &amp; MESIN
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-extrabold text-[#070F18] tracking-tight leading-tight">
              GARASI MOTOR SAKALA
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2 max-w-xl leading-relaxed">
              Koleksi motor kustom yang dirawat, dimodifikasi, dan dikendarai oleh anggota Sakala di Bandung.
            </p>
          </div>

          <Link
            href="/bikes"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#070F18] hover:text-[#0047AB] transition-colors uppercase flex-shrink-0 group"
          >
            <span>LIHAT SEMUA MOTOR</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* Asymmetric Editorial Showcase */}
        {featuredBike && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
            {/* Left: Featured Build Hero (7 Cols) */}
            <div className="lg:col-span-7">
              <EditableWrapper
                item={{ type: 'bike', id: featuredBike.id, data: featuredBike as unknown as Record<string, unknown> }}
              >
                <div className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs hover:border-[#070F18] transition-all flex flex-col h-full group">
                  {/* Large Bike Photo Container */}
                  <Link href={`/bikes/${featuredBike.id}`} className="relative h-72 sm:h-96 w-full bg-[#EFECE6] overflow-hidden block border-b border-[#E5E2D9]">
                    <Image
                      src={featuredBike.image_url}
                      alt={`${featuredBike.year} ${featuredBike.make} ${featuredBike.model} - ${featuredBike.title}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                      priority
                    />
                    <div className="absolute top-4 left-4 bg-[#070F18] text-[#C5AA00] px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-xs shadow-md">
                      SOROTAN GARASI • {featuredBike.year} {featuredBike.make.toUpperCase()}
                    </div>
                  </Link>

                  {/* Build Story & Mechanical Identity */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-xs font-bold tracking-wider text-[#0047AB] uppercase">
                          {featuredBike.make} {featuredBike.model} ({featuredBike.year})
                        </span>
                        <span className="text-[11px] text-[#64748B] font-medium">
                          Status: {featuredBike.status === 'archival' ? 'Koleksi Tetap' : 'Motor Jalan'}
                        </span>
                      </div>

                      <Link href={`/bikes/${featuredBike.id}`}>
                        <h3 className="font-serif-editorial text-2xl sm:text-3xl font-black text-[#070F18] mb-3 tracking-tight group-hover:text-[#0047AB] transition-colors">
                          {featuredBike.title}
                        </h3>
                      </Link>

                      <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-6 font-normal">
                        {featuredBike.description || 'Dibangun dengan rangka hardtail chromoly dan knalpot open-pipe kustom untuk melibas jalanan menanjak dan kelokan dingin Bandung Utara.'}
                      </p>

                      {/* Technical Specs 4-Box Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F5] border border-[#E5E2D9] p-4 rounded-xs text-xs mb-6">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-[#64748B] block mb-1">RANGKA</span>
                          <span className="font-semibold text-[#070F18] truncate block">{featuredBike.specs?.frame || 'Rigid Loop'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-[#64748B] block mb-1">KNALPOT</span>
                          <span className="font-semibold text-[#070F18] truncate block">{featuredBike.specs?.exhaust || 'Custom Open Pipe'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-[#64748B] block mb-1">BENGKEL</span>
                          <span className="font-semibold text-[#070F18] truncate block">{featuredBike.specs?.workshop || 'Garasi Sakala'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-[#64748B] block mb-1">WARNA</span>
                          <span className="font-semibold text-[#070F18] truncate block">{featuredBike.specs?.colorway || 'Raw Steel'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E5E2D9]">
                      <button
                        onClick={() => setSelectedBike(featuredBike)}
                        className="inline-flex items-center gap-2 bg-[#070F18] hover:bg-[#0047AB] text-white px-5 py-2.5 text-xs font-bold tracking-wider uppercase rounded-xs transition-colors cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>SPESIFIKASI LENGKAP</span>
                      </button>

                      <Link
                        href={`/bikes/${featuredBike.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#070F18] hover:text-[#0047AB] uppercase transition-colors px-4 py-2.5"
                      >
                        <span>DETAIL ARSIP MOTOR</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </EditableWrapper>
            </div>

            {/* Right: Companion Garage Bikes (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="text-xs font-bold tracking-wider text-[#64748B] uppercase pb-2 border-b border-[#E5E2D9]">
                MOTOR GARASI LAINNYA ({otherBikes.length})
              </div>

              {otherBikes.map((bike) => (
                <EditableWrapper
                  key={bike.id}
                  item={{ type: 'bike', id: bike.id, data: bike as unknown as Record<string, unknown> }}
                >
                  <div className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs hover:border-[#070F18] transition-all flex flex-col sm:flex-row group">
                    {/* Thumbnail */}
                    <Link href={`/bikes/${bike.id}`} className="relative h-44 sm:h-auto sm:w-44 bg-[#EFECE6] overflow-hidden shrink-0 block border-b sm:border-b-0 sm:border-r border-[#E5E2D9]">
                      <Image
                        src={bike.image_url}
                        alt={`${bike.year} ${bike.make} ${bike.title}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </Link>

                    {/* Details */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase block mb-1">
                          {bike.year} • {bike.make}
                        </span>
                        <Link href={`/bikes/${bike.id}`}>
                          <h4 className="font-serif-editorial text-lg font-bold text-[#070F18] mb-1.5 group-hover:text-[#0047AB] transition-colors leading-snug">
                            {bike.title}
                          </h4>
                        </Link>
                        <p className="text-[11px] text-[#64748B] line-clamp-2 mb-3">
                          {bike.specs?.frame ? `Rangka: ${bike.specs.frame}` : bike.model}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E5E2D9] text-xs">
                        <button
                          onClick={() => setSelectedBike(bike)}
                          className="font-bold text-[#0047AB] hover:underline uppercase text-[10px] tracking-wider cursor-pointer"
                        >
                          Lihat Spesifikasi
                        </button>
                        <Link
                          href={`/bikes/${bike.id}`}
                          className="font-bold text-[#070F18] hover:text-[#0047AB] uppercase text-[10px] tracking-wider inline-flex items-center gap-1"
                        >
                          <span>Arsip</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </EditableWrapper>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Build Specs Modal */}
      {selectedBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-[#FAF9F5] border border-[#C5AA00]/40 max-w-2xl w-full rounded-xs overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 bg-[#070F18] text-white flex items-center justify-between border-b border-[#C5AA00]/30">
              <div>
                <span className="text-[10px] tracking-wider text-[#C5AA00] font-bold uppercase block mb-1">
                  SPESIFIKASI TEKNIS MOTOR
                </span>
                <h4 className="font-serif-editorial text-xl font-bold">
                  {selectedBike.year} {selectedBike.make} — {selectedBike.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedBike(null)}
                className="text-white/60 hover:text-white transition-colors p-1.5 cursor-pointer"
                aria-label="Tutup Spesifikasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="relative h-60 w-full rounded-xs overflow-hidden mb-6 bg-[#070F18]">
                <Image
                  src={selectedBike.image_url}
                  alt={selectedBike.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-6">
                {Object.entries(selectedBike.specs || {}).map(([key, value]) => (
                  <div key={key} className="bg-white border border-[#E5E2D9] p-3 rounded-xs flex items-center justify-between">
                    <span className="text-[#64748B] uppercase font-bold text-[10px]">{key}</span>
                    <span className="font-bold text-[#070F18] text-right">{String(value)}</span>
                  </div>
                ))}
              </div>

              {selectedBike.description && (
                <p className="text-xs text-[#475569] leading-relaxed mb-6 bg-white p-4 border border-[#E5E2D9] rounded-xs">
                  {selectedBike.description}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E2D9]">
                <button
                  onClick={() => setSelectedBike(null)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#64748B] hover:text-[#070F18] cursor-pointer"
                >
                  Tutup
                </button>
                <Link
                  href={`/bikes/${selectedBike.id}`}
                  className="bg-[#0047AB] hover:bg-[#00388A] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
                >
                  Buka Halaman Lengkap
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
