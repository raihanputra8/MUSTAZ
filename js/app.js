/**
 * MUSTAZ Garage Zine - Main Application Entry Point
 */

import { initCart, openCart } from './components/cart.js';
import { initNavbar } from './components/navbar.js';
import { initPartsPage, initHelmetsPage, initChoppersPage, openProductDetail } from './components/products.js';
import { addToCart, getCartCount, PARTS_DATA, HELMETS_DATA, CHOPPERS_DATA, getDynamicParts, getFlashSaleConfig, getActiveFlashSaleProducts, isFlashSaleActive, formatRupiah } from './services/cartService.js';
import { getProductImageUrl } from './config.js';
import { showBrutalConfirm, showBrutalAlert, showBrutalFormModal } from './components/modal.js';
import { initInlineCms, loadPageContent } from './inlineCms.js';

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

  // 3b. Initialize Visual In-Page Inline CMS (Hover/Tap to Edit for Admin & Dynamic Content for Visitors)
  initInlineCms();

  // 4. Wire Global "data-add-to-cart" buttons (e.g. on Home page or featured sections)
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const partId = btn.dataset.addToCart;
      const part = getDynamicParts().find(p => p.id === partId);
      if (!part) return;
      const price = btn.dataset.price ? parseInt(btn.dataset.price, 10) : part.price;
      const isLoggedIn = typeof localStorage !== 'undefined' && localStorage.getItem('mustaz_auth_logged_in') === 'true';
      addToCart({ ...part, price });
      if (isLoggedIn) {
        showToast({
          title: part.name,
          message: `EQUIPPED! ${getCartCount()} item(s) in garage.`,
          image: part.image,
          actionText: 'LIHAT KERANJANG',
          onAction: openCart
        });
      }
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
    const sectionEl = document.getElementById('flashSaleSection');
    const hoursEl = document.getElementById('fsHours');
    const minsEl = document.getElementById('fsMins');
    const secsEl = document.getElementById('fsSecs');
    const headingEl = document.getElementById('fsCampaignHeading');
    const subHeadingEl = document.getElementById('fsCampaignSubheading');
    const gridEl = document.getElementById('flashSaleGrid');
    if (!hoursEl || !minsEl || !secsEl || !sectionEl) return;

    let timerInterval = null;

    function renderDynamicFlashSaleGrid() {
      const cfg = getFlashSaleConfig();
      const live = isFlashSaleActive();
      const activeProducts = live ? getActiveFlashSaleProducts() : [];

      if (!live || activeProducts.length === 0) {
        sectionEl.style.display = 'none';
        return;
      }

      sectionEl.style.display = '';

      if (headingEl && cfg.title) headingEl.textContent = cfg.title;
      if (subHeadingEl && cfg.subtitle) subHeadingEl.textContent = cfg.subtitle;

      if (!gridEl) return;

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
              ${p.desc || p.sub || 'Premium hand-forged custom hardware with precision fit.'}
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
          const isLoggedIn = typeof localStorage !== 'undefined' && localStorage.getItem('mustaz_auth_logged_in') === 'true';
          addToCart({ ...part, price });
          if (isLoggedIn) {
            showToast({
              title: part.name,
              message: `FLASH SALE GRABBED! ${getCartCount()} item(s) in garage.`,
              image: part.image,
              actionText: 'LIHAT KERANJANG',
              onAction: openCart
            });
          }
        });
      });
    }

    function tick() {
      const cfg = getFlashSaleConfig();
      if (!isFlashSaleActive()) {
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';
        sectionEl.style.display = 'none';
        if (timerInterval) clearInterval(timerInterval);
        return;
      }

      const now = Date.now();
      const targetEnd = cfg.endTime ? new Date(cfg.endTime).getTime() : 0;
      const totalSeconds = Math.max(0, Math.floor((targetEnd - now) / 1000));

      if (totalSeconds <= 0) {
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';
        sectionEl.style.display = 'none';
        if (timerInterval) clearInterval(timerInterval);
        return;
      }

      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const s = String(totalSeconds % 60).padStart(2, '0');

      hoursEl.textContent = h;
      minsEl.textContent = m;
      secsEl.textContent = s;
    }

    renderDynamicFlashSaleGrid();
    tick();
    timerInterval = setInterval(tick, 1000);

    // Re-render flash sale cards when currency changes
    window.addEventListener('mustaz:currency_changed', () => {
      renderDynamicFlashSaleGrid();
    });

    // Re-render when admin updates flash sale schedule or products
    window.addEventListener('flash-sale:updated', () => {
      renderDynamicFlashSaleGrid();
      tick();
    });
  }

  // 7.5. Universal Multi-Currency Synchronization for Home Page
  function updateAllHomePrices() {
    const dynamicParts = getDynamicParts();

    // 1. Elements with explicit data-price-idr attribute
    document.querySelectorAll('[data-price-idr]').forEach(card => {
      const rawPriceIdr = Number(card.dataset.priceIdr);
      if (rawPriceIdr && !isNaN(rawPriceIdr)) {
        const priceEls = card.querySelectorAll('.product-price, [data-product-price], .card-price');
        priceEls.forEach(el => {
          el.textContent = formatRupiah(rawPriceIdr);
        });
      }
    });

    // 2. Explicit data-product-price hooks (Drops Grid & Hero Pet in index.html)
    document.querySelectorAll('[data-product-price]').forEach(el => {
      const partId = el.dataset.productPrice;
      const product = dynamicParts.find(p => p.id === partId);
      if (product && product.price) {
        el.textContent = formatRupiah(product.price);
      }
    });

    // 3. Elements with class .product-price
    document.querySelectorAll('.product-price').forEach(el => {
      if (el.dataset.productPrice) {
        const product = dynamicParts.find(p => p.id === el.dataset.productPrice);
        if (product && product.price) {
          el.textContent = formatRupiah(product.price);
          return;
        }
      }
      const parentCard = el.closest('[data-price-idr], [data-product-card], article');
      if (parentCard && parentCard.dataset.priceIdr) {
        el.textContent = formatRupiah(Number(parentCard.dataset.priceIdr));
      }
    });

    // 4. Generic cards containing data-add-to-cart (Featured Drops, Hero Card, etc.)
    document.querySelectorAll('.drops-grid article, .card-brutal-white, .card-brutal-dark, [data-product-card]').forEach(card => {
      const addBtn = card.querySelector('[data-add-to-cart]');
      let rawPrice = card.dataset.priceIdr ? Number(card.dataset.priceIdr) : null;
      if (!rawPrice && addBtn) {
        const partId = addBtn.dataset.addToCart;
        const product = dynamicParts.find(p => p.id === partId);
        if (product && product.price) rawPrice = product.price;
      }
      if (!rawPrice) return;

      const priceEls = card.querySelectorAll('span, div');
      priceEls.forEach(el => {
        if (el.children.length > 0) return;
        if (el.classList.contains('zine-tag-yellow') || el.classList.contains('zine-tag-pink') || el.classList.contains('zine-tag-white') || el.classList.contains('zine-tag-dark')) return;

        const txt = (el.textContent || '').trim();
        if (/^(IDR|Rp|\$)\s*[\d.,]+/i.test(txt) || /^[\d.,]+\s*(IDR|Rp|\$)/i.test(txt)) {
          el.textContent = formatRupiah(rawPrice);
        }
      });
    });

    // 5. Update 3D Coverflow Slides in index.html
    document.querySelectorAll('.visor-slide').forEach(slide => {
      const addBtn = slide.querySelector('[data-add-to-cart]');
      if (!addBtn) return;
      const partId = addBtn.dataset.addToCart;
      const product = dynamicParts.find(p => p.id === partId);
      if (!product || !product.price) return;

      const priceEl = slide.querySelector('span[style*="font-size:1.3rem"], span[style*="font-size: 1.3rem"], .product-price');
      if (priceEl) {
        priceEl.textContent = formatRupiah(product.price);
      }
    });
  }

  // Expose globally for instant dispatch
  window.updateAllHomePrices = updateAllHomePrices;
  window.updateHomePrices = updateAllHomePrices;

  updateAllHomePrices();
  window.addEventListener('mustaz:currency_changed', updateAllHomePrices);
  window.addEventListener('mustaz_products_updated', updateAllHomePrices);
  window.addEventListener('storage', (e) => {
    if (e.key === 'mustaz_currency' || e.key === 'mustaz_catalog_products_v3' || e.key === 'mustaz_catalog_products') {
      updateAllHomePrices();
    }
  });

  initFlashSaleTimer();

  // 8. 3D Pet Coverflow Carousel with Auto-Slide (FOR RIDING WITH PRIDE)
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

// Auto-load latest CMS content immediately on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadPageContent);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  loadPageContent();
  initApp();
}

window.addEventListener('load', () => {
  document.body.classList.remove('preload');
});
