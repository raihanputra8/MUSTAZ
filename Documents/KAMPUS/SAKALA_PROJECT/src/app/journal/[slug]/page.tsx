import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Compass, 
  Thermometer, 
  Mountain, 
  Clock, 
  Camera, 
  User, 
  Volume2, 
  Share2, 
  Bookmark, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getJournalPostBySlug, getJournalPosts } from '@/lib/supabase/data';

interface JournalPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function JournalArticlePage({ params }: JournalPageProps) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getJournalPosts();
  const otherPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F5] text-[#070F18]">
      <Navbar />

      <main className="flex-1">
        {/* Top Editorial Breadcrumb & Category Bar */}
        <div className="border-b border-[#E5E2D9] bg-white">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold tracking-[0.2em] uppercase text-[#64748B]">
            <div className="flex items-center gap-2">
              <Link href="/#journal" className="hover:text-[#070F18] flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3 h-3" />
                <span>JOURNAL ARCHIVE</span>
              </Link>
              <span>/</span>
              <span className="text-[#0047AB]">{post.category}</span>
              <span>/</span>
              <span className="text-[#070F18]">DISPATCH 004</span>
            </div>

            <div className="flex items-center gap-4 text-[#070F18]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C5AA00]" />
                {post.read_time}
              </span>
              <span>•</span>
              <span>{post.publish_date}</span>
            </div>
          </div>
        </div>

        {/* Article Header & Editorial Masthead */}
        <header className="max-w-5xl mx-auto px-6 lg:px-8 pt-12 lg:pt-16 pb-10">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#0047AB] uppercase mb-4 block">
            EXPEDITION FIELD DISPATCH — OFFICIAL LOG
          </span>

          <h1 className="font-serif-editorial text-3xl sm:text-5xl lg:text-6xl font-black text-[#070F18] tracking-tight leading-[1.08] mb-6">
            {post.title}
          </h1>

          <p className="font-serif-editorial text-lg sm:text-xl lg:text-2xl text-[#475569] font-normal leading-relaxed italic max-w-4xl mb-8 border-l-2 border-[#C5AA00] pl-6">
            "{post.excerpt}"
          </p>

          {/* Expedition Field Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white border border-[#E5E2D9] rounded-xs text-xs mb-10 shadow-xs">
            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#64748B] uppercase block">
                PEAK ELEVATION
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#070F18]">
                <Mountain className="w-3.5 h-3.5 text-[#0047AB]" />
                <span>{post.elevation?.replace('//', '—') || '2,084 MASL'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#64748B] uppercase block">
                ATMOSPHERE • CLIMATE
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#070F18]">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>{post.temperature?.replace('//', '—') || '11°C — Heavy Fog'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#64748B] uppercase block">
                GPS COORDINATES
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#070F18]">
                <Compass className="w-3.5 h-3.5 text-[#C5AA00]" />
                <span className="font-mono text-[11px]">{post.coordinates || '6°46\'00"S 107°36\'00"E'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#64748B] uppercase block">
                ROAD CAPTAIN
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#070F18]">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{post.author}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Photographic Monograph */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-[#070F18] rounded-xs overflow-hidden border border-[#E5E2D9] shadow-lg">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Inset Photo Tag */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white">
              <div>
                <span className="text-[9px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase block mb-1">
                  ARCHIVAL MONOGRAPH — EXPEDITION NEGATIVE #4029
                </span>
                <p className="text-xs sm:text-sm font-medium text-white/90">
                  Plate 01 cutting through the sulfuric clouds along the rim of Kawah Ratu, Tangkuban Perahu at 03:14 WIB.
                </p>
              </div>
              <div className="text-[10px] text-white/60 font-mono sm:text-right">
                35MM ILFORD HP5+ — 1/60s f/2.8 ISO 1600
              </div>
            </div>
          </div>
        </section>

        {/* Audio Dispatch Bar (Editorial Feature) */}
        <section className="max-w-3xl mx-auto px-6 mb-12">
          <div className="bg-[#070F18] border border-[#2A374A] p-4 sm:p-5 rounded-xs flex items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C5AA00]/20 flex items-center justify-center text-[#C5AA00] flex-shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#C5AA00] uppercase block">
                  FIELD AUDIO DISPATCH (BANDUNG SOUND ARCHIVE)
                </span>
                <p className="text-xs font-bold text-white/90">
                  9 Parallel-Twin Engines Idling at Tangkuban Summit Crater (03:14 WIB)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#64748B] hidden sm:inline">02:45 / 04:30</span>
              <button 
                type="button"
                className="bg-[#C5AA00] hover:bg-white text-[#070F18] px-3.5 py-1.5 rounded-xs text-[10px] font-bold tracking-[0.16em] uppercase transition-colors"
              >
                LISTEN LOG
              </button>
            </div>
          </div>
        </section>

        {/* Editorial Body Content */}
        <article className="max-w-3xl mx-auto px-6 text-[#2D3748] leading-relaxed">
          {/* Formatted Story Markdown */}
          <div className="space-y-8 text-sm sm:text-base font-normal leading-[1.85]">
            <p className="first-letter:font-serif-editorial first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:text-[#070F18] first-letter:leading-none">
              The rain had been drumming a steady, hollow cadence on the corrugated zinc roof of the Ciroyom Atelier since sundown. Inside, the scent was of burnt SAE 20W-50 mineral oil, damp leather jackets, and the sharp metallic tang of fresh TIG-brazed chromoly tubing.
            </p>

            <p>
              Nine machines stood idling in the narrow alleyway off Jalan Jamika. Twin-cylinder parallel engines, a big-bore single 500cc thumper, and two vintage 1974 four-strokes with custom pie-cut open pipes. There were no turn signals. No digital instrument clusters. Just mechanical throttles, hand-turned brass fuel petcocks, and the amber glow of 6-volt halogen headlamps cutting through the exhaust fumes.
            </p>

            <div className="bg-[#FAF9F5] border-l-4 border-[#070F18] p-6 my-8 rounded-r-xs bg-white shadow-xs">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#0047AB] uppercase block mb-1">
                ROAD CAPTAIN'S BRIEFING — 01:30 WIB
              </span>
              <p className="font-serif-editorial text-base sm:text-lg italic font-semibold text-[#070F18] leading-relaxed">
                "Check the primary drive tensions once more. Once we hit the switchbacks past Setiabudhi, there is no shoulder to pull over. The road becomes black ice when the volcanic silt washes down from the tea slopes."
              </p>
              <span className="text-[10px] text-[#64748B] block mt-2 font-mono">
                — A. PRATAMA, SAKALA CIROYOM ATELIER
              </span>
            </div>

            <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#070F18] pt-6 tracking-tight">
              02:20 WIB — The Lembang Climb & The Cold Front
            </h3>

            <p>
              The transition from the Bandung basin to the high mountain air of Lembang is abrupt. Within fifteen kilometers, the ambient temperature plummeted from 23°C to 14°C. Condensation beaded on brass carb velocity stacks, chilling the mixture and requiring small, blind fingers on the pilot air screws at red lights.
            </p>

            <p>
              As we ascended past the Cikole pine groves, the streetlights vanished entirely. The darkness here is total, broken only by the yellow spears of our headlamps illuminating centuries-old eucalyptus trees standing like sentinels in the mist. 
            </p>

            <p>
              Driving a rigid frame machine through wet mountain hairpin turns requires an intimate bodily dialogue. Without rear suspension, every pebble, every seam of fresh tarmac, every pothole gouged by vegetable transport trucks is transmitted directly into the rider's pelvis and spine. You do not countersteer with casual ease; you lean your entire upper torso over the aluminum peanut tank, weighting the knurled footpegs, and listen for the subtle scrub of rubber slipping on moss.
            </p>

            {/* Giant Pull Quote */}
            <figure className="my-12 py-8 border-y-2 border-[#E5E2D9] text-center">
              <blockquote className="font-serif-editorial text-xl sm:text-2xl lg:text-3xl font-black text-[#070F18] leading-snug max-w-2xl mx-auto">
                “When the mist swallows your headlight twenty meters ahead, you don't steer with your eyes; you steer with the vibration of the crankcase through your ribs. You become the machine's primary dampener.”
              </blockquote>
              <figcaption className="text-[10px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase mt-4">
                CHIEF FRAME ARTISAN LOG — TANGKUBAN ASCENT
              </figcaption>
            </figure>

            {/* Photo Essay Dual Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-10 not-prose">
              <div className="space-y-2">
                <div className="relative aspect-[4/3] w-full bg-[#070F18] rounded-xs overflow-hidden border border-[#E5E2D9]">
                  <Image
                    src="/assets/culture_workshop.png"
                    alt="Pre-departure preparation at Ciroyom"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-[11px] text-[#64748B] italic">
                  Fig 1.1 — Final valve lash and primary chain inspection at 01:15 WIB before departing the Ciroyom garage.
                </p>
              </div>

              <div className="space-y-2">
                <div className="relative aspect-[4/3] w-full bg-[#070F18] rounded-xs overflow-hidden border border-[#E5E2D9]">
                  <Image
                    src="/assets/culture_members.png"
                    alt="The 9 riders regrouping in the mist"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <p className="text-[11px] text-[#64748B] italic">
                  Fig 1.2 — The guild regrouping at Cikole checkpoint under heavy drizzle and near-zero visibility.
                </p>
              </div>
            </div>

            <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#070F18] pt-6 tracking-tight">
              03:00 WIB — The Crater Walls (Kawah Ratu Summit)
            </h3>

            <p>
              At 03:00 WIB sharp, our tires ground into the volcanic gravel access road encircling the northern rim of Kawah Ratu. Here, at 2,084 meters above sea level, the air turned dense and choking with sulfur dioxide fumes blowing off the boiling sulfuric lake beneath.
            </p>

            <p>
              The engines were shut off one by one. The silence that followed was immense, broken only by the rhythmic pinging of rapidly cooling exhaust headers and the faint hiss of volcanic vents venting deep within the earth.
            </p>

            <p>
              Steam rose in thick white plumes from hot engine fins into the freezing drizzle. Pratama pulled a battered stainless thermos from his canvas roll and poured black Robusta coffee into tin cups. Nobody spoke for ten minutes. In the customs guild, the silence after a punishing ascent is the truest form of prayer.
            </p>

            {/* Technical Machine Matrix Box */}
            <div className="my-10 bg-[#070F18] text-white p-6 sm:p-8 rounded-xs border border-[#2A374A] shadow-lg not-prose">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2A374A]">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase block">
                    MECHANICAL ROSTER — ZERO CASUALTIES
                  </span>
                  <h4 className="font-serif-editorial text-xl sm:text-2xl font-bold text-white tracking-wide">
                    THE 5 EXPEDITION PILOT MACHINES
                  </h4>
                </div>
                <ShieldCheck className="w-6 h-6 text-[#C5AA00]" />
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-[#0D1926] rounded-xs border border-[#1E293B]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#C5AA00]">PLATE 01 — 1974 YAMAHA XS650 "SANGHYANG HEULEUT"</span>
                    <span className="text-[10px] text-[#64748B] font-mono">PILOT: A. PRATAMA</span>
                  </div>
                  <p className="text-white/70 text-[11px]">
                    Hand-formed 2.5mm aluminum monocoque, open Mikuni VM34 carbs, custom Girder front end. Survived 100% elevation ascent with zero vapor lock.
                  </p>
                </div>

                <div className="p-3.5 bg-[#0D1926] rounded-xs border border-[#1E293B]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#C5AA00]">PLATE 02 — 1968 HONDA CB450 BLACK BOMBER</span>
                    <span className="text-[10px] text-[#64748B] font-mono">PILOT: D. SATRIA</span>
                  </div>
                  <p className="text-white/70 text-[11px]">
                    Torsion bar valve springs, twin high-rise scrambler pipes, bronze oil cooler. Excellent low-end torque through the Cikole hairpin curves.
                  </p>
                </div>

                <div className="p-3.5 bg-[#0D1926] rounded-xs border border-[#1E293B]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#C5AA00]">PLATE 03 — 1981 KAWASAKI KZ750 TWIN</span>
                    <span className="text-[10px] text-[#64748B] font-mono">PILOT: R. HENDRA</span>
                  </div>
                  <p className="text-white/70 text-[11px]">
                    Hardtail loop, Ceriani 38mm forks, Bates vintage headlamp. Flawless ignition timing in wet sulfur conditions.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#070F18] pt-6 tracking-tight">
              05:15 WIB — Descent into the Ciater Tea Emeralds
            </h3>

            <p>
              As dawn cracked on the horizon, the sky shifted from bruised violet to pale amber. Below us lay the endless rolling terraces of the Ciater tea plantations, shrouded in sea-foam morning clouds. 
            </p>

            <p>
              With kickstarters kicked with stiff boots, the nine engines fired to life on the first stroke—warm combustion greeting the cold dawn. We leaned into the downhill sweeping turns towards Subang, throttle cables pulled taut, the roar echoing across the valley like ancient Sundanese brass gongs.
            </p>
          </div>

          {/* Author Dossier & Guild Stamp */}
          <div className="my-14 p-6 sm:p-8 bg-white border border-[#E5E2D9] rounded-xs shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-[#070F18] text-[#C5AA00] flex items-center justify-center font-serif-editorial text-2xl font-bold border-2 border-[#C5AA00] flex-shrink-0">
                AP
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#0047AB] uppercase">
                    AUTHOR & MASTER ARTISAN
                  </span>
                  <span>•</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">SAKALA VERIFIED</span>
                </div>
                <h4 className="font-serif-editorial text-xl font-bold text-[#070F18]">
                  {post.author}
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Lead frame builder and engine tuner at SAKALA Ciroyom Atelier. He has logged over 80,000 kilometers across the Indonesian archipelago on custom rigid chassis and specializes in vintage Japanese parallel twins.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Read Next Dispatches (Editorial Recirculation) */}
        <section className="bg-white border-t border-[#E5E2D9] py-16">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#0047AB] uppercase block mb-1">
                  CONTINUE READING
                </span>
                <h3 className="font-serif-editorial text-2xl sm:text-3xl font-black text-[#070F18]">
                  MORE DISPATCHES FROM THE ROAD
                </h3>
              </div>

              <Link
                href="/#journal"
                className="text-xs font-bold tracking-[0.16em] uppercase text-[#070F18] hover:text-[#C5AA00] transition-colors flex items-center gap-1.5"
              >
                <span>ALL DISPATCHES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {otherPosts.map((other) => (
                <Link
                  key={other.id}
                  href={`/journal/${other.slug}`}
                  className="group bg-[#FAF9F5] border border-[#E5E2D9] rounded-xs p-6 hover:border-[#070F18] transition-colors flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-[#0047AB] uppercase block mb-2">
                      {other.category} • {other.publish_date}
                    </span>
                    <h4 className="font-serif-editorial text-lg sm:text-xl font-bold text-[#070F18] group-hover:text-[#0047AB] transition-colors mb-3 leading-snug">
                      {other.title}
                    </h4>
                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                      {other.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#E5E2D9] flex items-center justify-between text-xs font-bold tracking-[0.16em] uppercase text-[#070F18]">
                    <span>READ MONOGRAPH</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
