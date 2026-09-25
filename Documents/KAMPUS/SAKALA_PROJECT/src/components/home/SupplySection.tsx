'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Plus } from 'lucide-react';
import { Product } from '@/types/database';
import { useCart } from '@/context/CartContext';
import EditableWrapper from '@/components/cms/EditableWrapper';
import { useInlineCMS } from '@/context/InlineCMSContext';
import { supabase } from '@/lib/supabase/client';
import { resolveAssetUrl } from '@/lib/supabase/data';

const CATEGORIES = [
  { id: 'all', label: 'SEMUA' },
  { id: 't-shirts', label: 'KAOS' },
  { id: 'hoodies', label: 'HOODIE' },
  { id: 'jackets', label: 'JAKET' },
  { id: 'headwear', label: 'TOPI' },
];

export default function SupplySection({ initialProducts }: { initialProducts: Product[] }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const { isEditMode, refreshKey } = useInlineCMS();

  // Re-fetch data when CMS triggers a refresh
  const refetchProducts = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) {
        setProducts((data as Product[]).map(p => ({ ...p, image_url: resolveAssetUrl(p.image_url) })));
      }
    } catch {
      // keep existing data
    }
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      refetchProducts();
    }
  }, [refreshKey, refetchProducts]);

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="supply" className="bg-[#FAF9F5] py-14 sm:py-20 lg:py-24 border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 pb-6 border-b border-[#E5E2D9] gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#0047AB] uppercase mb-2 block">
              PERLENGKAPAN &amp; APPAREL RESMI
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-extrabold text-[#070F18] tracking-tight leading-tight">
              SAKALA SUPPLY
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-2 max-w-xl leading-relaxed">
              Atribut dan apparel resmi Sakala Motorcycle Club Bandung. Diproduksi terbatas dengan bahan tahan pakai untuk berkendara.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Clean Category Filters */}
            <div className="flex items-center gap-1.5 bg-white border border-[#E5E2D9] p-1 rounded-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#070F18] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#070F18]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#070F18] hover:text-[#0047AB] uppercase ml-2 transition-colors"
            >
              <span>KATALOG LENGKAP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Editorial Lookbook Catalog Spread */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isWaitlist = product.stock_status === 'waitlist';

            return (
              <EditableWrapper
                key={product.id}
                item={{ type: 'product', id: product.id, data: product as unknown as Record<string, unknown> }}
              >
                <div className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs hover:border-[#070F18] transition-all flex flex-col justify-between group h-full">
                  {/* Product Image Stage */}
                  <Link
                    href={`/shop/${product.id}`}
                    className="relative aspect-square w-full bg-[#FAF9F5] p-6 flex items-center justify-center border-b border-[#E5E2D9] overflow-hidden block"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-xs bg-white/90 border border-[#E5E2D9] text-[#070F18]">
                        {product.stock_status === 'available'
                          ? 'Tersedia'
                          : product.stock_status === 'low_stock'
                          ? `Sisa ${product.stock_count}`
                          : 'Habis'}
                      </span>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-[#64748B] block mb-1 font-mono">
                        SKU: {product.sku}
                      </span>

                      <Link href={`/shop/${product.id}`}>
                        <h3 className="font-serif-editorial text-base sm:text-lg font-bold text-[#070F18] mb-2 group-hover:text-[#0047AB] transition-colors leading-snug">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="text-sm font-black text-[#0047AB] mb-4">
                        IDR {product.price_idr.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E2D9] flex items-center gap-2">
                      <button
                        onClick={() => addToCart(product, 'L')}
                        disabled={isWaitlist}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#070F18] hover:bg-[#0047AB] text-white py-2.5 px-3 text-[10px] font-bold tracking-wider uppercase rounded-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isWaitlist ? 'Habis' : 'Tambah'}</span>
                      </button>

                      <Link
                        href={`/shop/${product.id}`}
                        className="inline-flex items-center justify-center px-3 py-2.5 border border-[#E5E2D9] hover:border-[#070F18] text-[#070F18] text-[10px] font-bold uppercase rounded-xs transition-colors"
                        title="Lihat Detail Produk"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </EditableWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
