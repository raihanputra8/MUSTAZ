'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, ShoppingBag, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import SearchModal from '@/components/search/SearchModal';

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const { user, isAdmin } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  // Global hotkey: Cmd+K or Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        scrolled
          ? 'bg-[#F5F4EF]/95 backdrop-blur-md border-[#D8D4C7] shadow-sm py-0'
          : 'glass-header border-[#E5E2D9]'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex flex-col transition-transform duration-200 group-hover:translate-x-0.5">
              <span className="font-serif-editorial text-2xl font-bold tracking-[0.18em] text-[#070F18] leading-none group-hover:text-[#C5AA00] transition-colors">
                SAKALA
              </span>
              <span className="text-[9px] tracking-[0.25em] font-medium text-[#737373] uppercase mt-1">
                EST. 2026 • BANDUNG
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10 text-xs font-semibold tracking-[0.18em] text-[#1E293B]">
            <Link href="/shop" className="nav-link-animated hover:text-[#C5AA00] transition-colors uppercase">
              SHOP
            </Link>
            <Link href="/bikes/bike-01" className="nav-link-animated hover:text-[#C5AA00] transition-colors uppercase">
              BIKES
            </Link>
            <Link href="/journal" className="nav-link-animated hover:text-[#C5AA00] transition-colors uppercase">
              JOURNAL
            </Link>
            <Link href="/about" className="nav-link-animated hover:text-[#C5AA00] transition-colors uppercase">
              ABOUT
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-5">
            {/* Search Trigger (Opens Global Search Overlay) */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="text-[#070F18] hover:text-[#C5AA00] transition-colors p-1.5 flex items-center gap-1.5 btn-tactile"
              aria-label="Open Search (Cmd+K)"
              title="Search archive (Cmd+K)"
            >
              <Search className="w-4 h-4 stroke-[2]" />
              <span className="hidden xl:inline text-[9px] text-[#94A3B8] font-mono border border-[#E5E2D9] px-1.5 py-0.5 rounded-xs">
                ⌘K
              </span>
            </button>

            {/* Cart Button with Count Badge */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center p-1.5 text-[#070F18] hover:text-[#C5AA00] transition-colors btn-tactile"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
              <span className="absolute -top-1 -right-2 bg-[#C5AA00] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                {totalItems}
              </span>
            </button>

            {/* Admin CMS Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#C5AA00] hover:text-[#070F18] hover:border-[#070F18] transition-all py-1 px-2 border border-[#C5AA00]/30 rounded-xs bg-[#C5AA00]/5 btn-tactile"
                title="Admin CMS Dashboard"
              >
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">CMS</span>
              </Link>
            )}

            {/* Account Profile / Login */}
            {user ? (
              <Link 
                href="/account"
                className="w-7 h-7 rounded-full overflow-hidden border border-[#C5AA00]/70 flex-shrink-0 hover:border-[#070F18] hover:scale-105 transition-all btn-tactile"
                aria-label="Member Profile"
                title={`Signed in as ${user.user_metadata?.full_name || user.email}`}
              >
                <Image
                  src={user.user_metadata?.avatar_url || '/assets/avatar_user.png'}
                  alt="Member Avatar"
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#070F18] hover:text-[#C5AA00] transition-colors py-1.5 px-3 border border-[#E5E2D9] rounded-xs bg-white shadow-xs btn-tactile"
                aria-label="Sign In with Google"
              >
                <User className="w-3.5 h-3.5 stroke-[2]" />
                <span className="hidden sm:inline text-[10px] tracking-[0.16em] uppercase">SIGN IN</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
