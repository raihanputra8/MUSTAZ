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
  formatRupiah,
  getFlashSaleConfig,
  saveFlashSaleConfig,
  getActiveFlashSaleProducts,
  setProductFlashSale
} from './services/cartService.js';
import { CONFIG, getProductImageUrl } from './config.js';
import {
  uploadAssetWithProgress,
  deleteAssetFromStorage,
  generateSlug,
  fetchCloudProducts,
  fetchCloudOrders,
  updateCloudOrderStatus
} from './services/supabaseService.js';
import { getSupabaseClient } from './services/supabaseClient.js';
import { showBrutalConfirm, showBrutalAlert } from './components/modal.js';
import { getAllReviews, updateReviewStatus, deleteReview } from './services/reviewsService.js';
import {
  OFFICIAL_PAYMENT_ACCOUNTS,
  parseIncomingOrder,
  generatePhase1Response,
  generatePhase2Response,
  generatePhase3Response,
  generatePhase4Response,
  handleCustomerMessage,
  createDirectWhatsAppUrl,
  cleanOrderId,
  cleanPhoneNumber,
  buildTrackingUrl,
  buildReviewUrl,
  formatRupiahNumber
} from './services/whatsappCsService.js';

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

  // ─── 1. TABS SWITCHING & URL ROUTING (ROBUST DELEGATION & DIRECT BINDING) ──
  function initAdminTabs() {
    const navItems = document.querySelectorAll('#adminNav .account-nav-item[data-tab]');
    const panels = document.querySelectorAll('.account-tab-panel');

    function switchTab(targetTab) {
      if (!targetTab) return;
      navItems.forEach(n => {
        if (n.dataset.tab === targetTab) n.classList.add('active');
        else n.classList.remove('active');
      });
      panels.forEach(panel => {
        if (panel.id === 'panel-' + targetTab) panel.classList.add('active');
        else panel.classList.remove('active');
      });
      try {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('tab', targetTab);
        window.history.replaceState({}, '', newUrl.toString());
      } catch {}
    }

    // Expose for external calls
    window.switchAdminTab = switchTab;

    // Direct event listener on each tab button
    navItems.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.dataset.tab;
        if (tab) switchTab(tab);
      });
    });

    // Delegated fallback listener on #adminNav container
    const adminNav = document.getElementById('adminNav');
    if (adminNav) {
      adminNav.addEventListener('click', (e) => {
        const item = e.target.closest('.account-nav-item[data-tab]');
        if (!item) return;
        e.preventDefault();
        const targetTab = item.dataset.tab;
        if (targetTab) switchTab(targetTab);
      });
    }

    // Quick Action button helpers
    document.getElementById('btnSwitchToAdd')?.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('add');
    });
    document.getElementById('btnSidebarQuickAdd')?.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('add');
    });
  }

  function switchTab(targetTab) {
    if (typeof window.switchAdminTab === 'function') {
      window.switchAdminTab(targetTab);
    } else {
      const navItems = document.querySelectorAll('#adminNav .account-nav-item[data-tab]');
      const panels = document.querySelectorAll('.account-tab-panel');
      navItems.forEach(n => {
        if (n.dataset.tab === targetTab) n.classList.add('active');
        else n.classList.remove('active');
      });
      panels.forEach(panel => {
        if (panel.id === 'panel-' + targetTab) panel.classList.add('active');
        else panel.classList.remove('active');
      });
    }
  }

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
    } else if (tabParam === 'flash-sale' || tabParam === 'promo') {
      switchTab('flash-sale');
    } else {
      switchTab('inventory');
    }

    if (targetEditId) {
      setTimeout(() => {
        openEditModal(targetEditId);
      }, 250);
    }
  }

  // ─── 2. ADMIN ACCESS ENGINE & LOGOUT CONTROLS ─────────────────────────────
  async function enforceAdminRole() {
    try {
      const { verifyAdminSession, logoutUser } = await import('./services/authService.js');
      const adminCheck = await verifyAdminSession();

      const nonAdminPrompt = document.getElementById('adminNonAdminPrompt');
      const dashboardBody = document.getElementById('adminDashboardBody');
      const emailDisplay = document.getElementById('adminCurrentEmail');

      if (!adminCheck.isAdmin) {
        if (dashboardBody) dashboardBody.style.display = 'none';
        if (nonAdminPrompt) {
          nonAdminPrompt.style.display = 'block';
          if (emailDisplay) {
            emailDisplay.textContent = adminCheck.email ? `${adminCheck.email} (${adminCheck.role || 'Bukan Admin'})` : 'Tamu / Belum Login';
          }
        }

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
    } catch (err) {
      console.warn('[Admin] Auth verification warning:', err);
      return true;
    }
  }

  // ─── 3. CLOUD DATABASE SYNC ENGINE (SUPABASE ⇄ LOCAL INVENTORY) ────────────
  async function syncProductsFromCloud(showNotification = false) {
    const btnSync = document.getElementById('btnSyncProducts');
    if (btnSync) {
      btnSync.disabled = true;
      btnSync.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">sync</span> <span>SYNCING...</span>';
    }

    try {
      const cloudProducts = await fetchCloudProducts();
      if (cloudProducts && cloudProducts.length > 0) {
        refreshAdminView();
        if (showNotification) {
          showAdminToast('success', 'SUPABASE TERSINKRON', `${cloudProducts.length} produk katalog berhasil dimuat langsung dari cloud.`);
        }
      } else {
        refreshAdminView();
        if (showNotification) {
          showAdminToast('info', 'KATALOG AKTIF', 'Menggunakan data katalog workshop tersimpan.');
        }
      }
    } catch (err) {
      console.warn('[Admin] Error syncing cloud products:', err);
      refreshAdminView();
    } finally {
      if (btnSync) {
        btnSync.disabled = false;
        btnSync.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;color:var(--accent-yellow);">sync</span> <span>SYNC SUPABASE</span>';
      }
    }
  }

  document.getElementById('btnSyncProducts')?.addEventListener('click', () => syncProductsFromCloud(true));

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

    try {
      if (!items || items.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center;padding:48px 16px;color:#888;font-family:var(--font-mono-sub);">
              <div style="font-family:var(--font-headline);font-size:1.1rem;color:#FFF;margin-bottom:6px;">BELUM ADA PRODUK ATAU DATA GAGAL DIMUAT</div>
              <div style="font-size:0.8rem;color:#AAA;">Tidak ada produk yang cocok dengan filter atau database katalog kosong.</div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = items.filter(Boolean).map((part) => {
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

        const safeId = escapeHtml(part.id || '');
        const safeName = escapeHtml(part.name || 'CUSTOM PART');
        const safeSlug = escapeHtml(part.slug || generateSlug(part.name || 'part'));
        const safeCategory = escapeHtml(part.category || 'Retro Visor');
        const safeSub = escapeHtml(part.sub || part.description || '');
        const safeStatus = (part.status || 'Active').toLowerCase() === 'draft' ? 'Draft' : 'Active';
        const rawImg = part.image || part.image_url || 'Product1.png';
        const safeImage = rawImg ? getProductImageUrl(rawImg) : getProductImageUrl('Product1.png');

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
    } catch (err) {
      console.error('[Admin] Error rendering product table rows:', err);
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:#ef4444;font-family:var(--font-mono-sub);">ERROR RENDERING PRODUCTS: ${escapeHtml(err.message)}</td></tr>`;
    }
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

  // State for order filters & receipt modal (Usulan 2 & 3)
  let activeOrderStatusFilter = 'ALL';
  let orderSearchTerm = '';
  let currentReceiptOrderIndex = null;
  let stagedReceiptImage = '';
  let previousPendingCount = null;
  let globalOpenResiModal = null;

  function playOrderNotificationSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Play bright, punchy 3-note chime (G5, B5, D6)
      const notes = [
        { freq: 783.99, start: 0, dur: 0.15 },    // G5
        { freq: 987.77, start: 0.12, dur: 0.18 },  // B5
        { freq: 1174.66, start: 0.25, dur: 0.40 } // D6
      ];

      const now = ctx.currentTime;
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, now + n.start);

        gain.gain.setValueAtTime(0.01, now + n.start);
        gain.gain.linearRampToValueAtTime(0.35, now + n.start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.start);
        osc.stop(now + n.start + n.dur);
      });
    } catch (err) {
      console.warn('[Admin] Audio notification chime error:', err);
    }
  }

  // Backward compatible alias
  const playOrderPingSound = playOrderNotificationSound;
  window.playOrderNotificationSound = playOrderNotificationSound;
  window.playOrderPingSound = playOrderNotificationSound;

  function showNewOrderModalAlert(newOrder) {
    if (!newOrder) return;

    // Remove any existing new order modal
    const existing = document.getElementById('mustazNewOrderAlertModal');
    if (existing) existing.remove();

    const orderId = newOrder.id || newOrder.order_id || 'MSTZ-NEW';
    const customerName = newOrder.customer_name || newOrder.customer || 'Customer';
    const totalAmount = Number(newOrder.total_amount || newOrder.total || 0);
    const totalDisplay = formatRupiah(totalAmount);
    const phone = newOrder.phone || '-';
    const items = newOrder.items || 'Produk Pesanan';
    const courier = newOrder.courier || newOrder.city || 'Standard Dispatch';

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'mustazNewOrderAlertModal';
    modalOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeInOrderModal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    modalOverlay.innerHTML = `
      <style>
        @keyframes fadeInOrderModal {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseNewOrderBadge {
          0%, 100% { background: #FF007A; color: #FFF; box-shadow: 0 0 16px rgba(255, 0, 122, 0.6); }
          50% { background: #FFE600; color: #000; box-shadow: 0 0 20px rgba(255, 230, 0, 0.8); }
        }
      </style>
      <div style="
        background: #0D0D0D;
        border: 4px solid var(--accent-pink);
        box-shadow: 12px 12px 0px #000000;
        width: 100%;
        max-width: 480px;
        padding: 28px;
        position: relative;
        color: #FFFFFF;
      ">
        <!-- Floating Top Badge -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            font-family: var(--font-headline);
            font-size: 0.95rem;
            letter-spacing: 0.08em;
            border: 2px solid #000;
            animation: pulseNewOrderBadge 1.8s infinite;
            font-weight: 900;
          ">
            <span class="material-symbols-outlined" style="font-size: 18px;">notifications_active</span>
            PESANAN BARU MASUK!
          </span>
          <span style="font-family: var(--font-mono-sub); font-size: 0.75rem; color: #888;">
            REAL-TIME SYNC
          </span>
        </div>

        <!-- Order Headline -->
        <div style="border-bottom: 2px dashed #2E2E2E; padding-bottom: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="font-family: var(--font-mono-sub); font-size: 0.75rem; color: var(--accent-yellow); display: block;">ORDER NUMBER</span>
              <h2 style="font-family: var(--font-headline); font-size: 1.8rem; margin: 2px 0 0; color: #FFF; letter-spacing: -0.01em;">
                #${orderId}
              </h2>
            </div>
            <div style="text-align: right;">
              <span style="font-family: var(--font-mono-sub); font-size: 0.75rem; color: #888; display: block;">TOTAL TRANSAKSI</span>
              <span style="font-family: var(--font-headline); font-size: 1.5rem; color: var(--accent-yellow); font-weight: 900;">
                ${totalDisplay}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Details Breakdown -->
        <div style="background: #161616; border: 2px solid #282828; padding: 16px; margin-bottom: 20px; font-family: var(--font-mono-sub); font-size: 0.85rem; line-height: 1.5;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #777;">PEMESAN:</span>
            <span style="color: #FFF; font-weight: bold; text-align: right;">${customerName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #777;">WHATSAPP:</span>
            <span style="color: #4ade80; text-align: right;">${phone}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #777;">EKSPEDISI / TUJUAN:</span>
            <span style="color: #CCC; text-align: right;">${courier}</span>
          </div>
          <div style="border-top: 1px dashed #333; padding-top: 8px; margin-top: 8px;">
            <span style="color: #777; display: block; margin-bottom: 4px;">ITEM:</span>
            <span style="color: #FFF; display: block; font-family: var(--font-body); font-size: 0.88rem; max-height: 70px; overflow-y: auto;">
              ${items}
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 12px;">
          <button id="btnDismissNewOrderAlert" class="btn-brutal-ghost" style="flex: 1; padding: 12px; font-size: 0.95rem; text-align: center;">
            TUTUP
          </button>
          <button id="btnViewNewOrderAlert" class="btn-brutal-pink" style="flex: 1.5; padding: 12px; font-size: 0.95rem; text-align: center;">
            LIHAT PESANAN →
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeAlert = () => {
      modalOverlay.remove();
    };

    document.getElementById('btnDismissNewOrderAlert')?.addEventListener('click', closeAlert);
    document.getElementById('btnViewNewOrderAlert')?.addEventListener('click', () => {
      closeAlert();
      if (typeof switchTab === 'function') {
        switchTab('orders');
      } else if (typeof window.switchAdminTab === 'function') {
        window.switchAdminTab('orders');
      }
      const ordersSection = document.getElementById('panel-orders') || document.getElementById('ordersTableContainer');
      if (ordersSection) {
        ordersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Dismiss on ESC key
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeAlert();
        window.removeEventListener('keydown', handleEsc);
      }
    };
    window.addEventListener('keydown', handleEsc);
  }
  window.showNewOrderModalAlert = showNewOrderModalAlert;

  async function syncAndRenderOrders(silent = false) {
    try {
      const cloudOrders = await fetchCloudOrders();
      const localOrders = getAdminOrders();

      if (cloudOrders && cloudOrders.length > 0) {
        const cloudMap = new Map();
        cloudOrders.forEach(co => cloudMap.set(cleanOrderId(co.id), co));

        const merged = cloudOrders.map(co => {
          const match = localOrders.find(lo => cleanOrderId(lo.id) === cleanOrderId(co.id));
          return {
            ...co,
            receiptImage: match?.receiptImage || co.receiptImage || ''
          };
        });

        // Retain local mock orders not present in cloud
        localOrders.forEach(lo => {
          if (!cloudMap.has(cleanOrderId(lo.id))) {
            merged.push(lo);
          }
        });

        localStorage.setItem('mustaz_admin_orders', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('[Admin] syncAndRenderOrders fetch error:', err);
    }

    const allOrders = getAdminOrders();
    const pendingCount = allOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;

    // Trigger audio ping notification when new pending orders arrive
    if (previousPendingCount !== null && pendingCount > previousPendingCount && !silent) {
      playOrderPingSound();
    }
    previousPendingCount = pendingCount;

    // Update sidebar navigation badge
    const badge = document.getElementById('navBadgeOrders');
    if (badge) {
      badge.textContent = pendingCount;
      badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    renderOrders();
  }

  function openReceiptModal(idx, id = null) {
    const orders = getAdminOrders();
    const ord = (id ? orders.find(o => cleanOrderId(o.id) === cleanOrderId(id)) : null) || orders[idx];
    if (!ord) return;

    currentReceiptOrderIndex = orders.indexOf(ord);
    stagedReceiptImage = ord.receiptImage || '';

    const modal = document.getElementById('orderReceiptModal');
    const orderCodeEl = document.getElementById('receiptModalOrderCode');
    const customerEl = document.getElementById('receiptModalCustomer');
    const totalEl = document.getElementById('receiptModalTotal');
    const imgEl = document.getElementById('receiptPreviewImg');
    const placeholderEl = document.getElementById('receiptPlaceholder');
    const fileInput = document.getElementById('receiptFileInput');

    if (orderCodeEl) orderCodeEl.textContent = '#' + (ord.id || '');
    if (customerEl) customerEl.textContent = ord.customer || '-';
    if (totalEl) totalEl.textContent = formatRupiah(ord.total);
    if (fileInput) fileInput.value = '';

    if (stagedReceiptImage) {
      if (imgEl) {
        imgEl.src = stagedReceiptImage;
        imgEl.style.display = 'block';
      }
      if (placeholderEl) placeholderEl.style.display = 'none';
    } else {
      if (imgEl) {
        imgEl.src = '';
        imgEl.style.display = 'none';
      }
      if (placeholderEl) placeholderEl.style.display = 'block';
    }

    if (modal) {
      modal.classList.add('open');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeReceiptModal() {
    const modal = document.getElementById('orderReceiptModal');
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    currentReceiptOrderIndex = null;
    stagedReceiptImage = '';
  }

  // ─── HELPER WHATSAPP TARGET CS AUTOMATION (BUYER NUMBER) ───────────────────
  function getCustomerWhatsAppNumber(order) {
    if (!order) return '';
    let rawPhone = order.customer_phone || order.phone || order.customerPhone || '';
    if (!rawPhone && typeof order.customer === 'string') {
      const match = order.customer.match(/(?:08|\+?628)[0-9]{8,13}/);
      if (match) rawPhone = match[0];
    }
    let cleaned = String(rawPhone || '').replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  }

  function openAdminWhatsAppAction(order, actionPhase) {
    if (!order) return false;

    // Pastikan memformat nomor pembeli (ubah '0812...' menjadi '62812...')
    let customerPhone = getCustomerWhatsAppNumber(order);

    if (!customerPhone || customerPhone.length < 10) {
      const errTxt = `Nomor WhatsApp pembeli untuk pesanan #${order.id || ''} tidak valid atau belum diisi.`;
      showAdminToast('error', 'NOMOR WA TIDAK VALID', errTxt);
      alert(`⚠️ NOMOR WHATSAPP PEMBELI TIDAK VALID ATAU KOSONG!\n\nPesanan #${cleanOrderId(order.id)} tidak memiliki nomor WhatsApp pembeli yang valid (${customerPhone || 'KOSONG'}).\n\nAdmin tidak dapat menghubungi nomor sendiri.`);
      return false;
    }

    const custName = (order.customer || order.customer_name || '').split('//')[0].replace(/\(.*?\)/g, '').trim() || 'Rider';
    const orderCode = cleanOrderId(order.id);
    let message = '';

    if (actionPhase === 1 || actionPhase === 'p1') {
      const data = {
        orderId: orderCode,
        customerName: custName,
        itemsList: order.items || '-',
        totalFormatted: formatRupiahNumber(order.total || order.total_amount || 0),
        phone: customerPhone
      };
      message = generatePhase1Response(data, OFFICIAL_PAYMENT_ACCOUNTS);
    } else if (actionPhase === 2 || actionPhase === 'p2') {
      const data = {
        orderId: orderCode,
        customerName: custName,
        totalFormatted: formatRupiahNumber(order.total || order.total_amount || 0),
        phone: customerPhone
      };
      message = generatePhase2Response(data);
    } else if (actionPhase === 3 || actionPhase === 'p3') {
      const data = {
        orderId: orderCode,
        customerName: custName,
        courier: order.courier || 'J&T Express',
        resiNumber: order.resi || '-',
        phone: customerPhone
      };
      message = generatePhase3Response(data);
    } else if (actionPhase === 4 || actionPhase === 'p4') {
      const reviewUrl = `https://mustazbuildtest.vercel.app/testimoni.html?review_order=${orderCode}`;
      const data = {
        orderId: orderCode,
        customerName: custName,
        phone: customerPhone
      };
      message = generatePhase4Response(data, reviewUrl);
    }

    const waUrl = `https://wa.me/${customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    return true;
  }
  window.openAdminWhatsAppAction = openAdminWhatsAppAction;

  function renderOrders() {
    const allOrders = getAdminOrders();
    const tbody = document.getElementById('adminOrdersTbody');
    if (!tbody) return;

    // 1. Update filter tab counts (Usulan 2)
    const countAll = allOrders.length;
    const countPending = allOrders.filter(o => o.status === 'PENDING').length;
    const countPaid = allOrders.filter(o => o.status === 'PAID_PROCESSING' || o.status === 'PROCESSING').length;
    const countShipped = allOrders.filter(o => o.status === 'SHIPPED' || o.status === 'IN TRANSIT').length;
    const countDelivered = allOrders.filter(o => o.status === 'DELIVERED').length;
    const countCancelled = allOrders.filter(o => o.status === 'CANCELLED').length;

    const cntAllEl = document.getElementById('cntStatusAll');
    if (cntAllEl) cntAllEl.textContent = countAll;
    const cntPendingEl = document.getElementById('cntStatusPending');
    if (cntPendingEl) cntPendingEl.textContent = countPending;
    const cntPaidEl = document.getElementById('cntStatusPaid');
    if (cntPaidEl) cntPaidEl.textContent = countPaid;
    const cntShippedEl = document.getElementById('cntStatusShipped');
    if (cntShippedEl) cntShippedEl.textContent = countShipped;
    const cntDeliveredEl = document.getElementById('cntStatusDelivered');
    if (cntDeliveredEl) cntDeliveredEl.textContent = countDelivered;
    const cntCancelledEl = document.getElementById('cntStatusCancelled');
    if (cntCancelledEl) cntCancelledEl.textContent = countCancelled;

    // 2. Filter list by tab and search
    let filteredOrders = allOrders.map((ord, originalIdx) => ({ ord, originalIdx }));

    if (activeOrderStatusFilter !== 'ALL') {
      filteredOrders = filteredOrders.filter(({ ord }) => {
        if (activeOrderStatusFilter === 'PAID_PROCESSING') {
          return ord.status === 'PAID_PROCESSING' || ord.status === 'PROCESSING';
        }
        if (activeOrderStatusFilter === 'SHIPPED') {
          return ord.status === 'SHIPPED' || ord.status === 'IN TRANSIT';
        }
        return ord.status === activeOrderStatusFilter;
      });
    }

    if (orderSearchTerm) {
      filteredOrders = filteredOrders.filter(({ ord }) => {
        const q = orderSearchTerm.toLowerCase();
        const idMatch = ord.id && ord.id.toLowerCase().includes(q);
        const custMatch = ord.customer && ord.customer.toLowerCase().includes(q);
        const itemMatch = ord.items && ord.items.toLowerCase().includes(q);
        return idMatch || custMatch || itemMatch;
      });
    }

    if (filteredOrders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:36px;color:#888;font-family:var(--font-mono-sub);font-size:0.82rem;">
            ⚡ TIDAK ADA PESANAN YANG SESUAI FILTER ATAU PENCARIAN.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredOrders.map(({ ord, originalIdx }) => {
      const safeId = escapeHtml(ord.id);
      const safeCustomer = escapeHtml(ord.customer);
      const safeItems = escapeHtml(ord.items);
      const safeDate = escapeHtml(ord.date);
      const hasReceipt = Boolean(ord.receiptImage);
      const isNewOrder = ord.status === 'PENDING' || ord.status === 'PROCESSING';
      const isDelivered = ord.status === 'DELIVERED';
      const hasTracking = Boolean(ord.courier || ord.resi);

      const rowStyle = isNewOrder 
        ? 'background:rgba(255,230,0,0.06);border-left:4px solid var(--accent-yellow);'
        : (isDelivered ? 'border-left:4px solid #22c55e;' : 'border-left:4px solid transparent;');

      // Dynamic 1-Click CS WhatsApp Actions (Target Buyer Phone)
      const customerPhone = getCustomerWhatsAppNumber(ord);
      const orderCode = cleanOrderId(ord.id);
      const custName = (ord.customer || '').split('//')[0].replace(/\(.*?\)/g, '').trim() || 'Rider';

      let dynamicActionsHtml = '';
      const ordStatus = (ord.status || 'PENDING').toUpperCase();

      if (ordStatus === 'PENDING' || ordStatus === 'PENDING_PAYMENT') {
        dynamicActionsHtml = `
          <button type="button" class="btn-brutal-yellow btn-brutal-sm btn-action-p1" data-index="${originalIdx}" data-id="${safeId}" title="Kirim rincian tagihan & invoice via WhatsApp" style="padding:6px 10px;font-size:0.7rem;font-weight:900;cursor:pointer;">
            📩 KIRIM INVOICE WA
          </button>
          <button type="button" class="btn-brutal-sm btn-action-cancel" data-index="${originalIdx}" data-id="${safeId}" title="Batalkan pesanan ini" style="padding:6px 10px;font-size:0.7rem;background:#2a0f12;color:#f87171;border:1px solid #ef4444;cursor:pointer;font-weight:800;">
            ❌ BATALKAN
          </button>
        `;
      } else if (ordStatus === 'PAYMENT_REVIEW' || ordStatus === 'WAITING_VERIFICATION') {
        dynamicActionsHtml = `
          <button type="button" class="btn-brutal-sm btn-action-p2" data-index="${originalIdx}" data-id="${safeId}" title="Verifikasi pembayaran lunas & mulai proses" style="padding:6px 10px;font-size:0.7rem;background:#14301c;color:#4ade80;border:1px solid #22c55e;cursor:pointer;font-weight:900;">
            ✅ VERIFIKASI LUNAS
          </button>
          <button type="button" class="btn-brutal-sm btn-action-cancel" data-index="${originalIdx}" data-id="${safeId}" title="Tolak bukti & batalkan pesanan" style="padding:6px 10px;font-size:0.7rem;background:#2a0f12;color:#f87171;border:1px solid #ef4444;cursor:pointer;font-weight:800;">
            ❌ BATALKAN
          </button>
        `;
      } else if (ordStatus === 'PAID_PROCESSING' || ordStatus === 'PROCESSING' || ordStatus === 'PAID') {
        dynamicActionsHtml = `
          <button type="button" class="btn-brutal-sm btn-action-p3" data-index="${originalIdx}" data-id="${safeId}" title="Input Resi kurir dan update status ke SHIPPED" style="padding:6px 10px;font-size:0.7rem;background:#2a1b3d;color:#c084fc;border:1px solid #a855f7;cursor:pointer;font-weight:900;">
            📦 INPUT RESI &amp; SHIPPED
          </button>
        `;
      } else if (ordStatus === 'SHIPPED' || ordStatus === 'IN TRANSIT') {
        dynamicActionsHtml = `
          <button type="button" class="btn-brutal-sm btn-order-quick-delivered" data-index="${originalIdx}" data-id="${safeId}" title="Tandai pesanan diterima pelanggan" style="padding:6px 10px;font-size:0.7rem;background:#111;color:#4ade80;border:1px solid #22c55e;cursor:pointer;font-weight:900;">
            ✓ MARK DELIVERED
          </button>
        `;
      } else if (ordStatus === 'DELIVERED') {
        dynamicActionsHtml = `
          <button type="button" class="btn-brutal-sm btn-action-p4" data-index="${originalIdx}" data-id="${safeId}" title="Kirim ajakan ulasan / review ke WhatsApp pembeli" style="padding:6px 10px;font-size:0.7rem;background:#3b1024;color:var(--accent-pink);border:1px solid var(--accent-pink);cursor:pointer;font-weight:900;">
            ⭐ MINTA TESTIMONI
          </button>
        `;
      } else if (ordStatus === 'COMPLETED') {
        dynamicActionsHtml = `
          <span style="color:#4ade80;font-size:0.7rem;font-weight:900;padding:5px 8px;border:1px solid #22c55e44;background:#14301c33;">✓ SELESAI</span>
        `;
      } else {
        dynamicActionsHtml = `
          <span style="color:#ef4444;font-size:0.7rem;font-family:var(--font-mono-sub);padding:5px 8px;border:1px solid #ef444444;background:#30141433;font-weight:800;">❌ DIBATALKAN</span>
        `;
      }

      return `
        <tr style="${rowStyle}">
          <td style="padding:12px 14px;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span style="font-family:var(--font-headline);font-size:1.1rem;color:var(--accent-yellow);letter-spacing:0.04em;">#${safeId}</span>
              ${isNewOrder ? `<span class="zine-tag-yellow" style="font-size:0.62rem;padding:2px 6px;animation:pulseUrgency 1.5s infinite;">⚡ BARU</span>` : ''}
            </div>
            <div style="font-family:var(--font-mono-sub);font-size:0.7rem;color:#777;margin-top:2px;">${safeDate}</div>
            ${hasTracking ? `<div style="font-family:var(--font-mono-sub);font-size:0.68rem;color:#c084fc;margin-top:4px;">🚚 ${escapeHtml(ord.courier || 'Ekspedisi')}: <b>${escapeHtml(ord.resi || '-')}</b></div>` : ''}
          </td>
          <td style="padding:12px 14px;">
            <div style="font-weight:700;color:#FFF;">${safeCustomer}</div>
            ${customerPhone ? `<div style="font-family:var(--font-mono-sub);font-size:0.7rem;color:#888;margin-top:2px;">📱 +${customerPhone}</div>` : ''}
          </td>
          <td style="font-size:0.85rem;color:#AAA;padding:12px 14px;">
            ${safeItems}
          </td>
          <td style="font-family:var(--font-headline);font-size:1.15rem;color:var(--accent-yellow);font-weight:900;padding:12px 14px;">
            ${formatRupiah(ord.total)}
          </td>
          <td style="padding:12px 14px;">
            <button type="button" class="receipt-preview-btn btn-view-receipt" data-index="${originalIdx}" data-id="${safeId}">
              ${hasReceipt ? '📸 LIHAT BUKTI' : '+ LAMPIRKAN'}
            </button>
          </td>
          <td style="padding:12px 14px;">
            <select class="form-input-brutal order-status-select" data-index="${originalIdx}" style="padding:6px 10px;font-size:0.75rem;background:#111;color:#FFF;border-color:#444;width:auto;">
              <option value="PENDING" ${ord.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
              <option value="PENDING_PAYMENT" ${ord.status === 'PENDING_PAYMENT' ? 'selected' : ''}>PENDING_PAYMENT</option>
              <option value="PAID_PROCESSING" ${(ord.status === 'PAID_PROCESSING' || ord.status === 'PROCESSING') ? 'selected' : ''}>PAID_PROCESSING</option>
              <option value="SHIPPED" ${(ord.status === 'SHIPPED' || ord.status === 'IN TRANSIT') ? 'selected' : ''}>SHIPPED</option>
              <option value="DELIVERED" ${ord.status === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
              <option value="CANCELLED" ${ord.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
            </select>
          </td>
          <td style="text-align:right;white-space:nowrap;padding:12px 14px;">
            <div style="display:inline-flex;gap:4px;align-items:center;justify-content:flex-end;flex-wrap:wrap;">
              ${dynamicActionsHtml}
              ${customerPhone && customerPhone.length >= 10 ? `
                <a href="https://wa.me/${customerPhone}?text=Halo%20${encodeURIComponent(custName)}%2C%20kami%20dari%20Mustaz%20Craft%20terkait%20pesanan%20%23${encodeURIComponent(orderCode)}" target="_blank" class="btn-brutal-dark btn-brutal-sm" style="color:#4ade80;border-color:#22c55e;padding:6px 8px;font-size:0.7rem;" title="Chat WhatsApp Pembeli (${customerPhone})">
                  WA 💬
                </a>
              ` : `
                <a href="javascript:void(0)" onclick="alert('⚠️ Nomor WhatsApp pembeli tidak valid atau tidak tercantum pada pesanan #${safeId}.');" class="btn-brutal-dark btn-brutal-sm" style="color:#777;border-color:#444;padding:6px 8px;font-size:0.7rem;opacity:0.6;cursor:not-allowed;" title="Nomor WA pembeli tidak valid">
                  WA ❌
                </a>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.order-status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.index);
        const newStatus = e.target.value;
        const all = getAdminOrders();
        if (all[idx]) {
          all[idx].status = newStatus;
          localStorage.setItem('mustaz_admin_orders', JSON.stringify(all));

          updateCloudOrderStatus(all[idx].id, newStatus).catch(() => {});

          showAdminToast('success', 'STATUS DIPERBARUI', `Pesanan #${all[idx].id} diubah ke ${newStatus}.`);
          renderOrders();
        }
      });
    });

    // Fase 1: Kirim Rekening & Tagihan (Target Buyer WA)
    tbody.querySelectorAll('.btn-action-p1').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.index);
        const id = btn.dataset.id;
        const all = getAdminOrders();
        const ord = (id ? all.find(o => cleanOrderId(o.id) === cleanOrderId(id)) : null) || all[idx];
        if (!ord) return;

        const sent = openAdminWhatsAppAction(ord, 1);
        if (!sent) return;

        ord.status = 'PENDING_PAYMENT';
        localStorage.setItem('mustaz_admin_orders', JSON.stringify(all));
        updateCloudOrderStatus(ord.id, 'PENDING_PAYMENT').catch(() => {});

        showAdminToast('success', 'FASE 1: TAGIHAN DIKIRIM', `WhatsApp pembeli #${ord.id} terbuka. Status diubah ke PENDING_PAYMENT.`);
        renderOrders();
      });
    });

    // Fase 2: Verifikasi Pembayaran Lunas (Target Buyer WA)
    tbody.querySelectorAll('.btn-action-p2').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.index);
        const id = btn.dataset.id;
        const all = getAdminOrders();
        const ord = (id ? all.find(o => cleanOrderId(o.id) === cleanOrderId(id)) : null) || all[idx];
        if (!ord) return;

        const sent = openAdminWhatsAppAction(ord, 2);
        if (!sent) return;

        ord.status = 'PAID_PROCESSING';
        localStorage.setItem('mustaz_admin_orders', JSON.stringify(all));
        updateCloudOrderStatus(ord.id, 'PAID_PROCESSING').catch(() => {});

        showAdminToast('success', 'FASE 2: PEMBAYARAN LUNAS', `WhatsApp pembeli #${ord.id} terbuka. Status diubah ke PAID_PROCESSING.`);
        renderOrders();
      });
    });

    // Fase 3: Input Resi & Kirim ke WhatsApp
    tbody.querySelectorAll('.btn-action-p3').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = Number(btn.dataset.index);
        const id = btn.dataset.id;
        const all = getAdminOrders();
        const ord = (id ? all.find(o => cleanOrderId(o.id) === cleanOrderId(id)) : null) || all[idx];
        if (ord) {
          if (typeof openResiModal === 'function') {
            openResiModal(ord);
          } else if (typeof globalOpenResiModal === 'function') {
            globalOpenResiModal(ord);
          }
        }
      });
    });

    // Aksi Pembatalan Pesanan (Contextual Cancel)
    tbody.querySelectorAll('.btn-action-cancel').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.index);
        const id = btn.dataset.id;
        const all = getAdminOrders();
        const ord = (id ? all.find(o => cleanOrderId(o.id) === cleanOrderId(id)) : null) || all[idx];
        if (!ord) return;

        const confirmed = confirm(`⚠️ Apakah Anda yakin ingin membatalkan pesanan #${ord.id}?`);
        if (!confirmed) return;

        ord.status = 'CANCELLED';
        localStorage.setItem('mustaz_admin_orders', JSON.stringify(all));
        await updateCloudOrderStatus(ord.id, 'CANCELLED').catch(() => {});

        showAdminToast('warning', 'PESANAN DIBATALKAN', `Pesanan #${ord.id} telah dibatalkan.`);
        renderOrders();
      });
    });

    // Fase 4: Minta Review & Ulasan Pelanggan (Target Buyer WA)
    tbody.querySelectorAll('.btn-action-p4').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.index);
        const id = btn.dataset.id;
        const all = getAdminOrders();
        const ord = (id ? all.find(o => cleanOrderId(o.id) === cleanOrderId(id)) : null) || all[idx];
        if (!ord) return;

        const sent = openAdminWhatsAppAction(ord, 4);
        if (!sent) return;

        ord.status = 'COMPLETED';
        localStorage.setItem('mustaz_admin_orders', JSON.stringify(all));
        updateCloudOrderStatus(ord.id, 'COMPLETED').catch(() => {});

        showAdminToast('success', 'FASE 4: UNDANGAN ULASAN', `Link testimoni dikirim ke WhatsApp pembeli #${ord.id}. Status diubah ke COMPLETED.`);
        renderOrders();
      });
    });

    // Quick Mark Delivered
    tbody.querySelectorAll('.btn-order-quick-delivered').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.index);
        const id = btn.dataset.id;
        const all = getAdminOrders();
        const ord = (id ? all.find(o => cleanOrderId(o.id) === cleanOrderId(id)) : null) || all[idx];
        if (ord) {
          ord.status = 'DELIVERED';
          localStorage.setItem('mustaz_admin_orders', JSON.stringify(all));
          updateCloudOrderStatus(ord.id, 'DELIVERED').catch(() => {});
          showAdminToast('success', 'STATUS DELIVERED', `Pesanan #${ord.id} telah ditandai SELESAI (DELIVERED). Pembeli kini dapat memberikan ulasan.`);
          renderOrders();
        }
      });
    });

    tbody.querySelectorAll('.btn-view-receipt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = Number(btn.dataset.index);
        const id = btn.dataset.id;
        openReceiptModal(idx, id);
      });
    });
  }

  // Wire up filter tabs and search events (Usulan 2)
  document.querySelectorAll('#orderStatusFilterTabs .order-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#orderStatusFilterTabs .order-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeOrderStatusFilter = tab.dataset.status || 'ALL';
      renderOrders();
    });
  });

  document.getElementById('adminOrderSearchInput')?.addEventListener('input', (e) => {
    orderSearchTerm = e.target.value.toLowerCase().trim();
    renderOrders();
  });

  // Wire up Receipt Modal events (Usulan 3)
  document.getElementById('btnCloseReceiptModal')?.addEventListener('click', closeReceiptModal);
  document.getElementById('btnCancelReceiptModal')?.addEventListener('click', closeReceiptModal);
  document.getElementById('orderReceiptModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'orderReceiptModal') closeReceiptModal();
  });

  document.getElementById('receiptFileInput')?.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      stagedReceiptImage = evt.target.result;
      const imgEl = document.getElementById('receiptPreviewImg');
      const placeholderEl = document.getElementById('receiptPlaceholder');
      if (imgEl) {
        imgEl.src = stagedReceiptImage;
        imgEl.style.display = 'block';
      }
      if (placeholderEl) placeholderEl.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btnVerifyReceiptPaid')?.addEventListener('click', () => {
    if (currentReceiptOrderIndex === null) return;
    const orders = getAdminOrders();
    const ord = orders[currentReceiptOrderIndex];
    if (!ord) return;

    if (stagedReceiptImage) {
      ord.receiptImage = stagedReceiptImage;
    }
    ord.status = 'PAID_PROCESSING';
    localStorage.setItem('mustaz_admin_orders', JSON.stringify(orders));

    updateCloudOrderStatus(ord.id, 'PAID_PROCESSING').catch(() => {});

    showAdminToast('success', 'PEMBAYARAN DIVERIFIKASI', `Pesanan #${ord.id} telah diverifikasi LUNAS & bukti transfer tersimpan.`);
    closeReceiptModal();
    renderOrders();
  });

  document.getElementById('btnRefreshOrders')?.addEventListener('click', async () => {
    showAdminToast('info', 'SINKRONISASI...', 'Mengambil pesanan terbaru dari Supabase...');
    await syncAndRenderOrders(false);
    showAdminToast('success', 'TERHUBUNG', 'Daftar pesanan cloud telah diperbarui.');
  });

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


  // ─── 8C. RESI SHIPPING MODAL & CS LOGIC ─────────────────────────────────
  let pendingResiOrder = null;
  const resiModal = document.getElementById('csResiModal');

  function openResiModal(order) {
    if (!order) return;
    const modal = document.getElementById('csResiModal') || resiModal;
    if (!modal) return;
    pendingResiOrder = order;
    const orderIdClean = cleanOrderId(order.id);
    const custName = (order.customer || 'Rider').split('//')[0].replace(/\(.*?\)/g, '').trim() || 'Rider';
    const orderIdInput = document.getElementById('csResiOrderId');
    const custNameInput = document.getElementById('csResiCustomerName');
    const resiNumInput = document.getElementById('csResiNumber');
    const courierSelect = document.getElementById('csResiCourier');

    if (orderIdInput) orderIdInput.value = '#' + orderIdClean;
    if (custNameInput) custNameInput.value = custName;
    if (resiNumInput) resiNumInput.value = order.resi || ('JT-' + Math.floor(100000 + Math.random() * 900000));
    if (courierSelect && order.courier) courierSelect.value = order.courier;

    modal.classList.add('open');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  globalOpenResiModal = function(order) {
    openResiModal(order);
  };

  function closeResiModal() {
    const modal = document.getElementById('csResiModal') || resiModal;
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    pendingResiOrder = null;
  }

  document.getElementById('btnCsCloseResiModal')?.addEventListener('click', closeResiModal);
  document.getElementById('btnCsCancelResi')?.addEventListener('click', closeResiModal);
  document.getElementById('csResiModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'csResiModal') closeResiModal();
  });

  document.getElementById('btnCsSubmitResi')?.addEventListener('click', () => {
    if (!pendingResiOrder) return;
    const courier = document.getElementById('csResiCourier')?.value || 'J&T Express';
    const resiNum = (document.getElementById('csResiNumber')?.value || '').trim();
    if (!resiNum) {
      showAdminToast('error', 'RESI KOSONG', 'Nomor resi wajib diisi.');
      return;
    }

    const all = getAdminOrders();
    const ord = all.find(o => cleanOrderId(o.id) === cleanOrderId(pendingResiOrder.id)) || pendingResiOrder;
    ord.status = 'SHIPPED';
    ord.courier = courier;
    ord.resi = resiNum;

    localStorage.setItem('mustaz_admin_orders', JSON.stringify(all));
    updateCloudOrderStatus(ord.id, 'SHIPPED', { courier, resiNumber: resiNum }).catch(() => {});

    openAdminWhatsAppAction(ord, 3);

    showAdminToast('success', 'FASE 3: RESI DIKIRIM', `Status #${ord.id} diubah ke SHIPPED. WhatsApp pembeli terbuka membawa link tracking.`);
    closeResiModal();
    renderOrders();
  });

  // ─── 8D. FLASH SALE & PROMO MANAGER ENGINE ─────────────────────────────
  function initFlashSaleManager() {
    const titleInput = document.getElementById('fsCampaignTitle');
    const subtitleInput = document.getElementById('fsCampaignSubtitle');
    const startInput = document.getElementById('fsStartTimeInput');
    const endInput = document.getElementById('fsEndTimeInput');
    const toggleActive = document.getElementById('fsToggleActive');
    const btnSaveSchedule = document.getElementById('btnSaveFsSchedule');
    const statusIndicator = document.getElementById('fsStatusIndicator');

    const productSelect = document.getElementById('fsProductSelect');
    const origPriceDisplay = document.getElementById('fsOriginalPriceDisplay');
    const priceInput = document.getElementById('fsPriceInput');
    const stockInput = document.getElementById('fsStockInput');
    const discountPreview = document.getElementById('fsDiscountPreview');
    const btnAddProduct = document.getElementById('btnAddFsProduct');

    const productsTbody = document.getElementById('fsProductsTbody');
    const countBadge = document.getElementById('fsActiveCountBadge');
    const btnRefresh = document.getElementById('btnRefreshFlashSale');

    // Helper to format ISO to datetime-local
    function toDateTimeLocal(isoStr) {
      if (!isoStr) return '';
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    // Load config into inputs
    function loadFsConfig() {
      const cfg = getFlashSaleConfig();
      if (titleInput) titleInput.value = cfg.title || 'LIMITED DISPATCH';
      if (subtitleInput) subtitleInput.value = cfg.subtitle || 'POTONGAN HARGA S/D 30% // BERAKHIR MALAM INI';
      if (startInput) startInput.value = toDateTimeLocal(cfg.startTime);
      if (endInput) endInput.value = toDateTimeLocal(cfg.endTime);
      if (toggleActive) toggleActive.checked = Boolean(cfg.isActive);

      updateStatusIndicator(cfg);
    }

    function updateStatusIndicator(cfg) {
      if (!statusIndicator) return;
      const now = new Date();
      const start = cfg.startTime ? new Date(cfg.startTime) : null;
      const end = cfg.endTime ? new Date(cfg.endTime) : null;

      if (!cfg.isActive) {
        statusIndicator.textContent = '○ PROMO NONAKTIF';
        statusIndicator.style.color = '#888';
      } else if (end && now > end) {
        statusIndicator.textContent = '✕ WAKTU PROMO BERAKHIR';
        statusIndicator.style.color = '#ef4444';
      } else if (start && now < start) {
        statusIndicator.textContent = '⏳ PROMO DIJADWALKAN';
        statusIndicator.style.color = '#eab308';
      } else {
        statusIndicator.textContent = '● CAMPAIGN LIVE';
        statusIndicator.style.color = '#4ade80';
      }
    }

    // Populate products in select dropdown
    function populateFsProductSelect() {
      if (!productSelect) return;
      const parts = getDynamicParts();
      productSelect.innerHTML = '<option value="">-- PILIH DARI KATALOG PRODUK --</option>' +
        parts.map(p => `<option value="${p.id}" data-price="${p.price}" data-stock="${p.stock || 10}">${escapeHtml(p.name)} (${formatRupiah(p.price)})</option>`).join('');
    }

    productSelect?.addEventListener('change', () => {
      const opt = productSelect.selectedOptions[0];
      if (!opt || !opt.value) {
        if (origPriceDisplay) origPriceDisplay.value = 'Rp 0';
        if (discountPreview) discountPreview.textContent = '-0%';
        return;
      }
      const price = Number(opt.dataset.price) || 0;
      if (origPriceDisplay) origPriceDisplay.value = formatRupiah(price);
      updateDiscountPreview();
    });

    function updateDiscountPreview() {
      const opt = productSelect?.selectedOptions[0];
      const orig = opt ? Number(opt.dataset.price) || 0 : 0;
      const promo = Number(priceInput?.value) || 0;
      if (orig > 0 && promo > 0 && promo < orig) {
        const pct = Math.round(((orig - promo) / orig) * 100);
        if (discountPreview) discountPreview.textContent = `-${pct}% OFF`;
      } else {
        if (discountPreview) discountPreview.textContent = '-0%';
      }
    }

    if (priceInput) priceInput.addEventListener('input', updateDiscountPreview);

    // Save Countdown Schedule
    if (btnSaveSchedule) {
      btnSaveSchedule.addEventListener('click', () => {
        if (toggleActive?.checked && !endInput?.value) {
          showAdminToast('error', 'WAKTU BERAKHIR WAJIB DIISI', 'Tentukan tanggal dan jam berakhirnya promo Flash Sale.');
          return;
        }
        const startTime = startInput?.value ? new Date(startInput.value).toISOString() : new Date().toISOString();
        const endTime = endInput?.value ? new Date(endInput.value).toISOString() : '';
        const cfg = {
          title: (titleInput?.value || 'LIMITED DISPATCH').trim(),
          subtitle: (subtitleInput?.value || '').trim(),
          startTime,
          endTime,
          isActive: toggleActive ? toggleActive.checked : false
        };
        saveFlashSaleConfig(cfg);
        updateStatusIndicator(cfg);
        showAdminToast('success', 'JADWAL FLASH SALE DISIMPAN', 'Timer dan status promo home berhasil diperbarui.');
      });
    }

    // Add / Update Product in Flash Sale
    if (btnAddProduct) {
      btnAddProduct.addEventListener('click', () => {
        const prodId = productSelect?.value;
        if (!prodId) {
          showAdminToast('error', 'PRODUK BELUM DIPILIH', 'Silakan pilih produk dari katalog terlebih dahulu.');
          return;
        }
        const promoPrice = Number(priceInput?.value);
        if (!promoPrice || promoPrice <= 0) {
          showAdminToast('error', 'HARGA PROMO TIDAK VALID', 'Masukkan harga promo yang valid.');
          return;
        }
        const stockQuota = Number(stockInput?.value);
        if (!stockQuota || stockQuota <= 0) {
          showAdminToast('error', 'KUOTA STOK TIDAK VALID', 'Masukkan kuota stok promo yang valid.');
          return;
        }

        const cfg = getFlashSaleConfig();
        const fsData = {
          is_flash_sale: true,
          flash_sale_price: promoPrice,
          flash_sale_stock: stockQuota,
          flash_sale_start: cfg.startTime,
          flash_sale_end: cfg.endTime
        };

        setProductFlashSale(prodId, fsData);
        showAdminToast('success', 'PRODUK DIDAFTARKAN', 'Produk berhasil dimasukkan ke daftar Flash Sale.');
        
        // Reset input fields
        if (priceInput) priceInput.value = '';
        if (stockInput) stockInput.value = '';
        if (discountPreview) discountPreview.textContent = '-0%';
        renderFsProductsTable();
      });
    }

    // Render Flash Sale Products Table
    function renderFsProductsTable() {
      if (!productsTbody) return;
      const allParts = getDynamicParts();
      const fsProducts = allParts.filter(p => p.is_flash_sale || p.flash_sale_price);

      if (countBadge) countBadge.textContent = `${fsProducts.length} PRODUK PROMO`;

      if (fsProducts.length === 0) {
        productsTbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center;padding:32px 16px;color:#888;font-family:var(--font-mono-sub);">
              BELUM ADA PRODUK YANG DIDAFTARKAN DALAM FLASH SALE
            </td>
          </tr>
        `;
        return;
      }

      productsTbody.innerHTML = fsProducts.map(p => {
        const orig = Number(p.price) || 0;
        const promo = Number(p.flash_sale_price) || orig;
        const discountPct = orig > 0 && promo < orig ? Math.round(((orig - promo) / orig) * 100) : 0;
        const isActive = p.is_flash_sale !== false;
        const imgUrl = getProductImageUrl(p.image);

        return `
          <tr style="border-bottom:1px solid #222;">
            <td style="padding:12px 14px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <img src="${imgUrl}" alt="${escapeHtml(p.name)}" style="width:40px;height:40px;object-fit:cover;border:1px solid #333;" onerror="this.src='assets/images/placeholder.jpg';">
                <div>
                  <div style="font-weight:700;color:#FFF;font-size:0.9rem;">${escapeHtml(p.name)}</div>
                  <div style="font-size:0.72rem;color:#888;font-family:var(--font-mono-sub);">${escapeHtml(p.id)} // ${escapeHtml(p.category || 'PART')}</div>
                </div>
              </div>
            </td>
            <td style="padding:12px 14px;color:#888;text-decoration:line-through;font-size:0.85rem;">
              ${formatRupiah(orig)}
            </td>
            <td style="padding:12px 14px;font-family:var(--font-headline);font-size:1.1rem;color:#4ade80;font-weight:900;">
              ${formatRupiah(promo)}
            </td>
            <td style="padding:12px 14px;text-align:center;">
              <span class="zine-tag-pink" style="font-size:0.75rem;">-${discountPct}%</span>
            </td>
            <td style="padding:12px 14px;text-align:center;font-weight:800;color:var(--accent-yellow);">
              ${p.flash_sale_stock ?? 10} PCS
            </td>
            <td style="padding:12px 14px;text-align:center;">
              <button type="button" class="btn-toggle-fs-active" data-id="${p.id}" data-active="${isActive}" style="cursor:pointer;border:none;background:none;padding:0;">
                <span style="display:inline-block;padding:3px 8px;font-size:0.68rem;font-weight:800;border:1px solid ${isActive ? '#22c55e' : '#ef4444'};background:${isActive ? '#22c55e22' : '#ef444422'};color:${isActive ? '#4ade80' : '#f87171'};">
                  ${isActive ? '✓ AKTIF' : '✕ NONAKTIF'}
                </span>
              </button>
            </td>
            <td style="padding:12px 14px;text-align:right;">
              <button type="button" class="btn-remove-fs btn-brutal-dark btn-brutal-sm" data-id="${p.id}" style="font-size:0.7rem;padding:4px 8px;border-color:#ef4444;color:#ef4444;">
                HAPUS PROMO
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Toggle switch listener
      productsTbody.querySelectorAll('.btn-toggle-fs-active').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const currActive = btn.dataset.active === 'true';
          setProductFlashSale(id, { is_flash_sale: !currActive });
          showAdminToast('success', 'STATUS PROMO DIUBAH', `Produk kini ${!currActive ? 'AKTIF' : 'NONAKTIF'} dalam Flash Sale.`);
          renderFsProductsTable();
        });
      });

      // Remove from promo listener
      productsTbody.querySelectorAll('.btn-remove-fs').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const confirmed = await showBrutalConfirm({
            title: 'HAPUS DARI FLASH SALE?',
            message: 'Produk akan dikembalikan ke harga normal dan dihilangkan dari promo Flash Sale.',
            badge: 'PROMO REMOVAL',
            confirmText: 'YA, HAPUS',
            isDanger: true
          });
          if (confirmed) {
            setProductFlashSale(id, { is_flash_sale: false, flash_sale_price: null, flash_sale_stock: 0 });
            showAdminToast('success', 'PROMO DIHAPUS', 'Produk dikembalikan ke harga normal.');
            renderFsProductsTable();
          }
        });
      });
    }

    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        loadFsConfig();
        populateFsProductSelect();
        renderFsProductsTable();
        showAdminToast('success', 'FLASH SALE DISINKRONKAN', 'Data jadwal dan produk flash sale telah diperbarui.');
      });
    }

    // Init
    loadFsConfig();
    populateFsProductSelect();
    renderFsProductsTable();
  }

  // Global Escape key handler to close any active admin modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      try { closeReceiptModal(); } catch (_) {}
      try { closeResiModal(); } catch (_) {}
      try { closeEditModal(); } catch (_) {}
      try { closeDeleteModal(); } catch (_) {}
    }
  });

  // ─── 9. SAFE ASYNC BOOTSTRAP & ERROR ISOLATION ────────────────────────────
  function bindAdminEventListeners() {
    console.log('🔌 [Admin] Binding all UI event listeners & tabs...');
    try { initAdminTabs(); } catch (err) { console.error('Tab binding error:', err); }
    try { handleUrlRouting(); } catch (err) { console.error('URL routing error:', err); }
    try { updatePreview(); } catch (err) { console.error('Preview error:', err); }
  }

  async function loadAdminProducts() {
    console.log('📦 [Admin] Loading product inventory...');
    // 1. Immediately render from local storage / cache so inventory is never blank
    try {
      refreshAdminView();
    } catch (err) {
      console.warn('[Admin] Local inventory render warning:', err);
    }

    // 2. Fetch fresh products from cloud database safely
    try {
      await syncProductsFromCloud(false);
    } catch (err) {
      console.warn('[Admin] Cloud products sync warning:', err);
      try { refreshAdminView(); } catch (_) {}
    }
  }

  async function loadAdminOrders() {
    console.log('📋 [Admin] Loading orders list...');
    try {
      await syncAndRenderOrders(true);
    } catch (err) {
      console.warn('[Admin] Orders sync warning:', err);
    }
  }

  // Expose methods globally for external triggers & debugging
  window.bindAdminEventListeners = bindAdminEventListeners;
  window.loadAdminProducts = loadAdminProducts;
  window.loadAdminOrders = loadAdminOrders;
  window.fetchAdminOrders = () => syncAndRenderOrders(true);

  // Safe bootstrap execution pipeline
  try {
    console.log('🚀 Initializing Admin Dashboard...');

    // 1. Inisialisasi Event Listener DULU (Agar tombol & tab selalu bisa diklik)
    bindAdminEventListeners();

    // 2. Load Data Produk secara aman
    await loadAdminProducts();

    // 3. Load Data Orders secara aman
    await loadAdminOrders();

    // 4. Inisialisasi Flash Sale & Reviews
    try { initFlashSaleManager(); } catch (e) { console.warn('[Admin] Flash sale init error:', e); }
    try { renderAdminReviews(); } catch (e) { console.warn('[Admin] Reviews render error:', e); }

    // 5. Inisialisasi Supabase Realtime Subscription
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const ordersSubscription = supabase
          .channel('admin_realtime_orders')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
            console.log('⚡ [Supabase Realtime INSERT] Pesanan baru masuk:', payload);
            const newOrder = payload.new;
            playOrderNotificationSound();
            showNewOrderModalAlert(newOrder);
            if (typeof fetchAdminOrders === 'function') {
              fetchAdminOrders();
            } else {
              syncAndRenderOrders(true);
            }
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
            console.log('⚡ [Supabase Realtime UPDATE] Pesanan diperbarui:', payload);
            syncAndRenderOrders(true);
          })
          .subscribe((status) => {
            console.log('📡 [Supabase Realtime] admin_realtime_orders subscription status:', status);
          });

        window.adminOrdersSubscription = ordersSubscription;
      }
    } catch (err) {
      console.warn('[Admin] Realtime subscription init error:', err);
    }

    // 6. Verify admin session asynchronously
    try {
      enforceAdminRole().catch(err => console.warn('[Admin] Role check error:', err));
    } catch (err) {
      console.warn('[Admin] Enforce role call error:', err);
    }

  } catch (error) {
    console.error('❌ Admin Initialization Error:', error);
    showAdminToast('error', 'KESALAHAN SISTEM', 'Gagal memuat data dari database. Silakan klik Sync Supabase.');
  }

  // Periodic polling fallback every 12 seconds
  setInterval(() => {
    syncAndRenderOrders(true);
  }, 12000);
}

// Bootstrap dashboard immediately if DOM is already ready, or on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminDashboard);
} else {
  initAdminDashboard();
}

