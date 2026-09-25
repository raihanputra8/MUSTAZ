'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  Play
} from 'lucide-react';
import ScrollReveal from '@/components/common/ScrollReveal';
import EditableWrapper from '@/components/cms/EditableWrapper';
import { useInlineCMS } from '@/context/InlineCMSContext';

function getYouTubeVideoId(url: string): string {
  if (!url) return 'IK0VG7j2P9s';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.trim().match(regExp);
  return (match && match[2].length === 11) ? match[2] : 'IK0VG7j2P9s';
}

export default function CultureSection() {
  const { getContent, isEditMode } = useInlineCMS();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isAutoPlayTriggered, setIsAutoPlayTriggered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 1. Official Social Links
  const officialLinks = {
    instagram: 'https://www.instagram.com/sakala_ina?stkn=ZDNlZDc0MzIxNw==',
    youtube: 'https://youtube.com/@sakala.id25?si=4ScKIl-5ZM3UJ0tS',
    tiktok: 'https://www.tiktok.com/@sakala_ina?is_from_webapp=1&sender_device=pc',
  };

  // 2. Instagram Profile Header (Editable via CMS)
  const profile = getContent('culture_ig_profile', {
    name: 'Sakala Motorcycle Club Indonesia',
    handle: '@sakala_ina',
    posts_count: '3.0K posts',
    followers_count: '47K followers',
    follow_url: 'https://www.instagram.com/sakala_ina?stkn=ZDNlZDc0MzIxNw==',
  });

  // 3. Instagram Feed Posts (Editable via CMS: Link IG, Gambar, Tanggal, dll)
  const defaultPosts = [
    {
      id: 'culture_ig_1',
      title: 'Sakala Motorcycle Club',
      image_url: '/assets/culture_ceremony.png',
      caption: 'Deklarasi SAKALA MC di Padepokan Parukuyan. Menjunjung tinggi adat dan persaudaraan Nusantara.',
      date: '15 April 2026',
      media_type: 'video',
      link: 'https://www.instagram.com/sakala_ina?stkn=ZDNlZDc0MzIxNw==',
    },
    {
      id: 'culture_ig_2',
      title: 'Sakala Motorcycle Club',
      image_url: '/assets/culture_workshop.png',
      caption: 'Garage night di Ciroyom. Menghidupkan kembali karakter mesin klasik bersama para anggota.',
      date: '14 April 2026',
      media_type: 'video',
      link: 'https://www.instagram.com/sakala_ina?stkn=ZDNlZDc0MzIxNw==',
    },
    {
      id: 'culture_ig_3',
      title: 'Sakala Motorcycle Club',
      image_url: '/assets/culture_members.png',
      caption: 'Bukan sekadar rombongan, kami adalah lingkaran persaudaraan seumur hidup. A circle, not a crowd.',
      date: '07 May 2026',
      media_type: 'video',
      link: 'https://www.instagram.com/sakala_ina?stkn=ZDNlZDc0MzIxNw==',
    },
    {
      id: 'culture_ig_4',
      title: 'Sakala Motorcycle Club',
      image_url: '/assets/culture_patch.png',
      caption: 'Insignia & Cakra Rahayu Kencana. Lambang kehormatan, keselamatan, dan loyalitas tanpa syarat.',
      date: '02 June 2026',
      media_type: 'video',
      link: 'https://www.instagram.com/sakala_ina?stkn=ZDNlZDc0MzIxNw==',
    },
    {
      id: 'culture_ig_5',
      title: 'Sakala Motorcycle Club',
      image_url: '/assets/journal_subang.png',
      caption: 'Highland Monsoon Run. Menembus kabut Cikole menuju Puncak Pas.',
      date: '18 July 2026',
      media_type: 'video',
      link: 'https://www.instagram.com/sakala_ina?stkn=ZDNlZDc0MzIxNw==',
    },
    {
      id: 'culture_ig_6',
      title: 'Sakala Motorcycle Club',
      image_url: '/assets/bike_cb550.png',
      caption: '1978 Honda CB550 Four Beneli — Hand-crafted raw displacement atelier build.',
      date: '24 August 2026',
      media_type: 'video',
      link: 'https://www.instagram.com/sakala_ina?stkn=ZDNlZDc0MzIxNw==',
    },
  ];

  const posts = defaultPosts.map((post) => {
    const saved = getContent(post.id, post);
    return {
      ...post,
      ...saved,
      title: saved.title || post.title,
      image_url: saved.image_url || post.image_url,
      caption: saved.caption || saved.description || post.caption,
      date: saved.date || post.date,
      link: saved.link || saved.post_link || saved.external_link || post.link,
    };
  });

  // 4. YouTube Video Content (Editable via CMS)
  const videoContent = getContent('culture_video', {
    title: 'SAKALA MOTORCYCLE CLUB — OFFICIAL VIDEO',
    video_url: 'https://youtu.be/IK0VG7j2P9s',
    image_url: '/assets/culture_ceremony.png',
  });

  const youtubeVideoId = getYouTubeVideoId(videoContent.video_url || 'https://youtu.be/IK0VG7j2P9s');

  // Carousel scroll controls
  const checkScrollState = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.75;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkScrollState();
  }, [posts]);

  // Auto-play YouTube on scroll into view
  useEffect(() => {
    if (!videoContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsAutoPlayTriggered(true);
        }
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(videoContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="culture" className="bg-[#070F18] text-white py-16 sm:py-20 lg:py-24 border-b border-[#C5AA00]/20 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0047AB]/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* 1. DI TENGAH: LOGO SAKALA_MC.PNG */}
        <ScrollReveal direction="up" delay={50} className="flex flex-col items-center justify-center text-center mb-12 sm:mb-14">
          <div className="relative w-32 h-32 sm:w-44 sm:h-44 drop-shadow-[0_20px_45px_rgba(197,170,0,0.25)] hover:scale-105 transition-transform duration-500">
            <Image
              src="/assets/SAKALA_MC.PNG"
              alt="Sakala MC Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-serif-editorial text-2xl sm:text-4xl font-black tracking-[0.14em] text-white mt-3 block">
            SAKALA MOTORCYCLE CLUB
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase mt-1">
            EST. 2026 • BANDUNG GUILD
          </span>
        </ScrollReveal>

        {/* 2. INSTAGRAM FEED WIDGET (HEADER + POSTS CAROUSEL DENGAN DESAIN PERSIS REFERENSI USER) */}
        <ScrollReveal direction="up" delay={80} className="mb-14 sm:mb-16">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-7 backdrop-blur-xs shadow-2xl">
            
            {/* Header: Avatar, Name, Stats & Blue Follow Button */}
            <EditableWrapper
              item={{
                type: 'content',
                id: 'culture_ig_profile',
                data: profile,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 px-1">
                {/* Left Profile Info */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 p-0.5 bg-[#0C1724] shrink-0 shadow-lg">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src="/assets/SAKALA_MC.PNG"
                        alt="Sakala MC"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                      {profile.name || 'Sakala Motorcycle Club Indonesia'}
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-[13px] text-[#94A3B8] font-normal flex-wrap mt-0.5">
                      <span className="text-[#CBD5E1] font-medium">{profile.handle || '@sakala_ina'}</span>
                      <span className="text-white/40">•</span>
                      <span>{profile.posts_count || '3.0K posts'}</span>
                      <span className="text-white/40">•</span>
                      <span>{profile.followers_count || '47K followers'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Instagram Verified Blue Follow Button */}
                <a
                  href={profile.follow_url || officialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="self-start sm:self-center inline-flex items-center gap-2 bg-[#0095F6] hover:bg-[#1877F2] text-white px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 btn-tactile cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Follow</span>
                </a>
              </div>
            </EditableWrapper>

            {/* Horizontal Feed Cards Slider / Carousel */}
            <div className="relative group/carousel">
              
              {/* Floating Left Arrow */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white text-[#070F18] rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Previous posts"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

              {/* Feed Track */}
              <div
                ref={carouselRef}
                onScroll={checkScrollState}
                className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 px-1 snap-x snap-mandatory"
              >
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="snap-start shrink-0 w-[240px] sm:w-[260px] md:w-[275px]"
                  >
                    <EditableWrapper
                      item={{
                        type: 'content',
                        id: post.id,
                        data: {
                          title: post.title,
                          caption: post.caption,
                          description: post.caption,
                          image_url: post.image_url,
                          link: post.link,
                          date: post.date,
                          media_type: post.media_type,
                        },
                      }}
                      className="h-full"
                    >
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noreferrer"
                        className="relative block aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 bg-[#0C1724] shadow-xl group transition-all duration-300"
                        title={post.caption || post.title}
                      >
                        {/* Media Cover Image */}
                        <Image
                          src={post.image_url}
                          alt={post.caption || post.title}
                          fill
                          sizes="280px"
                          unoptimized={Boolean(post.image_url?.includes('fbcdn.net') || post.image_url?.includes('cdninstagram.com'))}
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />

                        {/* Top-Right Reel / Video Badge (Persis di Screenshot User) */}
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>

                        {/* Bottom Info Gradient Overlay (Persis di Screenshot User) */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent pt-14 pb-3.5 px-3.5 flex items-end justify-between gap-2">
                          {/* Mini Avatar + Name + Date */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="relative w-6 h-6 rounded-full border border-white/40 overflow-hidden bg-black shrink-0">
                              <Image
                                src="/assets/SAKALA_MC.PNG"
                                alt="Sakala"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex flex-col">
                              <span className="text-white text-[11px] font-semibold leading-tight truncate">
                                {post.title || 'Sakala Motorcycle ...'}
                              </span>
                              <span className="text-white/70 text-[9.5px] leading-tight mt-0.5">
                                {post.date || '15 April 2026'}
                              </span>
                            </div>
                          </div>

                          {/* Instagram Logo Icon on Bottom Right */}
                          <svg className="w-4 h-4 fill-white shrink-0 opacity-90 mb-0.5" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                      </a>
                    </EditableWrapper>
                  </div>
                ))}
              </div>

              {/* Floating Right Arrow (Persis di Screenshot User) */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white text-[#070F18] rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Next posts"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

            </div>
          </div>
        </ScrollReveal>

        {/* 3. AKUN MEDIA SOSIAL (Tombol Akses Saluran Resmi) */}
        <ScrollReveal direction="up" delay={100} className="mb-14 sm:mb-16">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            {/* Instagram */}
            <a
              href={officialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#E1306C] hover:bg-[#E1306C]/10 transition-all text-xs font-semibold text-white group shadow-sm hover:scale-105"
            >
              <svg className="w-4 h-4 fill-current text-[#E1306C]" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>@sakala_ina</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* YouTube */}
            <a
              href={officialLinks.youtube}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#FF0000] hover:bg-[#FF0000]/10 transition-all text-xs font-semibold text-white group shadow-sm hover:scale-105"
            >
              <svg className="w-4 h-4 fill-current text-[#FF0000]" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>@sakala.id25</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* TikTok */}
            <a
              href={officialLinks.tiktok}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#00F2FE] hover:bg-[#00F2FE]/10 transition-all text-xs font-semibold text-white group shadow-sm hover:scale-105"
            >
              <svg className="w-3.5 h-3.5 fill-current text-[#00F2FE]" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              <span>@sakala_ina</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </ScrollReveal>

        {/* 4. VIDEO UTAMA (CLEAN: AUTO-PLAY SAAT SCROLL KE SECTION, CMS EDITABLE) */}
        <ScrollReveal direction="up" delay={120}>
          <div className="max-w-3xl mx-auto" ref={videoContainerRef}>
            <EditableWrapper
              item={{
                type: 'content',
                id: 'culture_video',
                data: {
                  title: videoContent.title,
                  video_url: videoContent.video_url,
                  image_url: videoContent.image_url,
                },
              }}
            >
              <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-[#C5AA00]/30 group">
                {/* YouTube Iframe Player with Scroll Autoplay */}
                {isAutoPlayTriggered ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&mute=1&playsinline=1&controls=1&loop=1&playlist=${youtubeVideoId}`}
                    title={videoContent.title || 'SAKALA Motorcycle Club Official Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={videoContent.image_url || '/assets/culture_ceremony.png'}
                      alt="Video Thumbnail"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#0047AB] text-white flex items-center justify-center shadow-2xl">
                        <Play className="w-7 h-7 fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </EditableWrapper>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
