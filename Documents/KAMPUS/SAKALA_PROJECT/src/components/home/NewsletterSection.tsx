'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, CheckCircle2 } from 'lucide-react';
import { subscribeToCircle } from '@/lib/supabase/data';
import ScrollReveal from '@/components/common/ScrollReveal';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus({});
    try {
      const res = await subscribeToCircle(email);
      setStatus(res);
      if (res.success) {
        setEmail('');
      }
    } catch {
      setStatus({ success: false, message: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="circle" className="relative bg-[#070F18] text-white py-20 lg:py-28 overflow-hidden border-b border-[#C5AA00]/20">
      {/* Background Graphic Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        <Image
          src="/assets/newsletter_texture.png"
          alt="Circle Texture"
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <ScrollReveal direction="up" delay={50}>
          {/* Register Badge */}
          <span className="inline-block text-[10px] font-bold tracking-[0.25em] text-[#0047AB] bg-[#0047AB]/10 border border-[#0047AB]/30 px-3.5 py-1 uppercase rounded-xs mb-4">
            MEMBERSHIP DISPATCH REGISTER
          </span>

          {/* Title */}
          <h2 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-black text-[#C5AA00] tracking-tight mb-4">
            STAY IN THE CIRCLE.
          </h2>

          {/* Subtitle */}
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#E2E8F0] uppercase mb-10 max-w-xl mx-auto">
            NEW BUILDS • PRIVATE APPAREL DROPS • ROAD CHRONICLES • RIDE COORDINATES
          </p>
        </ScrollReveal>

        {/* Email Form */}
        <ScrollReveal direction="up" delay={150}>
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-6">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white/5 p-1.5 border border-[#C5AA00]/30 rounded-xs backdrop-blur-xs transition-all duration-300 focus-within:border-[#C5AA00]">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 bg-white text-gray-900 px-4 py-3 text-xs outline-none rounded-xs placeholder-gray-500 font-medium transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#C5AA00] hover:bg-[#B39900] disabled:opacity-75 text-black px-6 py-3 text-xs font-bold tracking-[0.16em] uppercase rounded-xs transition-colors flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer btn-tactile"
              >
                <span>{loading ? 'REGISTERING...' : 'JOIN THE CIRCLE'}</span>
                <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </ScrollReveal>

        {/* Status Message */}
        {status.message && (
          <div
            className={`text-xs font-medium max-w-md mx-auto p-2.5 rounded mb-4 flex items-center justify-center gap-2 animate-scale-in ${
              status.success ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30' : 'bg-red-950/70 text-red-400 border border-red-500/30'
            }`}
          >
            {status.success && <CheckCircle2 className="w-4 h-4" />}
            <span>{status.message}</span>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-[#64748B] max-w-md mx-auto leading-relaxed">
          No spam. Strictly confidential dispatch notices, private garage drops, and chapter ride coordinates directly from Bandung HQ.
        </p>
      </div>
    </section>
  );
}
