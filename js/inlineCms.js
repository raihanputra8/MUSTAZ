/**
 * MUSTAZ CRAFT - Visual In-Page Inline CMS (Hover/Tap to Edit)
 * Allows active logged-in Admins to hover/tap and edit content directly on public pages.
 * Handles Storage upload to 'site-assets' and UPSERT to Supabase 'home_content'.
 */

import { isKnownAdminEmail, getSupabase } from './services/authService.js';
import { CONFIG } from './config.js';

let _activeTargetEl = null;
let _activeKey = null;
let _activeType = null;
let _cmsModalInjected = false;

/**
 * Brutalist Toast Notification for CMS Operations
 */
export function showCmsToast(message, isSuccess = true) {
  let toastEl = document.getElementById('inlineCmsToast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'inlineCmsToast';
    toastEl.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 1000002;
      background: #0d0d0d;
      border: 2px solid ${isSuccess ? 'var(--accent-pink)' : '#ef4444'};
      box-shadow: 6px 6px 0px #000;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;
      font-family: var(--font-headline);
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      transform: translateY(-20px);
      opacity: 0;
      transition: all 0.25s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toastEl);
  }
  toastEl.style.borderColor = isSuccess ? 'var(--accent-pink)' : '#ef4444';
  toastEl.innerHTML = `
    <span class="material-symbols-outlined" style="color:${isSuccess ? 'var(--accent-pink)' : '#ef4444'};font-size:22px;">
      ${isSuccess ? 'check_circle' : 'error'}
    </span>
    <span>${message}</span>
  `;
  requestAnimationFrame(() => {
    toastEl.style.transform = 'translateY(0)';
    toastEl.style.opacity = '1';
  });
  setTimeout(() => {
    toastEl.style.transform = 'translateY(-20px)';
    toastEl.style.opacity = '0';
  }, 3500);
}

/**
 * 1. Synchronous Fast-Check: Is current user an authenticated Admin?
 */
export function checkIsAdmin() {
  const isLoggedIn = localStorage.getItem('mustaz_auth_logged_in') === 'true';
  let profile = {};
  try {
    profile = JSON.parse(localStorage.getItem('mustaz_user_profile_data') || '{}');
  } catch {}

  const email = (profile.email || '').toLowerCase().trim();
  return isLoggedIn && (profile.role === 'admin' || isKnownAdminEmail(email));
}

/**
 * Async Verification: Checks Supabase Session / RPC / JWT for Admin status
 */
export async function verifyAdminStatusAsync() {
  try {
    const sb = await getSupabase();
    if (sb) {
      const { data: { session } } = await sb.auth.getSession();
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase().trim();
        if (isKnownAdminEmail(email)) return true;

        try {
          const { data: rpcAdmin } = await sb.rpc('is_admin');
          if (rpcAdmin === true) return true;
        } catch {}
      }
    }
  } catch {}
  return checkIsAdmin();
}

/**
 * 1. PERBAIKAN FUNGSI SIMPAN (UPSERT TO SUPABASE)
 * Mengunggah gambar ke Storage Bucket 'site-assets' dan menyimpan permanen ke tabel 'home_content'
 */
export async function saveCmsContent(key, value) {
  try {
    const supabase = await getSupabase();
    if (!supabase) throw new Error("Supabase Client tidak dapat diinisialisasi.");

    // 1. Upload ke Storage Bucket jika input berupa File Gambar
    let finalValue = value;
    if (value instanceof File) {
      const rawExt = value.name.split('.').pop() || 'png';
      const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = `home_${key}_${Date.now()}.${cleanExt}`;

      let { data: storageData, error: uploadErr } = await supabase.storage
        .from('site-assets')
        .upload(fileName, value, { upsert: true });

      if (uploadErr) {
        console.warn('[Storage] Upload ke site-assets gagal, mencoba fallback product-images:', uploadErr.message);
        const fallbackRes = await supabase.storage
          .from('product-images')
          .upload(fileName, value, { upsert: true });

        if (fallbackRes.error) {
          throw uploadErr;
        }

        const { data: fallbackUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        finalValue = fallbackUrlData.publicUrl;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('site-assets')
          .getPublicUrl(fileName);

        finalValue = publicUrlData.publicUrl;
      }
    }

    // 2. Simpan URL/Teks Permanen ke Tabel Database Supabase
    const { error: dbErr } = await supabase
      .from('home_content')
      .upsert({ 
        section_id: key, 
        content_value: String(finalValue).trim(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'section_id' });

    if (dbErr) {
      console.error("[Supabase UPSERT Error]:", dbErr);
      throw dbErr;
    }

    // Perbarui cache lokal agar instan sinkron antar halaman
    try {
      const cached = JSON.parse(localStorage.getItem('mustaz_home_content') || '{}');
      cached[key] = finalValue;
      localStorage.setItem('mustaz_home_content', JSON.stringify(cached));
    } catch {}

    // 3. Perbarui atribut DOM lokal
    const elements = document.querySelectorAll(`[data-key="${key}"]`);
    elements.forEach(el => {
      if (el.tagName === 'IMG') {
        el.src = finalValue;
      } else if (el.querySelector('img')) {
        const innerImg = el.querySelector('img');
        if (innerImg) innerImg.src = finalValue;
      } else {
        if (typeof finalValue === 'string' && finalValue.includes('<') && finalValue.includes('>')) {
          el.innerHTML = finalValue;
        } else {
          el.textContent = finalValue;
        }
      }
    });

    showCmsToast("Perubahan Berhasil Disimpan Permanen!", true);
    return finalValue;
  } catch (err) {
    console.error("Gagal menyimpan ke Supabase:", err);
    showCmsToast(`Gagal Menyimpan ke Database: ${err.message || 'Error'}`, false);
    throw err;
  }
}

const CMS_IMAGE_FALLBACKS = {
  hero_banner_image: 'assets/images/pet_visor_yellow_flame.webp',
  about_banner_image: 'assets/images/mustaz_booth_event.webp'
};

export function applyContentToDOM(contentMap) {
  const mergedMap = { ...CMS_IMAGE_FALLBACKS, ...(contentMap || {}) };
  Object.keys(mergedMap).forEach(key => {
    const val = mergedMap[key];
    if (val === undefined || val === null) return;
    const elements = document.querySelectorAll(`[data-key="${key}"]`);
    elements.forEach(el => {
      if (el.tagName === 'IMG') {
        if (val && el.src !== val) {
          el.src = val;
          el.classList.remove('cms-image-loading');
        }
      } else if (el.querySelector('img')) {
        const innerImg = el.querySelector('img');
        if (innerImg && val && innerImg.src !== val) {
          innerImg.src = val;
          innerImg.classList.remove('cms-image-loading');
        }
      } else {
        if (val) {
          if (typeof val === 'string' && val.includes('<') && val.includes('>')) {
            el.innerHTML = val;
          } else {
            el.textContent = val;
          }
        }
      }
    });
  });
}

/**
 * 2. OPTIMASI LOAD WITH LOCALSTORAGE CACHE (INSTANT DISPLAY - 0ms NO FLICKER)
 * Membaca cache lokal seketika tanpa menunggu API Supabase, lalu sync background
 */
export async function loadPageContent() {
  // 1. Render dari Local Storage Cache terlebih dahulu (Instant - No Flicker)
  try {
    const cachedContent = localStorage.getItem('mustaz_home_content_cache') || localStorage.getItem('mustaz_home_content');
    if (cachedContent) {
      applyContentToDOM(JSON.parse(cachedContent));
    }
  } catch (err) {
    console.warn("[Inline CMS] Gagal render dari cache lokal:", err);
  }

  // 2. Fetch data terbaru dari Supabase (Background Sync)
  try {
    const supabase = await getSupabase();
    if (!supabase) return;

    const { data, error } = await supabase
      .from('home_content')
      .select('section_id, content_value');

    if (!error && data && Array.isArray(data)) {
      const contentMap = {};
      data.forEach(item => {
        if (item.section_id && item.content_value) {
          contentMap[item.section_id] = item.content_value;
        }
      });

      // Update DOM & Perbarui Cache
      applyContentToDOM(contentMap);
      localStorage.setItem('mustaz_home_content_cache', JSON.stringify(contentMap));
      localStorage.setItem('mustaz_home_content', JSON.stringify(contentMap));
    }
  } catch (err) {
    console.warn("Gagal sinkronisasi data CMS dari server:", err);
  }
}

/**
 * Inject the Inline Editor Modal Dialog
 */
export function injectCmsModal() {
  if (document.getElementById('inlineCmsBackdrop')) return;
  _cmsModalInjected = true;

  const modalHtml = `
    <div class="inline-cms-backdrop" id="inlineCmsBackdrop" role="dialog" aria-modal="true" style="display:none;z-index:1000001;">
      <div class="inline-cms-modal" id="inlineCmsModal" style="z-index:1000002;">
        <div class="inline-cms-header">
          <div class="inline-cms-title">
            <span class="material-symbols-outlined" style="color:var(--accent-pink);font-size:20px;">edit_note</span>
            <span id="inlineCmsHeaderKey">EDIT KONTEN</span>
          </div>
          <button id="btnCloseInlineCms" class="bottom-sheet-close-btn" type="button" aria-label="Tutup">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="inline-cms-body">
          <form id="inlineCmsForm" novalidate>
            <!-- TEXT FIELD WRAPPER -->
            <div id="inlineCmsTextWrapper" style="display:none;margin-bottom:18px;">
              <label class="form-label-brutal" for="inlineCmsTextInput">ISI TEKS / HTML</label>
              <textarea id="inlineCmsTextInput" class="form-input-brutal" rows="6" style="resize:vertical;font-family:inherit;line-height:1.5;"></textarea>
              <p style="font-size:0.75rem;color:#888;margin-top:6px;font-family:var(--font-mono-sub);">
                Dapat menggunakan tag HTML seperti &lt;br&gt; atau &lt;span style="..."&gt; untuk penyesuaian gaya.
              </p>
            </div>

            <!-- IMAGE FIELD WRAPPER -->
            <div id="inlineCmsImageWrapper" style="display:none;margin-bottom:18px;">
              <label class="form-label-brutal">PRATINJAU GAMBAR SAAT INI</label>
              <div class="inline-cms-preview-image-box">
                <img id="inlineCmsImgPreview" src="" alt="Preview" />
              </div>

              <label class="form-label-brutal" for="inlineCmsFileInput">UNGGAH FOTO BARU</label>
              <input type="file" id="inlineCmsFileInput" class="form-input-brutal" accept="image/*" style="padding:10px;" />
              <p style="font-size:0.75rem;color:#888;margin-top:6px;font-family:var(--font-mono-sub);">
                Format file didukung: JPG, PNG, WEBP. Otomatis diunggah ke Storage Bucket 'site-assets'.
              </p>
            </div>

            <div id="inlineCmsError" style="display:none;color:var(--accent-pink);font-family:var(--font-mono-sub);font-size:0.85rem;margin-bottom:16px;padding:10px;background:rgba(217,0,108,0.1);border:1px solid var(--accent-pink);"></div>

            <button type="submit" id="btnSaveInlineCms" class="btn-brutal-pink full-width" style="width:100%;padding:14px;font-size:1rem;font-weight:900;letter-spacing:0.05em;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:4px 4px 0px #000;cursor:pointer;">
              <span class="material-symbols-outlined">save</span>
              [ SIMPAN PERUBAHAN ]
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Bind close buttons & backdrop click
  const backdrop = document.getElementById('inlineCmsBackdrop');
  const btnClose = document.getElementById('btnCloseInlineCms');
  const form = document.getElementById('inlineCmsForm');

  btnClose?.addEventListener('click', closeCmsModal);
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeCmsModal();
  });

  // Handle Image input file preview
  const fileInput = document.getElementById('inlineCmsFileInput');
  const imgPreview = document.getElementById('inlineCmsImgPreview');
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && imgPreview) {
      const reader = new FileReader();
      reader.onload = (re) => {
        imgPreview.src = re.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle Form Submit
  form?.addEventListener('submit', handleCmsFormSubmit);
}

/**
 * Open Inline Editor Modal for a clicked element
 */
export function openInlineEditorModal(target, editType, key) {
  injectCmsModal();

  _activeTargetEl = target;
  _activeKey = key || target.getAttribute('data-key') || 'content_item';
  _activeType = (editType || target.getAttribute('data-editable') || 'text').toLowerCase();

  const backdrop = document.getElementById('inlineCmsBackdrop');
  const headerKey = document.getElementById('inlineCmsHeaderKey');
  const textWrapper = document.getElementById('inlineCmsTextWrapper');
  const textInput = document.getElementById('inlineCmsTextInput');
  const imageWrapper = document.getElementById('inlineCmsImageWrapper');
  const imgPreview = document.getElementById('inlineCmsImgPreview');
  const fileInput = document.getElementById('inlineCmsFileInput');
  const errorBox = document.getElementById('inlineCmsError');

  if (!backdrop) return;
  if (errorBox) errorBox.style.display = 'none';

  headerKey.textContent = `EDIT // [ ${String(_activeKey).toUpperCase()} ]`;

  if (_activeType === 'image') {
    textWrapper.style.display = 'none';
    imageWrapper.style.display = 'block';

    let currentSrc = '';
    if (target.tagName === 'IMG') {
      currentSrc = target.getAttribute('src') || '';
    } else {
      const innerImg = target.querySelector('img');
      currentSrc = innerImg ? innerImg.getAttribute('src') : '';
    }

    if (imgPreview) imgPreview.src = currentSrc;
    if (fileInput) fileInput.value = '';
  } else {
    imageWrapper.style.display = 'none';
    textWrapper.style.display = 'block';

    if (textInput) {
      textInput.value = target.innerHTML.includes('<')
        ? target.innerHTML.trim()
        : target.textContent.trim();
    }
  }

  backdrop.style.setProperty('display', 'flex', 'important');
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
    if (_activeType === 'text' && textInput) {
      setTimeout(() => textInput.focus(), 50);
    }
  });
}

// Alias for backwards compatibility
export const openCmsModal = openInlineEditorModal;

/**
 * Close CMS Editor Modal
 */
export function closeCmsModal() {
  const backdrop = document.getElementById('inlineCmsBackdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    setTimeout(() => {
      backdrop.style.display = 'none';
    }, 200);
  }
  _activeTargetEl = null;
  _activeKey = null;
  _activeType = null;
}

/**
 * Handle CMS Form Submit & Persistence
 */
async function handleCmsFormSubmit(e) {
  e.preventDefault();
  if (!_activeTargetEl || !_activeKey) return;

  const btnSave = document.getElementById('btnSaveInlineCms');
  const errorBox = document.getElementById('inlineCmsError');
  const textInput = document.getElementById('inlineCmsTextInput');
  const fileInput = document.getElementById('inlineCmsFileInput');

  if (errorBox) errorBox.style.display = 'none';

  const origBtnHtml = btnSave.innerHTML;
  btnSave.disabled = true;
  btnSave.innerHTML = `<span class="material-symbols-outlined spin-fast">progress_activity</span> MENYIMPAN KE SUPABASE...`;

  try {
    const isImage = _activeType === 'image' || _activeKey.endsWith('_image');
    let valueToSave = '';

    if (isImage) {
      const file = fileInput.files && fileInput.files[0];
      if (file) {
        valueToSave = file;
      } else {
        const previewSrc = document.getElementById('inlineCmsImgPreview')?.getAttribute('src');
        if (!previewSrc) throw new Error('Silakan pilih file gambar baru untuk diunggah.');
        valueToSave = previewSrc;
      }
    } else {
      valueToSave = textInput.value.trim();
      if (!valueToSave) throw new Error('Konten teks tidak boleh kosong.');
    }

    // Call saveCmsContent
    await saveCmsContent(_activeKey, valueToSave);

    closeCmsModal();
  } catch (err) {
    console.error('[Inline CMS Submit Error]:', err);
    if (errorBox) {
      errorBox.textContent = `Gagal menyimpan ke Supabase: ${err.message || 'Terjadi kesalahan sistem'}`;
      errorBox.style.display = 'block';
    }
  } finally {
    btnSave.disabled = false;
    btnSave.innerHTML = origBtnHtml;
  }
}

/**
 * Floating Admin Status Pill
 */
function injectAdminPill() {
  if (document.getElementById('adminCmsFloatingPill')) return;

  const pill = document.createElement('div');
  pill.id = 'adminCmsFloatingPill';
  pill.className = 'admin-cms-floating-pill';
  pill.innerHTML = `
    <span class="pulse-dot"></span>
    <span>ADMIN CMS ACTIVE // TAP TO EDIT</span>
    <a href="admin.html" style="color:var(--accent-pink);margin-left:6px;text-decoration:underline;">DASHBOARD ↗</a>
  `;
  document.body.appendChild(pill);
}

/**
 * Global Click & Tap Event Delegation
 */
function attachGlobalClickListener() {
  const clickHandler = (e) => {
    if (!document.body.classList.contains('is-admin-mode')) return;

    // Don't intercept clicks inside the editor modal or the floating pill
    if (e.target.closest('#inlineCmsModal') || e.target.closest('#adminCmsFloatingPill')) return;

    const target = e.target.closest('[data-editable]');
    if (target) {
      e.preventDefault();
      e.stopPropagation();

      const editType = target.getAttribute('data-editable') || 'text';
      const key = target.getAttribute('data-key');

      // Open Modal Editor for clicked element
      openInlineEditorModal(target, editType, key);
    }
  };

  document.addEventListener('click', clickHandler, true);
}

// Attach listener immediately on script load
if (typeof document !== 'undefined') {
  attachGlobalClickListener();
  window.openInlineEditorModal = openInlineEditorModal;
  window.saveCmsContent = saveCmsContent;
  window.loadPageContent = loadPageContent;
  window.showCmsToast = showCmsToast;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPageContent);
  } else {
    loadPageContent();
  }
}

/**
 * 3. Initialize Visual In-Page CMS
 */
export function initInlineCms() {
  // Load dynamic content for all visitors
  loadPageContent();

  const syncAdminUI = (isAdmin) => {
    if (isAdmin) {
      document.body.classList.add('is-admin-mode');
      injectAdminPill();
      injectCmsModal();
    } else {
      document.body.classList.remove('is-admin-mode');
      document.getElementById('adminCmsFloatingPill')?.remove();
    }
  };

  // Immediate synchronous check from stored state
  syncAdminUI(checkIsAdmin());

  // Background async verification with Supabase
  verifyAdminStatusAsync().then(isAdmin => {
    syncAdminUI(isAdmin);
  }).catch(() => {});

  // Listen for auth changes
  window.addEventListener('mustaz:auth_synced', (e) => {
    const profile = e.detail || {};
    const email = (profile.email || '').toLowerCase().trim();
    const isAdmin = profile.role === 'admin' || isKnownAdminEmail(email);
    syncAdminUI(isAdmin);
  });

  window.addEventListener('mustaz:logout', () => {
    syncAdminUI(false);
  });
}

export const initInlineCMS = initInlineCms;
