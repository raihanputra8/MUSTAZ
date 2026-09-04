/**
 * MUSTAZ CRAFT - Supabase Cloud Database & Storage Service Layer
 */

import { CONFIG } from '../config.js';

const headers = {
  'apikey': CONFIG.SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

/**
 * Universal Supabase REST Helper
 */
async function supabaseRest(endpoint, options = {}) {
  const url = `${CONFIG.SUPABASE_URL}/rest/v1/${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
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
 * 1. Fetch All Products from Supabase (Falls back to Local if table not ready)
 */
export async function fetchCloudProducts() {
  try {
    const data = await supabaseRest(`${CONFIG.TABLES.PRODUCTS}?select=*&order=created_at.desc`);
    if (Array.isArray(data) && data.length > 0) {
      const mapped = data.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price) || 0,
        originalPrice: p.original_price ? Number(p.original_price) : null,
        badge: p.badge || '',
        sub: p.sub || p.description || '',
        image: p.image || p.image_url || 'assets/images/pet_visor_yellow_flame.png',
        stock: Number(p.stock) || 0
      }));
      localStorage.setItem('mustaz_catalog_products', JSON.stringify(mapped));
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
      category: product.category,
      price: Number(product.price),
      original_price: product.originalPrice ? Number(product.originalPrice) : null,
      badge: product.badge || null,
      sub: product.sub,
      image: product.image,
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
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.price !== undefined) payload.price = Number(updates.price);
    if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice ? Number(updates.originalPrice) : null;
    if (updates.badge !== undefined) payload.badge = updates.badge;
    if (updates.sub !== undefined) payload.sub = updates.sub;
    if (updates.image !== undefined) payload.image = updates.image;
    if (updates.stock !== undefined) payload.stock = Number(updates.stock);

    await supabaseRest(`${CONFIG.TABLES.PRODUCTS}?id=eq.${id}`, {
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
    await supabaseRest(`${CONFIG.TABLES.PRODUCTS}?id=eq.${id}`, {
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
  const ext = file.name.split('.').pop() || 'png';
  const cleanName = `pet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const uploadUrl = `${CONFIG.SUPABASE_URL}/storage/v1/object/${CONFIG.STORAGE_BUCKET}/${cleanName}`;

  try {
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': file.type || 'image/png'
      },
      body: file
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Upload failed with HTTP ${res.status}`);
    }

    const publicUrl = `${CONFIG.SUPABASE_URL}/storage/v1/object/public/${CONFIG.STORAGE_BUCKET}/${cleanName}`;
    return publicUrl;
  } catch (err) {
    console.error('Supabase Storage upload error:', err);
    throw err;
  }
}

/**
 * 6. Save Customer Dispatch Order to Supabase
 */
export async function createCloudOrder(order) {
  try {
    const payload = [{
      id: order.id,
      customer_name: order.customer,
      items: order.items,
      total_amount: Number(order.total),
      status: order.status || 'PROCESSING',
      city: order.city || 'JAKARTA',
      phone: order.phone || ''
    }];

    await supabaseRest(CONFIG.TABLES.ORDERS, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.warn('Order saved locally (cloud error):', err.message);
    return false;
  }
}

/**
 * 7. Fetch Customer Orders from Supabase
 */
export async function fetchCloudOrders() {
  try {
    const data = await supabaseRest(`${CONFIG.TABLES.ORDERS}?select=*&order=created_at.desc`);
    if (Array.isArray(data) && data.length > 0) {
      const mapped = data.map(o => ({
        id: o.id,
        customer: o.customer_name || o.customer,
        items: o.items,
        total: Number(o.total_amount || o.total) || 0,
        date: o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TODAY',
        status: o.status || 'PROCESSING'
      }));
      localStorage.setItem('mustaz_admin_orders', JSON.stringify(mapped));
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
    const email = profile.email || 'raihan@mustazcraft.com';
    const id = profile.id || `acc_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const payload = {
      id: id,
      email: email,
      full_name: profile.fullName || 'Raihan Pratama',
      alias: profile.alias || '',
      phone: profile.phone || '',
      role: profile.role || 'member',
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

