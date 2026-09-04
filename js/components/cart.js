/**
 * MUSTAZ Garage Zine - Cart Drawer & Checkout Protocol
 */

import {
  getCart, removeFromCart, updateCartQty, clearCart,
  getCartTotal, getCartCount, formatRupiah, generateWhatsAppUrl
} from '../services/cartService.js';

// ─── Cart Drawer HTML Template ─────────────────────────────────────────────

function getCartDrawerHTML() {
  return `
    <div class="cart-drawer-overlay" id="cartOverlay">
      <div class="cart-drawer" id="cartDrawer" role="dialog" aria-label="Shopping Cart">
        <div class="cart-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="background:#FF008C;color:#000;font-family:var(--font-headline);font-weight:900;padding:2px 8px;font-size:0.85rem;border:1px solid #000;">GARAGE</div>
            <h3>YOUR ARSENAL</h3>
          </div>
          <button class="cart-close-btn" id="cartCloseBtn" aria-label="Close cart">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="cart-body" id="cartItemsList"></div>
        <div class="cart-footer" id="cartFooter" style="display:none;">
          <div class="cart-subtotal-row">
            <span class="cart-subtotal-label">SUBTOTAL MANIFEST</span>
            <span class="cart-subtotal-value" id="cartSubtotalValue">Rp 0</span>
          </div>
          <button id="startCheckoutBtn" class="btn-brutal-pink" style="width:100%;font-size:1.1rem;padding:16px;">
            <span class="material-symbols-outlined">bolt</span>
            CHECKOUT VIA WHATSAPP →
          </button>
          <div style="margin-top:12px;text-align:center;">
            <a href="checkout.html" style="font-family:var(--font-mono-sub);font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.12em;text-decoration:underline;">
              OPEN FULL MANIFEST PROTOCOL
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── Checkout Modal HTML Template ─────────────────────────────────────────

function getCheckoutModalHTML() {
  return `
    <div class="modal-backdrop" id="checkoutModal">
      <div class="modal-box">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="zine-tag-pink">STEP 01</span>
            <h2 class="modal-title">FINAL ORDER PROTOCOL</h2>
          </div>
          <button class="modal-close" id="checkoutCloseBtn" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div id="checkoutOrderSummary" style="margin-bottom:24px;background:#111111;border:2px solid #282828;padding:20px;"></div>
          <form id="checkoutForm" novalidate>
            <div class="form-group-brutal">
              <label class="form-label-brutal" for="custName">01 // FULL NAME / ALIAS *</label>
              <input type="text" id="custName" class="form-input-brutal" placeholder="Enter your full name or road alias" required>
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal" for="custPhone">02 // WHATSAPP / COMMS LINE *</label>
              <input type="tel" id="custPhone" class="form-input-brutal" placeholder="e.g. 081234567890" required>
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal" for="custEmail">03 // EMAIL NOTIFIKASI & INVOICE *</label>
              <input type="email" id="custEmail" class="form-input-brutal" placeholder="nama@email.com" required>
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal" for="custAddress">04 // DROP COORDINATES / ADDRESS *</label>
              <textarea id="custAddress" class="form-input-brutal" rows="3" placeholder="Full street address, city, sector, and postal code" required style="resize:vertical;"></textarea>
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal" for="paymentMethod">05 // PAYMENT PROTOCOL *</label>
              <select id="paymentMethod" class="form-input-brutal" style="cursor:pointer;">
                <option value="Transfer Bank (BCA / Mandiri)">Transfer Bank (BCA / Mandiri)</option>
                <option value="QRIS Instant Pay">QRIS Instant Pay</option>
                <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                <option value="Direct WhatsApp Negotiation">Direct WhatsApp Negotiation</option>
              </select>
            </div>
            <div id="checkoutError" style="display:none;color:#FF008C;font-family:var(--font-mono-sub);font-size:0.85rem;margin-bottom:16px;padding:12px;background:rgba(255,0,140,0.1);border:1px solid #FF008C;"></div>
            <button type="submit" id="checkoutSubmitBtn" class="btn-brutal-pink" style="width:100%;font-size:1.15rem;padding:16px;">
              CONFIRM ORDER VIA WHATSAPP →
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

// ─── Render Cart Items ─────────────────────────────────────────────────────

function renderCartItems() {
  const list = document.getElementById('cartItemsList');
  const footer = document.getElementById('cartFooter');
  const subtotal = document.getElementById('cartSubtotalValue');
  if (!list) return;

  const isLoggedIn = localStorage.getItem('mustaz_auth_logged_in') === 'true';

  // If unauthenticated / logged out, strictly hide badges and lock cart
  if (!isLoggedIn) {
    document.querySelectorAll('.mustaz-cart-badge, .cart-count-badge').forEach(el => {
      el.textContent = '0';
      el.style.display = 'none';
    });
    if (footer) footer.style.display = 'none';
    list.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">🔒</div>
        <p class="cart-empty-title">ARSENAL LOCKED</p>
        <p class="cart-empty-sub">Silakan masuk atau buat akun terlebih dahulu untuk mengaktifkan keranjang belanja Anda.</p>
        <a href="login.html" class="btn-brutal-yellow btn-brutal-sm" style="margin-top:20px;display:inline-flex;">
          MASUK KE AKUN →
        </a>
      </div>
    `;
    return;
  }

  const items = getCart();
  const total = getCartTotal();
  const count = getCartCount();

  if (subtotal) subtotal.textContent = formatRupiah(total);
  if (footer) footer.style.display = items.length > 0 ? 'block' : 'none';

  // Update all badges for logged-in user
  document.querySelectorAll('.mustaz-cart-badge, .cart-count-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });

  if (items.length === 0) {
    list.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">🏍️</div>
        <p class="cart-empty-title">ARSENAL IS EMPTY</p>
        <p class="cart-empty-sub">Belum ada visor atau part yang dipilih. Masuk ke katalog untuk melengkapi helm Anda.</p>
        <a href="parts.html" class="btn-brutal-pink btn-brutal-sm" style="margin-top:20px;display:inline-flex;">
          ENTER PARTS SHOP →
        </a>
      </div>
    `;
    return;
  }

  list.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item-img"
        src="${item.image || item.image_url || ''}"
        alt="${item.name}"
        onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop'">
      <div class="cart-item-info">
        <p class="cart-item-title">${item.name}</p>
        <p class="cart-item-price">${formatRupiah(item.price)}</p>
      </div>
      <div class="cart-qty-ctrl">
        <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1">−</button>
        <span class="cart-qty-num">${item.quantity}</span>
        <button class="cart-qty-btn" data-id="${item.id}" data-delta="1">+</button>
      </div>
      <button class="cart-remove-btn" data-id="${item.id}" title="Remove item">
        <span class="material-symbols-outlined" style="font-size:20px;">delete</span>
      </button>
    </div>
  `).join('');

  // Attach qty and remove listeners
  list.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      updateCartQty(btn.dataset.id, parseInt(btn.dataset.delta));
      renderCartItems();
    });
  });
  list.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id);
      renderCartItems();
    });
  });
}

// ─── Checkout Modal Logic ──────────────────────────────────────────────────

function renderCheckoutSummary() {
  const el = document.getElementById('checkoutOrderSummary');
  if (!el) return;
  const items = getCart();
  const total = getCartTotal();
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #282828;padding-bottom:8px;margin-bottom:12px;">
      <span style="font-family:var(--font-headline);font-size:1rem;color:#FF008C;text-transform:uppercase;">CARGO INVENTORY</span>
      <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;">${items.length} ITEM(S)</span>
    </div>
    ${items.map(i => `
      <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#F2F0E8;margin-bottom:8px;">
        <span>${i.name} × ${i.quantity}</span>
        <span style="color:#FF008C;font-weight:700;">${formatRupiah(i.price * i.quantity)}</span>
      </div>
    `).join('')}
    <div style="border-top:2px solid #FF008C;margin-top:14px;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-family:var(--font-headline);font-weight:900;font-size:1.1rem;text-transform:uppercase;">TOTAL MANIFEST</span>
      <span style="font-family:var(--font-headline);font-weight:900;color:#FF008C;font-size:1.6rem;">${formatRupiah(total)}</span>
    </div>
  `;
}

// ─── Open / Close Helpers ──────────────────────────────────────────────────

export function openCart() {
  const overlay = document.getElementById('cartOverlay');
  if (overlay) {
    renderCartItems();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

export function closeCart() {
  const overlay = document.getElementById('cartOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

export function openCheckout() {
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    renderCheckoutSummary();
    // Prefill buyer email if user is logged in
    const activeEmail = getActiveUserEmail();
    const emailInput = document.getElementById('custEmail');
    if (activeEmail && emailInput && !emailInput.value) {
      emailInput.value = activeEmail;
    }
    modal.classList.add('open');
    closeCart();
  }
}

export function closeCheckout() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('open');
}

// ─── Init Cart Component ───────────────────────────────────────────────────

export function initCart() {
  // Inject HTML if not present
  if (!document.getElementById('cartOverlay')) {
    const drawerContainer = document.createElement('div');
    drawerContainer.innerHTML = getCartDrawerHTML();
    document.body.appendChild(drawerContainer);
  }

  if (!document.getElementById('checkoutModal')) {
    const checkoutContainer = document.createElement('div');
    checkoutContainer.innerHTML = getCheckoutModalHTML();
    document.body.appendChild(checkoutContainer);
  }

  // Cart overlay close on backdrop click
  document.getElementById('cartOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'cartOverlay') closeCart();
  });
  document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);

  // Checkout open
  document.getElementById('startCheckoutBtn')?.addEventListener('click', openCheckout);
  document.getElementById('checkoutCloseBtn')?.addEventListener('click', closeCheckout);
  document.getElementById('checkoutModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'checkoutModal') closeCheckout();
  });

  // Checkout form submit
  document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const payment = document.getElementById('paymentMethod').value;
    const errEl = document.getElementById('checkoutError');

    if (!name || !phone || !email || !address) {
      errEl.textContent = '⚠️ ALL PROTOCOL FIELDS (INCLUDING EMAIL) REQUIRED BEFORE DROP.';
      errEl.style.display = 'block';
      return;
    }
    if (!email.includes('@')) {
      errEl.textContent = '⚠️ PLEASE ENTER A VALID EMAIL FOR INVOICE DISPATCH.';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    const cartItems = getCart();
    const total = getCartTotal();
    const orderId = 'MSTZ-' + Math.floor(1000 + Math.random() * 9000);

    const orderRecord = {
      id: orderId,
      orderId: orderId,
      customerName: name,
      phone: phone,
      email: email,
      address: address,
      paymentMethod: payment,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'PROCESSING',
      tracking: 'VERIFIKASI ADMIN',
      items: cartItems.map(i => ({
        name: i.name,
        spec: i.sub || 'Custom Visor',
        qty: i.quantity,
        price: i.price,
        image: i.image || i.image_url || 'assets/images/pet_visor_yellow_flame.png'
      })),
      total: total
    };

    // 1. Send Order Confirmation / Invoice Email to Buyer
    import('../services/emailService.js').then(({ sendOrderSuccessEmail, showOrderSuccessModal }) => {
      sendOrderSuccessEmail(orderRecord).catch(() => {});
      showOrderSuccessModal(orderRecord);
    }).catch(() => {});

    // 2. Save order to Supabase Cloud
    import('../services/supabaseService.js').then(({ saveCloudOrder }) => {
      saveCloudOrder({
        customer: name,
        email: email,
        items: cartItems.map(i => `${i.name} (x${i.quantity})`).join(', '),
        total: total,
        status: 'PROCESSING'
      }).catch(() => {});
    }).catch(() => {});

    // 3. Save to user's localized order history
    import('../services/cartService.js').then(({ saveUserOrder }) => {
      saveUserOrder(email, orderRecord);
    }).catch(() => {});

    const url = generateWhatsAppUrl({ name, phone, address, payment, notes: 'Email: ' + email }, cartItems, total);
    window.open(url, '_blank');

    clearCart();
    closeCheckout();
    renderCartItems();
    document.getElementById('checkoutForm').reset();
  });

  // Listen to cart updates, auth changes, and logout events from any page
  window.addEventListener('cart:updated', () => renderCartItems());
  window.addEventListener('mustaz:auth_synced', () => renderCartItems());
  window.addEventListener('mustaz:logout', () => {
    renderCartItems();
    closeCart();
  });

  // Wire all "open cart" buttons
  document.querySelectorAll('[data-open-cart]').forEach(btn => {
    btn.addEventListener('click', openCart);
  });

  // Initial badge render
  renderCartItems();
}
