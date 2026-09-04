/**
 * MUSTAZ Garage - Cart State & E-Commerce Data Service
 */

import { CONFIG } from '../config.js';

const CART_KEY = 'mustaz_cart_v2';

// ─── Product Catalog Data ───────────────────────────────────────────────────

export const CHOPPERS_DATA = [
  {
    id: 'custom-1', type: 'choppers', category: 'Custom Helmet',
    name: 'THE FLAME PILOT HELMET', sub: 'Open-Face Custom Lid + Studded Flame Leather Pet',
    price: 1850000, status: 'Available',
    specs: { Shell: 'Fiberglass Open Face', Pet: 'Hellfire Studded Leather', Snaps: 'Brass 3-Snap Universal', Finish: 'Matte Black Flame', Size: 'M / L / XL' },
    image: 'assets/images/pet_visor_yellow_flame.png',
    fallback: 'assets/images/pet_visor_yellow_flame.png'
  },
  {
    id: 'custom-2', type: 'choppers', category: 'Custom Helmet',
    name: 'CHECKER SPEED DEMON', sub: 'Full Moto Retro Shell + Monochrome Checker Peak',
    price: 2450000, status: 'In Shop',
    specs: { Shell: 'Reinforced Retro Full Moto', Pet: 'Checkered Duckbill Peak', Finish: 'Hand-Distressed Gloss', Interior: 'Antibacterial Foam', Size: 'All Sizes' },
    image: 'assets/images/retro_checkered_helmet.png',
    fallback: 'assets/images/retro_checkered_helmet.png'
  },
  {
    id: 'custom-3', type: 'choppers', category: 'Drop Sets',
    name: 'MUSTAZ EVENT EDITION KIT', sub: 'Complete Rider Kit + Ziplock Packaging + Zine',
    price: 1200000, status: 'Limited Drop',
    specs: { Visor: 'Acid Spiked Acrylic Pet', Package: 'Heavy Duty Zip Pack', Gloves: 'Yellow Leather Gloves', Extra: 'Issue 04 Zine + Stickers', Batch: 'Series 01 Run' },
    image: 'assets/images/mustaz_booth_event.png',
    fallback: 'assets/images/mustaz_booth_event.png'
  }
];

export const DEFAULT_PARTS_DATA = [
  {
    id: 'pet-1', type: 'parts', category: 'Acrylic Pet',
    name: 'Y-TWO ROOF VISOR', sub: 'Neon Lime Translucent // Spiked Studs // 3-Snap Universal',
    price: 350000, original_price: 450000, badge: 'BESTSELLER', stock: 12,
    image: 'assets/images/pet_visor_yellow_flame.png'
  },
  {
    id: 'pet-2', type: 'parts', category: 'Leather Pet',
    name: 'STUDDED LID FLAME VISOR', sub: 'Black Heavy Leather // Hand-Painted Red & Yellow Flames',
    price: 380000, original_price: null, badge: 'HOT DROP', stock: 8,
    image: 'assets/images/pet_visor_yellow_flame.png'
  },
  {
    id: 'pet-3', type: 'parts', category: 'Retro Visor',
    name: 'CHECKER RACER DUCKBILL', sub: 'Monochrome Checkered Motocross Visor // Chrome Snaps',
    price: 280000, original_price: 320000, badge: 'LIMITED', stock: 15,
    image: 'assets/images/retro_checkered_helmet.png'
  },
  {
    id: 'pet-4', type: 'parts', category: 'Drop Sets',
    name: 'MUSTAZ OFFICIAL BUNDLE SET', sub: 'Pet Visor + Custom Packaging Bag + Zine + Sticker Pack',
    price: 450000, original_price: 520000, badge: 'BUNDLE', stock: 10,
    image: 'assets/images/mustaz_booth_event.png'
  },
  {
    id: 'pet-5', type: 'parts', category: 'Acrylic Pet',
    name: 'ACID YELLOW SPIKED PET', sub: 'Acid Yellow High-Voltage Acrylic // Punk Spike Hardware',
    price: 360000, original_price: null, badge: 'NEW', stock: 18,
    image: 'assets/images/pet_visor_yellow_flame.png'
  },
  {
    id: 'pet-6', type: 'parts', category: 'Retro Visor',
    name: 'SMOKE TINT SHORT PEAK', sub: 'Dark Smoke Polycarbonate // Universal 3-Snap Fit',
    price: 220000, original_price: 270000, badge: 'SALE', stock: 24,
    image: 'assets/images/retro_checkered_helmet.png'
  },
  {
    id: 'pet-7', type: 'parts', category: 'Leather Pet',
    name: 'VINTAGE HIGHWAY EAR GUARDS', sub: 'Vintage Leather Side Covers with Brass Rivets',
    price: 195000, original_price: null, badge: 'CORE', stock: 14,
    image: 'assets/images/pet_visor_yellow_flame.png'
  },
  {
    id: 'pet-8', type: 'parts', category: 'Drop Sets',
    name: 'MUSTAZ EVENT EDITION PACK', sub: 'Special Event Pack // Limited Screenprinted Ziplock',
    price: 490000, original_price: 550000, badge: 'ARCHIVE', stock: 5,
    image: 'assets/images/mustaz_booth_event.png'
  }
];

const PRODUCTS_STORAGE_KEY = 'mustaz_catalog_products';

export function getDynamicParts() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('Failed to read dynamic products from storage', e);
  }
  return DEFAULT_PARTS_DATA;
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
    sub: product.sub || 'Custom Hand-Crafted Helmet Accessory',
    price: Number(product.price) || 250000,
    original_price: product.original_price ? Number(product.original_price) : null,
    badge: product.badge || 'NEW',
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
    alert('⚠️ AKSES DIBATASI // MASUK KE GARASI\n\nSilakan Login atau Buat Akun terlebih dahulu sebelum menambahkan barang ke keranjang.');
    window.location.href = 'login.html';
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

// ─── Utilities ─────────────────────────────────────────────────────────────

export function formatRupiah(amount) {
  return CONFIG.CURRENCY + ' ' + amount.toLocaleString('id-ID');
}

export function generateWhatsAppUrl(customerData, cartItems, total) {
  const itemsFormatted = (cartItems || []).map(i => 
    typeof i === 'string' ? i : `• ${i.name} x${i.quantity} = ${formatRupiah(i.price * i.quantity)}`
  );
  const lines = [
    `*⚡ ORDER BARU - MUSTAZ CRAFT*`,
    `--------------------------------`,
    `Nama: ${customerData.name}`,
    `WhatsApp: ${customerData.phone}`,
    `Alamat Drop: ${customerData.address}`,
    `Metode Bayar: ${customerData.payment || 'Direct Negotiation'}`,
    `Catatan: ${customerData.notes || '-'}`,
    `--------------------------------`,
    `*ITEM YANG DIBELI:*`,
    ...itemsFormatted,
    `--------------------------------`,
    `*TOTAL: ${formatRupiah(total)}*`,
    `--------------------------------`,
    `_Dikirim dari mustaz-craft.com_`
  ];
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${CONFIG.ADMIN_WHATSAPP}?text=${text}`;
}
