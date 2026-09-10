/**
 * MUSTAZ CRAFT - Supabase Cloud Database & Storage Service Layer
 */

import { CONFIG, getProductImageUrl } from '../config.js';

/**
 * Build dynamic headers with user session JWT if authenticated
 */
async function getDynamicHeaders(customHeaders = {}) {
  let authToken = CONFIG.SUPABASE_ANON_KEY;
  try {
    const { getAuthToken } = await import('./authService.js');
    const token = await getAuthToken();
    if (token) {
      authToken = token;
    }
  } catch {}

  return {
    'apikey': CONFIG.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...customHeaders
  };
}

/**
 * Universal Supabase REST Helper
 */
async function supabaseRest(endpoint, options = {}) {
  const url = `${CONFIG.SUPABASE_URL}/rest/v1/${endpoint}`;
  try {
    const reqHeaders = await getDynamicHeaders(options.headers || {});
    const res = await fetch(url, {
      ...options,
      headers: reqHeaders
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(errBody.message || `Supabase HTTP ${res.status}`);
    }

    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[Supabase REST Error] ${endpoint}:`, err.message);
    throw err;
  }
}

/**
 * Helper to generate URL-safe product slug
 */
export function generateSlug(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 1. Fetch All Products from Supabase (Falls back to Local if table not ready)
 */
export async function fetchCloudProducts() {
  try {
    const data = await supabaseRest(`${CONFIG.TABLES.PRODUCTS}?select=*&order=created_at.desc`);
    if (Array.isArray(data) && data.length > 0) {
      const mapped = data.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug || generateSlug(p.name),
        category: p.category,
        price: Number(p.price) || 0,
        originalPrice: p.original_price ? Number(p.original_price) : null,
        badge: p.badge || '',
        status: p.status || 'Active',
        sub: p.sub || p.description || '',
        image: getProductImageUrl(p.image || p.image_url || 'pet_visor_yellow_flame.png'),
        stock: Number(p.stock) || 0
      }));
      localStorage.setItem('mustaz_catalog_products_v3', JSON.stringify(mapped));
      localStorage.setItem('mustaz_catalog_products', JSON.stringify(mapped));
      localStorage.setItem('mustaz_dynamic_parts_v4', JSON.stringify(mapped));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mustaz_products_updated', { detail: mapped }));
      }
      return mapped;
    }
  } catch (err) {
    console.warn('Falling back to local catalog:', err.message);
  }
  return null;
}

/**
 * 2. Add New Product to Supabase
 */
export async function createCloudProduct(product) {
  try {
    const payload = [{
      id: product.id,
      name: product.name,
      slug: product.slug || generateSlug(product.name),
      category: product.category,
      price: Number(product.price),
      original_price: product.originalPrice ? Number(product.originalPrice) : (product.original_price ? Number(product.original_price) : null),
      badge: product.badge || null,
      status: product.status || 'Active',
      sub: product.sub || product.description || '',
      image: getProductImageUrl(product.image),
      stock: Number(product.stock) || 0
    }];

    const res = await supabaseRest(CONFIG.TABLES.PRODUCTS, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res && res[0] ? res[0] : product;
  } catch (err) {
    console.warn('Could not save to Supabase cloud, saved locally:', err.message);
    return product;
  }
}

/**
 * 3. Update Existing Product in Supabase
 */
export async function updateCloudProduct(id, updates) {
  try {
    const payload = {};
    if (updates.name !== undefined) {
      payload.name = updates.name;
      if (!updates.slug) payload.slug = generateSlug(updates.name);
    }
    if (updates.slug !== undefined) payload.slug = generateSlug(updates.slug);
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.price !== undefined) payload.price = Number(updates.price);
    if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice ? Number(updates.originalPrice) : null;
    if (updates.original_price !== undefined) payload.original_price = updates.original_price ? Number(updates.original_price) : null;
    if (updates.badge !== undefined) payload.badge = updates.badge;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.sub !== undefined) payload.sub = updates.sub;
    if (updates.description !== undefined) payload.sub = updates.description;
    if (updates.image !== undefined) payload.image = getProductImageUrl(updates.image);
    if (updates.stock !== undefined) payload.stock = Number(updates.stock);

    const safeId = encodeURIComponent(id.trim());
    await supabaseRest(`${CONFIG.TABLES.PRODUCTS}?id=eq.${safeId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.warn(`Could not update cloud product ${id}:`, err.message);
    return false;
  }
}

/**
 * 4. Delete Product in Supabase
 */
export async function deleteCloudProduct(id) {
  try {
    const safeId = encodeURIComponent(id.trim());
    await supabaseRest(`${CONFIG.TABLES.PRODUCTS}?id=eq.${safeId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (err) {
    console.warn(`Could not delete cloud product ${id}:`, err.message);
    return false;
  }
}

/**
 * 5. Upload Image Asset to Supabase Storage Bucket ('product-images')
 */
export async function uploadAssetToStorage(file) {
  return uploadAssetWithProgress(file);
}

/**
 * 5a. Upload Image Asset with real-time Progress Event callback
 */
export function uploadAssetWithProgress(file, onProgress) {
  return new Promise(async (resolve, reject) => {
    if (!file) {
      return reject(new Error('No file selected for upload.'));
    }

    const rawExt = file.name.split('.').pop() || 'png';
    const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanName = `pet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const uploadUrl = `${CONFIG.SUPABASE_URL}/storage/v1/object/${CONFIG.STORAGE_BUCKET}/${cleanName}`;

    let authToken = CONFIG.SUPABASE_ANON_KEY;
    try {
      const { getAuthToken } = await import('./authService.js');
      const token = await getAuthToken();
      if (token) authToken = token;
    } catch {}

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);
    xhr.setRequestHeader('apikey', CONFIG.SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    xhr.setRequestHeader('Content-Type', file.type || 'image/png');

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent, event.loaded, event.total);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const publicUrl = `${CONFIG.SUPABASE_URL}/storage/v1/object/public/${CONFIG.STORAGE_BUCKET}/${cleanName}`;
        console.log('⚡ File uploaded to Supabase Storage successfully:', publicUrl);
        resolve(publicUrl);
      } else {
        let errMsg = `Upload failed with HTTP ${xhr.status}`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.message) errMsg = parsed.message;
        } catch {}
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload to Supabase Storage'));
    };

    xhr.send(file);
  });
}

/**
 * 5b. Delete Old Image Asset from Supabase Storage Bucket ('product-images')
 * Prevents storage clutter when a product image is replaced or product is deleted.
 */
export async function deleteAssetFromStorage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return false;

  const bucketMarker = `/${CONFIG.STORAGE_BUCKET}/`;
  if (!imageUrl.includes(bucketMarker)) {
    // Not hosted on this Supabase storage bucket (e.g. local assets/images/ or external CDN)
    return false;
  }

  const filePath = imageUrl.split(bucketMarker)[1]?.split('?')[0];
  if (!filePath) return false;

  // Protect default system seed templates from accidental deletion
  const protectedAssets = [
    'Product1.png',
    'Product2.png',
    'Product3.png',
    'pet_visor_yellow_flame.png',
    'retro_checkered_helmet.png',
    'mustaz_booth_event.png'
  ];
  if (protectedAssets.includes(filePath)) {
    return false;
  }

  try {
    let authToken = CONFIG.SUPABASE_ANON_KEY;
    try {
      const { getAuthToken } = await import('./authService.js');
      const token = await getAuthToken();
      if (token) authToken = token;
    } catch {}

    // Option 1: Supabase client remove
    try {
      const { getSupabase } = await import('./authService.js');
      const sb = await getSupabase();
      if (sb && sb.storage) {
        const { error } = await sb.storage.from(CONFIG.STORAGE_BUCKET).remove([filePath]);
        if (!error) {
          console.log(`🗑️ Removed old asset from Supabase Storage: ${filePath}`);
          return true;
        }
      }
    } catch {}

    // Option 2: Direct REST call
    const deleteUrl = `${CONFIG.SUPABASE_URL}/storage/v1/object/${CONFIG.STORAGE_BUCKET}/${filePath}`;
    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (res.ok) {
      console.log(`🗑️ Deleted asset via REST: ${filePath}`);
      return true;
    }
  } catch (err) {
    console.warn(`Could not delete storage asset ${filePath}:`, err.message);
  }
  return false;
}

/**
 * 5b. Update Order Status in Supabase
 */
export async function updateCloudOrderStatus(orderId, status, extra = {}) {
  try {
    const safeId = encodeURIComponent(orderId.trim());
    const body = { status };
    if (extra.courier && (extra.resiNumber || extra.resi)) {
      body.city = `[${extra.courier}: ${extra.resiNumber || extra.resi}]`;
    } else if (extra.city) {
      body.city = extra.city;
    }
    await supabaseRest(`${CONFIG.TABLES.ORDERS}?id=eq.${safeId}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    return true;
  } catch (err) {
    console.warn(`Could not update cloud order ${orderId}:`, err.message);
    return false;
  }
}

/**
 * 6. Save Customer Dispatch Order to Supabase
 */
export async function createCloudOrder(order) {
  try {
    const orderId = order.id || order.orderId || ('MSTZ-' + Math.floor(1000 + Math.random() * 9000));
    const customer = (order.customer || order.customer_name || order.name || 'RIDER MUSTAZ').trim();
    const rawPhone = order.customer_phone || order.phone || order.customerPhone || '';
    let cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    else if (cleanPhone.startsWith('8')) cleanPhone = '62' + cleanPhone;
    const phone = cleanPhone || rawPhone;
    let city = order.city || order.address || 'INDONESIA';
    if (order.courier && order.resi) {
      city += ` [${order.courier}: ${order.resi}]`;
    }
    const fullCustomerName = (customer.includes('@') || !order.email) ? customer : `${customer} (${order.email})`;

    let itemsStr = '';
    if (typeof order.items === 'string') {
      itemsStr = order.items;
    } else if (Array.isArray(order.items)) {
      itemsStr = order.items.map(i => typeof i === 'string' ? i : `${i.name} (x${i.quantity || i.qty || 1})`).join(', ');
    }

    const payload = [{
      id: orderId,
      customer_name: fullCustomerName,
      items: itemsStr,
      total_amount: Number(order.total || order.total_amount || 0),
      status: order.status || 'PENDING',
      city: city,
      phone: phone,
      customer_phone: phone
    }];

    await supabaseRest(CONFIG.TABLES.ORDERS, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    // Also update local cache in localStorage
    try {
      const saved = localStorage.getItem('mustaz_admin_orders');
      const list = saved ? JSON.parse(saved) : [];
      if (!list.some(l => l.id === orderId)) {
        list.unshift({
          id: orderId,
          customer: fullCustomerName,
          items: itemsStr,
          total: Number(order.total || order.total_amount || 0),
          date: new Date().toISOString().split('T')[0],
          status: order.status || 'PENDING',
          city,
          phone,
          customer_phone: phone,
          receiptImage: order.receiptImage || ''
        });
        localStorage.setItem('mustaz_admin_orders', JSON.stringify(list));
      }
    } catch {}

    return true;
  } catch (err) {
    console.warn('Order saved locally (cloud error):', err.message);
    return false;
  }
}

export const saveCloudOrder = createCloudOrder;

/**
 * 6B. Submit Order Securely via Supabase RPC (Server-Side Price Calculation & Atomic Stock Deduction)
 * Re-computes real price from products table, verifies stock sufficiency,
 * deducts inventory atomically, and saves order with locked PENDING_PAYMENT status.
 */
export async function submitOrderSecure({
  customerName,
  phone,
  email,
  address,
  courier,
  notes = '',
  paymentMethod = 'Transfer Bank (BCA / Mandiri)',
  cartItems = [],
  orderId = null
}) {
  try {
    const payload = {
      p_customer_name: customerName,
      p_customer_phone: phone,
      p_customer_email: email,
      p_shipping_address: address,
      p_shipping_courier: courier,
      p_notes: notes,
      p_payment_method: paymentMethod,
      p_cart_items: cartItems.map(i => ({
        id: i.id || '',
        name: i.name || '',
        quantity: Number(i.quantity || i.qty || 1),
        price: Number(i.price || 0)
      })),
      p_order_id: orderId
    };

    const rpcResult = await supabaseRest('rpc/submit_order_secure', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      orderId: rpcResult?.order_id || orderId,
      totalAmount: rpcResult?.total_amount,
      status: rpcResult?.status || 'PENDING_PAYMENT',
      items: rpcResult?.items
    };
  } catch (err) {
    console.warn('[SupabaseService] submitOrderSecure RPC call:', err.message);
    // If error is about stock insufficiency, throw so checkout stops
    if (err.message && err.message.toLowerCase().includes('stok')) {
      throw err;
    }
    // Resilient fallback to direct createCloudOrder if RPC not yet deployed
    const fallbackSuccess = await createCloudOrder({
      id: orderId,
      customer: customerName,
      email,
      phone,
      city: `${address} (Kurir: ${courier})`,
      items: cartItems.map(i => `${i.name} (x${i.quantity || 1})`).join(', '),
      total: cartItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0),
      status: 'PENDING_PAYMENT'
    });
    return {
      success: fallbackSuccess,
      orderId,
      fallback: true
    };
  }
}

/**
 * 7. Fetch Customer Orders from Supabase
 */
export async function fetchCloudOrders() {
  try {
    const data = await supabaseRest(`${CONFIG.TABLES.ORDERS}?select=*&order=created_at.desc`);
    if (Array.isArray(data)) {
      const mapped = data.map(o => {
        let courier = '';
        let resi = '';
        let cleanCity = o.city || 'INDONESIA';
        const match = cleanCity.match(/\[(.*?):\s*(.*?)\]/);
        if (match) {
          courier = match[1].trim();
          resi = match[2].trim();
          cleanCity = cleanCity.replace(/\[.*?\]/, '').trim();
        }

        const phone = o.customer_phone || o.phone || '';
        const email = o.customer_email || o.email || '';

        return {
          id: o.id,
          customer: o.customer_name || o.customer || 'Pelanggan',
          customer_name: o.customer_name || o.customer || 'Pelanggan',
          customer_email: email,
          email: email,
          items: o.items || '',
          total: Number(o.total_amount || o.total) || 0,
          total_amount: Number(o.total_amount || o.total) || 0,
          date: o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TODAY',
          status: o.status || 'PENDING',
          city: cleanCity,
          phone: phone,
          customer_phone: phone,
          courier,
          resi,
          created_at: o.created_at
        };
      });
      return mapped;
    }
  } catch (err) {
    console.warn('Orders cloud fetch fallback:', err.message);
  }
  return null;
}

/**
 * 8. Save or Update User Account Profile in Supabase ('accounts' table)
 */
export async function saveCloudAccount(profile) {
  try {
    const email = (profile.email || '').trim().toLowerCase();
    if (!email) return false;

    // Security: Prevent unprivileged client from escalating their own role to 'admin'
    let role = profile.role || 'member';
    const isOwner = email === 'raihanputrairawan8@gmail.com' || email === 'admin@mustazcraft.com';
    if (role === 'admin' && !isOwner) {
      const existing = await fetchCloudAccount(email).catch(() => null);
      if (!existing || existing.role !== 'admin') {
        role = 'member'; // Enforce member role
      }
    }

    const id = profile.id || `acc_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const payload = {
      id: id,
      email: email,
      full_name: profile.fullName || email.split('@')[0].toUpperCase(),
      alias: profile.alias || 'Rider 7G',
      phone: profile.phone || '',
      role: role,
      avatar_url: profile.avatarUrl || '',
      updated_at: new Date().toISOString()
    };

    // Try update first
    const updated = await supabaseRest(`${CONFIG.TABLES.ACCOUNTS}?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }).catch(() => null);

    // If not found or empty, insert
    if (!updated || updated.length === 0) {
      await supabaseRest(CONFIG.TABLES.ACCOUNTS, {
        method: 'POST',
        body: JSON.stringify([payload])
      });
    }
    return true;
  } catch (err) {
    console.warn('Account saved locally (cloud pending):', err.message);
    return false;
  }
}

/**
 * 9. Fetch User Account Profile from Supabase ('accounts' table)
 */
export async function fetchCloudAccount(email) {
  try {
    if (!email) return null;
    const data = await supabaseRest(`${CONFIG.TABLES.ACCOUNTS}?email=eq.${encodeURIComponent(email)}&limit=1`);
    if (Array.isArray(data) && data.length > 0) {
      const acc = data[0];
      const mapped = {
        fullName: acc.full_name,
        alias: acc.alias || '',
        email: acc.email,
        phone: acc.phone || '',
        avatarUrl: acc.avatar_url || '',
        role: acc.role || 'member'
      };
      localStorage.setItem('mustaz_user_profile_data', JSON.stringify(mapped));
      return mapped;
    }
  } catch (err) {
    console.warn('Account cloud fetch fallback:', err.message);
  }
  return null;
}

