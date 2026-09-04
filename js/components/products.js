/**
 * MUSTAZ Garage Zine - Catalog & Product Detail Engine
 */

import { CHOPPERS_DATA, PARTS_DATA, getDynamicParts, addToCart, formatRupiah, getCartCount } from '../services/cartService.js';
import { openCart } from './cart.js';
import { showToast } from './toast.js';

// ─── PRODUCT DETAIL MODAL COMPONENT ────────────────────────────────────────

function ensureProductModal() {
  if (document.getElementById('productDetailModal')) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'productDetailModal';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:860px;background:#0d0d0d;border:3px solid #FFFFFF;box-shadow:12px 12px 0px #FF008C;">
      <div class="modal-header" style="background:#000;border-bottom:3px solid #FF008C;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="zine-tag-pink" id="modalSku">SKU_001</span>
          <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;letter-spacing:0.12em;" id="modalCategory">PARTS ARCHIVE</span>
        </div>
        <button class="modal-close" id="modalCloseBtn" aria-label="Close modal">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="modal-body" id="modalContent" style="padding:32px;"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close handlers
  modal.addEventListener('click', (e) => {
    if (e.target.id === 'productDetailModal') closeProductModal();
  });
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeProductModal);
}

export function openProductDetail(product) {
  ensureProductModal();
  const modal = document.getElementById('productDetailModal');
  const content = document.getElementById('modalContent');
  const skuEl = document.getElementById('modalSku');
  const catEl = document.getElementById('modalCategory');

  if (skuEl) skuEl.textContent = product.id.toUpperCase();
  if (catEl) catEl.textContent = (product.category || 'HARDWARE').toUpperCase();

  const isChopper = product.type === 'choppers';

  content.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:32px;align-items:start;">
      <!-- LEFT: LARGE PRODUCT IMAGE -->
      <div style="position:relative;">
        <div class="tape-decor tape-top-left"></div>
        <div style="background:#050505;border:3px solid #FFF;box-shadow:6px 6px 0px #000;overflow:hidden;position:relative;width:100%;aspect-ratio:4/5;max-height:480px;display:flex;align-items:center;justify-content:center;">
          <img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:contain;background:#050505;filter:contrast(110%);">
          <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top, rgba(0,0,0,0.9), transparent);padding:16px;">
            <span class="zine-tag-pink">${product.badge || (isChopper ? product.status : 'IN STOCK')}</span>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
          <span class="barcode-decor" style="height:24px;width:100px;"></span>
          <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#777;">ARCHIVE SPEC // REF-04</span>
        </div>
      </div>

      <!-- RIGHT: SPECIFICATIONS & ADD TO CART -->
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <span style="font-family:var(--font-mono-sub);font-size:0.75rem;letter-spacing:0.2em;color:#FF008C;text-transform:uppercase;font-weight:700;">
            ${product.category || 'TECHNICAL HARDWARE'}
          </span>
          <h2 style="font-family:var(--font-headline);font-size:clamp(2rem, 3.5vw, 2.8rem);color:#FFF;line-height:0.92;margin:6px 0 8px;">
            ${product.name}
          </h2>
          <p style="font-family:var(--font-mono-sub);font-size:0.85rem;color:#888;text-transform:uppercase;">
            ${product.sub || 'Engineered without compromise.'}
          </p>
        </div>

        <div style="display:flex;align-items:baseline;gap:12px;padding:12px 0;border-top:1px dashed #333;border-bottom:1px dashed #333;">
          <span style="font-family:var(--font-headline);font-size:2.2rem;color:#FF008C;font-weight:900;">
            ${formatRupiah(product.price)}
          </span>
          ${product.original_price ? `<span style="text-decoration:line-through;color:#666;font-size:1rem;font-family:var(--font-mono-sub);">${formatRupiah(product.original_price)}</span>` : ''}
        </div>

        <!-- SPECIFICATIONS TABLE -->
        <div style="background:#141414;border:1px solid #282828;padding:16px;">
          <div style="font-family:var(--font-mono-sub);font-size:0.7rem;letter-spacing:0.18em;color:#FF008C;text-transform:uppercase;font-weight:800;margin-bottom:10px;">
            TECHNICAL SPECIFICATIONS
          </div>
          ${isChopper && product.specs ? Object.entries(product.specs).map(([k, v]) => `
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:6px 0;border-bottom:1px solid #1e1e1e;">
              <span style="color:#888;font-family:var(--font-mono-sub);text-transform:uppercase;">${k}</span>
              <span style="color:#FFF;font-weight:700;">${v}</span>
            </div>
          `).join('') : `
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:6px 0;border-bottom:1px solid #1e1e1e;">
              <span style="color:#888;font-family:var(--font-mono-sub);">MATERIAL</span>
              <span style="color:#FFF;font-weight:700;">Hand-Formed Raw Steel / Billet Alloy</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:6px 0;border-bottom:1px solid #1e1e1e;">
              <span style="color:#888;font-family:var(--font-mono-sub);">FITMENT</span>
              <span style="color:#FFF;font-weight:700;">Universal / Chopper & Bobber Platforms</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:6px 0;border-bottom:1px solid #1e1e1e;">
              <span style="color:#888;font-family:var(--font-mono-sub);">FINISH</span>
              <span style="color:#FFF;font-weight:700;">Industrial Graded / Unpolished</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:6px 0;">
              <span style="color:#888;font-family:var(--font-mono-sub);">STOCK STATUS</span>
              <span style="color:${(product.stock || 10) <= 5 ? '#FF008C' : '#4ADE80'};font-weight:700;">
                ${(product.stock || 10) <= 5 ? `CRITICAL - ${(product.stock || 5)} REMAINING` : `VERIFIED AVAILABLE (${product.stock || 10})`}
              </span>
            </div>
          `}
        </div>

        <p style="font-size:0.85rem;color:#888;line-height:1.5;">
          Each item is hand inspected in our industrial garage before packaging. Built for durability in extreme street and dirt environments.
        </p>

        <!-- CTA BUTTONS -->
        <div style="display:flex;gap:12px;margin-top:8px;">
          <button id="modalAddToCartBtn" class="btn-brutal-pink" style="flex:1;padding:16px;font-size:1.15rem;">
            ADD TO GARAGE →
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modalAddToCartBtn')?.addEventListener('click', () => {
    addToCart(product);
    showToast({
      title: product.name,
      message: `EQUIPPED! ${getCartCount()} item(s) in garage.`,
      image: product.image,
      actionText: 'VIEW ARSENAL',
      onAction: openCart
    });
    closeProductModal();
  });

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeProductModal() {
  const modal = document.getElementById('productDetailModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ─── PARTS SHOP CATALOG ───────────────────────────────────────────────────

function renderParts(data) {
  const grid = document.getElementById('partsGrid');
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px;background:#101010;border:2px dashed #333;">
        <div style="font-size:3rem;margin-bottom:16px;color:#FF008C;">⚡</div>
        <p style="font-family:var(--font-headline);font-size:1.8rem;color:#FFF;text-transform:uppercase;margin:0 0 8px;">NO HARDWARE MATCHED</p>
        <p style="font-size:0.9rem;color:#888;">Try selecting ALL SCRAP or adjusting your search keyword.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = data.map((part, index) => {
    const num = String(index + 1).padStart(2, '0');
    // Rotate every 3rd card slightly for brutalist zine variety
    const tiltStyle = index % 3 === 1 ? 'transform: rotate(1deg);' : index % 3 === 2 ? 'transform: rotate(-1deg);' : '';
    
    return `
      <article class="part-card group" data-category="${part.category}" style="${tiltStyle}transition:all 0.2s ease;">
        <div style="background:#FFFFFF;color:#000;border:3px solid #000;box-shadow:6px 6px 0px #000;padding:16px;position:relative;display:flex;flex-direction:column;height:100%;">
          
          <!-- Top Row: Number + Category Tag + Tape -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-family:var(--font-headline);font-weight:900;font-size:1.4rem;color:#000;line-height:1;">
              ${num}
            </span>
            <span style="background:#000;color:#FFF;font-family:var(--font-mono-sub);font-weight:800;font-size:0.68rem;padding:3px 8px;text-transform:uppercase;letter-spacing:0.12em;">
              ${part.category}
            </span>
          </div>

          <!-- Product Image with raw border (4:5 proportional ratio) -->
          <div style="position:relative;width:100%;aspect-ratio:4/5;background:#080808;border:2px solid #000;overflow:hidden;margin-bottom:14px;cursor:pointer;" class="quick-view-trigger" data-id="${part.id}">
            ${part.badge ? `<div class="zine-tag-pink" style="position:absolute;top:8px;left:8px;z-index:10;">${part.badge}</div>` : ''}
            <img src="${part.image}" alt="${part.name}"
              style="width:100%;height:100%;object-fit:cover;object-position:center;filter:contrast(110%);transition:all 0.3s ease;"
              onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop'"
              onmouseover="this.style.filter='contrast(125%)';this.style.transform='scale(1.04)';"
              onmouseout="this.style.filter='contrast(110%)';this.style.transform='scale(1)';">
          </div>

          <!-- Product Info -->
          <div style="flex-grow:1;display:flex;flex-direction:column;">
            <h3 style="font-family:var(--font-headline);font-size:1.35rem;color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:6px;cursor:pointer;" class="quick-view-trigger" data-id="${part.id}">
              ${part.name}
            </h3>
            <p style="font-family:var(--font-mono-sub);font-size:0.78rem;color:#555;text-transform:uppercase;margin-bottom:14px;">
              ${part.sub}
            </p>

            <!-- Price & Stock -->
            <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px dashed #000;padding-top:10px;margin-top:auto;margin-bottom:14px;">
              <span style="font-family:var(--font-headline);font-size:1.35rem;font-weight:900;color:#FF008C;">
                ${formatRupiah(part.price)}
              </span>
              <span style="font-family:var(--font-mono-sub);font-size:0.7rem;font-weight:700;color:${part.stock <= 5 ? '#FF008C' : '#333'};">
                ${part.stock <= 5 ? `⚠️ ${part.stock} REMAINING` : `IN STOCK (${part.stock})`}
              </span>
            </div>

            <!-- Action Buttons: Add to Cart + Quick View -->
            <div style="display:flex;gap:8px;">
              <button class="add-to-cart-btn btn-brutal-pink" data-id="${part.id}" style="flex:1;padding:10px;font-size:0.95rem;justify-content:center;">
                + ADD
              </button>
              <button class="quick-view-btn" data-id="${part.id}" style="background:#000;color:#FFF;border:2px solid #000;padding:10px 14px;font-family:var(--font-headline);font-size:0.95rem;cursor:pointer;" title="View Specs">
                VIEW →
              </button>
            </div>
          </div>

        </div>
      </article>
    `;
  }).join('');

  // Wire add-to-cart
  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const part = getDynamicParts().find(p => p.id === btn.dataset.id);
      if (!part) return;
      addToCart(part);
      showToast({
        title: part.name,
        message: `EQUIPPED! ${getCartCount()} item(s) in garage.`,
        image: part.image,
        actionText: 'VIEW ARSENAL',
        onAction: openCart
      });
    });
  });

  // Wire quick-view triggers
  grid.querySelectorAll('.quick-view-btn, .quick-view-trigger').forEach(el => {
    el.addEventListener('click', () => {
      const part = getDynamicParts().find(p => p.id === el.dataset.id);
      if (part) openProductDetail(part);
    });
  });
}

export function initPartsPage() {
  const container = document.getElementById('partsGrid');
  if (!container) return;

  let activeCategory = 'ALL';
  let searchQuery = '';

  function applyFilters() {
    let result = getDynamicParts();
    if (activeCategory !== 'ALL') {
      result = result.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.sub.toLowerCase().includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery)
      );
    }
    renderParts(result);
  }

  // Filter tab buttons
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      applyFilters();
    });
  });

  // Search input
  const searchInput = document.querySelector('[data-search]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  // Check URL param search if present (e.g. ?search=exhaust)
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  if (searchParam && searchInput) {
    searchInput.value = searchParam;
    searchQuery = searchParam.toLowerCase().trim();
  }

  applyFilters();

  window.addEventListener('mustaz_products_updated', () => {
    applyFilters();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'mustaz_catalog_products') {
      applyFilters();
    }
  });
}

// ─── CHOPPERS BUILDS CATALOG ───────────────────────────────────────────────

function renderChoppers(data) {
  const grid = document.getElementById('choppersGrid');
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px;background:#101010;border:2px dashed #333;">
        <div style="font-size:3rem;margin-bottom:16px;color:#FF008C;">🏍️</div>
        <p style="font-family:var(--font-headline);font-size:1.8rem;color:#FFF;text-transform:uppercase;">NO MACHINES FOUND</p>
        <p style="font-size:0.9rem;color:#888;">Try selecting ALL MACHINES or clearing the search query.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = data.map((chop, index) => {
    const isSold = chop.status === 'Sold';
    const statusBg = isSold ? 'background:#333;color:#999;' : chop.status === 'In Shop' ? 'background:#FF008C;color:#000;' : 'background:#FFF;color:#000;';
    const tiltStyle = index % 2 === 1 ? 'transform: translateY(12px);' : '';

    return `
      <article class="chopper-card" data-category="${chop.category}" style="${tiltStyle}">
        <div class="card-brutal-white" style="display:flex;flex-direction:column;height:100%;padding:20px;">
          
          <!-- Top Tag & Stamp -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-family:var(--font-mono-sub);font-size:0.75rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#555;">
              BUILD #${chop.id.toUpperCase()}
            </span>
            <span style="font-family:var(--font-mono-sub);font-weight:900;font-size:0.72rem;padding:3px 10px;border:1px solid #000;letter-spacing:0.1em;text-transform:uppercase;${statusBg}">
              ${chop.status}
            </span>
          </div>

          <!-- Chopper Image (4:5 proportional ratio) -->
          <div style="position:relative;width:100%;aspect-ratio:4/5;background:#080808;border:2px solid #000;overflow:hidden;margin-bottom:16px;cursor:pointer;" class="chopper-view-trigger" data-id="${chop.id}">
            <img src="${chop.image}" alt="${chop.name}"
              style="width:100%;height:100%;object-fit:cover;object-position:center;filter:contrast(110%);transition:all 0.3s ease;"
              onerror="this.src='${chop.fallback}'"
              onmouseover="this.style.filter='contrast(125%)';this.style.transform='scale(1.04)';"
              onmouseout="this.style.filter='contrast(110%)';this.style.transform='scale(1)';">
          </div>

          <!-- Chopper Title & Sub -->
          <h2 style="font-family:var(--font-headline);font-size:1.8rem;color:#000;text-transform:uppercase;line-height:0.9;margin-bottom:4px;cursor:pointer;" class="chopper-view-trigger" data-id="${chop.id}">
            ${chop.name}
          </h2>
          <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#555;text-transform:uppercase;margin-bottom:14px;">
            ${chop.sub}
          </p>

          <!-- Specifications Mini Grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:18px;">
            ${Object.entries(chop.specs).slice(0, 4).map(([k, v]) => `
              <div style="background:#000;color:#FFF;padding:6px 10px;border:1px solid #222;">
                <span style="display:block;font-family:var(--font-mono-sub);font-size:0.62rem;color:#FF008C;letter-spacing:0.1em;text-transform:uppercase;">${k}</span>
                <span style="font-family:var(--font-headline);font-size:0.88rem;color:#FFF;letter-spacing:0.04em;text-transform:uppercase;">${v}</span>
              </div>
            `).join('')}
          </div>

          <!-- Price & Inquire Action -->
          <div style="display:flex;align-items:center;justify-content:space-between;border-top:2px dashed #000;padding-top:14px;margin-top:auto;">
            <div>
              <span style="display:block;font-family:var(--font-mono-sub);font-size:0.65rem;color:#777;letter-spacing:0.1em;">PRICE PROTOCOL</span>
              <span style="font-family:var(--font-headline);font-size:1.4rem;font-weight:900;color:#FF008C;">
                ${formatRupiah(chop.price)}
              </span>
            </div>
            ${!isSold ? `
              <button class="inquire-btn btn-brutal-pink btn-brutal-sm" data-id="${chop.id}">
                ORDER INQUIRY →
              </button>
            ` : `
              <span class="stamp-punk stamp-sold" style="font-size:1rem;padding:2px 8px;">ARCHIVED</span>
            `}
          </div>

        </div>
      </article>
    `;
  }).join('');

  // Wire inquiries
  grid.querySelectorAll('.inquire-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chop = CHOPPERS_DATA.find(c => c.id === btn.dataset.id);
      if (!chop) return;
      addToCart({ id: chop.id, name: chop.name, price: chop.price, image: chop.image, type: 'choppers' });
      showToast({
        title: chop.name,
        message: `INQUIRY ADDED! Finalize via WhatsApp.`,
        image: chop.image,
        actionText: 'VIEW ARSENAL',
        onAction: openCart
      });
    });
  });

  // Wire quick detail
  grid.querySelectorAll('.chopper-view-trigger').forEach(el => {
    el.addEventListener('click', () => {
      const chop = CHOPPERS_DATA.find(c => c.id === el.dataset.id);
      if (chop) openProductDetail(chop);
    });
  });
}

export function initChoppersPage() {
  const container = document.getElementById('choppersGrid');
  if (!container) return;

  let activeCategory = 'ALL';
  let searchQuery = '';

  function applyFilters() {
    let result = CHOPPERS_DATA;
    if (activeCategory !== 'ALL') {
      result = result.filter(c => c.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchQuery) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchQuery) ||
        c.sub.toLowerCase().includes(searchQuery) ||
        c.category.toLowerCase().includes(searchQuery)
      );
    }
    renderChoppers(result);
  }

  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      applyFilters();
    });
  });

  const searchInput = document.querySelector('[data-search]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  applyFilters();
}
