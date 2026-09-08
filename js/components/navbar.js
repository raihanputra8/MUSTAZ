/**
 * MUSTAZ Garage Zine - Navigation & Mobile Drawer
 */

import { openCart } from './cart.js';

let _navbarEventsWired = false;

export function initNavbar() {
  const header = document.querySelector('header');
  if (!header) return;

  // 1. Synchronize Authentication Status & Logout Buttons across navigation & footer
  function syncNavbarState() {
    const isLoggedIn = localStorage.getItem('mustaz_auth_logged_in') === 'true';
    let profile = {};
    try {
      profile = JSON.parse(localStorage.getItem('mustaz_user_profile_data') || '{}');
    } catch {}

    const email = (profile.email || '').toLowerCase().trim();
    const isAdmin = isLoggedIn && (profile.role === 'admin' || email === 'raihanputrairawan8@gmail.com' || email === 'admin@mustazcraft.com');
    const onAdminPage = window.location.pathname.includes('admin.html') || window.location.pathname.endsWith('/admin');

    // Update 'ADMIN' link in navbar: STRICTLY visible only if admin, NEVER for ordinary users
    const adminNavLinks = document.querySelectorAll('.nav-link-admin, a[href="admin.html"], a[href="/admin.html"], a[href="admin"], a[href="/admin"]');
    adminNavLinks.forEach(link => {
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
        icon.setAttribute('href', 'admin.html');
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
            if (confirm('Yakin ingin LOG OUT?\nAnda dapat masuk kembali atau berganti ke akun user biasa.')) {
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
          <button id="mobileNavLogoutBtn" style="width:100%;background:#b91c1c;color:#FFF;border:2px solid #ef4444;font-weight:900;padding:10px;font-family:var(--font-headline);display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;">
            <span class="material-symbols-outlined">logout</span>
            <span>LOG OUT (GANTI AKUN)</span>
          </button>
        `;
        mobAuthArea.querySelector('#mobileNavLogoutBtn')?.addEventListener('click', async () => {
          const { logoutUser } = await import('../services/authService.js');
          await logoutUser();
          window.location.href = 'login.html';
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
