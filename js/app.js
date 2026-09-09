/**
 * MUSTAZ Garage Zine - Main Application Entry Point
 */

import { initCart, openCart } from './components/cart.js';
import { initNavbar } from './components/navbar.js';
import { initPartsPage, initHelmetsPage, initChoppersPage, openProductDetail } from './components/products.js';
import { addToCart, getCartCount, PARTS_DATA, HELMETS_DATA, CHOPPERS_DATA, getDynamicParts, getFlashSaleConfig, getActiveFlashSaleProducts, formatRupiah } from './services/cartService.js';
import { getProductImageUrl } from './config.js';
import { showToast } from './components/toast.js';
import { showBrutalConfirm, showBrutalAlert, showBrutalFormModal } from './components/modal.js';

// Expose brutalist dialog engine globally and intercept native alert
if (typeof window !== 'undefined') {
  window.showBrutalConfirm = showBrutalConfirm;
  window.showBrutalAlert = showBrutalAlert;
  window.showBrutalFormModal = showBrutalFormModal;
  window.alert = (msg) => {
    showBrutalAlert({
      title: 'SYSTEM NOTIFICATION',
      message: String(msg || ''),
      badge: 'MUSTAZ DISPATCH'
    });
  };
}

async function initApp() {
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
  initHelmetsPage();

  // 4. Wire Global "data-add-to-cart" buttons (e.g. on Home page or featured sections)
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const partId = btn.dataset.addToCart;
      const part = getDynamicParts().find(p => p.id === partId);
      if (!part) return;
      const price = btn.dataset.price ? parseInt(btn.dataset.price, 10) : part.price;
      addToCart({ ...part, price });
      showToast({
        title: part.name,
        message: `EQUIPPED! ${getCartCount()} item(s) in garage.`,
        image: part.image,
        actionText: 'LIHAT KERANJANG',
        onAction: openCart
      });
    });
  });

  // 5. Wire Quick View Buttons on Featured Hardware
  document.querySelectorAll('[data-quick-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.quickView;
      const item = getDynamicParts().find(p => p.id === id) || (HELMETS_DATA || CHOPPERS_DATA).find(c => c.id === id);
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

  // 7. Live Flash Sale Countdown Timer & Dynamic Grid
  function initFlashSaleTimer() {
    const hoursEl = document.getElementById('fsHours');
    const minsEl = document.getElementById('fsMins');
    const secsEl = document.getElementById('fsSecs');
    const headingEl = document.getElementById('fsCampaignHeading');
    const subHeadingEl = document.getElementById('fsCampaignSubheading');
    const gridEl = document.getElementById('flashSaleGrid');
    if (!hoursEl || !minsEl || !secsEl) return;

    const cfg = getFlashSaleConfig();
    if (headingEl && cfg.title) headingEl.textContent = cfg.title;
    if (subHeadingEl && cfg.subtitle) subHeadingEl.textContent = cfg.subtitle;

    function renderDynamicFlashSaleGrid() {
      if (!gridEl) return;
      const activeProducts = getActiveFlashSaleProducts();
      if (!activeProducts || activeProducts.length === 0) return;

      gridEl.innerHTML = activeProducts.map((p, idx) => {
        const origPrice = Number(p.price) || 0;
        const salePrice = Number(p.flash_sale_price) || origPrice;
        const discountPct = origPrice > 0 && salePrice < origPrice ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 25;
        const stockLeft = p.flash_sale_stock ?? 5;
        const stockPercent = Math.min(100, Math.max(15, Math.round((stockLeft / 10) * 100)));
        const imgUrl = getProductImageUrl(p.image);
        const tagClass = idx % 2 === 0 ? 'zine-tag-yellow' : 'zine-tag-pink';
        const tagLabel = p.badge || (idx % 2 === 0 ? 'ACID DROP' : 'HOT DROP');

        return `
          <article class="card-flash-sale">
            <span class="flash-discount-tag">-${discountPct}%</span>
            <div class="card-img-box">
              <img src="${imgUrl}" onerror="this.onerror=null;this.src='assets/images/placeholder.jpg';" alt="${p.name}">
            </div>
            <span class="${tagClass}" style="align-self:flex-start;margin-bottom:6px;">${tagLabel}</span>
            <h3 style="font-family:var(--font-headline);font-size:1.45rem;color:#000;margin-bottom:4px;line-height:0.95;">
              ${p.name}
            </h3>
            <p style="font-family:var(--font-mono-sub);font-size:0.78rem;color:#555;margin-bottom:8px;line-height:1.4;">
              ${p.desc || 'Premium hand-forged custom hardware with precision fit.'}
            </p>

            <div class="flash-stock-wrap">
              <div class="flash-stock-info">
                <span>STOCK FLASH:</span>
                <span style="color:var(--accent-pink);">SISA ${stockLeft} PCS</span>
              </div>
              <div class="flash-stock-bar">
                <div class="flash-stock-fill" style="width: ${stockPercent}%;"></div>
              </div>
            </div>

            <div class="flash-price-row">
              <div>
                <span class="flash-price-orig">${formatRupiah(origPrice)}</span>
                <div class="flash-price-sale">${formatRupiah(salePrice)}</div>
              </div>
              <button class="btn-brutal-pink btn-brutal-sm btn-flash-grab" data-add-to-cart="${p.id}" data-price="${salePrice}" style="margin-left:auto;">
                + GRAB
              </button>
            </div>
          </article>
        `;
      }).join('');

      // Wire buttons
      gridEl.querySelectorAll('.btn-flash-grab').forEach(btn => {
        btn.addEventListener('click', () => {
          const partId = btn.dataset.addToCart;
          const part = getDynamicParts().find(p => p.id === partId);
          if (!part) return;
          const price = btn.dataset.price ? parseInt(btn.dataset.price, 10) : part.price;
          addToCart({ ...part, price });
          showToast({
            title: part.name,
            message: `FLASH SALE GRABBED! ${getCartCount()} item(s) in garage.`,
            image: part.image,
            actionText: 'LIHAT KERANJANG',
            onAction: openCart
          });
        });
      });
    }

    renderDynamicFlashSaleGrid();

    function tick() {
      const now = new Date();
      const targetEnd = cfg.endTime ? new Date(cfg.endTime) : null;
      let totalSeconds = 0;

      if (targetEnd && !isNaN(targetEnd.getTime())) {
        totalSeconds = Math.max(0, Math.floor((targetEnd - now) / 1000));
      } else {
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        totalSeconds = Math.max(0, Math.floor((endOfDay - now) / 1000));
      }

      if (cfg.isActive === false || totalSeconds <= 0) {
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';
        return;
      }

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
    const INTERVAL = 1900; // accelerated interval for dynamic auto-slide (was 3000ms)

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

  // Remove preload class to activate smooth transitions without initial button glitch
  requestAnimationFrame(() => {
    document.body.classList.remove('preload');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

window.addEventListener('load', () => {
  document.body.classList.remove('preload');
});
