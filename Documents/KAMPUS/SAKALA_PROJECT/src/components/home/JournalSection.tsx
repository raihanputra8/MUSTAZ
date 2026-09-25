'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, MapPin, Calendar } from 'lucide-react';
import { JournalPost } from '@/types/database';
import EditableWrapper from '@/components/cms/EditableWrapper';
import { useInlineCMS } from '@/context/InlineCMSContext';
import { supabase } from '@/lib/supabase/client';
import { resolveAssetUrl } from '@/lib/supabase/data';

export default function JournalSection({ posts: initialPosts }: { posts: JournalPost[] }) {
  const [posts, setPosts] = useState<JournalPost[]>(initialPosts);
  const { isEditMode, refreshKey } = useInlineCMS();

  const featured = posts.find((p) => p.featured) || posts[0];
  const sideArticles = posts.filter((p) => p.id !== featured?.id);

  // Re-fetch data when CMS triggers a refresh
  const refetchPosts = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('journal_posts').select('*').order('publish_date', { ascending: false });
      if (!error && data && data.length > 0) {
        setPosts((data as JournalPost[]).map(p => ({ ...p, cover_image_url: resolveAssetUrl(p.cover_image_url) })));
      }
    } catch {
      // keep existing data
    }
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      refetchPosts();
    }
  }, [refreshKey, refetchPosts]);

  return (
    <section id="journal" className="bg-[#FAF9F5] py-14 sm:py-20 lg:py-24 border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 pb-6 border-b border-[#E5E2D9] gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#0047AB] uppercase mb-2 block">
              DOKUMENTASI JALUR &amp; CERITA
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-extrabold text-[#070F18] tracking-tight leading-tight">
              CATATAN PERJALANAN
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2 max-w-xl leading-relaxed">
              Rekaman perjalanan roda dua menembus dingin malam, rute pegunungan, dan kebersamaan di jalanan Jawa Barat.
            </p>
          </div>

          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#070F18] hover:text-[#0047AB] transition-colors uppercase flex-shrink-0 group"
          >
            <span>BACA SEMUA CATATAN</span>
            <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          </Link>
        </div>

        {/* Asymmetric Editorial Travelogue Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left: Featured Road Story (7 Cols) */}
          {featured && (
            <div className="lg:col-span-7 flex flex-col">
              <EditableWrapper
                item={{ type: 'journal', id: featured.id, data: featured as unknown as Record<string, unknown> }}
              >
                <div className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs hover:border-[#070F18] transition-all flex flex-col justify-between group h-full">
                  {/* Feature Image */}
                  <Link href={`/journal/${featured.slug}`} className="relative h-72 sm:h-96 w-full bg-[#E5E2D9] overflow-hidden block border-b border-[#E5E2D9]">
                    <Image
                      src={featured.cover_image_url}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                      priority
                    />
                    <div className="absolute top-4 left-4 bg-[#070F18] text-[#C5AA00] px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-xs shadow-md flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#C5AA00]" />
                      <span>RUTE UTAMA • LEMBANG – SUBANG</span>
                    </div>
                  </Link>

                  {/* Story Headline & Excerpt */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-[11px] text-[#64748B] mb-3">
                        <span className="font-bold text-[#0047AB] uppercase tracking-wider">
                          {featured.category || 'Catatan Turing'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {featured.publish_date}
                        </span>
                        <span>•</span>
                        <span>{featured.read_time || '6 Menit Baca'}</span>
                      </div>

                      <Link href={`/journal/${featured.slug}`}>
                        <h3 className="font-serif-editorial text-2xl sm:text-3xl font-black text-[#070F18] leading-snug mb-4 group-hover:text-[#0047AB] transition-colors">
                          {featured.title}
                        </h3>
                      </Link>

                      <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-6 line-clamp-3">
                        {featured.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E5E2D9] flex items-center justify-between">
                      <Link
                        href={`/journal/${featured.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#070F18] group-hover:text-[#0047AB] uppercase transition-colors"
                      >
                        <span>BACA KISAH LENGKAP</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
                      </Link>

                      <span className="text-[11px] text-[#94A3B8] font-mono">
                        Penulis: {featured.author || 'Sakala MC'}
                      </span>
                    </div>
                  </div>
                </div>
              </EditableWrapper>
            </div>
          )}

          {/* Right: Archive Stories List (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="text-xs font-bold tracking-wider text-[#64748B] uppercase pb-2 border-b border-[#E5E2D9]">
              CERITA JALUR LAINNYA
            </div>

            {sideArticles.map((post) => (
              <EditableWrapper
                key={post.id}
                item={{ type: 'journal', id: post.id, data: post as unknown as Record<string, unknown> }}
              >
                <div className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs hover:border-[#070F18] transition-all flex flex-col sm:flex-row group">
                  {/* Thumbnail */}
                  <Link href={`/journal/${post.slug}`} className="relative h-44 sm:h-auto sm:w-44 bg-[#E5E2D9] overflow-hidden shrink-0 block border-b sm:border-b-0 sm:border-r border-[#E5E2D9]">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 180px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </Link>

                  {/* Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-[#64748B] flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-[#0047AB] uppercase">{post.category}</span>
                        <span>•</span>
                        <span>{post.publish_date}</span>
                      </div>

                      <Link href={`/journal/${post.slug}`}>
                        <h4 className="font-serif-editorial text-base sm:text-lg font-bold text-[#070F18] mb-2 leading-snug group-hover:text-[#0047AB] transition-colors">
                          {post.title}
                        </h4>
                      </Link>

                      <p className="text-[11px] text-[#475569] line-clamp-2 leading-relaxed mb-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E5E2D9] flex items-center justify-between">
                      <Link
                        href={`/journal/${post.slug}`}
                        className="text-[10px] font-bold tracking-wider text-[#070F18] group-hover:text-[#0047AB] uppercase inline-flex items-center gap-1"
                      >
                        <span>Baca Cerita</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </EditableWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
