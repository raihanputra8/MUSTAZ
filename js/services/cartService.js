/**
 * MUSTAZ Garage - Cart State & E-Commerce Data Service
 */

import { CONFIG, getProductImageUrl } from '../config.js';

const CART_KEY = 'mustaz_cart_v2';

// ─── Product Catalog Data (Hosted on Supabase Storage CDN) ───────────────────

export const HELMETS_DATA = [
  {
    id: 'custom-1', type: 'helmets', category: 'Custom Helmet',
    name: 'THE FLAME PILOT HELMET', sub: 'Open-Face Custom Lid + Studded Flame Leather Pet',
    price: 1850000, status: 'Available',
    specs: { Shell: 'Fiberglass Open Face', Pet: 'Hellfire Studded Leather', Snaps: 'Brass 3-Snap Universal', Finish: 'Matte Black Flame', Size: 'M / L / XL' },
    image: getProductImageUrl('pet_visor_yellow_flame.png'),
    fallback: 'assets/images/pet_visor_yellow_flame.png'
  },
  {
    id: 'custom-2', type: 'helmets', category: 'Custom Helmet',
    name: 'CHECKER SPEED DEMON', sub: 'Full Moto Retro Shell + Monochrome Checker Peak',
    price: 2450000, status: 'In Shop',
    specs: { Shell: 'Reinforced Retro Full Moto', Pet: 'Checkered Duckbill Peak', Finish: 'Hand-Distressed Gloss', Interior: 'Antibacterial Foam', Size: 'All Sizes' },
    image: getProductImageUrl('retro_checkered_helmet.png'),
    fallback: 'assets/images/retro_checkered_helmet.png'
  },
  {
    id: 'custom-3', type: 'drop-sets', category: 'Drop Sets',
    name: 'MUSTAZ EVENT EDITION KIT', sub: 'Complete Rider Kit + Ziplock Packaging + Zine',
    price: 1200000, status: 'Limited Drop',
    specs: { Visor: 'Acid Spiked Acrylic Pet', Package: 'Heavy Duty Zip Pack', Gloves: 'Yellow Leather Gloves', Extra: 'Issue 04 Zine + Stickers', Batch: 'Series 01 Run' },
    image: getProductImageUrl('mustaz_booth_event.png'),
    fallback: 'assets/images/mustaz_booth_event.png'
  }
];

// Backward-compatible alias
export const CHOPPERS_DATA = HELMETS_DATA;

export const DEFAULT_PARTS_DATA = [
  {
    id: 'pet-1', type: 'parts', category: 'Acrylic Pet',
    name: 'Y-TWO ROOF VISOR', slug: 'y-two-roof-visor', sub: 'Neon Lime Translucent // Spiked Studs // 3-Snap Universal',
    price: 350000, original_price: 450000, badge: 'BESTSELLER', status: 'Active', stock: 12,
    is_flash_sale: true, flash_sale_price: 245000, flash_sale_stock: 3,
    flash_sale_start: '2026-09-01T00:00:00.000Z', flash_sale_end: '2026-09-30T23:59:59.000Z',
    image: getProductImageUrl('Product1.png'),
    fallback: 'assets/images/Product1.png'
  },
  {
    id: 'pet-2', type: 'parts', category: 'Leather Pet',
    name: 'STUDDED LID FLAME VISOR', slug: 'studded-lid-flame-visor', sub: 'Black Heavy Leather // Hand-Painted Red & Yellow Flames',
    price: 380000, original_price: null, badge: 'HOT DROP', status: 'Active', stock: 8,
    is_flash_sale: true, flash_sale_price: 285000, flash_sale_stock: 5,
    flash_sale_start: '2026-09-01T00:00:00.000Z', flash_sale_end: '2026-09-30T23:59:59.000Z',
    image: getProductImageUrl('Product2.png'),
    fallback: 'assets/images/Product2.png'
  },
  {
    id: 'pet-3', type: 'parts', category: 'Retro Visor',
    name: 'CHECKER RACER DUCKBILL', slug: 'checker-racer-duckbill', sub: 'Monochrome Checkered Motocross Visor // Chrome Snaps',
    price: 280000, original_price: 320000, badge: 'LIMITED', status: 'Active', stock: 15,
    is_flash_sale: true, flash_sale_price: 210000, flash_sale_stock: 4,
    flash_sale_start: '2026-09-01T00:00:00.000Z', flash_sale_end: '2026-09-30T23:59:59.000Z',
    image: getProductImageUrl('Product3.png'),
    fallback: 'assets/images/Product3.png'
  },
  {
    id: 'pet-4', type: 'parts', category: 'Drop Sets',
    name: 'MUSTAZ OFFICIAL BUNDLE SET', slug: 'mustaz-official-bundle-set', sub: 'Pet Visor + Custom Packaging Bag + Zine + Sticker Pack',
    price: 450000, original_price: 520000, badge: 'BUNDLE', status: 'Active', stock: 10,
    is_flash_sale: false, flash_sale_price: null, flash_sale_stock: 0,
    image: getProductImageUrl('mustaz_booth_event.png'),
    fallback: 'assets/images/mustaz_booth_event.png'
  },
  {
    id: 'pet-5', type: 'parts', category: 'Acrylic Pet',
    name: 'ACID YELLOW SPIKED PET', slug: 'acid-yellow-spiked-pet', sub: 'Acid Yellow High-Voltage Acrylic // Punk Spike Hardware',
    price: 360000, original_price: null, badge: 'NEW', status: 'Active', stock: 18,
    is_flash_sale: false, flash_sale_price: null, flash_sale_stock: 0,
    image: getProductImageUrl('Product1.png'),
    fallback: 'assets/images/Product1.png'
  },
  {
    id: 'pet-6', type: 'parts', category: 'Retro Visor',
    name: 'SMOKE TINT SHORT PEAK', slug: 'smoke-tint-short-peak', sub: 'Dark Smoke Polycarbonate // Universal 3-Snap Fit',
    price: 220000, original_price: 270000, badge: 'SALE', status: 'Active', stock: 24,
    is_flash_sale: false, flash_sale_price: null, flash_sale_stock: 0,
    image: getProductImageUrl('Product2.png'),
    fallback: 'assets/images/Product2.png'
  },
  {
    id: 'pet-7', type: 'parts', category: 'Leather Pet',
    name: 'VINTAGE HIGHWAY EAR GUARDS', slug: 'vintage-highway-ear-guards', sub: 'Vintage Leather Side Covers with Brass Rivets',
    price: 195000, original_price: null, badge: 'CORE', status: 'Active', stock: 14,
    is_flash_sale: false, flash_sale_price: null, flash_sale_stock: 0,
    image: getProductImageUrl('Product3.png'),
    fallback: 'assets/images/Product3.png'
  },
  {
    id: 'pet-8', type: 'parts', category: 'Drop Sets',
    name: 'MUSTAZ EVENT EDITION PACK', slug: 'mustaz-event-edition-pack', sub: 'Special Event Pack // Limited Screenprinted Ziplock',
    price: 490000, original_price: 550000, badge: 'ARCHIVE', status: 'Active', stock: 5,
    is_flash_sale: false, flash_sale_price: null, flash_sale_stock: 0,
    image: getProductImageUrl('mustaz_booth_event.png'),
    fallback: 'assets/images/mustaz_booth_event.png'
  }
];

export const FLASH_SALE_CONFIG_KEY = 'mustaz_flash_sale_config_v1';
let _flashSaleConfigMem = null;

export function getFlashSaleConfig() {
  const defaultStart = new Date();
  const defaultEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const defaults = {
    active: true,
    isActive: true,
    title: 'LIMITED DISPATCH',
    subtitle: 'POTONGAN HARGA S/D 30% // BERAKHIR MALAM INI',
    startTime: defaultStart.toISOString(),
    endTime: defaultEnd.toISOString()
  };

  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(FLASH_SALE_CONFIG_KEY);
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } else if (_flashSaleConfigMem) {
      return { ...defaults, ..._flashSaleConfigMem };
    }
  } catch {}
  return defaults;
}

export function saveFlashSaleConfig(config) {
  try {
    const current = getFlashSaleConfig();
    const updated = { ...current, ...config };
    if (config.isActive !== undefined && config.active === undefined) {
      updated.active = config.isActive;
    }
    _flashSaleConfigMem = updated;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FLASH_SALE_CONFIG_KEY, JSON.stringify(updated));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flash-sale:updated', { detail: updated }));
    }
    return updated;
  } catch (err) {
    console.error('Failed to save flash sale config:', err);
    return config;
  }
}

export function getActiveFlashSaleProducts() {
  const config = getFlashSaleConfig();
  const isPromoActive = config.isActive !== undefined ? config.isActive : (config.active !== false);
  if (!isPromoActive) return [];

  const now = new Date().getTime();
  const start = config.startTime ? new Date(config.startTime).getTime() : 0;
  const end = config.endTime ? new Date(config.endTime).getTime() : Infinity;

  if (now < start || now > end) return [];

  const allParts = getDynamicParts();
  return allParts.filter(p => {
    if (!p.is_flash_sale) return false;
    const price = Number(p.flash_sale_price);
    if (!price || price <= 0) return false;
    if (p.flash_sale_start && new Date(p.flash_sale_start).getTime() > now) return false;
    if (p.flash_sale_end && new Date(p.flash_sale_end).getTime() < now) return false;
    return true;
  });
}

export function setProductFlashSale(productId, fsData) {
  const parts = getDynamicParts();
  const target = parts.find(p => p.id === productId);
  if (!target) return null;

  target.is_flash_sale = Boolean(fsData.is_flash_sale);
  if (fsData.flash_sale_price !== undefined) target.flash_sale_price = Number(fsData.flash_sale_price) || 0;
  else if (fsData.price !== undefined) target.flash_sale_price = Number(fsData.price) || 0;

  if (fsData.flash_sale_stock !== undefined) target.flash_sale_stock = Number(fsData.flash_sale_stock) || 0;
  else if (fsData.stock !== undefined) target.flash_sale_stock = Number(fsData.stock) || 0;

  if (fsData.flash_sale_start !== undefined) target.flash_sale_start = fsData.flash_sale_start;
  else if (fsData.start !== undefined) target.flash_sale_start = fsData.start;

  if (fsData.flash_sale_end !== undefined) target.flash_sale_end = fsData.flash_sale_end;
  else if (fsData.end !== undefined) target.flash_sale_end = fsData.end;

  saveDynamicParts(parts);

  // Sync to cloud
  import('./supabaseService.js').then(sb => {
    sb.updateCloudProduct(productId, {
      is_flash_sale: target.is_flash_sale,
      flash_sale_price: target.flash_sale_price,
      flash_sale_stock: target.flash_sale_stock,
      flash_sale_start: target.flash_sale_start,
      flash_sale_end: target.flash_sale_end
    }).catch(() => {});
  }).catch(() => {});

  return target;
}

export function deductProductStock(productId, quantity = 1) {
  const parts = getDynamicParts();
  const target = parts.find(p => p.id === productId);
  if (!target) return;

  if (typeof target.stock === 'number') {
    target.stock = Math.max(0, target.stock - quantity);
  }
  if (target.is_flash_sale && typeof target.flash_sale_stock === 'number') {
    target.flash_sale_stock = Math.max(0, target.flash_sale_stock - quantity);
  }

  saveDynamicParts(parts);
}

const PRODUCTS_STORAGE_KEY = 'mustaz_catalog_products_v3';

function toSlug(str) {
  return String(str || '').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function getDynamicParts() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY) || localStorage.getItem('mustaz_catalog_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => ({
            ...p,
            slug: p.slug || toSlug(p.name),
            status: p.status || 'Active',
            image: getProductImageUrl(p.image)
          }));
        }
      }
    }
  } catch (e) {
    console.error('Failed to read dynamic products from storage', e);
  }
  return DEFAULT_PARTS_DATA;
}

export function getActiveParts() {
  return getDynamicParts().filter(p => (p.status || 'Active').toLowerCase() === 'active');
}

export function saveDynamicParts(parts) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(parts));
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mustaz_products_updated', { detail: parts }));
  }
}

export function addProduct(product) {
  const parts = getDynamicParts();
  const newProduct = {
    id: product.id || `pet-${Date.now().toString().slice(-4)}`,
    type: 'parts',
    category: product.category || 'Acrylic Pet',
    name: product.name || 'UNTITLED PET VISOR',
    slug: product.slug || toSlug(product.name || 'untitled-pet-visor'),
    sub: product.sub || product.description || 'Custom Hand-Crafted Helmet Accessory',
    price: Number(product.price) || 250000,
    original_price: product.original_price ? Number(product.original_price) : (product.originalPrice ? Number(product.originalPrice) : null),
    badge: product.badge || '',
    status: product.status || 'Active',
    stock: Number(product.stock) || 10,
    image: product.image || 'assets/images/pet_visor_yellow_flame.png'
  };
  parts.unshift(newProduct);
  saveDynamicParts(parts);

  // Sync to Supabase Cloud in background
  import('./supabaseService.js').then(sb => {
    sb.createCloudProduct(newProduct).catch(() => {});
  }).catch(() => {});

  return newProduct;
}

export function updateProduct(id, updatedFields) {
  const parts = getDynamicParts();
  const idx = parts.findIndex(p => p.id === id);
  if (idx !== -1) {
    const oldImage = parts[idx].image;
    const newImage = updatedFields.image;

    // Clean up old image from Supabase Storage if replaced
    if (newImage && oldImage && newImage !== oldImage) {
      import('./supabaseService.js').then(sb => {
        sb.deleteAssetFromStorage(oldImage).catch(() => {});
      }).catch(() => {});
    }

    if (updatedFields.name && !updatedFields.slug) {
      updatedFields.slug = toSlug(updatedFields.name);
    }

    parts[idx] = Object.assign({}, parts[idx], updatedFields);
    saveDynamicParts(parts);

    // Sync to Supabase Cloud in background
    import('./supabaseService.js').then(sb => {
      sb.updateCloudProduct(id, updatedFields).catch(() => {});
    }).catch(() => {});

    return parts[idx];
  }
  return null;
}

export function deleteProduct(id) {
  let parts = getDynamicParts();
  const target = parts.find(p => p.id === id);

  // Clean up image from Supabase Storage bucket when product is deleted
  if (target && target.image) {
    import('./supabaseService.js').then(sb => {
      sb.deleteAssetFromStorage(target.image).catch(() => {});
    }).catch(() => {});
  }

  parts = parts.filter(p => p.id !== id);
  saveDynamicParts(parts);

  // Sync to Supabase Cloud in background
  import('./supabaseService.js').then(sb => {
    sb.deleteCloudProduct(id).catch(() => {});
  }).catch(() => {});

  return parts;
}

export function resetCatalogToDefault() {
  saveDynamicParts(DEFAULT_PARTS_DATA);
  return DEFAULT_PARTS_DATA;
}

export const PARTS_DATA = getDynamicParts();

// ─── Cart State Management (User-Scoped & Auth-Tied) ───────────────────────

export function getActiveUserEmail() {
  const isLoggedIn = typeof localStorage !== 'undefined' && localStorage.getItem('mustaz_auth_logged_in') === 'true';
  if (!isLoggedIn) return null;
  try {
    const profile = JSON.parse(localStorage.getItem('mustaz_user_profile_data') || '{}');
    const email = (profile.email || '').toLowerCase().trim();
    return email || null;
  } catch {
    return null;
  }
}

function getActiveCartKey() {
  const email = getActiveUserEmail();
  if (!email) {
    return null;
  }
  return `mustaz_cart_${email.replace(/[^a-z0-9]/g, '_')}`;
}

function readCart() {
  const key = getActiveCartKey();
  if (!key) {
    return []; // No items for unauthenticated / logged out sessions
  }
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function writeCart(cart) {
  const key = getActiveCartKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
}

export function getCart() {
  return readCart();
}

export function addToCart(product) {
  const isLoggedIn = typeof localStorage !== 'undefined' && localStorage.getItem('mustaz_auth_logged_in') === 'true';
  if (!isLoggedIn) {
    import('../components/modal.js').then(({ showBrutalAlert }) => {
      showBrutalAlert({
        title: 'AKSES DIBATASI // MASUK KE GARASI',
        message: 'Silakan Login atau Buat Akun terlebih dahulu sebelum menambahkan barang ke keranjang.',
        badge: 'AUTH REQUIRED',
        okText: 'LOGIN SEKARANG',
        onOk: () => { window.location.href = 'login.html'; }
      });
    }).catch(() => {
      window.location.href = 'login.html';
    });
    return [];
  }

  const cart = readCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  writeCart(cart);
  return cart;
}

export function removeFromCart(id) {
  const cart = readCart().filter(i => i.id !== id);
  writeCart(cart);
  return cart;
}

export function updateCartQty(id, delta) {
  const cart = readCart().map(i => {
    if (i.id === id) return { ...i, quantity: Math.max(0, i.quantity + delta) };
    return i;
  }).filter(i => i.quantity > 0);
  writeCart(cart);
  return cart;
}

export function clearCart() {
  const key = getActiveCartKey();
  if (key) {
    localStorage.removeItem(key);
  }
  try {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem('mustaz_cart');
  } catch {}
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: [] }));
}

export function getCartTotal() {
  return readCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function getCartCount() {
  return readCart().reduce((sum, i) => sum + i.quantity, 0);
}

// ─── User-Scoped Order History Management ──────────────────────────────────

export function getUserOrders(userEmail) {
  const email = (userEmail || getActiveUserEmail() || '').toLowerCase().trim();
  if (!email) return [];
  const key = `mustaz_orders_${email.replace(/[^a-z0-9]/g, '_')}`;
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}

  // Initial seed orders ONLY for owner email (for showroom demo)
  if (email === 'raihanputrairawan8@gmail.com' || email === 'admin@mustazcraft.com') {
    const ownerOrders = [
      {
        id: 'MSTZ-9942',
        date: '2 SEP 2026',
        status: 'IN TRANSIT',
        tracking: 'J&T EXPRESS [JT-992144]',
        items: [
          { name: 'Y-TWO ROOF VISOR // SPIKED', spec: 'COLOR: ACID YELLOW ACRYLIC • 3-SNAP MOUNT', qty: 1, price: 350000, image: 'assets/images/pet_visor_yellow_flame.png' },
          { name: 'CHECKER RACER PET // DUCKBILL', spec: 'COLOR: MONOCHROME CHECKERED • RETRO 70S', qty: 1, price: 280000, image: 'assets/images/retro_checkered_helmet.png' }
        ],
        total: 630000
      }
    ];
    localStorage.setItem(key, JSON.stringify(ownerOrders));
    return ownerOrders;
  }

  return [];
}

export function saveUserOrder(userEmail, newOrder) {
  const email = (userEmail || getActiveUserEmail() || '').toLowerCase().trim();
  if (!email) return false;
  const key = `mustaz_orders_${email.replace(/[^a-z0-9]/g, '_')}`;
  const orders = getUserOrders(email);
  orders.unshift(newOrder);
  try {
    localStorage.setItem(key, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('mustaz:orders_updated', { detail: orders }));
    return true;
  } catch {
    return false;
  }
}

// ─── User-Scoped Wishlist (Saved Visors) ────────────────────────────────────

export function getUserWishlist(userEmail) {
  const email = (userEmail || getActiveUserEmail() || '').toLowerCase().trim();
  if (!email) return [];
  const key = `mustaz_wishlist_${email.replace(/[^a-z0-9]/g, '_')}`;
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function toggleWishlist(userEmail, product) {
  const email = (userEmail || getActiveUserEmail() || '').toLowerCase().trim();
  if (!email) return [];
  const key = `mustaz_wishlist_${email.replace(/[^a-z0-9]/g, '_')}`;
  let list = getUserWishlist(email);
  const exists = list.some(p => p.id === product.id);
  if (exists) {
    list = list.filter(p => p.id !== product.id);
  } else {
    list.push(product);
  }
  localStorage.setItem(key, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('mustaz:wishlist_updated', { detail: list }));
  return list;
}

// ─── User-Scoped Delivery Addresses ────────────────────────────────────────

export function getUserAddresses(userEmail, defaultName = '', defaultPhone = '') {
  const email = (userEmail || getActiveUserEmail() || '').toLowerCase().trim();
  if (!email) return [];
  const key = `mustaz_addresses_${email.replace(/[^a-z0-9]/g, '_')}`;
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}

  // Only demo default address for owner
  if (email === 'raihanputrairawan8@gmail.com' || email === 'admin@mustazcraft.com') {
    return [
      {
        id: 'addr-1',
        title: 'HOME & GARAGE',
        isDefault: true,
        recipient: `${defaultName || 'Raihan Putra'} (${defaultPhone || '+62 812-3456-7890'})`,
        address: 'Jl. Senopati Raya No. 42B, RT 04 / RW 02, Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta 12190',
        notes: 'TITIPKAN KE SECURITY JIKA BENGKEL TUTUP'
      }
    ];
  }

  return [];
}

export function saveUserAddress(userEmail, newAddress) {
  const email = (userEmail || getActiveUserEmail() || '').toLowerCase().trim();
  if (!email) return false;
  const key = `mustaz_addresses_${email.replace(/[^a-z0-9]/g, '_')}`;
  const addresses = getUserAddresses(email);
  addresses.push(newAddress);
  localStorage.setItem(key, JSON.stringify(addresses));
  window.dispatchEvent(new CustomEvent('mustaz:addresses_updated', { detail: addresses }));
  return true;
}

// ─── Multi-Currency Engine (IDR ⇄ USD) ──────────────────────────────────────

let _inMemoryCurrency = null;

export function getActiveCurrency() {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mustaz_currency');
      if (stored) return stored.toUpperCase();
    }
  } catch {}
  return _inMemoryCurrency || CONFIG.DEFAULT_CURRENCY || 'IDR';
}

export function setActiveCurrency(currencyCode) {
  const code = (currencyCode || 'IDR').toUpperCase().trim();
  _inMemoryCurrency = code;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mustaz_currency', code);
    }
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mustaz:currency_changed', { detail: { currency: code } }));
  }
  return code;
}

export function formatPrice(amount, forceCurrency = null) {
  const currency = (forceCurrency || getActiveCurrency() || 'IDR').toUpperCase();
  const num = Number(amount) || 0;

  if (currency === 'USD') {
    const rate = Number(CONFIG.EXCHANGE_RATE_USD) || 15500;
    const usdVal = num / rate;
    return `$${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // IDR format (Rp 350.000)
  return (CONFIG.CURRENCY || 'Rp') + ' ' + Math.round(num).toLocaleString('id-ID');
}

// Backward-compatible alias that dynamically respects selected currency
export function formatRupiah(amount, forceCurrency = null) {
  return formatPrice(amount, forceCurrency);
}

export function generateWhatsAppUrl(customerData, cartItems, total, orderIdParam) {
  const currency = getActiveCurrency();
  const orderId = orderIdParam || customerData.orderId || customerData.id || ('MSTZ-' + Math.floor(1000 + Math.random() * 9000));
  const itemsFormatted = (cartItems || []).map(i => 
    typeof i === 'string' ? i : `• ${i.name} x${i.quantity} = ${formatPrice(i.price * i.quantity, currency)}`
  );

  const totalFormatted = formatPrice(total, currency);
  const rateNote = currency === 'USD' 
    ? `\n💵 *Kurs Acuan:* 1 USD = Rp ${(CONFIG.EXCHANGE_RATE_USD || 15500).toLocaleString('id-ID')}\n🇮🇩 *Setara IDR:* Rp ${Math.round(total).toLocaleString('id-ID')}`
    : '';

  const lines = [
    `*⚡ FORMAT PESANAN RESMI WEB // MUSTAZ CRAFT*`,
    `--------------------------------`,
    `📌 *Kode Order:* #${orderId}`,
    `🌐 *Mata Uang:* ${currency}`,
    `👤 *Nama:* ${customerData.name}`,
    `📱 *WhatsApp:* ${customerData.phone}`,
    `📍 *Alamat Drop:* ${customerData.address}`,
    `💳 *Metode Bayar:* ${customerData.payment || 'Direct Negotiation'}`,
    `📝 *Catatan:* ${customerData.notes || '-'}`,
    `--------------------------------`,
    `📦 *ITEM YANG DIBELI:*`,
    ...itemsFormatted,
    `--------------------------------`,
    `💰 *Total Tagihan:* ${totalFormatted}${rateNote}`,
    `--------------------------------`,
    `_Mohon instruksi pembayaran dan nomor rekening resmi toko ya Kak CS._`
  ];
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${CONFIG.ADMIN_WHATSAPP}?text=${text}`;
}

