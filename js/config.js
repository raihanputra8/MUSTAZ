/**
 * MUSTAZ GARAGE & KUSTOM KULTUR - Global E-Commerce Configuration
 */

export const CONFIG = {
  APP_NAME: "MUSTAZ CRAFT",
  CURRENCY: "Rp",
  DEFAULT_CURRENCY: "IDR",
  EXCHANGE_RATE_USD: 15500, // 1 USD = Rp 15.500
  VERSION: "2.0.0",

  // Admin WhatsApp Number for Direct Checkout (Default fallback)
  DEFAULT_ADMIN_WHATSAPP: "62895325604340",
  ADMIN_WHATSAPP: "62895325604340",

  // Supabase Project Credentials (Active)
  SUPABASE_URL: "https://hskggocaakmidbysrpnd.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_GiDVOZNX_cZFe79wO0fw5w_wsfgRyAi",

  STORAGE_BUCKET: "product-images",
  STORAGE_URL: "https://hskggocaakmidbysrpnd.supabase.co/storage/v1/object/public/product-images",

  TABLES: {
    PRODUCTS: "products",
    ORDERS: "orders",
    ACCOUNTS: "accounts",
    CATEGORIES: "categories",
    REVIEWS: "reviews",
    STORE_SETTINGS: "store_settings",
  },
};

/**
 * Get public Supabase Storage CDN URL for any product asset
 */
export function getProductImageUrl(filename) {
  if (!filename) return `${CONFIG.STORAGE_URL}/Product1.png`;
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
  const clean = filename.replace(/^assets\/images\//, '').replace(/^\//, '');
  return `${CONFIG.STORAGE_URL}/${clean}`;
}

// Auto-sanitize legacy localStorage data containing old demo/testing phone numbers
(function sanitizeLegacyStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    // 1. Profile data
    const profileStr = localStorage.getItem('mustaz_user_profile_data');
    if (profileStr && (profileStr.includes('81234567890') || profileStr.includes('812-3456-7890'))) {
      const p = JSON.parse(profileStr);
      p.phone = '+62 895-4028-06350';
      localStorage.setItem('mustaz_user_profile_data', JSON.stringify(p));
    }

    // 2. Admin orders cache
    const adminOrdersStr = localStorage.getItem('mustaz_admin_orders');
    if (adminOrdersStr && adminOrdersStr.includes('81234567890')) {
      const orders = JSON.parse(adminOrdersStr);
      let changed = false;
      orders.forEach(o => {
        if (o.phone && o.phone.includes('81234567890')) {
          o.phone = '0895402806350';
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('mustaz_admin_orders', JSON.stringify(orders));
      }
    }

    // 3. User saved orders & addresses
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('mustaz_user_orders_') || key.startsWith('mustaz_addresses_'))) {
        const val = localStorage.getItem(key);
        if (val && val.includes('81234567890')) {
          const replaced = val.replace(/81234567890/g, '895402806350');
          localStorage.setItem(key, replaced);
        }
      }
    }
  } catch (e) {}
})();
