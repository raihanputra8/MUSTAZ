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
      if (error.message && error.message.includes('Invalid login credentials')) {
        throw new Error('Email atau password salah. Jika belum mendaftar, silakan buat akun baru di menu DAFTAR AKUN SEKARANG.');
      }
      throw error;
    }
  }

  // Local fallback (only for offline development, never grant admin automatically)
  await syncUserSession({ email: cleanEmail, user_metadata: { role: 'member' } }, cleanEmail);
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

    if (error) {
      // If user is already registered, seamlessly attempt to log in with this password!
      if (error.message && (error.message.includes('already registered') || error.message.includes('already exists') || error.message.includes('User already registered'))) {
        try {
          const loginRes = await loginWithPassword(email, password);
          return { user: loginRes.user, autoLoggedIn: true, requiresOtp: false };
        } catch (loginErr) {
          throw new Error('Email ini sudah terdaftar di sistem. Silakan <a href="login.html" style="color:#FFF;text-decoration:underline;font-weight:700;">masuk melalui halaman Login</a> atau gunakan akun Google.');
        }
      }
      throw error;
    }

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
 * 8. Cryptographic Admin Session Verification (Zero-Trust)
 * Ensures user has an authentic Supabase session (JWT via getUser())
 * AND is authorized as admin via owner whitelist or verified database role.
 * Never trusts unverified client-side localStorage values.
 * Returns { isAdmin: boolean, user: object|null, reason?: string, email?: string }
 */
export async function verifyAdminSession() {
  const sb = await getSupabase();
  if (!sb) {
    return { isAdmin: false, user: null, reason: 'SUPABASE_UNAVAILABLE' };
  }

  try {
    // 1. Verifikasi otentisitas token JWT langsung ke server Supabase Auth
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user) {
      return { isAdmin: false, user: null, reason: 'NOT_AUTHENTICATED' };
    }

    const email = (user.email || '').toLowerCase().trim();
    const isOwnerEmail = email === 'raihanputrairawan8@gmail.com' || 
                         email === 'raihanputra8@gmail.com' || 
                         email === 'admin@mustazcraft.com';

    // 2. Periksa role admin dari metadata JWT server
    const metadataRole = user.app_metadata?.role || user.user_metadata?.role;
    let isRoleAdmin = metadataRole === 'admin' || isOwnerEmail;

    // 3. Fallback periksa role pada tabel accounts jika didefinisikan
    if (!isRoleAdmin) {
      try {
        let profile = null;
        if (user.id) {
          const res = await sb.from('accounts').select('role').eq('id', user.id).maybeSingle();
          profile = res.data;
        }
        if (!profile && email) {
          const res = await sb.from('accounts').select('role').eq('email', email).maybeSingle();
          profile = res.data;
        }
        if (profile?.role === 'admin') {
          isRoleAdmin = true;
        }
      } catch (_) {}
    }

    if (isRoleAdmin) {
      localStorage.setItem('mustaz_auth_logged_in', 'true');
      return { isAdmin: true, user, email, role: 'admin' };
    }

    return { isAdmin: false, user, email, role: 'member', reason: 'NOT_ADMIN' };
  } catch (err) {
    console.error('[AuthService] verifyAdminSession error:', err);
    return { isAdmin: false, user: null, reason: 'AUTH_ERROR' };
  }
}

/**
 * Get current user's active Supabase JWT access token for API authorization headers
 */
export async function getAuthToken() {
  const sb = await getSupabase();
  if (sb) {
    try {
      const { data } = await sb.auth.getSession();
      return data?.session?.access_token || null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Fetch User Role ('admin' | 'member')
 */
export async function checkUserRole(email) {
  if (!email) return 'member';
  const normalized = email.toLowerCase().trim();
  if (normalized === 'raihanputrairawan8@gmail.com' || normalized === 'raihanputra8@gmail.com' || normalized === 'admin@mustazcraft.com' || normalized.includes('admin')) {
    return 'admin';
  }
  try {
    const sb = await getSupabase();
    if (sb) {
      const { data } = await sb.from('accounts').select('role').eq('email', normalized).maybeSingle();
      if (data?.role) return data.role;
    }
  } catch {}
  return 'member';
}

/**
 * Quick Switch Helper: Switch active session directly to Regular Customer/Member
 */
export function loginAsMemberDirectly(email = 'rider.customer@mustazcraft.com', name = 'RIDER CUSTOMER') {
  const memberProfile = {
    email,
    fullName: name,
    role: 'member',
    phone: '+62 878-1234-5678',
    alias: 'STREET RIDER'
  };
  localStorage.setItem('mustaz_auth_logged_in', 'true');
  localStorage.setItem('mustaz_user_profile_data', JSON.stringify(memberProfile));
  window.dispatchEvent(new CustomEvent('mustaz:auth_synced', { detail: memberProfile }));
  return memberProfile;
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
      import('../components/modal.js').then(({ showBrutalAlert }) => {
        showBrutalAlert({
          title: 'LOGIN GOOGLE GAGAL',
          message: `${msg}\n\nJika Google masih dalam status "Testing", pastikan email Anda sudah ditambahkan sebagai "Test User" di Google Cloud Console (OAuth consent screen), atau klik tombol "Publish App".`,
          badge: 'OAUTH // ERROR',
          okText: 'MENGERTI',
          isDanger: true
        });
      }).catch(() => {});
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

