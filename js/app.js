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

  // 7. Live Flash Sale Countdown Timer
  function initFlashSaleTimer() {
    const hoursEl = document.getElementById('fsHours');
    const minsEl = document.getElementById('fsMins');
    const secsEl = document.getElementById('fsSecs');
    if (!hoursEl || !minsEl || !secsEl) return;

    function tick() {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const totalSeconds = Math.max(0, Math.floor((endOfDay - now) / 1000));

      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const s = String(totalSeconds % 60).padStart(2, '0');

      hoursEl.textContent = h;
      minsEl.textContent = m;
      secsEl.textContent = s;
    }

    tick();
    setInterval(tick, 1000);
  }

  initFlashSaleTimer();

  // 8. 3D Visor Coverflow Carousel with Auto-Slide (FOR RIDING WITH PRIDE)
  function initVisorCoverflowSlider() {
    const stage = document.getElementById('visorSliderStage');
    if (!stage) return;

    const slides = Array.from(stage.querySelectorAll('.visor-slide'));
    const dots = Array.from(document.querySelectorAll('.v-dot'));
    const prevBtn = document.getElementById('visorSlidePrev');
    const nextBtn = document.getElementById('visorSlideNext');
    const container = document.getElementById('visorSliderContainer');

    const total = slides.length;
    let currentIndex = 2; // initial center slide: Pink Spiked Hero
    let autoSlideTimer = null;
    const INTERVAL = 3000; // auto-slide every 3 seconds

    function updatePositions() {
      slides.forEach((slide, idx) => {
        let offset = (idx - currentIndex + total) % total;
        if (offset > total / 2) offset -= total;

        slide.classList.remove(
          'pos-active',
          'pos-prev-1',
          'pos-next-1',
          'pos-prev-2',
          'pos-next-2',
          'pos-hidden'
        );

        if (offset === 0) {
          slide.classList.add('pos-active');
        } else if (offset === -1) {
          slide.classList.add('pos-prev-1');
        } else if (offset === 1) {
          slide.classList.add('pos-next-1');
        } else if (offset === -2) {
          slide.classList.add('pos-prev-2');
        } else if (offset === 2) {
          slide.classList.add('pos-next-2');
        } else {
          slide.classList.add('pos-hidden');
        }
      });

      dots.forEach((dot, idx) => {
        if (idx === currentIndex) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }

    function goToSlide(index) {
      currentIndex = (index + total) % total;
      updatePositions();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    // Navigation buttons
    nextBtn?.addEventListener('click', () => {
      nextSlide();
      resetTimer();
    });

    prevBtn?.addEventListener('click', () => {
      prevSlide();
      resetTimer();
    });

    // Click on side slide to focus
    slides.forEach((slide, idx) => {
      slide.addEventListener('click', () => {
        if (currentIndex !== idx) {
          goToSlide(idx);
          resetTimer();
        }
      });
    });

    // Pagination dots
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetTimer();
      });
    });

    // Auto-slide loop
    function startTimer() {
      stopTimer();
      autoSlideTimer = setInterval(nextSlide, INTERVAL);
    }

    function stopTimer() {
      if (autoSlideTimer) clearInterval(autoSlideTimer);
    }

    function resetTimer() {
      stopTimer();
      startTimer();
    }

    // Pause on hover
    if (container) {
      container.addEventListener('mouseenter', stopTimer);
      container.addEventListener('mouseleave', startTimer);
    }

    // Touch Swipe Support for mobile
    let touchStartX = 0;
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopTimer();
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) nextSlide();
        else prevSlide();
      }
      startTimer();
    }, { passive: true });

    // Initial state
    updatePositions();
    startTimer();
  }

  initVisorCoverflowSlider();
});
