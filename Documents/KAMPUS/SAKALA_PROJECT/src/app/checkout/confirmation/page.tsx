'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Printer, PackageCheck } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'SKL-782910';
  const total = searchParams.get('total') ? Number(searchParams.get('total')) : 1185000;

  return (
    <main className="flex-1 py-16 max-w-3xl mx-auto px-6 w-full">
      <div className="bg-white border border-[#E5E2D9] rounded-xs p-8 sm:p-12 shadow-sm text-center">
        {/* Status Badge */}
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <span className="text-[10px] font-bold tracking-[0.25em] text-[#0047AB] uppercase block mb-2">
          ORDER MANIFEST STATUS — CONFIRMED
        </span>

        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-black text-[#070F18] tracking-tight mb-3">
          DISPATCH RECEIPT AUTHORIZED
        </h1>

        <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mb-8">
          Your dispatch manifest has been registered into SAKALA Supply logistics queue. Packing underway at the Ciroyom Atelier.
        </p>

        {/* Receipt Details Box */}
        <div className="bg-[#FAF9F5] border border-[#E5E2D9] rounded-xs p-6 text-left mb-8 text-xs space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-[#E5E2D9]">
            <span className="text-[#64748B] uppercase font-bold text-[10px]">MANIFEST REGISTRATION ID</span>
            <span className="font-bold text-[#070F18]">{orderId}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-[#E5E2D9]">
            <span className="text-[#64748B] uppercase font-bold text-[10px]">DISPATCH ORIGIN</span>
            <span className="font-bold text-[#070F18]">SAKALA CIROYOM ATELIER, BANDUNG</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-[#E5E2D9]">
            <span className="text-[#64748B] uppercase font-bold text-[10px]">TOTAL SETTLEMENT</span>
            <span className="font-extrabold text-[#0047AB]">IDR {total.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#64748B] uppercase font-bold text-[10px]">ESTIMATED TRANSIT</span>
            <span className="font-bold text-[#C5AA00]">1-2 BUSINESS DAYS (JNE OVERNIGHT)</span>
          </div>
        </div>

        {/* Dual Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[#E5E2D9] hover:border-[#070F18] text-[#070F18] px-6 py-3 text-xs font-bold tracking-[0.16em] uppercase rounded-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT RECEIPT</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#070F18] hover:bg-[#0047AB] text-white px-8 py-3 text-xs font-bold tracking-[0.16em] uppercase rounded-xs transition-colors"
          >
            <span>RETURN TO GUILD HOME</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F5]">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading receipt...</div>}>
        <ConfirmationContent />
      </Suspense>
      <Footer />
    </div>
  );
}
