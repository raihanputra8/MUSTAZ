/**
 * MUSTAZ Garage Zine - Navigation & Mobile Drawer
 */

import { openCart } from './cart.js';

export function initNavbar() {
  const header = document.querySelector('header');
  if (!header) return;

  // 1. Synchronize Authentication Status across navigation & footer
  function syncAccountLinks() {
    const isLoggedIn = localStorage.getItem('mustaz_auth_logged_in') === 'true';
    const accountLinks = document.querySelectorAll('a[href="account.html"], a[href="login.html"]');
    accountLinks.forEach(link => {
      if (!isLoggedIn) {
        link.setAttribute('href', 'login.html');
      } else {
        link.setAttribute('href', 'account.html');
      }
    });
  }

  syncAccountLinks();

  // Listen for logout event to immediately switch links to login.html
  window.addEventListener('mustaz:logout', syncAccountLinks);

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

  // Quick search button in header (if clicked on parts/choppers page, focuses input; else redirects to parts.html)
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
