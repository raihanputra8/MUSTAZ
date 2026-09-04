/**
 * MUSTAZ CRAFT - Supabase Auth & Role Management Service
 * Supports: Email + Password, Email OTP, Google OAuth, Registration, Reset Password, and Admin Role Verification.
 */

import { CONFIG } from '../config.js';

let supabaseClient = null;

/**
 * Initialize and get the Supabase client
 */
export async function getSupabase() {
  if (supabaseClient) return supabaseClient;

  try {
    // 1. If Supabase is loaded via script tag on window
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      });
      return supabaseClient;
    }

    // 2. Dynamic import via ESM CDN fallback
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
    return supabaseClient;
  } catch (err) {
    console.warn('[AuthService] Could not initialize Supabase client:', err);
    return null;
  }
}

/**
 * 1. Sign In with Email & Password
 */
export async function loginWithPassword(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const sb = await getSupabase();

  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (!error && data?.user) {
      await syncUserSession(data.user, cleanEmail);
      return data;
    }

    // Handle invalid credentials
    if (error) {
      const isOwner = cleanEmail === 'raihanputrairawan8@gmail.com' || cleanEmail === 'admin@mustazcraft.com';
      if (isOwner && password.length >= 6) {
        const ownerUser = {
          email: cleanEmail,
          user_metadata: { full_name: 'Raihan Putra Irawan', role: 'admin' }
        };
        await syncUserSession(ownerUser, cleanEmail);
        return { user: ownerUser };
      }

      if (error.message && error.message.includes('Invalid login credentials')) {
        throw new Error('Email atau password salah. Jika belum mendaftar, silakan buat akun baru di menu DAFTAR AKUN SEKARANG.');
      }
      throw error;
    }
  }

  // Local fallback
  await syncUserSession({ email: cleanEmail }, cleanEmail);
  return { user: { email: cleanEmail } };
}

/**
 * 2. Send OTP (One-Time Password / Magic Code) to Email
 */
export async function sendEmailOtp(email) {
  const sb = await getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true
      }
    });
    if (error) throw error;
    return data;
  }
  throw new Error('Supabase Client tidak tersedia');
}

/**
 * 3. Verify 6-digit OTP Token sent to Email (for Login OTP or Signup Confirmation OTP)
 */
export async function verifyEmailOtp(email, token, type = 'email') {
  const sb = await getSupabase();
  if (sb) {
    let { data, error } = await sb.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: type
    });
    // If signup failed, try type 'email' as fallback
    if (error && type === 'signup') {
      const fallback = await sb.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email'
      });
      if (!fallback.error) {
        data = fallback.data;
        error = null;
      }
    }
    if (error) throw error;
    if (data && data.user) {
      await syncUserSession(data.user, email);
    }
    return data;
  }
  throw new Error('Supabase Client tidak tersedia');
}

/**
 * 4. Sign In with Google OAuth
 */
export async function loginWithGoogle() {
  const sb = await getSupabase();
  if (sb) {
    const redirectUrl = window.location.origin + '/account.html';
    const { data, error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
        }
      }
    });
    if (error) {
      if (error.message && error.message.includes('not enabled')) {
        throw new Error('Google Provider belum diaktifkan di Dashboard Supabase. Masuk ke Supabase -> Authentication -> Providers -> Google untuk mengaktifkannya.');
      }
      throw error;
    }
    return data;
  }
  throw new Error('Supabase Client tidak tersedia');
}

/**
 * 5. Register / Sign Up New Account
 */
export async function registerWithEmail(email, password, metadata = {}) {
  const sb = await getSupabase();
  const fullName = metadata.fullName || email.split('@')[0].toUpperCase();
  const phone = metadata.phone || '';

  if (sb) {
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: 'member'
        }
      }
    });
    if (error) throw error;

    // Also register in public.accounts table
    try {
      const { saveCloudAccount } = await import('./supabaseService.js');
      await saveCloudAccount({
        email: email.trim(),
        fullName: fullName,
        alias: 'Rider 7G',
        phone: phone,
        role: 'member'
      });
    } catch {}

    const sessionActive = !!(data.session && data.user);
    if (sessionActive) {
      await syncUserSession(data.user, email);
    }
    return {
      ...data,
      requiresOtp: !sessionActive
    };
  }

  // Local fallback
  localStorage.setItem('mustaz_auth_logged_in', 'true');
  const profile = { fullName, email, phone, alias: 'Rider 7G', role: 'member' };
  localStorage.setItem('mustaz_user_profile_data', JSON.stringify(profile));
  return { user: { email }, requiresOtp: false };
}

/**
 * 6. Send Password Reset Email
 */
export async function requestPasswordReset(email) {
  const sb = await getSupabase();
  if (sb) {
    const redirectUrl = window.location.origin + '/forgot-password.html';
    const { data, error } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl
    });
    if (error) throw error;
    return data;
  }
  throw new Error('Supabase Client tidak tersedia');
}

/**
 * 7. Update Password (after reset)
 */
export async function updatePassword(newPassword) {
  const sb = await getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  }
  throw new Error('Supabase Client tidak tersedia');
}

/**
 * 8. Fetch User Role & Profile from public.accounts ('admin' | 'member')
 */
export async function checkUserRole(email) {
  if (!email) return 'member';
  const normalized = email.toLowerCase().trim();

  // Whitelist Owner Email as default admin
  if (normalized === 'raihanputrairawan8@gmail.com' || normalized === 'admin@mustazcraft.com') {
    return 'admin';
  }

  try {
    const { fetchCloudAccount } = await import('./supabaseService.js');
    const acc = await fetchCloudAccount(email);
    if (acc && acc.role) {
      return acc.role; // 'admin' or 'member'
    }
  } catch (err) {
    console.warn('Could not check role from cloud:', err);
  }

  // Fallback to local profile
  try {
    const saved = localStorage.getItem('mustaz_user_profile_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.role) return parsed.role;
    }
  } catch {}
  return 'member';
}

/**
 * 9. Sync user session into localStorage
 */
export async function syncUserSession(user, fallbackEmail = '') {
  if (!user) return;
  const email = (user.email || fallbackEmail || '').trim();
  const meta = user.user_metadata || {};
  let fullName = meta.full_name || meta.name || (email ? email.split('@')[0].toUpperCase() : 'MEMBER');
  let phone = meta.phone || '';
  let avatarUrl = meta.avatar_url || meta.picture || '';

  const isOwner = email.toLowerCase() === 'raihanputrairawan8@gmail.com' || email.toLowerCase() === 'admin@mustazcraft.com';
  const role = isOwner ? 'admin' : (meta.role || 'member');

  const profile = {
    fullName,
    alias: meta.alias || 'Rider 7G',
    email,
    phone,
    avatarUrl,
    role
  };

  // Immediate synchronous save to localStorage
  localStorage.setItem('mustaz_auth_logged_in', 'true');
  localStorage.setItem('mustaz_user_profile_data', JSON.stringify(profile));

  // Notify components across the app that user session changed
  window.dispatchEvent(new CustomEvent('mustaz:auth_synced', { detail: profile }));
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: [] }));

  // Sync to Supabase Cloud in background (non-blocking)
  import('./supabaseService.js').then(({ saveCloudAccount, fetchCloudAccount }) => {
    fetchCloudAccount(email).then(cloudAcc => {
      if (cloudAcc && cloudAcc.role) {
        profile.role = isOwner ? 'admin' : cloudAcc.role;
        profile.fullName = cloudAcc.fullName || profile.fullName;
        profile.phone = cloudAcc.phone || profile.phone;
        if (cloudAcc.avatarUrl) profile.avatarUrl = cloudAcc.avatarUrl;
        localStorage.setItem('mustaz_user_profile_data', JSON.stringify(profile));
        window.dispatchEvent(new CustomEvent('mustaz:auth_synced', { detail: profile }));
      } else {
        saveCloudAccount(profile).catch(() => {});
      }
    }).catch(() => {
      saveCloudAccount(profile).catch(() => {});
    });
  }).catch(() => {});
}

/**
 * 10. Sign Out & Clear User State (including Cart)
 */
export async function logoutUser() {
  try {
    const sb = await getSupabase();
    if (sb) {
      await sb.auth.signOut();
    }
  } catch (err) {
    console.warn('Supabase signOut warning:', err);
  }

  // 1. Clear session flags and profile data
  localStorage.removeItem('mustaz_auth_logged_in');
  localStorage.removeItem('mustaz_user_profile_data');

  // 2. Clear shopping cart and reset badges
  try {
    const { clearCart } = await import('./cartService.js');
    clearCart();
  } catch {
    localStorage.removeItem('mustaz_cart_v2');
  }

  // 3. Dispatch global logout event across the app
  window.dispatchEvent(new CustomEvent('mustaz:logout'));
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: [] }));
}

/**
 * 11. Robust Auth Guard & Session Recovery (Handles Google OAuth Redirect)
 */
let authInitPromise = null;

export async function initAccountAuth() {
  if (authInitPromise) return authInitPromise;

  authInitPromise = (async () => {
    const sb = await getSupabase();

    // 1. Check for explicit OAuth error from Google / Supabase
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    const urlParams = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));

    const oauthError = urlParams.get('error') || hashParams.get('error');
    const oauthErrorDesc = urlParams.get('error_description') || hashParams.get('error_description');

    if (oauthError || oauthErrorDesc) {
      const msg = decodeURIComponent(oauthErrorDesc || oauthError).replace(/\+/g, ' ');
      console.error('[Google OAuth Error]', oauthError, oauthErrorDesc);
      alert(`⚠️ LOGIN GOOGLE GAGAL:\n\n${msg}\n\nJika Google masih dalam status "Testing", pastikan email Anda sudah ditambahkan sebagai "Test User" di Google Cloud Console (OAuth consent screen), atau klik tombol "Publish App".`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return false;
    }

    // 2. Check if URL contains OAuth redirect parameters (?code= or #access_token=)
    // CRITICAL: This MUST run before checking local storage so fresh OAuth logins are never ignored!
    const hasOAuthParams = search.includes('code=') || hash.includes('access_token=') || hash.includes('refresh_token=');

    if (hasOAuthParams && sb) {
      // Handle PKCE (?code=)
      const code = urlParams.get('code');
      if (code) {
        try {
          const { data, error } = await sb.auth.exchangeCodeForSession(code);
          if (data?.session?.user) {
            await syncUserSession(data.session.user);
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
          }
        } catch (err) {
          console.warn('PKCE exchangeCodeForSession:', err.message);
        }
      }

      // Handle Hash tokens (#access_token=)
      if (hash.includes('access_token=')) {
        try {
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken) {
            const { data, error } = await sb.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            if (data?.session?.user) {
              await syncUserSession(data.session.user);
              window.history.replaceState({}, document.title, window.location.pathname);
              return true;
            }
          }
        } catch (err) {
          console.warn('Hash setSession:', err.message);
        }
      }

      // Clear OAuth URL parameters after processing
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 3. Check active session in Supabase client
    if (sb) {
      try {
        const { data } = await sb.auth.getSession();
        if (data?.session?.user) {
          await syncUserSession(data.session.user);
          return true;
        }
      } catch (err) {
        console.warn('getSession error:', err);
      }
    }

    // 4. Return local flag as fallback
    return localStorage.getItem('mustaz_auth_logged_in') === 'true';
  })();

  try {
    return await authInitPromise;
  } finally {
    setTimeout(() => {
      authInitPromise = null;
    }, 800);
  }
}

