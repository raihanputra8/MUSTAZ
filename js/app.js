/**
 * MUSTAZ Garage Zine - Main Application Entry Point
 */

import { initCart, openCart } from './components/cart.js';
import { initNavbar } from './components/navbar.js';
import { initPartsPage, initChoppersPage, openProductDetail } from './components/products.js';
import { addToCart, getCartCount, PARTS_DATA, CHOPPERS_DATA, getDynamicParts } from './services/cartService.js';
import { showToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Universal OAuth Return & Session Handling across all pages
  const hasAuthParams = window.location.search.includes('code=') || 
                        window.location.hash.includes('access_token=') || 
                        window.location.hash.includes('refresh_token=');

  if (hasAuthParams) {
    try {
      const { initAccountAuth } = await import('./services/authService.js');
      const isAuthed = await initAccountAuth();
      if (isAuthed && !window.location.pathname.includes('account.html')) {
        window.location.replace('account.html');
        return;
      }
    } catch (e) {
      console.warn('OAuth listener error:', e);
    }
  } else {
    // Refresh navbar if user is authenticated in Supabase
    import('./services/authService.js').then(async ({ initAccountAuth }) => {
      const isAuthed = await initAccountAuth();
      if (isAuthed) initNavbar();
    }).catch(() => {});
  }

  // 2. Initialize Universal Cart Drawer & Checkout
  initCart();

  // 3. Initialize Responsive Brutalist Navbar
  initNavbar();

  // 3. Initialize Page-Specific Catalogs
  initPartsPage();
  initChoppersPage();

  // 4. Wire Global "data-add-to-cart" buttons (e.g. on Home page or featured sections)
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const partId = btn.dataset.addToCart;
      const part = getDynamicParts().find(p => p.id === partId);
      if (!part) return;
      addToCart(part);
      showToast({
        title: part.name,
        message: `EQUIPPED! ${getCartCount()} item(s) in garage.`,
        image: part.image,
        actionText: 'VIEW ARSENAL',
        onAction: openCart
      });
    });
  });

  // 5. Wire Quick View Buttons on Featured Hardware
  document.querySelectorAll('[data-quick-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.quickView;
      const item = getDynamicParts().find(p => p.id === id) || CHOPPERS_DATA.find(c => c.id === id);
      if (item) openProductDetail(item);
    });
  });

  // 6. Wire Newsletter Form Submission
  document.querySelectorAll('.newsletter-form, #newsletterForm').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast({
          title: 'ACCESS RECORDED',
          message: 'Frequency synchronized. Intel will be dispatched.',
          actionText: 'DISMISS'
        });
        form.reset();
      }
    });
  });
});
