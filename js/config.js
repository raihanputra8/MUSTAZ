/**
 * MUSTAZ GARAGE & KUSTOM KULTUR - Global E-Commerce Configuration
 */

export const CONFIG = {
  APP_NAME: "MUSTAZ CRAFT",
  CURRENCY: "Rp",
  VERSION: "2.0.0",

  // Admin WhatsApp Number for Direct Checkout
  ADMIN_WHATSAPP: "6281234567890",

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
