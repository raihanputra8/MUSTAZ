'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Play, 
  ExternalLink, 
  Heart, 
  MessageCircle, 
  ArrowUpRight
} from 'lucide-react';
import ScrollReveal from '@/components/common/ScrollReveal';

export default function CultureSection() {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const officialLinks = {
    instagram: 'https://www.instagram.com/sakala_ina?stkn=ZDNlZDc0MzIxNw==',
    youtube: 'https://youtube.com/@sakala.id25?si=4ScKIl-5ZM3UJ0tS',
    tiktok: 'https://www.tiktok.com/@sakala_ina?is_from_webapp=1&sender_device=pc',
    video: 'https://youtu.be/IK0VG7j2P9s',
  };

  const instagramPosts = [
    {
      id: 'post-1',
      image: '/assets/culture_ceremony.png',
      caption: 'Deklarasi SAKALA MC di Padepokan Parukuyan. Menjunjung tinggi adat dan persaudaraan Nusantara.',
      likes: '1.248',
      comments: '86',
      date: 'Terbaru',
    },
    {
      id: 'post-2',
      image: '/assets/culture_workshop.png',
      caption: 'Garage night di Ciroyom. Menghidupkan kembali karakter mesin klasik bersama para anggota.',
      likes: '942',
      comments: '53',
      date: '3 hari lalu',
    },
    {
      id: 'post-3',
      image: '/assets/culture_members.png',
      caption: 'Bukan sekadar rombongan, kami adalah lingkaran persaudaraan seumur hidup. A circle, not a crowd.',
      likes: '1.580',
      comments: '112',
      date: '1 minggu lalu',
    },
    {
      id: 'post-4',
      image: '/assets/culture_patch.png',
      caption: 'Insignia & Cakra Rahayu Kencana. Lambang kehormatan, keselamatan, dan loyalitas tanpa syarat.',
      likes: '2.110',
      comments: '147',
      date: '2 minggu lalu',
    },
  ];

  return (
    <section id="culture" className="bg-[#070F18] text-white py-16 sm:py-20 lg:py-28 border-b border-[#C5AA00]/20 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0047AB]/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={50} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase mb-2 block">
            05 / CULTURE — CLUB ACTIVITIES
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            BROTHERHOOD IN MOTION
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-xl mx-auto">
            Dokumentasi perjalanan, persaudaraan, dan aktivitas guild SAKALA di aspal Nusantara dan atelier Bandung.
          </p>
        </ScrollReveal>

        {/* 1. DI TENGAH: LOGO SAKALA_MC.PNG */}
        <ScrollReveal direction="up" delay={100} className="flex flex-col items-center justify-center text-center mb-14">
          <div className="relative w-36 h-36 sm:w-48 sm:h-48 drop-shadow-[0_20px_45px_rgba(197,170,0,0.28)] hover:scale-105 transition-transform duration-500">
            <Image
              src="/assets/SAKALA_MC.PNG"
              alt="Sakala MC Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-serif-editorial text-2xl sm:text-3xl font-black tracking-[0.16em] text-white mt-4 block">
            SAKALA MOTORCYCLE CLUB
          </span>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase mt-1">
            EST. 2026 • BANDUNG GUILD
          </span>
        </ScrollReveal>

        {/* 2. AKUN MEDIA SOSIAL (Tombol Akses Resmi) */}
        <ScrollReveal direction="up" delay={140} className="mb-14">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            {/* Instagram */}
            <a
              href={officialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#E1306C] hover:bg-[#E1306C]/10 transition-all text-xs font-semibold text-white group shadow-sm"
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
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#FF0000] hover:bg-[#FF0000]/10 transition-all text-xs font-semibold text-white group shadow-sm"
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
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#00F2FE] hover:bg-[#00F2FE]/10 transition-all text-xs font-semibold text-white group shadow-sm"
            >
              <svg className="w-3.5 h-3.5 fill-current text-[#00F2FE]" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              <span>@sakala_ina</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </ScrollReveal>

        {/* 3. PREVIEW POSTINGAN INSTAGRAM */}
        <div className="mb-16 sm:mb-20">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 fill-current text-[#E1306C]" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-xs font-bold tracking-wider uppercase text-white">
                INSTAGRAM DISPATCHES (@SAKALA_INA)
              </span>
            </div>
            <a
              href={officialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-bold tracking-widest text-[#C5AA00] hover:underline uppercase inline-flex items-center gap-1"
            >
              <span>BUKA INSTAGRAM</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          {/* Instagram Post Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {instagramPosts.map((post, idx) => (
              <a
                key={post.id}
                href={officialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="bg-[#0C1724] border border-white/10 rounded-xs overflow-hidden group hover:border-[#C5AA00] transition-all flex flex-col shadow-lg"
              >
                <div className="relative h-60 w-full overflow-hidden bg-black/40">
                  <Image
                    src={post.image}
                    alt={post.caption}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-xs text-[8px] text-[#C5AA00] font-bold uppercase">
                    {post.date}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#CBD5E1] line-clamp-2 leading-relaxed">
                    {post.caption}
                  </p>
                  <span className="text-[9.5px] font-bold tracking-wider text-[#C5AA00] uppercase mt-3 inline-flex items-center gap-1">
                    <span>Lihat di Instagram</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 4. VIDEO UTAMA DENGAN HYPERLINK KE YOUTUBE */}
        <ScrollReveal direction="up" delay={180}>
          <div className="bg-[#0C1724] border border-[#C5AA00]/30 rounded-xs overflow-hidden shadow-2xl">
            <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase block mb-1">
                  OFFICIAL CINEMATIC DISPATCH • YOUTUBE ARCHIVE
                </span>
                <h3 className="font-serif-editorial text-2xl sm:text-3xl font-black text-white tracking-tight">
                  SAKALA MOTORCYCLE CLUB — OFFICIAL VIDEO
                </h3>
              </div>

              <a
                href={officialLinks.video}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF0000] hover:bg-[#D90000] text-white text-xs font-bold tracking-widest uppercase rounded-xs transition-colors shrink-0 shadow-md"
              >
                <span>TONTON DI YOUTUBE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Video Player / Interactive Hyperlink Cover */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center group overflow-hidden">
              {isPlayingVideo ? (
                <iframe
                  src="https://www.youtube-nocookie.com/embed/IK0VG7j2P9s?autoplay=1"
                  title="SAKALA Motorcycle Club Official Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <>
                  <Image
                    src="/assets/culture_ceremony.png"
                    alt="SAKALA Video Cover"
                    fill
                    className="object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 pointer-events-none" />

                  {/* Center Play Button & Direct Action */}
                  <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4">
                    <button
                      onClick={() => setIsPlayingVideo(true)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#C5AA00] hover:bg-[#D4B800] text-black flex items-center justify-center pl-1 shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer group/btn"
                      aria-label="Putar Video SAKALA"
                    >
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
                    </button>
                    
                    <div>
                      <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white block">
                        KLIK UNTUK MEMUTAR DI WEB
                      </span>
                      <a
                        href={officialLinks.video}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#C5AA00] hover:underline tracking-wider uppercase inline-flex items-center gap-1 mt-1 font-semibold"
                      >
                        <span>Atau Buka Langsung di YouTube</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
