'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  ExternalLink,
  Play
} from 'lucide-react';
import EditableWrapper from '@/components/cms/EditableWrapper';
import { useInlineCMS } from '@/context/InlineCMSContext';
import { InstagramConfig } from '@/types/database';

function getYouTubeVideoId(url: string): string {
  if (!url) return 'IK0VG7j2P9s';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.trim().match(regExp);
  return (match && match[2].length === 11) ? match[2] : 'IK0VG7j2P9s';
}

function extractInstagramHandle(url: string): string {
  if (!url) return '@sakala_ina';
  try {
    const clean = url.trim();
    const parsed = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0] !== 'p' && segments[0] !== 'reel' && segments[0] !== 'reels') {
      return `@${segments[0]}`;
    }
    return '@sakala_ina';
  } catch {
    return '@sakala_ina';
  }
}

interface FetchedPost {
  shortcode: string;
  permalink: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  title?: string;
  has_official_media: boolean;
  error?: string;
}

export default function CultureSection() {
  const { getContent } = useInlineCMS();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 1. CMS CONFIGURATION: Source of truth for Instagram configuration
  const defaultInstagramConfig: InstagramConfig = {
    profile_url: 'https://www.instagram.com/sakala_ina/',
    post_urls: [
      'https://www.instagram.com/p/DAXwK_JzV2O/',
      'https://www.instagram.com/p/DAUvP91TVnI/',
      'https://www.instagram.com/p/C_2mQ7mS3x8/',
      'https://www.instagram.com/p/C_rF6d_SiQ7/',
    ],
    enabled: true,
  };

  const instagramConfig = getContent('instagram_config', defaultInstagramConfig as unknown as Record<string, any>) as unknown as InstagramConfig;
  const profileUrl = instagramConfig.profile_url || defaultInstagramConfig.profile_url;
  const profileHandle = extractInstagramHandle(profileUrl);

  // 2. Official Instagram Posts Data
  const [posts, setPosts] = useState<FetchedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const urls = instagramConfig.post_urls || [];

    if (!instagramConfig.enabled || urls.length === 0) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }

    async function loadInstagramPosts() {
      setLoadingPosts(true);

      try {
        const res = await fetch(`/api/instagram?urls=${encodeURIComponent(JSON.stringify(urls))}`, {
          cache: 'default',
        });

        if (!res.ok) {
          throw new Error(`Failed to load posts (status ${res.status})`);
        }

        const json = await res.json();
        if (isMounted) {
          if (json.posts && Array.isArray(json.posts)) {
            setPosts(json.posts);
          } else {
            setPosts([]);
          }
        }
      } catch {
        if (isMounted) {
          setPosts([]);
        }
      } finally {
        if (isMounted) {
          setLoadingPosts(false);
        }
      }
    }

    loadInstagramPosts();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(instagramConfig.post_urls), instagramConfig.enabled]);

  // 3. YouTube Video Content
  const videoContent = getContent('culture_video', {
    title: 'DOKUMENTASI RESMI SAKALA MOTORCYCLE CLUB',
    video_url: 'https://youtu.be/IK0VG7j2P9s',
  });

  const youtubeVideoId = getYouTubeVideoId(videoContent.video_url || 'https://youtu.be/IK0VG7j2P9s');

  const checkScrollState = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 320;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkScrollState();
  }, [posts, loadingPosts]);

  return (
    <section id="culture" className="bg-[#070F18] text-white py-16 sm:py-20 lg:py-24 border-b border-[#C5AA00]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-8 border-b border-white/10 gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#C5AA00] uppercase mb-2 block">
              DOKUMENTASI &amp; KEBUDAYAAN
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              KEHIDUPAN DI JALAN &amp; GARASI
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-2 max-w-xl leading-relaxed">
              Arsip visual dari garasi, kebersamaan anggota, dan rekaman perjalanan roda dua Sakala Motorcycle Club Bandung.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xs text-xs font-bold tracking-wider uppercase transition-colors"
            >
              <span>{profileHandle}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C5AA00]" />
            </a>
          </div>
        </div>

        {/* Part 1: Official Documentary Video & Club Roster Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-14 sm:mb-16 items-center">
          {/* Left: Cinematic Video Player (7 Cols) */}
          <div className="lg:col-span-7">
            <div 
              ref={videoContainerRef}
              className="relative w-full aspect-video rounded-xs overflow-hidden border border-white/15 bg-black shadow-2xl"
            >
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                title={videoContent.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <div className="pt-3 flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span className="font-bold text-white uppercase tracking-wider">
                VIDEO DOKUMENTASI RESMI
              </span>
              <a
                href="https://youtube.com/@sakala.id25"
                target="_blank"
                rel="noreferrer"
                className="text-[#C5AA00] hover:underline inline-flex items-center gap-1"
              >
                <span>Buka di YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right: Authentic Club Insignia & Real Documentation Narrative (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                <Image
                  src="/assets/SAKALA_MC.PNG"
                  alt="Lambang Resmi Sakala MC"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider text-[#C5AA00] uppercase block">
                  IDENTITAS RESMI
                </span>
                <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-white leading-snug">
                  SAKALA MOTORCYCLE CLUB
                </h3>
                <span className="text-[11px] text-[#94A3B8]">Bandung, Jawa Barat</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed mb-6 font-normal">
              Bukan sekadar kumpul bermotor. Sakala berdiri atas ikatan persaudaraan yang mengutamakan rasa saling menghormati, pemahaman mekanis motor kustom, dan loyalitas tanpa kompromi saat roda berputar di jalan.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xs">
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase block mb-1">BASIS</span>
                <span className="text-white font-semibold">Bandung, Jawa Barat</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xs">
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase block mb-1">KEGIATAN</span>
                <span className="text-white font-semibold">Turing, Garasi, Amal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Real Photographic Documentation Strip */}
        <div className="mb-14 sm:mb-16">
          <div className="text-xs font-bold tracking-wider text-[#94A3B8] uppercase pb-2 mb-6 border-b border-white/10">
            DOKUMENTASI NYATA KEGIATAN &amp; GARASI
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Photo 1: Garage Life */}
            <div className="border border-white/10 bg-[#0C1724] p-3 rounded-xs flex flex-col justify-between group">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black mb-3">
                <Image
                  src="/assets/culture_workshop.png"
                  alt="Aktivitas di bengkel garasi Sakala Bandung"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#C5AA00] uppercase tracking-wider block mb-1">
                  RUANG KARYA
                </span>
                <h4 className="font-serif-editorial text-sm font-bold text-white mb-1">
                  Perawatan Mesin &amp; Garasi
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Setiap mesin dirawat dan dipersiapkan sendiri oleh anggota sebelum melibas rute panjang.
                </p>
              </div>
            </div>

            {/* Photo 2: Gathering Ceremony */}
            <div className="border border-white/10 bg-[#0C1724] p-3 rounded-xs flex flex-col justify-between group">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black mb-3">
                <Image
                  src="/assets/culture_ceremony.png"
                  alt="Pertemuan anggota Sakala Motorcycle Club"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#C5AA00] uppercase tracking-wider block mb-1">
                  KEBERSAMAAN
                </span>
                <h4 className="font-serif-editorial text-sm font-bold text-white mb-1">
                  Silaturahmi &amp; Komitmen
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Pertemuan rutin untuk menjaga komunikasi, membahas agenda turing, dan mempererat solidaritas.
                </p>
              </div>
            </div>

            {/* Photo 3: Embroidered Colors Backpatch */}
            <div className="border border-white/10 bg-[#0C1724] p-3 rounded-xs flex flex-col justify-between group">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black mb-3">
                <Image
                  src="/assets/culture_patch.png"
                  alt="Atribut resmi backpatch Sakala MC"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#C5AA00] uppercase tracking-wider block mb-1">
                  ATRIBUT RESMI
                </span>
                <h4 className="font-serif-editorial text-sm font-bold text-white mb-1">
                  Lambang &amp; Warna Sakala
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Warna biru, kuning emas, dan hitam yang dijaga kehormatannya oleh setiap pemakai jaket.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Part 3: Real Instagram Feed Track */}
        {instagramConfig.enabled && (
          <div className="border-t border-white/10 pt-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 fill-[#E1306C]" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-xs font-bold tracking-wider text-white uppercase">
                  POSTINGAN INSTAGRAM {profileHandle}
                </span>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollCarousel('left')}
                  disabled={!canScrollLeft}
                  className="w-8 h-8 rounded-xs border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  disabled={!canScrollRight}
                  className="w-8 h-8 rounded-xs border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Instagram Track */}
            {loadingPosts ? (
              <div className="py-12 text-center text-xs text-[#94A3B8]">
                Memuat dokumentasi Instagram...
              </div>
            ) : posts.length === 0 ? (
              <div className="py-8 px-4 text-center bg-white/5 border border-white/10 rounded-xs">
                <p className="text-xs text-[#94A3B8] mb-3">Konten Instagram saat ini dapat diakses langsung di akun resmi.</p>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold rounded-xs transition-colors"
                >
                  <span>Buka @sakala_ina</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div
                ref={carouselRef}
                onScroll={checkScrollState}
                className="flex gap-4 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory"
              >
                {posts.map((post) => (
                  <div
                    key={post.shortcode || post.permalink}
                    className="snap-start shrink-0 w-[240px] sm:w-[260px]"
                  >
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="relative block aspect-[4/5] w-full rounded-xs overflow-hidden border border-white/10 hover:border-white/40 bg-[#0C1724] group transition-all"
                    >
                      {post.has_official_media && post.thumbnail_url ? (
                        <>
                          <Image
                            src={post.thumbnail_url}
                            alt={post.title || 'Dokumentasi Instagram Sakala'}
                            fill
                            sizes="260px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex flex-col justify-end">
                            {post.title && (
                              <p className="text-white text-[11px] line-clamp-2 leading-snug mb-1">
                                {post.title}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-[10px] text-white/70">
                              <span>Lihat di Instagram</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full p-5 flex flex-col items-center justify-center text-center bg-[#0B1522]">
                          <svg className="w-7 h-7 fill-[#E1306C] mb-2 opacity-80" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <p className="text-[11px] text-[#94A3B8] mb-3">Instagram post unavailable</p>
                          <span className="text-[10px] font-bold text-white bg-white/10 px-3 py-1 rounded-xs">
                            View on Instagram
                          </span>
                        </div>
                      )}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Part 4: Official Club Social Channels */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 text-xs">
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xs text-white transition-colors"
          >
            <span>Instagram: {profileHandle}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#E1306C]" />
          </a>
          <a
            href="https://youtube.com/@sakala.id25"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xs text-white transition-colors"
          >
            <span>YouTube: Sakala MC</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#FF0000]" />
          </a>
          <a
            href="https://www.tiktok.com/@sakala_ina"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xs text-white transition-colors"
          >
            <span>TikTok: @sakala_ina</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#00F2FE]" />
          </a>
        </div>
      </div>
    </section>
  );
}
