'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  User, 
  Package, 
  Wrench, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Printer, 
  Plus, 
  Check, 
  Truck, 
  Calendar,
  Layers,
  ArrowRight,
  LogOut
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getOrders, getUserProfile, getBikes } from '@/lib/supabase/data';
import { Order, Profile, Bike } from '@/types/database';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const { user, signOut, loading: authLoading, isMockUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'garage' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit address state
  const [addressData, setAddressData] = useState({
    fullName: 'Raihan Putra',
    email: 'raihan@sakala.cc',
    phone: '+62 812-9842-1029',
    address: 'Jl. Jamika No. 42, Ciroyom',
    city: 'Bandung',
    postalCode: '40182',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Machine Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newBikeData, setNewBikeData] = useState({
    title: '',
    make: '',
    model: '',
    year: '1980',
    plate: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedOrders, fetchedProfile, fetchedBikes] = await Promise.all([
          getOrders(),
          getUserProfile(),
          getBikes(),
        ]);
        setOrders(fetchedOrders);
        setProfile(fetchedProfile);
        setBikes(fetchedBikes);
      } catch (err) {
        console.error('Failed to load account data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRegisterBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBikeData.title || !newBikeData.make) return;
    const newSpecimen: Bike = {
      id: `bike-${Date.now()}`,
      title: newBikeData.title.toUpperCase(),
      year: parseInt(newBikeData.year) || 1980,
      make: newBikeData.make,
      model: newBikeData.model,
      specs: {
        frame: 'Custom Hardtail Chromoly',
        workshop: 'SAKALA Ciroyom Atelier',
        colorway: 'Raw Brushed Steel & Gold',
      },
      image_url: '/assets/bike_sportster.png',
      status: 'commissioned',
    };
    setBikes([newSpecimen, ...bikes]);
    setShowRegisterModal(false);
    setNewBikeData({ title: '', make: '', model: '', year: '1980', plate: '' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F5] text-[#070F18]">
      <Navbar />

      <main className="flex-1 py-12 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#64748B] mb-8 pb-4 border-b border-[#E5E2D9]">
          <Link href="/" className="hover:text-[#070F18] transition-colors">
            THE CIRCLE ARCHIVE
          </Link>
          <span>/</span>
          <span className="text-[#0047AB]">MEMBER REGISTRY</span>
          <span>/</span>
          <span className="text-[#070F18]">PROFILE DOSSIER</span>
        </div>

        {/* Google Sync Notice if not signed in with Google */}
        {!user && (
          <div className="mb-6 p-4 bg-[#070F18] text-white border border-[#C5AA00]/40 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C5AA00] animate-pulse" />
              <span>
                You are viewing sample artisan records. <strong>Sign in with Google</strong> to link your real motorcycle garage &amp; live orders.
              </span>
            </div>
            <Link
              href="/login"
              className="bg-[#C5AA00] hover:bg-[#D4B800] text-black text-[11px] font-bold tracking-[0.16em] uppercase px-5 py-2 rounded-xs whitespace-nowrap transition-colors"
            >
              SIGN IN WITH GOOGLE →
            </Link>
          </div>
        )}

        {/* Member Identity Card */}
        <section className="bg-white border border-[#E5E2D9] rounded-xs p-6 sm:p-10 mb-10 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left: Avatar & Bio */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#C5AA00] bg-[#070F18] flex-shrink-0 shadow-md">
                <Image
                  src={user?.user_metadata?.avatar_url || profile?.avatar_url || '/assets/avatar_user.png'}
                  alt={user?.user_metadata?.full_name || profile?.full_name || 'Member Avatar'}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#0047AB] uppercase">
                    REGISTRY ID: {user ? `SKL-ID-${user.id.slice(0, 6).toUpperCase()}` : 'SKL-MBR-0482'}
                  </span>
                  <span>•</span>
                  {user && !isMockUser ? (
                    <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      GOOGLE AUTH VERIFIED
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      GUILD VERIFIED
                    </span>
                  )}
                </div>

                <h1 className="font-serif-editorial text-2xl sm:text-4xl font-black text-[#070F18] tracking-tight">
                  {user?.user_metadata?.full_name || profile?.full_name || 'Raihan Putra'}
                </h1>

                <p className="text-xs text-[#64748B] font-medium">
                  {user?.email || 'Senior Artisan & Road Captain — SAKALA Ciroyom Atelier, Bandung'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#64748B] pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C5AA00]" />
                    Ciroyom, Bandung (768 MASL)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#0047AB]" />
                    Active Member
                  </span>
                  {user && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() => signOut()}
                        className="text-red-600 hover:text-red-700 font-bold tracking-wider uppercase inline-flex items-center gap-1 transition-colors"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Telemetry Counter Stats */}
            <div className="grid grid-cols-3 gap-4 w-full lg:w-auto p-4 bg-[#FAF9F5] border border-[#E5E2D9] rounded-xs text-center">
              <div className="px-3">
                <span className="font-serif-editorial text-2xl font-black text-[#070F18] block">
                  {bikes.length}
                </span>
                <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-[#64748B]">
                  MACHINES
                </span>
              </div>
              <div className="px-3 border-x border-[#E5E2D9]">
                <span className="font-serif-editorial text-2xl font-black text-[#0047AB] block">
                  {orders.length}
                </span>
                <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-[#64748B]">
                  DISPATCHES
                </span>
              </div>
              <div className="px-3">
                <span className="font-serif-editorial text-2xl font-black text-[#C5AA00] block">
                  12.4K
                </span>
                <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-[#64748B]">
                  KM LOGGED
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E2D9] mb-8 gap-8 text-xs font-bold tracking-[0.18em] uppercase">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3.5 transition-colors flex items-center gap-2 relative ${
              activeTab === 'orders'
                ? 'text-[#070F18] border-b-2 border-[#070F18]'
                : 'text-[#64748B] hover:text-[#070F18]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>DISPATCH ORDERS ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('garage')}
            className={`pb-3.5 transition-colors flex items-center gap-2 relative ${
              activeTab === 'garage'
                ? 'text-[#070F18] border-b-2 border-[#070F18]'
                : 'text-[#64748B] hover:text-[#070F18]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>MY GARAGE SPECIMENS ({bikes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3.5 transition-colors flex items-center gap-2 relative ${
              activeTab === 'settings'
                ? 'text-[#070F18] border-b-2 border-[#070F18]'
                : 'text-[#64748B] hover:text-[#070F18]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>DELIVERY COORDINATES</span>
          </button>
        </div>

        {/* TAB 1: DISPATCH ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white border border-[#E5E2D9] rounded-xs p-12 text-center">
                <Package className="w-10 h-10 text-[#64748B] mx-auto mb-3 opacity-50" />
                <h3 className="font-serif-editorial text-lg font-bold text-[#070F18] mb-1">
                  NO DISPATCH ORDERS LOGGED
                </h3>
                <p className="text-xs text-[#64748B] mb-6">
                  You haven't requested any gear or apparel dispatch manifests yet.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#070F18] text-white px-6 py-2.5 text-xs font-bold tracking-[0.16em] uppercase rounded-xs hover:bg-[#0047AB] transition-colors"
                >
                  <span>BROWSE SUPPLY CATALOG</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const isDelivered = order.status === 'delivered';
                const isDispatching = order.status === 'dispatching';
                const isPending = order.status === 'pending' || order.status === 'paid';

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-[#E5E2D9] rounded-xs p-6 sm:p-8 shadow-xs hover:border-[#070F18] transition-colors"
                  >
                    {/* Order Top Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E5E2D9] gap-4 mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase">
                            MANIFEST ID:
                          </span>
                          <span className="font-bold text-[#070F18] text-sm">{order.id}</span>
                        </div>
                        <span className="text-[10px] text-[#64748B] block font-mono">
                          Placed on: {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent Dispatch'}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-xs text-[10px] font-bold tracking-[0.16em] uppercase ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isDispatching
                                ? 'bg-blue-50 text-[#0047AB] border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isDelivered
                              ? 'DELIVERED TO ATELIER'
                              : isDispatching
                              ? 'DISPATCH IN TRANSIT'
                              : 'SETTLEMENT PENDING'}
                          </span>
                        </div>

                        <Link
                          href={`/checkout/confirmation?orderId=${order.id}&total=${order.total_idr}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] uppercase text-[#070F18] hover:text-[#C5AA00] transition-colors bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-1.5 rounded-xs"
                        >
                          <span>RECEIPT</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Order Items Grid */}
                    <div className="space-y-4 mb-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="relative w-14 h-14 bg-[#FAF9F5] rounded-xs border border-[#E5E2D9] overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif-editorial text-sm font-bold text-[#070F18] truncate">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] text-[#64748B] block">
                              SIZE: {item.size || 'M'} • QTY: {item.quantity}
                            </span>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-bold text-[#070F18]">
                              IDR {(item.product.price_idr * item.quantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer & Settlement Summary */}
                    <div className="pt-4 border-t border-[#E5E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <Truck className="w-4 h-4 text-[#0047AB]" />
                        <span>Courier: {order.courier.toUpperCase()}</span>
                        <span>•</span>
                        <span>Payment: {order.payment_method.toUpperCase()}</span>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                          TOTAL SETTLEMENT:
                        </span>
                        <span className="font-serif-editorial text-base font-black text-[#0047AB]">
                          IDR {order.total_idr.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: MY GARAGE SPECIMENS */}
        {activeTab === 'garage' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#070F18]">
                  REGISTERED BROTHERHOOD MACHINES
                </h3>
                <p className="text-xs text-[#64748B]">
                  Specimens crafted or verified by the SAKALA Atelier registry with official plate archives.
                </p>
              </div>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="inline-flex items-center gap-2 bg-[#070F18] hover:bg-[#0047AB] text-white px-4 py-2.5 text-xs font-bold tracking-[0.16em] uppercase rounded-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>REGISTER SPECIMEN</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bikes.map((bike) => (
                <div
                  key={bike.id}
                  className="bg-white border border-[#E5E2D9] rounded-xs overflow-hidden shadow-xs hover:border-[#070F18] transition-colors flex flex-col justify-between group"
                >
                  <div className="relative h-56 w-full bg-[#E5E2D9] overflow-hidden">
                    <Image
                      src={bike.image_url}
                      alt={bike.title}
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#070F18]/90 text-[#C5AA00] px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] uppercase rounded-xs">
                      {bike.year} • {bike.make.toUpperCase()}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif-editorial text-lg font-bold text-[#070F18] mb-1">
                        {bike.title}
                      </h4>
                      <p className="text-xs text-[#64748B] mb-4">
                        Model: {bike.model}
                      </p>

                      <div className="p-3 bg-[#FAF9F5] border border-[#E5E2D9] rounded-xs space-y-1.5 text-[11px] mb-4">
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">CHASSIS:</span>
                          <span className="font-bold text-[#070F18]">{bike.specs?.frame || 'Rigid Loop'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">EXHAUST:</span>
                          <span className="font-bold text-[#070F18]">{bike.specs?.exhaust || 'Custom Open Pipe'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">WORKSHOP:</span>
                          <span className="font-bold text-[#070F18]">{bike.specs?.workshop || 'SAKALA Atelier'}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/bikes/${bike.id}`}
                      className="inline-flex items-center justify-between w-full pt-3 border-t border-[#E5E2D9] text-xs font-bold tracking-[0.16em] uppercase text-[#070F18] group-hover:text-[#0047AB] transition-colors"
                    >
                      <span>VIEW BUILD DOSSIER</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DELIVERY COORDINATES & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white border border-[#E5E2D9] rounded-xs p-8 shadow-xs">
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#070F18] mb-2">
              DISPATCH DELIVERY COORDINATES
            </h3>
            <p className="text-xs text-[#64748B] mb-8">
              Update your primary workshop shipping address and contact info for all merchandise dispatches.
            </p>

            {savedSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Delivery coordinates successfully updated and registered.</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  FULL NAME / OPERATOR
                </label>
                <input
                  type="text"
                  required
                  value={addressData.fullName}
                  onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#070F18]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    DISPATCH EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={addressData.email}
                    onChange={(e) => setAddressData({ ...addressData, email: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    PHONE / WHATSAPP
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressData.phone}
                    onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  WORKSHOP / STREET ADDRESS
                </label>
                <textarea
                  required
                  rows={3}
                  value={addressData.address}
                  onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#070F18] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    CITY
                  </label>
                  <input
                    type="text"
                    required
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    POSTAL CODE
                  </label>
                  <input
                    type="text"
                    required
                    value={addressData.postalCode}
                    onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3.5 py-2.5 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="bg-[#070F18] hover:bg-[#0047AB] text-white px-6 py-3 text-xs font-bold tracking-[0.16em] uppercase rounded-xs transition-colors"
                >
                  SAVE COORDINATES
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E5E2D9] rounded-xs p-8 max-w-lg w-full shadow-2xl">
            <h3 className="font-serif-editorial text-2xl font-bold text-[#070F18] mb-2">
              REGISTER NEW SPECIMEN
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              Enter machine lineage for official entry into SAKALA Brotherhood registry.
            </p>

            <form onSubmit={handleRegisterBike} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  MACHINE TITLE / NICKNAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SANGHYANG HEULEUT"
                  value={newBikeData.title}
                  onChange={(e) => setNewBikeData({ ...newBikeData, title: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3 py-2 rounded-xs outline-none focus:border-[#070F18]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    MAKE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yamaha"
                    value={newBikeData.make}
                    onChange={(e) => setNewBikeData({ ...newBikeData, make: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3 py-2 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    MODEL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. XS650"
                    value={newBikeData.model}
                    onChange={(e) => setNewBikeData({ ...newBikeData, model: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3 py-2 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    YEAR OF MANUFACTURE
                  </label>
                  <input
                    type="number"
                    value={newBikeData.year}
                    onChange={(e) => setNewBikeData({ ...newBikeData, year: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3 py-2 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    LICENSE PLATE NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. D 4029 BDG"
                    value={newBikeData.plate}
                    onChange={(e) => setNewBikeData({ ...newBikeData, plate: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3 py-2 rounded-xs outline-none focus:border-[#070F18]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E2D9]">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-[#E5E2D9] text-[#64748B] hover:text-[#070F18] font-bold text-xs uppercase rounded-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-[#070F18] hover:bg-[#0047AB] text-white px-5 py-2 font-bold text-xs uppercase rounded-xs transition-colors"
                >
                  CONFIRM REGISTRATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
