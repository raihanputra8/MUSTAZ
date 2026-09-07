/**
 * MUSTAZ Garage Zine - Navigation & Mobile Drawer
 */

import { openCart } from './cart.js';

export function initNavbar() {
  const header = document.querySelector('header');
  if (!header) return;

  // 1. Direct Single-Role: Always Admin
  try {
    let localProfile = JSON.parse(localStorage.getItem('mustaz_user_profile_data') || '{}');
    if (!localProfile || !localProfile.email) {
      localProfile = {
        email: 'raihanputrairawan8@gmail.com',
        fullName: 'MUSTAZ CRAFT ADMIN',
        role: 'admin',
        phone: '+62 812-3456-7890',
        alias: 'OWNER / MASTER CRAFT'
      };
    }
    localProfile.role = 'admin';
    localStorage.setItem('mustaz_user_profile_data', JSON.stringify(localProfile));
    localStorage.setItem('mustaz_auth_logged_in', 'true');
  } catch {}

  // 2. Synchronize Admin links across navigation & footer
  function syncAccountLinks() {
    const accountLinks = document.querySelectorAll('a[href="account.html"], a[href="login.html"]');
    accountLinks.forEach(link => {
      link.setAttribute('href', 'admin.html');
      link.setAttribute('title', 'Admin Dashboard');
    });

    const signInBtn = document.getElementById('headerSignInBtn');
    if (signInBtn) {
      signInBtn.textContent = 'ADMIN';
      signInBtn.setAttribute('href', 'admin.html');
    }

    const personIcons = header.querySelectorAll('a[aria-label="My Account"], a[title="My Account"]');
    personIcons.forEach(icon => {
      icon.setAttribute('href', 'admin.html');
      icon.setAttribute('aria-label', 'Admin Dashboard');
      icon.setAttribute('title', 'Admin Dashboard');
    });
  }

  syncAccountLinks();

  // Determine active route
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  header.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Wire cart open on cart buttons
  document.querySelectorAll('[data-open-cart], #headerCartBtn').forEach(btn => {
    btn.addEventListener('click', openCart);
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
