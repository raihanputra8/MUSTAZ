/**
 * Supabase Client Initialization
 * Safe initialization using window.supabase with lazy fallback
 */

import { CONFIG } from '../config.js';

let supabaseInstance = null;

export const isSupabaseConfigured = () => {
  return (
    CONFIG.SUPABASE_URL &&
    CONFIG.SUPABASE_URL.startsWith('https://') &&
    CONFIG.SUPABASE_ANON_KEY &&
    CONFIG.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
  );
};

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  if (isSupabaseConfigured()) {
    try {
      if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseInstance = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        console.log('⚡ Supabase Client initialized successfully via window.supabase!');
        return supabaseInstance;
      }
    } catch (error) {
      console.warn('❌ Failed to initialize Supabase client:', error);
    }
  }
  return supabaseInstance;
};

export const initSupabaseClientAsync = async () => {
  if (supabaseInstance) return supabaseInstance;
  const client = getSupabaseClient();
  if (client) return client;

  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/+esm');
    supabaseInstance = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    console.log('⚡ Supabase Client initialized via dynamic import!');
    return supabaseInstance;
  } catch (err) {
    console.warn('[SupabaseClient] Dynamic import fallback failed:', err);
    return null;
  }
};
