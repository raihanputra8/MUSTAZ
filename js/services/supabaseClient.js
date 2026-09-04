/**
 * Supabase Client Initialization
 * Loads Supabase ESM module directly from CDN
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/+esm';
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
  if (!supabaseInstance && isSupabaseConfigured()) {
    try {
      supabaseInstance = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      console.log('⚡ Supabase Client initialized successfully!');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
    }
  }
  return supabaseInstance;
};
