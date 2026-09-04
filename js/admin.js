/**
 * MUSTAZ CRAFT - Admin Console & Inventory Control Engine
 */

import {
  getDynamicParts,
  addProduct,
  updateProduct,
  deleteProduct,
  resetCatalogToDefault,
  formatRupiah
} from './services/cartService.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ─── 0. ADMIN ACCESS GUARD ────────────────────────────────────────────────
  async function enforceAdminRole() {
    const { initAccountAuth, checkUserRole } = await import('./services/authService.js');
    const isAuthed = await initAccountAuth();
    if (!isAuthed) {
      window.location.replace('login.html');
      return false;
    }

    let userEmail = '';
    let localRole = 'member';
    try {
      const saved = localStorage.getItem('mustaz_user_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        userEmail = parsed.email || '';
        localRole = parsed.role || 'member';
      }
    } catch {}

    const role = await checkUserRole(userEmail);

    if (role !== 'admin' && localRole !== 'admin') {
      alert(`⚠️ AKSES DITOLAK // RESTRICTED ACCESS\n\nAkun (${userEmail || 'Anda'}) saat ini berstatus 'member'.\n\nHalaman Admin ini hanya dapat diakses oleh akun dengan role 'admin' di Supabase.\n\nUntuk membuka akses admin, ubah role di database Supabase:\nUPDATE public.accounts SET role = 'admin' WHERE email = '${userEmail}';`);
      window.location.replace('account.html');
      return false;
    }
    return true;
  }

  await enforceAdminRole();

  // ─── 1. TABS SWITCHING (HARMONIZED WITH ACCOUNT.HTML) ─────────────────────
  const navItems = document.querySelectorAll('#adminNav .account-nav-item[data-tab]');
  const panels = document.querySelectorAll('.account-tab-panel');

  function switchTab(targetTab) {
    navItems.forEach(n => {
      if (n.dataset.tab === targetTab) n.classList.add('active');
      else n.classList.remove('active');
    });
    panels.forEach(panel => {
      if (panel.id === 'panel-' + targetTab) panel.classList.add('active');
      else panel.classList.remove('active');
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(item.dataset.tab);
    });
  });

  document.getElementById('btnSwitchToAdd')?.addEventListener('click', () => {
    switchTab('add');
  });
  document.getElementById('btnSidebarQuickAdd')?.addEventListener('click', () => {
    switchTab('add');
  });

  // ─── 2. RENDER OVERVIEW STATS & INVENTORY TABLE ──────────────────────────
  function refreshAdminView() {
    const parts = getDynamicParts();

    // Calculate Stats
    const totalProducts = parts.length;
    const totalStock = parts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const lowStock = parts.filter(p => (Number(p.stock) || 0) <= 5).length;
    const totalValuation = parts.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0);

    // Update DOM Stats
    const statTotalProducts = document.getElementById('statTotalProducts');
    const statTotalStock = document.getElementById('statTotalStock');
    const statLowStock = document.getElementById('statLowStock');
    const statInventoryValue = document.getElementById('statInventoryValue');
    const navBadgeProducts = document.getElementById('navBadgeProducts');

    if (statTotalProducts) statTotalProducts.textContent = totalProducts;
    if (navBadgeProducts) navBadgeProducts.textContent = totalProducts;
    if (statTotalStock) statTotalStock.textContent = totalStock;
    if (statLowStock) statLowStock.textContent = lowStock;
    if (statInventoryValue) statInventoryValue.textContent = formatRupiah(totalValuation);

    // Apply Filters for Table
    const query = (document.getElementById('adminSearchInput')?.value || '').toLowerCase().trim();
    const category = document.getElementById('adminCategoryFilter')?.value || 'ALL';

    let filtered = parts;
    if (category !== 'ALL') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.sub.toLowerCase().includes(query)
      );
    }

    renderTableRows(filtered);
  }

  function renderTableRows(items) {
    const tbody = document.getElementById('adminProductsTbody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:48px 16px;color:#888;font-family:var(--font-mono-sub);">NO PET VISOR HARDWARE FOUND MATCHING CRITERIA</td></tr>';
      return;
    }

    tbody.innerHTML = items.map((part) => {
      const stock = Number(part.stock) || 0;
      let stockBadgeClass = 'stock-badge-good';
      let stockLabel = 'IN STOCK';
      if (stock === 0) {
        stockBadgeClass = 'stock-badge-zero';
        stockLabel = 'OUT OF STOCK';
      } else if (stock <= 5) {
        stockBadgeClass = 'stock-badge-low';
        stockLabel = 'LOW STOCK';
      }

      const badgeHtml = part.badge
        ? `<span class="zine-tag-pink" style="font-size:0.65rem;padding:2px 8px;">${part.badge}</span>`
        : '<span style="color:#555;">-</span>';

      return `
        <tr>
          <td>
            <img src="${part.image}" alt="${part.name}" style="width:52px;aspect-ratio:4/5;object-fit:cover;border:1px solid #333;background:#000;">
          </td>
          <td>
            <div style="font-family:var(--font-headline);font-size:1.1rem;color:#FFF;letter-spacing:0.02em;">${part.name}</div>
            <div style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;margin-top:2px;">SKU: ${part.id.toUpperCase()}</div>
            <div style="font-size:0.78rem;color:#AAA;max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">${part.sub}</div>
          </td>
          <td>
            <span style="background:#181818;border:1px solid #333;color:var(--accent-yellow);font-family:var(--font-mono-sub);font-size:0.72rem;font-weight:700;padding:4px 8px;">
              ${part.category}
            </span>
          </td>
          <td style="font-family:var(--font-headline);font-size:1.15rem;color:var(--accent-yellow);font-weight:900;">
            ${formatRupiah(part.price)}
          </td>
          <td style="text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:6px;margin-bottom:4px;">
              <button class="qty-control-btn btn-stock-dec" data-id="${part.id}">-</button>
              <span style="font-family:var(--font-headline);font-size:1.1rem;min-width:32px;text-align:center;color:#FFF;">${stock}</span>
              <button class="qty-control-btn btn-stock-inc" data-id="${part.id}">+</button>
            </div>
            <div>
              <span class="${stockBadgeClass}">${stockLabel}</span>
            </div>
          </td>
          <td>
            ${badgeHtml}
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <button class="btn-admin-edit btn-brutal-ghost btn-brutal-sm" data-id="${part.id}" style="padding:6px 14px;font-size:0.75rem;margin-right:6px;">
              EDIT
            </button>
            <button class="btn-admin-del btn-brutal-dark btn-brutal-sm" data-id="${part.id}" style="padding:6px 14px;font-size:0.75rem;background:#35000a;border-color:#e11d48;color:#fecdd3;">
              DELETE
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Wire stock controls
    tbody.querySelectorAll('.btn-stock-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const part = items.find(p => p.id === id);
        if (part) {
          updateProduct(id, { stock: (Number(part.stock) || 0) + 1 });
          refreshAdminView();
        }
      });
    });

    tbody.querySelectorAll('.btn-stock-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const part = items.find(p => p.id === id);
        if (part) {
          const current = Number(part.stock) || 0;
          if (current > 0) {
            updateProduct(id, { stock: current - 1 });
            refreshAdminView();
          }
        }
      });
    });

    // Wire edit buttons
    tbody.querySelectorAll('.btn-admin-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        openEditModal(btn.dataset.id);
      });
    });

    // Wire delete buttons
    tbody.querySelectorAll('.btn-admin-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const part = items.find(p => p.id === id);
        if (!part) return;
        if (confirm(`DELETE PRODUCT: "${part.name}"?\nThis action cannot be undone.`)) {
          deleteProduct(id);
          refreshAdminView();
        }
      });
    });
  }

  // ─── 3. SEARCH & FILTER LISTENERS ────────────────────────────────────────
  document.getElementById('adminSearchInput')?.addEventListener('input', refreshAdminView);
  document.getElementById('adminCategoryFilter')?.addEventListener('change', refreshAdminView);

  // ─── 4. ADD PRODUCT LOGIC & LIVE PREVIEW ─────────────────────────────────
  let selectedAssetPath = 'assets/images/pet_visor_yellow_flame.png';

  document.querySelectorAll('#assetPickerGrid .admin-asset-choice').forEach(choice => {
    choice.addEventListener('click', () => {
      document.querySelectorAll('#assetPickerGrid .admin-asset-choice').forEach(c => c.classList.remove('selected'));
      choice.classList.add('selected');
      selectedAssetPath = choice.dataset.asset;
      const customInput = document.getElementById('newProdCustomUrl');
      if (customInput) customInput.value = '';
      updatePreview();
    });
  });

  document.getElementById('newProdCustomUrl')?.addEventListener('input', (e) => {
    if (e.target.value.trim()) {
      document.querySelectorAll('#assetPickerGrid .admin-asset-choice').forEach(c => c.classList.remove('selected'));
      selectedAssetPath = e.target.value.trim();
    } else {
      const first = document.querySelector('#assetPickerGrid .admin-asset-choice');
      first?.classList.add('selected');
      selectedAssetPath = first?.dataset.asset || 'assets/images/pet_visor_yellow_flame.png';
    }
    updatePreview();
  });

  // Direct Supabase Storage File Uploader
  const fileInput = document.getElementById('newProdFileInput');
  const uploadStatus = document.getElementById('uploadStatusText');

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (uploadStatus) {
      uploadStatus.textContent = '⏳ Mengunggah ke Supabase Storage (product-images)...';
      uploadStatus.style.color = 'var(--accent-yellow)';
    }

    try {
      const { uploadAssetToStorage } = await import('./services/supabaseService.js');
      const publicUrl = await uploadAssetToStorage(file);
      selectedAssetPath = publicUrl;

      document.querySelectorAll('#assetPickerGrid .admin-asset-choice').forEach(c => c.classList.remove('selected'));
      const customInput = document.getElementById('newProdCustomUrl');
      if (customInput) customInput.value = publicUrl;

      updatePreview();

      if (uploadStatus) {
        uploadStatus.textContent = '✅ Berhasil diunggah ke Supabase CDN: ' + publicUrl.split('/').pop();
        uploadStatus.style.color = '#4ade80';
      }
    } catch (err) {
      if (uploadStatus) {
        uploadStatus.textContent = '⚠️ Upload cloud tertunda (jalankan SQL setup bucket): ' + err.message;
        uploadStatus.style.color = '#FF4444';
      }
      selectedAssetPath = URL.createObjectURL(file);
      updatePreview();
    }
  });

  function updatePreview() {
    const name = document.getElementById('newProdName')?.value.trim() || 'UNTITLED PET VISOR';
    const cat = document.getElementById('newProdCategory')?.value || 'ACRYLIC PET';
    const sub = document.getElementById('newProdSub')?.value.trim() || 'Custom Hand-Crafted Helmet Accessory';
    const priceVal = Number(document.getElementById('newProdPrice')?.value) || 350000;
    const stockVal = Number(document.getElementById('newProdStock')?.value) || 10;
    const badgeVal = document.getElementById('newProdBadge')?.value;

    const prevName = document.getElementById('prevName');
    const prevCategory = document.getElementById('prevCategory');
    const prevSub = document.getElementById('prevSub');
    const prevPrice = document.getElementById('prevPrice');
    const prevStock = document.getElementById('prevStock');
    const prevImage = document.getElementById('prevImage');

    if (prevName) prevName.textContent = name;
    if (prevCategory) prevCategory.textContent = cat.toUpperCase();
    if (prevSub) prevSub.textContent = sub;
    if (prevPrice) prevPrice.textContent = formatRupiah(priceVal);
    if (prevStock) prevStock.textContent = 'STOCK: ' + stockVal;
    if (prevImage) prevImage.src = selectedAssetPath;

    const badgeEl = document.getElementById('prevBadge');
    if (badgeEl) {
      if (badgeVal) {
        badgeEl.style.display = 'block';
        badgeEl.textContent = badgeVal;
      } else {
        badgeEl.style.display = 'none';
      }
    }
  }

  ['newProdName', 'newProdCategory', 'newProdSub', 'newProdPrice', 'newProdStock', 'newProdBadge'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updatePreview);
    document.getElementById(id)?.addEventListener('change', updatePreview);
  });

  // Handle Add Form Submit
  document.getElementById('addProductForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('newProdName').value.trim();
    const category = document.getElementById('newProdCategory').value;
    const sub = document.getElementById('newProdSub').value.trim();
    const price = Number(document.getElementById('newProdPrice').value);
    const originalPrice = document.getElementById('newProdOriginalPrice').value ? Number(document.getElementById('newProdOriginalPrice').value) : null;
    const stock = Number(document.getElementById('newProdStock').value);
    const badge = document.getElementById('newProdBadge').value;

    const newProd = addProduct({
      name,
      category,
      sub,
      price,
      original_price: originalPrice,
      stock,
      badge,
      image: selectedAssetPath
    });

    alert(`SUCCESSFULLY ADDED!\n"${newProd.name}" is now live in the store catalog.`);
    document.getElementById('addProductForm').reset();
    updatePreview();

    // Switch to inventory tab & refresh
    document.querySelector('[data-tab="tab-inventory"]')?.click();
    refreshAdminView();
  });

  // ─── 5. EDIT PRODUCT MODAL LOGIC ─────────────────────────────────────────
  const editModal = document.getElementById('editProductModal');
  function openEditModal(id) {
    const parts = getDynamicParts();
    const part = parts.find(p => p.id === id);
    if (!part || !editModal) return;

    document.getElementById('editModalSku').textContent = part.id.toUpperCase();
    document.getElementById('editProdId').value = part.id;
    document.getElementById('editProdName').value = part.name;
    document.getElementById('editProdCategory').value = part.category;
    document.getElementById('editProdBadge').value = part.badge || '';
    document.getElementById('editProdSub').value = part.sub;
    document.getElementById('editProdPrice').value = part.price;
    document.getElementById('editProdStock').value = part.stock;
    document.getElementById('editProdImage').value = part.image;

    editModal.classList.add('open');
  }

  function closeEditModal() {
    if (editModal) editModal.classList.remove('open');
  }

  document.getElementById('editModalCloseBtn')?.addEventListener('click', closeEditModal);
  document.getElementById('btnCancelEdit')?.addEventListener('click', closeEditModal);

  document.getElementById('editProductForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editProdId').value;
    const updated = {
      name: document.getElementById('editProdName').value.trim(),
      category: document.getElementById('editProdCategory').value,
      badge: document.getElementById('editProdBadge').value,
      sub: document.getElementById('editProdSub').value.trim(),
      price: Number(document.getElementById('editProdPrice').value),
      stock: Number(document.getElementById('editProdStock').value),
      image: document.getElementById('editProdImage').value.trim()
    };

    updateProduct(id, updated);
    closeEditModal();
    refreshAdminView();
  });

  // ─── 6. CUSTOMER ORDERS TAB ──────────────────────────────────────────────
  const DEFAULT_ADMIN_ORDERS = [
    { id: 'MSTZ-9942', customer: 'Raihan // Depok', items: 'Y-Two Roof Visor (Acid Lime) x1', total: 350000, date: '2026-09-02', status: 'IN TRANSIT' },
    { id: 'MSTZ-8812', customer: 'Bima // Jakarta Selatan', items: 'Studded Lid Flame Visor x1, Ear Guards x1', total: 575000, date: '2026-08-28', status: 'DELIVERED' },
    { id: 'MSTZ-7731', customer: 'Deri // Bandung Barat', items: 'Mustaz Official Bundle Set x1', total: 450000, date: '2026-08-24', status: 'PROCESSING' }
  ];

  function getAdminOrders() {
    try {
      const saved = localStorage.getItem('mustaz_admin_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ADMIN_ORDERS;
  }

  function renderOrders() {
    const orders = getAdminOrders();
    const tbody = document.getElementById('adminOrdersTbody');
    if (!tbody) return;

    tbody.innerHTML = orders.map((ord, idx) => `
      <tr>
        <td>
          <span style="font-family:var(--font-headline);font-size:1.1rem;color:var(--accent-yellow);letter-spacing:0.04em;">#${ord.id}</span>
        </td>
        <td>
          <div style="font-weight:700;color:#FFF;">${ord.customer}</div>
        </td>
        <td style="font-size:0.85rem;color:#AAA;">
          ${ord.items}
        </td>
        <td style="font-family:var(--font-headline);font-size:1.15rem;color:var(--accent-yellow);font-weight:900;">
          ${formatRupiah(ord.total)}
        </td>
        <td style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;">
          ${ord.date}
        </td>
        <td>
          <select class="form-input-brutal order-status-select" data-index="${idx}" style="padding:6px 10px;font-size:0.75rem;background:#111;color:#FFF;border-color:#444;width:auto;">
            <option value="PROCESSING" ${ord.status === 'PROCESSING' ? 'selected' : ''}>PROCESSING</option>
            <option value="IN TRANSIT" ${ord.status === 'IN TRANSIT' ? 'selected' : ''}>IN TRANSIT</option>
            <option value="DELIVERED" ${ord.status === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
            <option value="CANCELLED" ${ord.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
          </select>
        </td>
        <td style="text-align:right;">
          <a href="https://wa.me/6281234567890?text=Halo%20kami%20dari%20Mustaz%20Craft%20terkait%20pesanan%20${ord.id}" target="_blank" class="btn-brutal-dark btn-brutal-sm" style="color:#4ade80;border-color:#22c55e;">
            WHATSAPP
          </a>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.order-status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.index);
        orders[idx].status = e.target.value;
        localStorage.setItem('mustaz_admin_orders', JSON.stringify(orders));
      });
    });
  }

  document.getElementById('btnRefreshOrders')?.addEventListener('click', renderOrders);

  // ─── 7. SYSTEM SETTINGS ──────────────────────────────────────────────────
  document.getElementById('btnExportJson')?.addEventListener('click', () => {
    const data = getDynamicParts();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mustaz_products_catalog_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('btnResetCatalog')?.addEventListener('click', () => {
    if (confirm("WARNING: Are you sure you want to reset the store inventory back to factory default?\nAny newly added custom products will be removed.")) {
      resetCatalogToDefault();
      refreshAdminView();
      alert("CATALOG RESTORED TO FACTORY DEFAULT.");
    }
  });

  // INITIAL RUN
  refreshAdminView();
  renderOrders();
  updatePreview();
});
