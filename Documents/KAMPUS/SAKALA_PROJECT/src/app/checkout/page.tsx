'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, CreditCard, Lock, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/supabase/data';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalItems, totalIdr, totalUsd, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bandung',
    postalCode: '40182',
    courier: 'jne_yes',
    payment: 'bca_va',
  });

  const [submitting, setSubmitting] = useState(false);

  const shippingFee = 35000;
  const grandTotal = totalIdr + (cart.length > 0 ? shippingFee : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your manifest is empty. Please add items from the catalog.');
      return;
    }
    setSubmitting(true);
    
    const orderId = 'SKL-' + Math.floor(100000 + Math.random() * 900000);
    const orderPayload = {
      id: orderId,
      customer_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      shipping_address: formData.address,
      city: formData.city,
      postal_code: formData.postalCode,
      courier: formData.courier,
      payment_method: formData.payment,
      items: cart,
      subtotal_idr: totalIdr,
      shipping_fee_idr: shippingFee,
      total_idr: grandTotal,
      status: 'pending' as const,
    };

    try {
      await createOrder(orderPayload);
    } catch (err) {
      console.warn('Could not persist to Supabase orders table (check if table exists):', err);
    }

    clearCart();
    router.push(`/checkout/confirmation?orderId=${orderId}&total=${grandTotal}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F5]">
      <Navbar />

      <main className="flex-1 py-12 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        {/* Step Indicator */}
        <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-[#64748B] mb-8 pb-4 border-b border-[#E5E2D9]">
          <Link href="/shop" className="hover:text-[#070F18]">
            01. SUPPLY CATALOG
          </Link>
          <span>/</span>
          <span className="text-[#0047AB]">02. SECURE DISPATCH CHECKOUT</span>
          <span>/</span>
          <span className="opacity-50">03. ORDER CONFIRMATION</span>
        </div>

        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-black text-[#070F18] tracking-tight mb-2">
          SECURE DISPATCH MANIFEST
        </h1>
        <p className="text-xs text-[#64748B] mb-10">
          Enter operational delivery coordinates and select encrypted payment channel.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Form: Operator Info, Shipping & Payment */}
          <div className="lg:col-span-7 space-y-8">
            {/* Operator Coordinates */}
            <div className="bg-white border border-[#E5E2D9] rounded-xs p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-6 text-[#070F18]">
                <ShieldCheck className="w-4 h-4 text-[#0047AB]" />
                <h3 className="font-serif-editorial text-base font-bold uppercase tracking-wider">
                  1. OPERATOR COORDINATES
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Raihan Putra"
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    WHATSAPP / PHONE *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    DISPATCH EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="operator@brotherhood.cc"
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    STREET ADDRESS / WORKSHOP HQ *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Complete address with RT/RW and postal district..."
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#070F18] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    CITY / REGENCY
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    POSTAL CODE
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Courier Selection */}
            <div className="bg-white border border-[#E5E2D9] rounded-xs p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-6 text-[#070F18]">
                <Truck className="w-4 h-4 text-[#0047AB]" />
                <h3 className="font-serif-editorial text-base font-bold uppercase tracking-wider">
                  2. DISPATCH & COURIER LOGISTICS
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-4 border rounded-xs cursor-pointer flex flex-col justify-between transition-colors ${
                    formData.courier === 'jne_yes'
                      ? 'border-[#070F18] bg-[#070F18]/5'
                      : 'border-[#E5E2D9] bg-white hover:border-[#070F18]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#070F18]">JNE YES (Overnight Air)</span>
                    <input
                      type="radio"
                      name="courier"
                      value="jne_yes"
                      checked={formData.courier === 'jne_yes'}
                      onChange={() => setFormData({ ...formData, courier: 'jne_yes' })}
                    />
                  </div>
                  <span className="text-[10px] text-[#64748B]">Next-day priority delivery</span>
                  <span className="font-bold text-[#070F18] mt-2 block">IDR 35.000</span>
                </label>

                <label
                  className={`p-4 border rounded-xs cursor-pointer flex flex-col justify-between transition-colors ${
                    formData.courier === 'cargo'
                      ? 'border-[#070F18] bg-[#070F18]/5'
                      : 'border-[#E5E2D9] bg-white hover:border-[#070F18]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#070F18]">J&T CARGO (Heavy Gear)</span>
                    <input
                      type="radio"
                      name="courier"
                      value="cargo"
                      checked={formData.courier === 'cargo'}
                      onChange={() => setFormData({ ...formData, courier: 'cargo' })}
                    />
                  </div>
                  <span className="text-[10px] text-[#64748B]">Reinforced heavy logistics</span>
                  <span className="font-bold text-[#070F18] mt-2 block">IDR 45.000</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-[#E5E2D9] rounded-xs p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-6 text-[#070F18]">
                <CreditCard className="w-4 h-4 text-[#0047AB]" />
                <h3 className="font-serif-editorial text-base font-bold uppercase tracking-wider">
                  3. PAYMENT CHANNEL
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-4 border rounded-xs cursor-pointer flex items-center justify-between transition-colors ${
                    formData.payment === 'bca_va'
                      ? 'border-[#070F18] bg-[#070F18]/5'
                      : 'border-[#E5E2D9] bg-white hover:border-[#070F18]'
                  }`}
                >
                  <div>
                    <span className="font-bold text-[#070F18] block">BCA Virtual Account</span>
                    <span className="text-[10px] text-[#64748B]">Automated 24/7 Verification</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="bca_va"
                    checked={formData.payment === 'bca_va'}
                    onChange={() => setFormData({ ...formData, payment: 'bca_va' })}
                  />
                </label>

                <label
                  className={`p-4 border rounded-xs cursor-pointer flex items-center justify-between transition-colors ${
                    formData.payment === 'qris'
                      ? 'border-[#070F18] bg-[#070F18]/5'
                      : 'border-[#E5E2D9] bg-white hover:border-[#070F18]'
                  }`}
                >
                  <div>
                    <span className="font-bold text-[#070F18] block">QRIS Settlement</span>
                    <span className="text-[10px] text-[#64748B]">GoPay, OVO, Dana, ShopeePay</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="qris"
                    checked={formData.payment === 'qris'}
                    onChange={() => setFormData({ ...formData, payment: 'qris' })}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E5E2D9] rounded-xs p-6 sm:p-8 shadow-sm sticky top-28">
              <h3 className="font-serif-editorial text-lg font-bold text-[#070F18] uppercase tracking-wider mb-6 pb-3 border-b border-[#E5E2D9]">
                DISPATCH SUMMARY
              </h3>

              {/* Items List */}
              <div className="divide-y divide-[#E5E2D9] mb-6 max-h-72 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-xs text-[#64748B] py-4">No specimens selected in cart.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="py-3 flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-[#FAF9F5] border border-[#E5E2D9] rounded-xs flex-shrink-0 p-1">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <h4 className="font-bold text-[#070F18] truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-[10px] text-[#64748B]">
                          QTY: {item.quantity} • SIZE: {item.size || 'M'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#070F18] flex-shrink-0">
                        IDR {(item.product.price_idr * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs border-t border-[#E5E2D9] pt-4 mb-6">
                <div className="flex justify-between text-[#64748B]">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-[#070F18]">
                    IDR {totalIdr.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Domestic Courier Dispatch</span>
                  <span className="font-semibold text-[#070F18]">
                    {cart.length > 0 ? `IDR ${shippingFee.toLocaleString('id-ID')}` : 'IDR 0'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#070F18] pt-3 border-t border-[#E5E2D9]">
                  <span>Total Amount</span>
                  <span className="text-[#0047AB]">
                    IDR {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full bg-[#070F18] hover:bg-[#0047AB] disabled:opacity-50 text-white py-4 text-xs font-bold tracking-[0.2em] uppercase rounded-xs transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>{submitting ? 'AUTHORIZING DISPATCH...' : 'AUTHORIZE DISPATCH & PLACE ORDER'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#94A3B8] uppercase tracking-wider mt-4">
                <Lock className="w-3 h-3 text-[#C5AA00]" />
                <span>256-BIT ENCRYPTED SPECIMEN PROTOCOL</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
