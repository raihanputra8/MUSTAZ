/**
 * MUSTAZ CRAFT - Visual In-Page Inline CMS (Hover/Tap to Edit)
 * Allows active logged-in Admins to hover/tap and edit content directly on public pages.
 */

import { isKnownAdminEmail } from './services/authService.js';
import { fetchHomeContent, saveHomeContent, uploadSiteAsset } from './services/supabaseService.js';
import { showNotificationToast } from './components/modal.js';

let _activeTargetEl = null;
let _activeKey = null;
let _activeType = null;
let _cmsModalInjected = false;

/**
 * 1. Check if the current user is an authenticated Admin
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
 * 2. Load and apply stored page content for any visitor
 * Only updates elements if actual custom data exists in Supabase.
 */
export async function loadPageContent() {
  try {
    const content = await fetchHomeContent();
    if (!content || typeof content !== 'object') return;

    const editables = document.querySelectorAll('[data-key]');
    editables.forEach(el => {
      const key = el.dataset.key;
      if (!key || content[key] === undefined || content[key] === null) return;

      const val = content[key];
      if (typeof val !== 'string' || !val.trim()) return;

      if (el.tagName === 'IMG') {
        // Prevent broken default paths
        if (!val.includes('hero-main.jpg')) {
          el.src = val;
        }
      } else {
        // Only update if not identical to dummy fallback
        if (key === 'hero_title' && val === 'PET HELM / VISORS') return;
        if (key === 'hero_subtitle' && val.startsWith('High-voltage acid')) return;

        // Support HTML markup (e.g. <br>, <span> styling) or plain text
        if (val.includes('<') && val.includes('>')) {
          el.innerHTML = val;
        } else {
          el.textContent = val;
        }
      }
    });
  } catch (err) {
    console.warn('[Inline CMS] loadPageContent error, using fallback HTML:', err);
  }
}

/**
 * 3. Initialize Visual In-Page CMS
 */
export function initInlineCms() {
  // Load dynamic content for all visitors
  loadPageContent();

  const isAdmin = checkIsAdmin();
  if (!isAdmin) {
    document.body.classList.remove('is-admin-mode');
    return;
  }

  // Activate Admin Mode on Body
  document.body.classList.add('is-admin-mode');

  // Inject Floating Admin Status Pill
  injectAdminPill();

  // Inject Inline CMS Editor Modal
  injectCmsModal();

  // Wire Click / Tap event listeners for all [data-editable] elements
  wireEditableElements();
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
 * Inject the Inline Editor Modal Dialog
 */
function injectCmsModal() {
  if (_cmsModalInjected || document.getElementById('inlineCmsBackdrop')) return;
  _cmsModalInjected = true;

  const modalHtml = `
    <div class="inline-cms-backdrop" id="inlineCmsBackdrop" role="dialog" aria-modal="true" style="display:none;">
      <div class="inline-cms-modal" id="inlineCmsModal">
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
                Dapat menggunakan tag HTML seperti &lt;br&gt; atau &lt;span style="..."&gt; untuk styling ganda.
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
                Format file didukung: JPG, PNG, WEBP.
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
 * Open CMS Editor Modal for a given element
 */
function openCmsModal(targetEl) {
  _activeTargetEl = targetEl;
  _activeKey = targetEl.dataset.key || 'content_item';
  _activeType = (targetEl.dataset.editable || 'text').toLowerCase();

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

    const currentSrc = targetEl.tagName === 'IMG'
      ? targetEl.getAttribute('src')
      : (targetEl.querySelector('img')?.getAttribute('src') || '');

    if (imgPreview) imgPreview.src = currentSrc;
    if (fileInput) fileInput.value = '';
  } else {
    imageWrapper.style.display = 'none';
    textWrapper.style.display = 'block';

    if (textInput) {
      // If innerHTML contains tags, load innerHTML to preserve format; otherwise trimmed text
      textInput.value = targetEl.innerHTML.includes('<')
        ? targetEl.innerHTML.trim()
        : targetEl.textContent.trim();
    }
  }

  backdrop.style.display = 'flex';
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
    if (_activeType === 'text' && textInput) {
      textInput.focus();
    }
  });
}

/**
 * Close CMS Editor Modal
 */
function closeCmsModal() {
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
  btnSave.innerHTML = `<span class="material-symbols-outlined spin-fast">progress_activity</span> MENYIMPAN PERUBAHAN...`;

  try {
    let newValue = '';

    if (_activeType === 'image') {
      const file = fileInput.files && fileInput.files[0];
      if (file) {
        newValue = await uploadSiteAsset(file);
      } else {
        const previewSrc = document.getElementById('inlineCmsImgPreview')?.getAttribute('src');
        if (!previewSrc) throw new Error('Silakan pilih file gambar baru untuk diunggah.');
        newValue = previewSrc;
      }
    } else {
      newValue = textInput.value.trim();
      if (!newValue) throw new Error('Konten teks tidak boleh kosong.');
    }

    // 1. Persist to Supabase Database (public.home_content)
    await saveHomeContent({ [_activeKey]: newValue });

    // 2. Real-time in-place DOM update (No page reload)
    if (_activeType === 'image') {
      if (_activeTargetEl.tagName === 'IMG') {
        _activeTargetEl.src = newValue;
      } else {
        const img = _activeTargetEl.querySelector('img');
        if (img) img.src = newValue;
      }
    } else {
      if (newValue.includes('<') && newValue.includes('>')) {
        _activeTargetEl.innerHTML = newValue;
      } else {
        _activeTargetEl.textContent = newValue;
      }
    }

    // Also update any other element on the page sharing the same data-key
    document.querySelectorAll(`[data-key="${_activeKey}"]`).forEach(el => {
      if (el === _activeTargetEl) return;
      if (_activeType === 'image') {
        if (el.tagName === 'IMG') el.src = newValue;
        else el.querySelector('img')?.setAttribute('src', newValue);
      } else {
        if (newValue.includes('<') && newValue.includes('>')) {
          el.innerHTML = newValue;
        } else {
          el.textContent = newValue;
        }
      }
    });

    closeCmsModal();

    // Show toast confirmation
    showNotificationToast('Perubahan Berhasil Disimpan', 'success');
  } catch (err) {
    console.error('[Inline CMS Submit Error]:', err);
    if (errorBox) {
      errorBox.textContent = `Gagal menyimpan: ${err.message || 'Terjadi kesalahan sistem'}`;
      errorBox.style.display = 'block';
    }
  } finally {
    btnSave.disabled = false;
    btnSave.innerHTML = origBtnHtml;
  }
}

/**
 * Event Delegation for all [data-editable] elements
 */
function wireEditableElements() {
  document.addEventListener('click', (e) => {
    // Only active in Admin Mode
    if (!document.body.classList.contains('is-admin-mode')) return;

    // Find closest [data-editable] element
    const editable = e.target.closest('[data-editable]');
    if (!editable) return;

    // Don't intercept clicks inside the editor modal itself
    if (e.target.closest('#inlineCmsModal')) return;

    e.preventDefault();
    e.stopPropagation();
    openCmsModal(editable);
  }, true);
}
