'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/database';

const CATALOG_ITEMS: Product[] = [
  {
    id: 'prod-01',
    sku: 'SKL-TEE-01',
    name: 'CIRCLE EMBLEM HEAVYWEIGHT TEE',
    category: 't-shirts',
    price_idr: 385000,
    price_usd: 26,
    stock_status: 'available',
    stock_count: 15,
    description: '280 GSM Ring-Spun Cotton. Vintage Off-White with deep navy screenprint.',
    image_url: '/assets/product_tee.png',
  },
  {
    id: 'prod-02',
    sku: 'SKL-HD-02',
    name: 'GARAGE CREW ZIP HOODIE',
    category: 'hoodies',
    price_idr: 720000,
    price_usd: 52,
    stock_status: 'low_stock',
    stock_count: 4,
    description: '480 GSM French Terry. Grounding Black with Golden Yellow embroidery.',
    image_url: '/assets/product_hoodie.png',
  },
  {
    id: 'prod-03',
    sku: 'SKL-JKT-03',
    name: 'BROTHERHOOD COACH JACKET',
    category: 'jackets',
    price_idr: 1150000,
    price_usd: 82,
    stock_status: 'available',
    stock_count: 8,
    description: 'Weatherproof Japanese Nylon. Sakala Royal Blue with quilted lining.',
    image_url: '/assets/product_jacket.png',
  },
  {
    id: 'prod-04',
    sku: 'SKL-CAP-04',
    name: 'LOYALTY TRUCKER CAP',
    category: 'headwear',
    price_idr: 260000,
    price_usd: 18,
    stock_status: 'waitlist',
    stock_count: 0,
    description: 'Heavy Mesh & Twill. Stamped brass closure, Grounding Black finish.',
    image_url: '/assets/product_cap.png',
  },
  {
    id: 'prod-05',
    sku: 'SKL-TEE-05',
    name: 'KUJANG LONG-SLEEVE TEE',
    category: 't-shirts',
    price_idr: 440000,
    price_usd: 30,
    stock_status: 'available',
    stock_count: 12,
    description: '300 GSM Heavy Cotton. Raw Bone cotton with distressed gold sleeve print.',
    image_url: '/assets/manifesto_thumb.png',
  },
  {
    id: 'prod-06',
    sku: 'SKL-SHT-06',
    name: 'BANDUNG ATELIER WORK SHIRT',
    category: 'jackets',
    price_idr: 890000,
    price_usd: 64,
    stock_status: 'available',
    stock_count: 6,
    description: '12oz Herringbone Twill. Dual chest utility pockets, vintage brass rivets.',
    image_url: '/assets/culture_workshop.png',
  },
  {
    id: 'prod-07',
    sku: 'SKL-CAP-07',
    name: 'CIROYOM SPEED GUILD SNAPBACK',
    category: 'headwear',
    price_idr: 290000,
    price_usd: 21,
    stock_status: 'available',
    stock_count: 9,
    description: 'Heavy-Wale Corduroy. Flat brim, Royal Blue with gold 3D bullion lettering.',
    image_url: '/assets/product_cap.png',
  },
  {
    id: 'prod-08',
    sku: 'SKL-VST-08',
    name: 'SUBANG PASS WAXED VEST',
    category: 'jackets',
    price_idr: 1450000,
    price_usd: 105,
    stock_status: 'waitlist',
    stock_count: 0,
    description: '16oz Halley Stevensons Canvas. Flannel lined, heavy brass 2-way zipper.',
    image_url: '/assets/culture_ceremony.png',
  },
  {
    id: 'prod-09',
    sku: 'SKL-ACC-09',
    name: 'LEATHER KEY FOB & CARABINER',
    category: 'accessories',
    price_idr: 210000,
    price_usd: 15,
    stock_status: 'available',
    stock_count: 20,
    description: '4mm Tochigi Veg-Tan Leather. Solid stamped Japanese brass, saddle-stitched.',
    image_url: '/assets/culture_patch.png',
  },
  {
    id: 'prod-10',
    sku: 'SKL-ACC-10',
    name: 'BROTHERHOOD BANDANA PACK',
    category: 'accessories',
    price_idr: 180000,
    price_usd: 13,
    stock_status: 'available',
    stock_count: 35,
    description: '100% Selvedge Cotton (Set of 2). Discharge printed with Parahyangan pattern.',
    image_url: '/assets/journal_subang.png',
  },
  {
    id: 'prod-11',
    sku: 'SKL-TOOL-11',
    name: 'MOTO-TOOL ROLL NO. 01',
    category: 'accessories',
    price_idr: 480000,
    price_usd: 34,
    stock_status: 'available',
    stock_count: 10,
    description: 'Water-Repellent Heavy Duck Canvas. Slotted wrench compartments, bridle leather strap.',
    image_url: '/assets/culture_workshop.png',
  },
  {
    id: 'prod-12',
    sku: 'SKL-PIN-12',
    name: 'CIRCULAR ENAMEL PIN SET',
    category: 'accessories',
    price_idr: 150000,
    price_usd: 11,
    stock_status: 'available',
    stock_count: 50,
    description: 'Stamped Brass & Cloisonné. Hard enamel in Sakala Royal Blue and Gold.',
    image_url: '/assets/sakala_emblem.png',
  },
];

const FILTER_TABS = [
  { id: 'all', label: 'ALL GEAR [24]' },
  { id: 't-shirts', label: 'HEAVYWEIGHT TEES [8]' },
  { id: 'hoodies', label: 'HOODIES & FLEECE [4]' },
  { id: 'jackets', label: 'RIDING JACKETS & VESTS [3]' },
  { id: 'headwear', label: 'HEADWEAR & CAPS [5]' },
  { id: 'accessories', label: 'LEATHER & ATELIER TOOLS [4]' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('L');
  const { addToCart } = useCart();

  const filteredItems =
    activeCategory === 'all'
      ? CATALOG_ITEMS
      : CATALOG_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F5]">
      <Navbar />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="pt-12 pb-8 border-b border-[#E5E2D9]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif-editorial text-4xl sm:text-6xl font-black text-[#070F18] tracking-tight leading-none mb-3">
                SAKALA SUPPLY
              </h1>
              <p className="text-xs sm:text-sm text-[#475569] max-w-2xl leading-relaxed">
                Gear for the Brotherhood. Heavyweight textiles, chain-stitched insignias, and industrial-grade motorcycle apparel built for the asphalt corridor.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white border border-[#E5E2D9] px-4 py-2.5 rounded-xs flex-shrink-0 shadow-xs">
              <div className="w-8 h-8 rounded bg-[#070F18] flex items-center justify-center p-1.5 flex-shrink-0">
                <Image
                  src="/assets/sakala_emblem.png"
                  alt="Guild Insignia"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#070F18] uppercase block">
                  OFFICIAL ARCHIVE
                </span>
                <span className="text-[9px] tracking-[0.2em] text-[#64748B] uppercase block">
                  GUILD SPECIMEN DISPATCH
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar & Controls */}
        <section className="py-4 bg-[#F5F4EF] border-b border-[#E5E2D9] sticky top-20 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`text-[10px] font-bold tracking-[0.16em] uppercase px-3 py-1.5 rounded-xs transition-colors ${
                    activeCategory === tab.id
                      ? 'bg-[#070F18] text-white shadow-xs'
                      : 'bg-white text-[#475569] border border-[#E5E2D9] hover:border-[#070F18]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Size Selector */}
            <div className="flex items-center gap-3 self-end lg:self-auto">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase">
                SIZE:
              </span>
              <div className="flex items-center gap-1.5">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-7 h-7 text-[10px] font-bold rounded-xs flex items-center justify-center transition-colors ${
                      selectedSize === size
                        ? 'bg-[#070F18] text-white'
                        : 'bg-white border border-[#E5E2D9] text-[#64748B] hover:border-[#070F18]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Drop Banner */}
        <section className="py-8 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="bg-[#070F18] text-white rounded-xs p-8 lg:p-12 border border-[#C5AA00]/30 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#C5AA00] uppercase block mb-3">
                DROP 04 — MONSOON TRANSIT FLEECE & LEATHER
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                ENGINEERED FOR ASPHALT CLIMBS
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-8 max-w-xl">
                Engineered for saturated highway runs from Bandung down through the Subang elevation drop. Featuring Japanese weatherproof twill, dual-density fleece storm collars, and solid brass hardware.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => addToCart(CATALOG_ITEMS[2], selectedSize)}
                  className="inline-flex items-center gap-2 bg-[#0047AB] hover:bg-[#00388A] text-white px-6 py-3 text-xs font-bold tracking-[0.18em] uppercase rounded-xs transition-colors"
                >
                  <span>ACQUIRE CAPSULE SPECIMEN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#C5AA00] uppercase">
                  STRICTLY LIMITED TO 100 NUMBERED UNITS
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-64 sm:h-80 rounded-xs overflow-hidden border border-[#C5AA00]/20">
              <Image
                src="/assets/product_jacket.png"
                alt="Drop 04 Capsule"
                fill
                className="object-contain p-4 bg-[#0C1724]"
              />
            </div>
          </div>
        </section>

        {/* Inventory Index Title */}
        <section className="pt-8 pb-4 max-w-7xl mx-auto px-6 lg:px-12">
          <span className="text-[10px] font-bold tracking-[0.22em] text-[#64748B] uppercase">
            CURRENT INVENTORY INDEX
          </span>
        </section>

        {/* 12 Products Grid */}
        <section className="pb-20 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const isWaitlist = item.stock_status === 'waitlist';

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <Link 
                    href={`/shop/${item.id}`}
                    className="relative h-64 w-full bg-[#FAF9F5] p-6 flex items-center justify-center border-b border-[#E5E2D9] overflow-hidden block"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold tracking-[0.18em] text-[#64748B] uppercase block mb-1">
                        SKU: {item.sku}
                      </span>
                      <Link href={`/shop/${item.id}`}>
                        <h3 className="font-serif-editorial text-sm font-bold text-[#070F18] leading-snug mb-2 group-hover:text-[#0047AB] transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-[#64748B] leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E5E2D9] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#070F18] block">
                          IDR {item.price_idr.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-[#94A3B8] font-medium block">
                          / ${item.price_usd} USD
                        </span>
                      </div>

                      {isWaitlist ? (
                        <button
                          onClick={() => alert(`Registered for waitlist: ${item.name}`)}
                          className="bg-[#FAF9F5] border border-[#E5E2D9] hover:bg-[#070F18] hover:text-white text-[#070F18] text-[9px] font-bold tracking-[0.16em] uppercase px-3 py-2 rounded-xs transition-colors"
                        >
                          WAITLIST
                        </button>
                      ) : (
                        <button
                          onClick={() => addToCart(item, selectedSize)}
                          className="bg-[#070F18] hover:bg-[#0047AB] text-white text-[10px] font-bold tracking-[0.18em] uppercase px-4 py-2 rounded-xs transition-colors shadow-xs"
                        >
                          ACQUIRE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
