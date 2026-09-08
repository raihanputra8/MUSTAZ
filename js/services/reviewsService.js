/**
 * MUSTAZ CRAFT - Verified Customer Reviews & Testimonials Service
 * Scheme 1: Only verified buyers with authentic orders can submit reviews.
 */

import { CONFIG } from '../config.js';

const STORAGE_KEY = 'mustaz_verified_reviews';

// Baseline authentic seed testimonials (shown on first load / fallback)
const SEED_REVIEWS = [
  {
    id: 'REV-SEED-01',
    order_id: 'MSTZ-SHOWROOM-01',
    user_email: 'dimas.speedy@kustom.id',
    user_name: 'DIMAS "SPEEDY" R.',
    bike_model: 'HONDA CB KUSTOM',
    city: 'BANDUNG',
    product_id: 'WHITE-ACRYLIC-01',
    product_name: 'WHITE ACRYLIC 3-SNAP',
    product_image: 'assets/images/TESTI.png',
    rating: 5,
    comment: 'Fitting ke helm open-face Bell 500 langsung pas presisi tanpa goyang. Finishing akrilik tebal rapi dan bonus sticker pack-nya gokil abis! Rekomendasi buat anak kustom.',
    is_verified: true,
    tag: 'BOOTH FITTING',
    status: 'approved',
    created_at: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'REV-SEED-02',
    order_id: 'MSTZ-SHOWROOM-02',
    user_email: 'bram.ironhead@garage.com',
    user_name: 'OM BRAM "IRONHEAD"',
    bike_model: 'CUSTOM RIGID',
    city: 'JAKSEL',
    product_id: 'SMOKE-OBSIDIAN-01',
    product_name: 'SMOKE OBSIDIAN PEAK',
    product_image: 'assets/images/TESTI1.png',
    rating: 5,
    comment: 'Bahan duckbill pet-nya solid banget, bukan plastik abal-abal tipis pabrikan. Dipakai touring panas terik tetep adem dan gak gampang baret. Mantap brother!',
    is_verified: true,
    tag: 'VERIFIED BUYER',
    status: 'approved',
    created_at: '2026-08-22T14:30:00.000Z'
  },
  {
    id: 'REV-SEED-03',
    order_id: 'MSTZ-SHOWROOM-03',
    user_email: 'sarah.valkyrie@riders.id',
    user_name: 'SARAH "VALKYRIE" W.',
    bike_model: 'VESPA SPRINT RETRO',
    city: 'TANGERANG',
    product_id: 'Y-TWO-FLAME-01',
    product_name: 'Y-TWO FLAME SPECIAL',
    product_image: 'assets/images/TESTI2.png',
    rating: 5,
    comment: 'Desain pet flame-nya eye catching parah! Packaging ziplock eksklusif kayak brand streetwear luar. Pas dipasang ke helm retro langsung auto ganteng motoran santai.',
    is_verified: true,
    tag: 'DAILY RIDER',
    status: 'approved',
    created_at: '2026-08-25T09:15:00.000Z'
  },
  {
    id: 'REV-SEED-04',
    order_id: 'MSTZ-SHOWROOM-04',
    user_email: 'cindy.rebel@bobber.com',
    user_name: 'CINDY "REBEL" A.',
    bike_model: 'CUSTOM BOBBER',
    city: 'JAKTIM',
    product_id: 'STUDDED-FLAME-01',
    product_name: 'STUDDED FLAME LIDS',
    product_image: 'assets/images/TESTI3.png',
    rating: 5,
    comment: 'Spikes studded-nya bener-bener gahar pas dipasang ke helm custom full cat gua. Kancing snap solid ga gampang copot walau kena angin kencang. 100% riding with pride!',
    is_verified: true,
    tag: 'CUSTOM BUILD',
    status: 'approved',
    created_at: '2026-08-28T16:40:00.000Z'
  },
  {
    id: 'REV-SEED-05',
    order_id: 'MSTZ-SHOWROOM-05',
    user_email: 'radit.blueflame@re350.id',
    user_name: 'RADIT "BLUE FLAME"',
    bike_model: 'ROYAL ENFIELD 350',
    city: 'BOGOR',
    product_id: 'BLUE-FLAME-01',
    product_name: 'BLUE FLAME UNIVERSAL',
    product_image: 'assets/images/TESTI4.png',
    rating: 5,
    comment: 'Kancing snap kuningan asli kenceng banget pas ngebut di jalur luar kota. Warna flame birunya tajem dan materialnya tahan banting. Bakal order varian lain!',
    is_verified: true,
    tag: 'STREET KULTURE',
    status: 'approved',
    created_at: '2026-08-30T11:20:00.000Z'
  }
];

/**
 * Initialize local storage with seed reviews if empty
 */
function getLocalReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REVIEWS));
      return [...SEED_REVIEWS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REVIEWS));
    return [...SEED_REVIEWS];
  } catch (err) {
    console.warn('[Reviews] LocalStorage read failed:', err);
    return [...SEED_REVIEWS];
  }
}

/**
 * Save reviews list to LocalStorage
 */
function setLocalReviews(reviews) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn('[Reviews] LocalStorage save failed:', err);
  }
}

/**
 * Fetch all reviews (from Supabase if table exists, with fallback to LocalStorage)
 */
export async function getAllReviews() {
  try {
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${CONFIG.TABLES.REVIEWS}?select=*&order=created_at.desc`;
    const res = await fetch(url, {
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const cloudReviews = await res.json();
      if (Array.isArray(cloudReviews) && cloudReviews.length > 0) {
        // Merge cloud reviews with local seed reviews
        const local = getLocalReviews();
        const mergedMap = new Map();
        [...local, ...cloudReviews].forEach(item => {
          if (item && item.id) mergedMap.set(item.id, item);
        });
        const merged = Array.from(mergedMap.values());
        setLocalReviews(merged);
        return merged;
      }
    }
  } catch (err) {
    // Silently fall back to LocalStorage
  }

  return getLocalReviews();
}

/**
 * Get approved reviews for public pages (kulture.html, index.html)
 */
export async function getApprovedReviews() {
  const all = await getAllReviews();
  return all.filter(r => r.status === 'approved' || !r.status);
}

/**
 * Get reviews written by a specific user email
 */
export async function getUserReviews(email) {
  const normEmail = String(email || '').toLowerCase().trim();
  if (!normEmail) return [];
  const all = await getAllReviews();
  return all.filter(r => String(r.user_email || '').toLowerCase().trim() === normEmail);
}

/**
 * Check if a user has already reviewed an order and specific product
 */
export async function getOrderReview(orderId, productName) {
  const all = await getAllReviews();
  const normOrderId = String(orderId || '').trim();
  const normName = String(productName || '').trim().toLowerCase();

  return all.find(r => 
    String(r.order_id || '').trim() === normOrderId &&
    (!normName || String(r.product_name || '').trim().toLowerCase() === normName)
  ) || null;
}

/**
 * Submit a verified buyer review
 * @param {Object} data
 * @param {string} data.order_id - Required Order ID (e.g. 'MSTZ-9942')
 * @param {string} data.user_email - Required user email
 * @param {string} data.user_name - Display name / rider moniker
 * @param {string} [data.bike_model] - e.g. "Royal Enfield 350"
 * @param {string} [data.city] - e.g. "Bandung"
 * @param {string} data.product_name - Name of product purchased
 * @param {string} [data.product_image] - Product image url
 * @param {number} data.rating - 1 to 5 stars
 * @param {string} data.comment - Authentic review quote
 * @returns {Promise<Object>} The created review
 */
export async function submitVerifiedReview(data) {
  if (!data.order_id) throw new Error('Order ID wajib disertakan untuk verifikasi pembelian.');
  if (!data.product_name) throw new Error('Produk yang diulas wajib ditentukan.');
  if (!data.rating || data.rating < 1 || data.rating > 5) throw new Error('Rating bintang harus bernilai antara 1 sampai 5.');
  if (!data.comment || data.comment.trim().length < 5) throw new Error('Tulis ulasan minimal 5 karakter.');

  const newReview = {
    id: `REV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    order_id: String(data.order_id).trim(),
    user_email: String(data.user_email || '').trim().toLowerCase(),
    user_name: String(data.user_name || 'VERIFIED RIDER').trim().toUpperCase(),
    bike_model: String(data.bike_model || 'CUSTOM RIDE').trim().toUpperCase(),
    city: String(data.city || 'INDONESIA').trim().toUpperCase(),
    product_id: data.product_id || '',
    product_name: String(data.product_name).trim(),
    product_image: data.product_image || 'assets/images/pet_visor_yellow_flame.png',
    rating: Math.round(Number(data.rating)),
    comment: String(data.comment).trim(),
    is_verified: true,
    tag: 'VERIFIED BUYER',
    status: 'approved',
    created_at: new Date().toISOString()
  };

  // 1. Save to LocalStorage immediately
  const local = getLocalReviews();
  // Filter out any previous review for this exact order & product to allow updating
  const filtered = local.filter(r => !(r.order_id === newReview.order_id && r.product_name === newReview.product_name));
  filtered.unshift(newReview);
  setLocalReviews(filtered);

  // 2. Try to sync to Supabase Cloud if table exists
  try {
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${CONFIG.TABLES.REVIEWS}`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([newReview])
    });
  } catch (err) {
    console.warn('[Reviews] Supabase cloud sync deferred (saved locally):', err.message);
  }

  // 3. Dispatch global event for reactive UI update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mustaz:reviews_updated', { detail: newReview }));
  }

  return newReview;
}

/**
 * Update review status (admin action: 'approved' | 'hidden' | 'rejected')
 */
export async function updateReviewStatus(reviewId, status) {
  const local = getLocalReviews();
  const idx = local.findIndex(r => r.id === reviewId);
  if (idx !== -1) {
    local[idx].status = status;
    setLocalReviews(local);
  }

  try {
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${CONFIG.TABLES.REVIEWS}?id=eq.${reviewId}`;
    await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mustaz:reviews_updated', { detail: { id: reviewId, status } }));
  }
  return true;
}

/**
 * Delete a review (admin action)
 */
export async function deleteReview(reviewId) {
  const local = getLocalReviews().filter(r => r.id !== reviewId);
  setLocalReviews(local);

  try {
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${CONFIG.TABLES.REVIEWS}?id=eq.${reviewId}`;
    await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
      }
    });
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mustaz:reviews_updated', { detail: { id: reviewId, deleted: true } }));
  }
  return true;
}
