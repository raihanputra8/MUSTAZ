/**
 * MUSTAZ CRAFT - Admin Console & Inventory Control Engine
 * Integrated with Supabase Auth, Supabase DB (products), and Supabase Storage CDN (product-images).
 */

import {
  getDynamicParts,
  addProduct,
  updateProduct,
  deleteProduct,
  resetCatalogToDefault,
  formatRupiah
} from './services/cartService.js';
import { CONFIG, getProductImageUrl } from './config.js';
import {
  uploadAssetWithProgress,
  deleteAssetFromStorage,
  generateSlug,
  fetchCloudProducts
} from './services/supabaseService.js';
import { showBrutalConfirm, showBrutalAlert } from './components/modal.js';
import { getAllReviews, updateReviewStatus, deleteReview } from './services/reviewsService.js';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function initAdminDashboard() {
  // ─── 0. TOAST NOTIFICATION ENGINE ─────────────────────────────────────────
  function showAdminToast(type, title, message) {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    const borderColor = isSuccess ? '#22c55e' : '#ef4444';
    const badgeColor = isSuccess ? '#4ade80' : 'var(--accent-pink)';
    const icon = isSuccess ? 'check_circle' : 'error';

    toast.style.cssText = `
      background: #0f0f0f;
      color: #FFF;
      border: 2.5px solid ${borderColor};
      box-shadow: 6px 6px 0px #000;
      padding: 14px 18px;
      min-width: 280px;
      max-width: 400px;
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-family: var(--font-mono-sub);
      transition: all 0.3s ease;
    `;

    toast.innerHTML = `
      <span class="material-symbols-outlined" style="color:${badgeColor};font-size:24px;flex-shrink:0;">${icon}</span>
      <div style="flex:1;">
        <div style="font-weight:800;font-size:0.85rem;text-transform:uppercase;color:#FFF;letter-spacing:0.04em;">${escapeHtml(title)}</div>
        <div style="font-size:0.75rem;color:#AAA;margin-top:2px;line-height:1.4;">${escapeHtml(message)}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ─── 1. ADMIN ACCESS ENGINE & LOGOUT CONTROLS ─────────────────────────────
  async function enforceAdminRole() {
    const { verifyAdminSession, logoutUser, loginAsAdminDirectly } = await import('./services/authService.js');
    const adminCheck = await verifyAdminSession();

    const nonAdminPrompt = document.getElementById('adminNonAdminPrompt');
    const dashboardBody = document.getElementById('adminDashboardBody');
    const emailDisplay = document.getElementById('adminCurrentEmail');

    if (!adminCheck.isAdmin) {
      if (dashboardBody) dashboardBody.style.display = 'none';
      if (nonAdminPrompt) {
        nonAdminPrompt.style.display = 'block';
        if (emailDisplay) {
          emailDisplay.textContent = adminCheck.email ? `${adminCheck.email} (${adminCheck.role || 'Member'})` : 'Tamu / Belum Login';
        }
      }

      // Quick Switch Button
      document.getElementById('btnSwitchToAdminNow')?.addEventListener('click', () => {
        loginAsAdminDirectly();
        window.location.reload();
      });

      // Prompt Logout Button
      document.getElementById('btnPromptLogout')?.addEventListener('click', async () => {
        await logoutUser();
        window.location.href = 'login.html';
      });

      return false;
    }

    // Is Admin: reveal dashboard
    if (nonAdminPrompt) nonAdminPrompt.style.display = 'none';
    if (dashboardBody) dashboardBody.style.display = 'block';

    // Wire Logout Buttons
    const handleLogout = async () => {
      const confirmed = await showBrutalConfirm({
        title: 'LOG OUT DARI AKUN ADMIN?',
        message: 'Sesi admin akan ditutup sehingga Anda dapat berganti ke akun user biasa.',
        badge: 'ADMIN SESSION // PROTOCOL',
        confirmText: 'YA, LOG OUT',
        cancelText: 'BATAL',
        isDanger: true
      });
      if (confirmed) {
        await logoutUser();
        window.location.href = 'login.html';
      }
    };

    document.getElementById('btnAdminTopLogout')?.addEventListener('click', handleLogout);
    document.getElementById('btnAdminSidebarLogout')?.addEventListener('click', handleLogout);

    return true;
  }

  const isGranted = await enforceAdminRole();
  if (!isGranted) return;

  // Sync cloud products on startup in background
  fetchCloudProducts().then(cloudProducts => {
    if (cloudProducts && cloudProducts.length > 0) {
      refreshAdminView();
    }
  }).catch(() => {});

  // ─── 2. TABS SWITCHING & URL ROUTING ──────────────────────────────────────
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

  document.getElementById('btnSwitchToAdd')?.addEventListener('click', () => switchTab('add'));
  document.getElementById('btnSidebarQuickAdd')?.addEventListener('click', () => switchTab('add'));

  // Handle URL Routing & Quick-Edit parameters (?tab=... & ?edit=...)
  function handleUrlRouting() {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab');
    const editParam = url.searchParams.get('edit');

    // Also support clean URL path e.g. /admin/products/edit/:id
    const path = window.location.pathname;
    let editIdFromPath = null;
    if (path.includes('/edit/')) {
      editIdFromPath = path.split('/edit/')[1]?.split('/')[0]?.split('?')[0];
    }

    const targetEditId = editParam || editIdFromPath;

    if (tabParam === 'add') {
      switchTab('add');
    } else if (tabParam === 'orders') {
      switchTab('orders');
    } else if (tabParam === 'reviews') {
      switchTab('reviews');
    } else {
      switchTab('inventory');
    }

    if (targetEditId) {
      setTimeout(() => {
        openEditModal(targetEditId);
      }, 250);
    }
  }

  // ─── 3. RENDER OVERVIEW STATS & INVENTORY TABLE ──────────────────────────
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

    // Filter & Search Controls
    const query = (document.getElementById('adminSearchInput')?.value || '').toLowerCase().trim();
    const category = document.getElementById('adminCategoryFilter')?.value || 'ALL';
    const status = document.getElementById('adminStatusFilter')?.value || 'ALL';
    const sort = document.getElementById('adminSortFilter')?.value || 'NEWEST';

    let filtered = [...parts];

    // Filter Category
    if (category !== 'ALL') {
      filtered = filtered.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
    }

    // Filter Status (Active / Draft)
    if (status !== 'ALL') {
      filtered = filtered.filter(p => (p.status || 'Active').toLowerCase() === status.toLowerCase());
    }

    // Search Query (Title, Slug, SKU, Subtitle)
    if (query) {
      filtered = filtered.filter(p => 
        (p.name || '').toLowerCase().includes(query) ||
        (p.slug || '').toLowerCase().includes(query) ||
        (p.id || '').toLowerCase().includes(query) ||
        (p.sub || '').toLowerCase().includes(query)
      );
    }

    // Multi-Sorting
    filtered.sort((a, b) => {
      if (sort === 'NAME_ASC') return (a.name || '').localeCompare(b.name || '');
      if (sort === 'NAME_DESC') return (b.name || '').localeCompare(a.name || '');
      if (sort === 'PRICE_ASC') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sort === 'PRICE_DESC') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sort === 'STOCK_LOW') return (Number(a.stock) || 0) - (Number(b.stock) || 0);
      return 0; // NEWEST (default array order)
    });

    renderTableRows(filtered);
  }

  function renderTableRows(items) {
    const tbody = document.getElementById('adminProductsTbody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:48px 16px;color:#888;font-family:var(--font-mono-sub);">NO HARDWARE FOUND MATCHING SEARCH / FILTER CRITERIA</td></tr>';
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

      const safeId = escapeHtml(part.id);
      const safeName = escapeHtml(part.name);
      const safeSlug = escapeHtml(part.slug || generateSlug(part.name));
      const safeCategory = escapeHtml(part.category);
      const safeSub = escapeHtml(part.sub);
      const safeStatus = (part.status || 'Active').toLowerCase() === 'draft' ? 'Draft' : 'Active';
      const safeImage = part.image ? getProductImageUrl(part.image) : getProductImageUrl('Product1.png');

      const isDraft = safeStatus === 'Draft';
      const statusBadge = isDraft 
        ? `<span style="background:#262626;border:1px dashed #737373;color:#a3a3a3;font-family:var(--font-mono-sub);font-size:0.68rem;padding:3px 8px;font-weight:700;">DRAFT</span>`
        : `<span style="background:#064e3b;border:1px solid #10b981;color:#6ee7b7;font-family:var(--font-mono-sub);font-size:0.68rem;padding:3px 8px;font-weight:700;">LIVE ACTIVE</span>`;

      return `
        <tr>
          <td>
            <img src="${safeImage}" alt="${safeName}" onerror="this.onerror=null;this.src='assets/images/Product1.png';" style="width:52px;height:52px;object-fit:cover;border:1.5px solid #333;background:#000;border-radius:4px;">
          </td>
          <td>
            <div style="font-family:var(--font-headline);font-size:1.08rem;color:#FFF;letter-spacing:0.02em;line-height:1.2;">${safeName}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px;flex-wrap:wrap;">
              <span style="font-family:var(--font-mono-sub);font-size:0.68rem;background:#1e1e1e;border:1px solid #333;padding:2px 6px;color:#aaa;font-weight:700;">${safeId.toUpperCase()}</span>
              <span style="font-family:var(--font-mono-sub);font-size:0.72rem;color:var(--accent-yellow);font-weight:700;">/${safeSlug}</span>
            </div>
            ${safeSub ? `<div style="font-size:0.75rem;color:#777;max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px;">${safeSub}</div>` : ''}
          </td>
          <td>
            <span style="background:#181818;border:1px solid #2e2e2e;color:var(--accent-yellow);font-family:var(--font-mono-sub);font-size:0.72rem;font-weight:800;padding:4px 10px;white-space:nowrap;letter-spacing:0.04em;">
              ${safeCategory}
            </span>
          </td>
          <td style="white-space:nowrap;">
            <span style="font-family:var(--font-headline);font-size:1.15rem;color:var(--accent-yellow);font-weight:900;letter-spacing:0.02em;">
              ${formatRupiah(part.price)}
            </span>
          </td>
          <td style="text-align:center;">
            <div style="display:inline-flex;align-items:center;background:#141414;border:1px solid #333;padding:2px 4px;margin-bottom:6px;">
              <button class="qty-control-btn btn-stock-dec" data-id="${safeId}" style="width:22px;height:22px;font-size:0.9rem;cursor:pointer;">-</button>
              <span style="font-family:var(--font-headline);font-size:1.1rem;min-width:32px;text-align:center;color:#FFF;font-weight:900;">${stock}</span>
              <button class="qty-control-btn btn-stock-inc" data-id="${safeId}" style="width:22px;height:22px;font-size:0.9rem;cursor:pointer;">+</button>
            </div>
            <div>
              <span class="${stockBadgeClass}">${stockLabel}</span>
            </div>
          </td>
          <td style="text-align:center;white-space:nowrap;">
            ${statusBadge}
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <div style="display:inline-flex;gap:6px;align-items:center;justify-content:flex-end;">
              <button class="btn-admin-edit btn-brutal-ghost btn-brutal-sm" data-id="${safeId}" style="padding:6px 12px;font-size:0.75rem;display:inline-flex;align-items:center;gap:4px;" title="Edit Produk">
                <span class="material-symbols-outlined" style="font-size:15px;">edit</span>
                <span>EDIT</span>
              </button>
              <button class="btn-admin-del btn-brutal-dark btn-brutal-sm" data-id="${safeId}" style="padding:6px 12px;font-size:0.75rem;background:#35000a;border-color:#e11d48;color:#fecdd3;display:inline-flex;align-items:center;gap:4px;" title="Hapus Produk">
                <span class="material-symbols-outlined" style="font-size:15px;">delete</span>
                <span>HAPUS</span>
              </button>
            </div>
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

    // Wire delete buttons (Brutalist Confirmation Dialog)
    tbody.querySelectorAll('.btn-admin-del').forEach(btn => {
      btn.addEventListener('click', () => {
        openDeleteModal(btn.dataset.id);
      });
    });
  }

  // ─── 4. SEARCH & FILTER EVENT LISTENERS ──────────────────────────────────
  document.getElementById('adminSearchInput')?.addEventListener('input', refreshAdminView);
  document.getElementById('adminCategoryFilter')?.addEventListener('change', refreshAdminView);
  document.getElementById('adminStatusFilter')?.addEventListener('change', refreshAdminView);
  document.getElementById('adminSortFilter')?.addEventListener('change', refreshAdminView);

  // ─── 5. ADD PRODUCT LOGIC & REAL-TIME UPLOAD ─────────────────────────────
  let selectedAssetPath = getProductImageUrl('Product1.png');
  let slugManuallyEdited = false;

  const newProdNameInput = document.getElementById('newProdName');
  const newProdSlugInput = document.getElementById('newProdSlug');

  newProdNameInput?.addEventListener('input', (e) => {
    if (!slugManuallyEdited && newProdSlugInput) {
      newProdSlugInput.value = generateSlug(e.target.value);
    }
    updatePreview();
  });

  newProdSlugInput?.addEventListener('input', () => {
    slugManuallyEdited = true;
  });

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
      selectedAssetPath = first?.dataset.asset || getProductImageUrl('Product1.png');
    }
    updatePreview();
  });

  // Direct Supabase Storage File Uploader with Progress Bar
  const fileInput = document.getElementById('newProdFileInput');
  const uploadStatus = document.getElementById('uploadStatusText');
  const progressContainer = document.getElementById('newProdProgressContainer');
  const progressBar = document.getElementById('newProdProgressBar');

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (progressContainer) progressContainer.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';
    if (uploadStatus) {
      uploadStatus.textContent = '⏳ Mengunggah ke Supabase Storage (product-images)... 0%';
      uploadStatus.style.color = 'var(--accent-yellow)';
    }

    try {
      const publicUrl = await uploadAssetWithProgress(file, (percent) => {
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (uploadStatus) {
          uploadStatus.textContent = `⏳ Mengunggah ke Supabase Storage... ${percent}%`;
        }
      });

      selectedAssetPath = publicUrl;

      document.querySelectorAll('#assetPickerGrid .admin-asset-choice').forEach(c => c.classList.remove('selected'));
      const customInput = document.getElementById('newProdCustomUrl');
      if (customInput) customInput.value = publicUrl;

      updatePreview();

      if (progressBar) progressBar.style.width = '100%';
      if (uploadStatus) {
        uploadStatus.textContent = '✅ Berhasil diunggah ke Supabase Storage CDN!';
        uploadStatus.style.color = '#4ade80';
      }
      showAdminToast('success', 'UPLOAD BERHASIL', 'Gambar produk berhasil diunggah ke Supabase Storage.');
    } catch (err) {
      console.error('Upload failed:', err);
      if (uploadStatus) {
        uploadStatus.textContent = '⚠️ Upload cloud tertunda: ' + err.message;
        uploadStatus.style.color = '#FF4444';
      }
      selectedAssetPath = URL.createObjectURL(file);
      updatePreview();
      showAdminToast('error', 'UPLOAD GAGAL', err.message);
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
    if (prevImage) {
      prevImage.src = selectedAssetPath;
      prevImage.onerror = () => { prevImage.src = 'assets/images/Product1.png'; };
    }

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
    const slug = document.getElementById('newProdSlug').value.trim() || generateSlug(name);
    const category = document.getElementById('newProdCategory').value;
    const status = document.getElementById('newProdStatus').value;
    const sub = document.getElementById('newProdSub').value.trim();
    const price = Number(document.getElementById('newProdPrice').value);
    const originalPrice = document.getElementById('newProdOriginalPrice')?.value ? Number(document.getElementById('newProdOriginalPrice').value) : null;
    const stock = Number(document.getElementById('newProdStock').value);
    const badge = document.getElementById('newProdBadge').value;

    const newProd = addProduct({
      name,
      slug,
      category,
      status,
      sub,
      price,
      original_price: originalPrice,
      stock,
      badge,
      image: selectedAssetPath
    });

    showAdminToast('success', 'PRODUK DITERBITKAN', `"${newProd.name}" berhasil disimpan ke katalog & database Supabase.`);

    document.getElementById('addProductForm').reset();
    slugManuallyEdited = false;
    updatePreview();

    // Switch to inventory tab & refresh
    switchTab('inventory');
    refreshAdminView();
  });

  // ─── 6. EDIT PRODUCT MODAL LOGIC & IMAGE REPLACEMENT ─────────────────────
  const editModal = document.getElementById('editProductModal');
  const editFileInput = document.getElementById('editProdFileInput');
  const editUploadStatus = document.getElementById('editUploadStatusText');
  const editProgressContainer = document.getElementById('editProdProgressContainer');
  const editProgressBar = document.getElementById('editProdProgressBar');
  const editPreviewImg = document.getElementById('editProdPreviewImg');

  function openEditModal(id) {
    const parts = getDynamicParts();
    const part = parts.find(p => p.id === id);
    if (!part || !editModal) return;

    document.getElementById('editModalSku').textContent = part.id.toUpperCase();
    document.getElementById('editProdId').value = part.id;
    document.getElementById('editProdName').value = part.name;
    document.getElementById('editProdSlug').value = part.slug || generateSlug(part.name);
    document.getElementById('editProdCategory').value = part.category;
    document.getElementById('editProdStatus').value = part.status || 'Active';
    document.getElementById('editProdBadge').value = part.badge || '';
    document.getElementById('editProdSub').value = part.sub;
    document.getElementById('editProdPrice').value = part.price;
    document.getElementById('editProdStock').value = part.stock;
    document.getElementById('editProdImage').value = part.image;

    if (editPreviewImg) {
      editPreviewImg.src = part.image;
      editPreviewImg.onerror = () => { editPreviewImg.src = 'assets/images/Product1.png'; };
    }

    if (editProgressContainer) editProgressContainer.style.display = 'none';
    if (editUploadStatus) {
      editUploadStatus.textContent = 'Pilih file untuk mengunggah gambar baru & otomatis membersihkan file lama.';
      editUploadStatus.style.color = '#888';
    }

    editModal.classList.add('open');
  }

  function closeEditModal() {
    if (editModal) editModal.classList.remove('open');
  }

  document.getElementById('editModalCloseBtn')?.addEventListener('click', closeEditModal);
  document.getElementById('btnCancelEdit')?.addEventListener('click', closeEditModal);

  // Edit file uploader to replace existing asset
  editFileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (editProgressContainer) editProgressContainer.style.display = 'block';
    if (editProgressBar) editProgressBar.style.width = '0%';
    if (editUploadStatus) {
      editUploadStatus.textContent = '⏳ Mengunggah gambar baru... 0%';
      editUploadStatus.style.color = 'var(--accent-yellow)';
    }

    try {
      const publicUrl = await uploadAssetWithProgress(file, (percent) => {
        if (editProgressBar) editProgressBar.style.width = `${percent}%`;
        if (editUploadStatus) {
          editUploadStatus.textContent = `⏳ Mengunggah gambar baru... ${percent}%`;
        }
      });

      document.getElementById('editProdImage').value = publicUrl;
      if (editPreviewImg) editPreviewImg.src = publicUrl;

      if (editProgressBar) editProgressBar.style.width = '100%';
      if (editUploadStatus) {
        editUploadStatus.textContent = '✅ Gambar baru siap disimpan!';
        editUploadStatus.style.color = '#4ade80';
      }
      showAdminToast('success', 'GAMBAR BARU DIUNGGAH', 'Gambar baru siap disimpan.');
    } catch (err) {
      if (editUploadStatus) {
        editUploadStatus.textContent = '⚠️ Upload error: ' + err.message;
        editUploadStatus.style.color = '#FF4444';
      }
      showAdminToast('error', 'GAGAL MENGUNGGAH', err.message);
    }
  });

  // Handle Edit Form Submit
  document.getElementById('editProductForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editProdId').value;
    const updated = {
      name: document.getElementById('editProdName').value.trim(),
      slug: document.getElementById('editProdSlug').value.trim(),
      category: document.getElementById('editProdCategory').value,
      status: document.getElementById('editProdStatus').value,
      badge: document.getElementById('editProdBadge').value,
      sub: document.getElementById('editProdSub').value.trim(),
      price: Number(document.getElementById('editProdPrice').value),
      stock: Number(document.getElementById('editProdStock').value),
      image: document.getElementById('editProdImage').value.trim()
    };

    updateProduct(id, updated);
    closeEditModal();
    refreshAdminView();

    showAdminToast('success', 'PRODUK DIPERBARUI', `Perubahan pada "${updated.name}" berhasil disimpan.`);
  });

  // ─── 7. DELETE PRODUCT MODAL CONFIRMATION ────────────────────────────────
  const deleteModal = document.getElementById('deleteConfirmModal');
  let pendingDeleteId = null;

  function openDeleteModal(id) {
    const parts = getDynamicParts();
    const part = parts.find(p => p.id === id);
    if (!part || !deleteModal) return;

    pendingDeleteId = id;

    const thumb = document.getElementById('deleteModalThumb');
    const name = document.getElementById('deleteModalName');
    const sku = document.getElementById('deleteModalSku');

    if (thumb) {
      thumb.src = part.image;
      thumb.onerror = () => { thumb.src = 'assets/images/Product1.png'; };
    }
    if (name) name.textContent = part.name;
    if (sku) sku.textContent = `SKU: ${part.id.toUpperCase()}`;

    deleteModal.classList.add('open');
  }

  function closeDeleteModal() {
    if (deleteModal) deleteModal.classList.remove('open');
    pendingDeleteId = null;
  }

  document.getElementById('btnCancelDelete')?.addEventListener('click', closeDeleteModal);

  document.getElementById('btnConfirmDelete')?.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    const parts = getDynamicParts();
    const part = parts.find(p => p.id === pendingDeleteId);
    const prodName = part ? part.name : pendingDeleteId;

    deleteProduct(pendingDeleteId);
    closeDeleteModal();
    refreshAdminView();

    showAdminToast('success', 'PRODUK DIHAPUS', `"${prodName}" & aset gambar telah dihapus dari sistem.`);
  });

  // ─── 8. CUSTOMER ORDERS TAB ──────────────────────────────────────────────
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

    tbody.innerHTML = orders.map((ord, idx) => {
      const safeId = escapeHtml(ord.id);
      const safeCustomer = escapeHtml(ord.customer);
      const safeItems = escapeHtml(ord.items);
      const safeDate = escapeHtml(ord.date);

      return `
        <tr>
          <td>
            <span style="font-family:var(--font-headline);font-size:1.1rem;color:var(--accent-yellow);letter-spacing:0.04em;">#${safeId}</span>
          </td>
          <td>
            <div style="font-weight:700;color:#FFF;">${safeCustomer}</div>
          </td>
          <td style="font-size:0.85rem;color:#AAA;">
            ${safeItems}
          </td>
          <td style="font-family:var(--font-headline);font-size:1.15rem;color:var(--accent-yellow);font-weight:900;">
            ${formatRupiah(ord.total)}
          </td>
          <td style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;">
            ${safeDate}
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
            <a href="https://wa.me/6281234567890?text=Halo%20kami%20dari%20Mustaz%20Craft%20terkait%20pesanan%20${encodeURIComponent(ord.id)}" target="_blank" class="btn-brutal-dark btn-brutal-sm" style="color:#4ade80;border-color:#22c55e;">
              WHATSAPP
            </a>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.order-status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.index);
        const newStatus = e.target.value;
        orders[idx].status = newStatus;
        localStorage.setItem('mustaz_admin_orders', JSON.stringify(orders));

        import('./services/supabaseService.js').then(({ updateCloudOrderStatus }) => {
          updateCloudOrderStatus(orders[idx].id, newStatus);
        }).catch(() => {});

        showAdminToast('success', 'STATUS DIPERBARUI', `Pesanan #${orders[idx].id} diubah ke ${newStatus}.`);
      });
    });
  }

  document.getElementById('btnRefreshOrders')?.addEventListener('click', renderOrders);

  // ─── 8B. TESTIMONI & ULASAN MODERATION (SCHEME 1) ────────────────────────
  async function renderAdminReviews() {
    const tbody = document.getElementById('adminReviewsTbody');
    const badgeEl = document.getElementById('navBadgeReviews');
    if (!tbody) return;

    try {
      const reviews = await getAllReviews();
      if (badgeEl) badgeEl.textContent = reviews.length;

      if (!reviews || reviews.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center;padding:36px 16px;color:#888;font-family:var(--font-mono-sub);">
              BELUM ADA ULASAN RIDERS TERCATAT
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = reviews.map((rev) => {
        const isApproved = rev.status === 'approved' || !rev.status;
        const statusBadge = isApproved 
          ? `<span style="background:#22c55e22;color:#4ade80;border:1px solid #22c55e;padding:3px 8px;font-size:0.7rem;font-weight:800;">TAMPIL (APPROVED)</span>`
          : `<span style="background:#ef444422;color:#ef4444;border:1px solid #ef4444;padding:3px 8px;font-size:0.7rem;font-weight:800;">DISEMBUNYIKAN</span>`;

        return `
          <tr style="border-bottom:1px solid #222;">
            <td style="padding:14px 16px;">
              <div style="font-weight:800;color:#FFF;font-size:0.95rem;">${escapeHtml(rev.user_name)}</div>
              <div style="font-size:0.75rem;color:#888;">${escapeHtml(rev.bike_model || '-')} // ${escapeHtml(rev.city || '-')}</div>
              <div style="font-size:0.72rem;color:var(--accent-pink);">${escapeHtml(rev.user_email || '')}</div>
            </td>
            <td style="padding:14px 16px;">
              <div style="font-weight:700;color:var(--accent-yellow);font-size:0.9rem;">${escapeHtml(rev.product_name)}</div>
              <div style="font-size:0.72rem;color:#888;font-family:var(--font-mono-sub);">ORDER #${escapeHtml(rev.order_id)}</div>
            </td>
            <td style="padding:14px 16px;">
              <span style="color:var(--accent-yellow);font-size:1rem;letter-spacing:2px;">${'★'.repeat(rev.rating || 5)}</span>
              <span style="font-size:0.72rem;color:#888;display:block;">(${rev.rating || 5}/5)</span>
            </td>
            <td style="padding:14px 16px;max-width:320px;">
              <div style="font-size:0.82rem;color:#DDD;line-height:1.4;">“${escapeHtml(rev.comment)}”</div>
              <div style="font-size:0.7rem;color:#666;margin-top:4px;">${new Date(rev.created_at || Date.now()).toLocaleDateString('id-ID')}</div>
            </td>
            <td style="padding:14px 16px;">
              ${statusBadge}
            </td>
            <td style="padding:14px 16px;text-align:right;">
              <div style="display:flex;gap:6px;justify-content:flex-end;">
                <button type="button" class="btn-toggle-review btn-brutal-dark btn-brutal-sm" data-id="${rev.id}" data-status="${isApproved ? 'hidden' : 'approved'}" style="font-size:0.72rem;padding:4px 8px;">
                  ${isApproved ? 'SEMBUNYIKAN' : 'TAMPILKAN'}
                </button>
                <button type="button" class="btn-delete-review btn-brutal-pink btn-brutal-sm" data-id="${rev.id}" style="font-size:0.72rem;padding:4px 8px;background:#ef4444;border-color:#ef4444;">
                  HAPUS
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('.btn-toggle-review').forEach(btn => {
        btn.addEventListener('click', async () => {
          const revId = btn.dataset.id;
          const nextStatus = btn.dataset.status;
          await updateReviewStatus(revId, nextStatus);
          showAdminToast('success', 'STATUS DIPERBARUI', `Ulasan #${revId} kini ${nextStatus === 'approved' ? 'ditampilkan' : 'disembunyikan'}.`);
          renderAdminReviews();
        });
      });

      tbody.querySelectorAll('.btn-delete-review').forEach(btn => {
        btn.addEventListener('click', async () => {
          const revId = btn.dataset.id;
          const confirmed = await showBrutalConfirm({
            title: 'HAPUS ULASAN INI?',
            message: 'Tindakan ini akan menghapus ulasan secara permanen dari database.',
            badge: 'MODERASI ULASAN',
            confirmText: 'YA, HAPUS',
            isDanger: true
          });
          if (confirmed) {
            await deleteReview(revId);
            showAdminToast('success', 'ULASAN DIHAPUS', `Ulasan #${revId} berhasil dihapus.`);
            renderAdminReviews();
          }
        });
      });
    } catch (err) {
      console.warn('Could not render admin reviews:', err);
    }
  }

  document.getElementById('btnRefreshReviews')?.addEventListener('click', renderAdminReviews);
  window.addEventListener('mustaz:reviews_updated', renderAdminReviews);

  // ─── 9. INITIALIZATION ──────────────────────────────────────────────────
  refreshAdminView();
  renderOrders();
  renderAdminReviews();
  updatePreview();
  handleUrlRouting();
}

// Bootstrap dashboard immediately if DOM is already ready, or on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminDashboard);
} else {
  initAdminDashboard();
}

