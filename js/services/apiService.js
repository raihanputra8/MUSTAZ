/**
 * E-Commerce API, Cart & WhatsApp Checkout Service Layer
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient.js';
import { CONFIG } from '../config.js';

// Sample Brand Products
const SAMPLE_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Mustaz Cyberpunk Oversized Hoodie',
    category: 'Outerwear',
    price: 349000,
    original_price: 499000,
    badge: 'BESTSELLER',
    rating: 4.9,
    description: 'Hoodie bahan Heavyweight Cotton 330gsm dengan sablon plastisol discharge premium.',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    stock: 25
  },
  {
    id: 'prod-2',
    name: 'Mustaz Minimalist Heavy T-Shirt White',
    category: 'T-Shirt',
    price: 179000,
    original_price: 229000,
    badge: 'NEW',
    rating: 4.8,
    description: 'Kaos polos potong boxy fit 24s combed cotton dengan ribbed neck rapat.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    stock: 40
  },
  {
    id: 'prod-3',
    name: 'Mustaz Tactical Cargo Pants Black',
    category: 'Pants',
    price: 389000,
    original_price: 450000,
    badge: 'HOT',
    rating: 4.9,
    description: 'Celana cargo ripstop water-repellent dengan 6 kantong fungsional & buckle strap.',
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
    stock: 15
  },
  {
    id: 'prod-4',
    name: 'Mustaz Signature Utility Cap Black',
    category: 'Accessories',
    price: 129000,
    original_price: 159000,
    badge: 'LIMITED',
    rating: 4.7,
    description: 'Topi baseball 6-panel dengan bordir high density 3D logo Mustaz.',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80',
    stock: 30
  }
];

const CART_STORAGE_KEY = 'mustaz_brand_cart';

export async function getProducts(selectedCategory = 'All') {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    try {
      let query = supabase.from(CONFIG.TABLES.PRODUCTS).select('*');
      if (selectedCategory && selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Using sample products fallback:', e);
    }
  }

  if (selectedCategory === 'All') return SAMPLE_PRODUCTS;
  return SAMPLE_PRODUCTS.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
}

/**
 * Submit Checkout Order to Supabase `orders` table
 */
export async function submitOrder(customerDetails, cartItems, totalAmount) {
  const orderPayload = {
    customer_name: customerDetails.name,
    customer_phone: customerDetails.phone,
    customer_address: customerDetails.address,
    payment_method: customerDetails.paymentMethod || 'WhatsApp Checkout',
    items: cartItems,
    total_amount: totalAmount,
    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(CONFIG.TABLES.ORDERS)
      .insert([orderPayload])
      .select();

    if (!error && data) {
      return data[0];
    }
  }

  const existingOrders = JSON.parse(localStorage.getItem('mustaz_orders') || '[]');
  const localOrder = { ...orderPayload, id: 'ORD-' + Math.floor(100000 + Math.random() * 900000) };
  existingOrders.unshift(localOrder);
  localStorage.setItem('mustaz_orders', JSON.stringify(existingOrders));
  return localOrder;
}

/**
 * Generate Direct WhatsApp Checkout Link with Formatted Order Message
 */
export function generateWhatsAppOrderUrl(customerDetails, cartItems, totalAmount, orderId = 'ORD-NEW') {
  const adminNumber = CONFIG.ADMIN_WHATSAPP || '6281234567890';
  
  let itemListText = '';
  cartItems.forEach((item, index) => {
    itemListText += `${index + 1}. *${item.name}* (Size: ${item.size || 'M'}) x ${item.quantity} - ${formatRupiah(item.price * item.quantity)}\n`;
  });

  const messageText = 
`Halo Admin *${CONFIG.APP_NAME}*! 👋
Saya mau checkout pesanan baru:

----------------------------------
🆔 *ID Order:* ${orderId}
👤 *Nama:* ${customerDetails.name}
📱 *No. WA:* ${customerDetails.phone}
📍 *Alamat:* ${customerDetails.address}
💳 *Metode:* ${customerDetails.paymentMethod || 'Transfer Bank / QRIS'}

📦 *Rincian Pesanan:*
${itemListText}
💰 *Total Pembayaran:* *${formatRupiah(totalAmount)}*
----------------------------------

Mohon segera diproses ya min. Terima kasih!`;

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Shopping Cart Management
 */
export function getCart() {
  const data = localStorage.getItem(CART_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addToCart(product, selectedSize = 'M') {
  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === product.id && item.size === selectedSize);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: selectedSize,
      quantity: 1
    });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
  return cart;
}

export function updateCartQuantity(productId, size, change) {
  let cart = getCart();
  const index = cart.findIndex(item => item.id === productId && item.size === size);

  if (index > -1) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event('cart-updated'));
}

export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}
