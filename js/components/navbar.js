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

    // Clean Mobile Navigation Drawer (Photo 2 Torn Paper Tape Zine Style)
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    if (mobileDrawer) {
      // Clean out any legacy injected elements (currency slots, auth areas)
      mobileDrawer.querySelectorAll('.mobile-auth-area, #mobileCurrencySlot').forEach(el => el.remove());

      const mobAccountLink = mobileDrawer.querySelector('#mobLinkAccount');
      if (mobAccountLink) {
        if (isAdmin) {
          mobAccountLink.setAttribute('href', '/admin');
          mobAccountLink.setAttribute('title', 'Admin Dashboard');
        } else if (isLoggedIn) {
          mobAccountLink.setAttribute('href', 'account.html');
          mobAccountLink.setAttribute('title', 'Akun Saya');
        } else {
          mobAccountLink.setAttribute('href', 'login.html');
          mobAccountLink.setAttribute('title', 'Masuk / Login');
        }
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

  // Highlight active mobile tape link
  const mobileDrawerEl = document.getElementById('mobileNavDrawer');
  if (mobileDrawerEl) {
    mobileDrawerEl.querySelectorAll('.mob-tape-link').forEach(link => {
      const page = link.dataset.page;
      let isMatch = false;
      if (page === 'home' && (currentBase === 'index' || currentBase === '')) isMatch = true;
      else if (page === 'parts' && currentBase === 'parts') isMatch = true;
      else if (page === 'kulture' && (currentBase === 'kulture' || currentBase === 'about')) isMatch = true;
      else if (page === 'account' && (currentBase === 'account' || currentBase === 'admin' || currentBase === 'login')) isMatch = true;

      if (isMatch) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

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

    // Mobile drawer tape link clicks (close drawer smoothly on navigate)
    mobileDrawer.querySelectorAll('.mob-tape-link').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.id === 'mobLinkSearch') {
          const searchInput = document.querySelector('[data-search], #catalogSearchInput');
          if (searchInput) {
            e.preventDefault();
            mobileDrawer.classList.remove('open');
            mobileToggle.setAttribute('aria-expanded', 'false');
            if (hamburgerIcon) hamburgerIcon.textContent = 'menu';
            document.body.style.overflow = '';
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          mobileDrawer.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          if (hamburgerIcon) hamburgerIcon.textContent = 'menu';
          document.body.style.overflow = '';
        }
      });
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
