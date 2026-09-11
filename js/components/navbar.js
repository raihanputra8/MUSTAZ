/**
 * MUSTAZ Garage Zine - Navigation & Mobile Drawer
 */

import { openCart } from './cart.js';
import { getActiveCurrency, setActiveCurrency } from '../services/cartService.js';
import { isKnownAdminEmail } from '../services/authService.js';

let _navbarEventsWired = false;

export function initNavbar() {
  const header = document.querySelector('header');
  if (!header) return;

  // 0. Mount and Sync Multi-Currency Dropdown (Desktop & Mobile)
  function syncCurrencySwitchers() {
    const currentCurrency = getActiveCurrency();

    // Desktop Header Switcher
    const actions = header.querySelector('.nav-actions');
    if (actions) {
      let slot = actions.querySelector('#headerCurrencySlot');
      if (!slot) {
        slot = document.createElement('div');
        slot.id = 'headerCurrencySlot';
        slot.className = 'currency-switcher-slot';
        slot.style.cssText = 'display:inline-flex;align-items:center;margin:0 2px;';
        slot.innerHTML = `
          <select id="headerCurrencySelect" aria-label="Select Currency" style="
            background: #0d0d0d;
            color: var(--accent-yellow);
            border: 2px solid #333;
            font-family: var(--font-mono-sub);
            font-size: 0.72rem;
            font-weight: 800;
            padding: 4px 8px;
            height: 38px;
            cursor: pointer;
            outline: none;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            box-shadow: 2px 2px 0px #000;
            transition: all 0.15s ease;
          ">
            <option value="IDR">IDR (Rp)</option>
            <option value="USD">USD ($)</option>
          </select>
        `;
        // Insert right before headerCartBtn or headerAuthBtn
        const cartBtn = actions.querySelector('#headerCartBtn') || actions.querySelector('.mobile-menu-toggle');
        actions.insertBefore(slot, cartBtn);

        const select = slot.querySelector('#headerCurrencySelect');
        select?.addEventListener('change', (e) => {
          setActiveCurrency(e.target.value);
        });
      }
      const select = slot.querySelector('#headerCurrencySelect');
      if (select && select.value !== currentCurrency) {
        select.value = currentCurrency;
      }
    }

    // Mobile Drawer Switcher
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    if (mobileDrawer) {
      let mobSlot = mobileDrawer.querySelector('#mobileCurrencySlot');
      if (!mobSlot) {
        mobSlot = document.createElement('div');
        mobSlot.id = 'mobileCurrencySlot';
        mobSlot.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px dashed #333;border-bottom:1px dashed #333;margin:14px 0;';
        mobSlot.innerHTML = `
          <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;font-weight:800;letter-spacing:0.08em;">CURRENCY / MATA UANG:</span>
          <select id="mobileCurrencySelect" style="
            background: #161616;
            color: var(--accent-yellow);
            border: 2px solid #333;
            font-family: var(--font-mono-sub);
            font-size: 0.75rem;
            font-weight: 800;
            padding: 5px 10px;
            cursor: pointer;
            box-shadow: 2px 2px 0px #000;
            outline: none;
          ">
            <option value="IDR">IDR (Rp)</option>
            <option value="USD">USD ($)</option>
          </select>
        `;
        const mobLinks = mobileDrawer.querySelector('.mobile-nav-link:last-of-type');
        if (mobLinks) {
          mobLinks.after(mobSlot);
        } else {
          mobileDrawer.prepend(mobSlot);
        }

        const mobSelect = mobSlot.querySelector('#mobileCurrencySelect');
        mobSelect?.addEventListener('change', (e) => {
          setActiveCurrency(e.target.value);
        });
      }
      const mobSelect = mobSlot.querySelector('#mobileCurrencySelect');
      if (mobSelect && mobSelect.value !== currentCurrency) {
        mobSelect.value = currentCurrency;
      }
    }
  }

  syncCurrencySwitchers();

  // 1. Synchronize Authentication Status & Logout Buttons across navigation & footer
  function syncNavbarState() {
    const isLoggedIn = localStorage.getItem('mustaz_auth_logged_in') === 'true';
    let profile = {};
    try {
      profile = JSON.parse(localStorage.getItem('mustaz_user_profile_data') || '{}');
    } catch {}

    const email = (profile.email || '').toLowerCase().trim();
    const isAdmin = isLoggedIn && (profile.role === 'admin' || isKnownAdminEmail(email));
    const onAdminPage = window.location.pathname.includes('admin.html') || window.location.pathname.endsWith('/admin');

    // Update 'ADMIN' link in navbar: STRICTLY visible only if admin, NEVER for ordinary users
    const adminNavLinks = document.querySelectorAll('.nav-link-admin, a[href="admin.html"], a[href="/admin.html"], a[href="admin"], a[href="/admin"]');
    adminNavLinks.forEach(link => {
      link.setAttribute('href', '/admin');
      // Don't hide the nav link if we are actively inside admin.html dashboard
      if (onAdminPage) {
        link.style.display = 'inline-block';
        return;
      }
      if (isAdmin) {
        link.style.setProperty('display', 'inline-block', 'important');
        link.classList.add('is-admin');
      } else {
        link.style.setProperty('display', 'none', 'important');
        link.classList.remove('is-admin');
      }
    });

    // Update Person Icon in navbar:
    const personIcons = header.querySelectorAll('a[aria-label="Admin Dashboard"], a[aria-label="My Account"], a[title="Admin Dashboard"], a[title="My Account"], .nav-btn-icon[href*="admin"], .nav-btn-icon[href*="account"], .nav-btn-icon[href*="login"]');
    personIcons.forEach(icon => {
      if (isAdmin) {
        icon.setAttribute('href', '/admin');
        icon.setAttribute('title', 'Admin Dashboard (' + (profile.fullName || 'Admin') + ')');
        icon.setAttribute('aria-label', 'Admin Dashboard');
      } else if (isLoggedIn) {
        icon.setAttribute('href', 'account.html');
        icon.setAttribute('title', 'Akun Saya (' + (profile.fullName || 'Member') + ')');
        icon.setAttribute('aria-label', 'My Account');
      } else {
        icon.setAttribute('href', 'login.html');
        icon.setAttribute('title', 'Masuk / Login');
        icon.setAttribute('aria-label', 'Login');
      }
    });

    // Dynamic Logout button in desktop header (40x40 square icon button to prevent layout shifts)
    const actions = header.querySelector('.nav-actions');
    if (actions) {
      let authBtn = actions.querySelector('#headerAuthBtn');
      if (!authBtn) {
        authBtn = document.createElement('div');
        authBtn.id = 'headerAuthBtn';
        authBtn.className = 'header-auth-slot';
        const mobToggle = actions.querySelector('.mobile-menu-toggle');
        actions.insertBefore(authBtn, mobToggle);
      }

      // Remove any duplicate old static signin button
      const oldSignIn = actions.querySelector('#headerSignInBtn');
      if (oldSignIn) oldSignIn.remove();

      const expectedMode = isLoggedIn ? 'logout' : 'none';
      if (authBtn.dataset.mode !== expectedMode) {
        authBtn.dataset.mode = expectedMode;
        if (isLoggedIn) {
          authBtn.style.display = 'inline-flex';
          authBtn.innerHTML = `
            <button id="globalNavLogoutBtn" class="nav-btn-icon" style="border-color:#ef4444;color:#ef4444;width:40px;height:40px;" title="Keluar / Ganti Akun (${profile.fullName || profile.email || 'Member'})" aria-label="Keluar / Ganti Akun">
              <span class="material-symbols-outlined" style="font-size:20px;">logout</span>
            </button>
          `;
          authBtn.querySelector('#globalNavLogoutBtn')?.addEventListener('click', async () => {
            const { showBrutalConfirm } = await import('./modal.js');
            const confirmed = await showBrutalConfirm({
              title: 'YAKIN INGIN LOG OUT?',
              message: 'Anda dapat masuk kembali atau berganti ke akun user biasa.',
              badge: 'AUTH // SIGN OUT',
              confirmText: 'YA, LOG OUT',
              cancelText: 'BATAL',
              isDanger: true
            });
            if (confirmed) {
              const { logoutUser } = await import('../services/authService.js');
              await logoutUser();
              window.location.href = 'login.html';
            }
          });
        } else {
          // When logged out, Person icon handles login cleanly with zero layout shift
          authBtn.style.display = 'none';
          authBtn.innerHTML = '';
        }
      }
    }

    // Dynamic Auth area in Mobile Navigation Drawer
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    if (mobileDrawer) {
      const mobAdminLinks = mobileDrawer.querySelectorAll('.mobile-admin-link, a[href="admin.html"], a[href="/admin.html"], a[href="admin"]');
      mobAdminLinks.forEach(link => {
        if (onAdminPage) {
          link.style.display = 'flex';
          return;
        }
        if (isAdmin) {
          link.style.setProperty('display', 'flex', 'important');
          link.classList.add('is-admin');
        } else {
          link.style.setProperty('display', 'none', 'important');
          link.classList.remove('is-admin');
        }
      });

      let mobAuthArea = mobileDrawer.querySelector('.mobile-auth-area');
      if (!mobAuthArea) {
        mobAuthArea = document.createElement('div');
        mobAuthArea.className = 'mobile-auth-area';
        mobAuthArea.style.marginTop = 'auto';
        mobAuthArea.style.paddingTop = '16px';
        mobAuthArea.style.borderTop = '1px dashed #333';
        mobileDrawer.appendChild(mobAuthArea);
      }

      if (isLoggedIn) {
        mobAuthArea.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:0.75rem;color:#888;">STATUS: <strong style="color:${isAdmin ? 'var(--accent-yellow)' : '#4ade80'};">${isAdmin ? 'ADMIN' : 'USER BIASA'}</strong></span>
            <span style="font-size:0.7rem;color:#AAA;">${profile.email || ''}</span>
          </div>
          <a href="${isAdmin ? '/admin' : 'account.html'}" class="mobile-nav-link" style="padding:10px 0;font-size:1.05rem;color:var(--accent-yellow);display:flex;align-items:center;justify-content:space-between;text-decoration:none;border-bottom:1px solid #222;margin-bottom:12px;">
            <span>${isAdmin ? 'ADMIN DASHBOARD' : 'AKUN SAYA // PROFILE'}</span>
            <span class="material-symbols-outlined">${isAdmin ? 'shield_person' : 'person'}</span>
          </a>
          <button id="mobileNavLogoutBtn" style="width:100%;background:#b91c1c;color:#FFF;border:2px solid #ef4444;font-weight:900;padding:10px;font-family:var(--font-headline);display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;">
            <span class="material-symbols-outlined">logout</span>
            <span>LOG OUT (GANTI AKUN)</span>
          </button>
        `;
        mobAuthArea.querySelector('#mobileNavLogoutBtn')?.addEventListener('click', async () => {
          const { showBrutalConfirm } = await import('./modal.js');
          const confirmed = await showBrutalConfirm({
            title: 'YAKIN INGIN LOG OUT?',
            message: 'Anda dapat masuk kembali atau berganti ke akun user biasa.',
            badge: 'AUTH // SIGN OUT',
            confirmText: 'YA, LOG OUT',
            cancelText: 'BATAL',
            isDanger: true
          });
          if (confirmed) {
            const { logoutUser } = await import('../services/authService.js');
            await logoutUser();
            window.location.href = 'login.html';
          }
        });
      } else {
        mobAuthArea.innerHTML = `
          <a href="login.html" style="color:var(--accent-pink);font-family:var(--font-headline);font-size:1.1rem;text-transform:uppercase;text-decoration:none;display:flex;align-items:center;justify-content:space-between;">
            <span>MEMBER LOGIN →</span>
            <span class="material-symbols-outlined">login</span>
          </a>
        `;
      }
    }
  }

  syncNavbarState();

  // 2. Determine active route (handles clean URLs on Vercel e.g. /parts, /kulture, /helmets, /)
  const pathname = window.location.pathname.toLowerCase();
  const pathSegment = pathname.split('/').filter(Boolean).pop() || 'index';
  const currentBase = pathSegment.replace(/\.html$/, '');

  header.querySelectorAll('.nav-link').forEach(link => {
    if (link.classList.contains('nav-link-admin')) return;
    const rawHref = (link.getAttribute('href') || '').toLowerCase().trim();
    const hrefBase = rawHref.split('/').filter(Boolean).pop()?.replace(/\.html$/, '') || '';

    const isMatch = (hrefBase === currentBase) ||
                    ((currentBase === 'index' || currentBase === '') && (hrefBase === 'index' || hrefBase === ''));

    if (isMatch) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Attach event listeners only once
  if (_navbarEventsWired) return;
  _navbarEventsWired = true;

  window.addEventListener('mustaz:auth_synced', syncNavbarState);
  window.addEventListener('mustaz:logout', syncNavbarState);
  window.addEventListener('mustaz:currency_changed', syncCurrencySwitchers);

  // Wire cart open on cart buttons
  document.querySelectorAll('[data-open-cart], #headerCartBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  });

  // Mobile drawer toggle
  const mobileToggle = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const hamburgerIcon = document.getElementById('hamburgerIcon');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      if (hamburgerIcon) {
        hamburgerIcon.textContent = isOpen ? 'close' : 'menu';
      }
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Quick search button in header (if clicked on parts/helmets page, focuses input; else redirects to parts.html)
  document.getElementById('headerSearchBtn')?.addEventListener('click', () => {
    const searchInput = document.querySelector('[data-search]');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.location.href = 'parts.html';
    }
  });
}
