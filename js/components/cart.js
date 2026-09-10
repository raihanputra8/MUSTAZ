/**
 * MUSTAZ Garage Zine - Cart Drawer & Checkout Protocol
 */

import {
  getCart, removeFromCart, updateCartQty, clearCart,
  getCartTotal, getCartCount, formatRupiah, generateWhatsAppUrl,
  getActiveUserEmail, getUserAddresses, saveUserOrder
} from '../services/cartService.js';
import { sendOrderSuccessEmail, showOrderSuccessModal } from '../services/emailService.js';
import { saveCloudOrder, submitOrderSecure } from '../services/supabaseService.js';

// ─── Cart Drawer HTML Template ─────────────────────────────────────────────

function getCartDrawerHTML() {
  return `
    <div class="cart-drawer-overlay" id="cartOverlay">
      <div class="cart-drawer" id="cartDrawer" role="dialog" aria-label="Shopping Cart">
        <div class="cart-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="background:var(--accent-pink);color:#FFF;font-family:var(--font-headline);font-weight:900;padding:2px 8px;font-size:0.85rem;border:1px solid #000;">MUSTAZ</div>
            <h3>KERANJANG BELANJA</h3>
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
              <input type="text" id="custName" class="form-input-brutal" placeholder="Nama Lengkap" required />
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal" for="custPhone">02 // WHATSAPP / COMMS LINE *</label>
              <input type="tel" id="custPhone" class="form-input-brutal" placeholder="Nomor WhatsApp (Contoh: 081234567890)" required pattern="^[0-9]{9,15}$" />
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal" for="custEmail">03 // EMAIL NOTIFIKASI & INVOICE *</label>
              <input type="email" id="custEmail" class="form-input-brutal" placeholder="nama@email.com" required />
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal" for="custAddress">04 // DROP COORDINATES / ADDRESS *</label>
              <textarea id="custAddress" class="form-input-brutal" rows="3" placeholder="Alamat Lengkap Pengiriman" required style="resize:vertical;"></textarea>
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal" for="custCourier">05 // LOGISTICS & COURIER *</label>
              <select id="custCourier" class="form-input-brutal" style="cursor:pointer;" required>
                <option value="" disabled selected>-- Pilih Kurir Ekspedisi --</option>
                <option value="J&T Express">J&T Express (Reguler / COD)</option>
                <option value="JNE Trucking">JNE Trucking / Reguler</option>
                <option value="SiCepat Cargo">SiCepat Cargo / Best</option>
                <option value="GoSend / Grab Instant">GoSend / Grab Instant</option>
                <option value="Ambil di Workshop">Ambil di Workshop MUSTAZ</option>
              </select>
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal" for="paymentMethod">06 // PAYMENT PROTOCOL *</label>
              <select id="paymentMethod" class="form-input-brutal" style="cursor:pointer;">
                <option value="Transfer Bank (BCA / Mandiri)">Transfer Bank (BCA / Mandiri)</option>
                <option value="QRIS Instant Pay">QRIS Instant Pay</option>
                <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                <option value="Direct WhatsApp Negotiation">Direct WhatsApp Negotiation</option>
              </select>
            </div>
            <div id="checkoutError" style="display:none;color:var(--accent-pink);font-family:var(--font-mono-sub);font-size:0.85rem;margin-bottom:16px;padding:12px;background:rgba(217,0,108,0.1);border:1px solid var(--accent-pink);"></div>
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
        <p class="cart-empty-title">KERANJANG TERKUNCI</p>
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
        <p class="cart-empty-title">KERANJANG BELANJA KOSONG</p>
        <p class="cart-empty-sub">Belum ada visor atau part yang dipilih. Masuk ke katalog untuk melengkapi helm Anda.</p>
        <a href="parts.html" class="btn-brutal-pink btn-brutal-sm" style="margin-top:20px;display:inline-flex;">
          LIHAT KATALOG PRODUK →
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
        onerror="this.onerror=null;this.src='assets/images/Product1.webp'">
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
      <span style="font-family:var(--font-headline);font-size:1rem;color:var(--accent-pink);text-transform:uppercase;">CARGO INVENTORY</span>
      <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;">${items.length} ITEM(S)</span>
    </div>
    ${items.map(i => `
      <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#F2F0E8;margin-bottom:8px;">
        <span>${i.name} × ${i.quantity}</span>
        <span style="color:var(--accent-pink);font-weight:700;">${formatRupiah(i.price * i.quantity)}</span>
      </div>
    `).join('')}
    <div style="border-top:2px solid var(--accent-pink);margin-top:14px;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-family:var(--font-headline);font-weight:900;font-size:1.1rem;text-transform:uppercase;">TOTAL MANIFEST</span>
      <span style="font-family:var(--font-headline);font-weight:900;color:var(--accent-pink);font-size:1.6rem;">${formatRupiah(total)}</span>
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
  const items = getCart();
  if (!items || items.length === 0) {
    import('./modal.js').then(({ showBrutalAlert }) => {
      showBrutalAlert({
        title: 'KERANJANG KOSONG',
        message: 'Silakan pilih produk pet helm atau custom visor terlebih dahulu sebelum checkout.',
        badge: 'CART // EMPTY',
        okText: 'PILIH PRODUK',
        onOk: () => { window.location.href = 'parts.html'; }
      });
    }).catch(() => {});
    return;
  }

  const modal = document.getElementById('checkoutModal');
  if (modal) {
    renderCheckoutSummary();

    // Prefill buyer details from active session & profile
    const activeEmail = getActiveUserEmail();
    let profile = {};
    try {
      profile = JSON.parse(localStorage.getItem('mustaz_user_profile_data') || '{}');
    } catch {}

    const nameInput = document.getElementById('custName');
    const phoneInput = document.getElementById('custPhone');
    const emailInput = document.getElementById('custEmail');
    const addrInput = document.getElementById('custAddress');

    if (nameInput && !nameInput.value) {
      nameInput.value = profile.fullName || profile.alias || profile.name || '';
    }
    if (phoneInput && !phoneInput.value) {
      phoneInput.value = profile.phone || '';
    }
    if (emailInput && !emailInput.value) {
      emailInput.value = profile.email || activeEmail || '';
    }
    if (addrInput && !addrInput.value) {
      if (profile.address) {
        addrInput.value = profile.address;
      } else if (activeEmail) {
        const addrs = getUserAddresses(activeEmail);
        if (addrs && addrs.length > 0) {
          const primary = addrs.find(a => a.isPrimary) || addrs[0];
          addrInput.value = `${primary.label ? '[' + primary.label + '] ' : ''}${primary.street || ''}, ${primary.city || ''} ${primary.zip || ''}`.trim();
        }
      }
    }

    closeCart();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

export function closeCheckout() {
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
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
  document.getElementById('startCheckoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openCheckout();
  });
  document.getElementById('checkoutCloseBtn')?.addEventListener('click', closeCheckout);
  document.getElementById('checkoutModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'checkoutModal') closeCheckout();
  });

  // Keyboard Escape to dismiss modal & drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCheckout();
      closeCart();
    }
  });

  // Idempotency Lock: Mencegah double submit order saat tombol ditekan berkali-kali
  let isSubmittingOrder = false;

  // Checkout form submit
  document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmittingOrder) return;

    const name = (document.getElementById('custName')?.value || '').trim();
    const phone = (document.getElementById('custPhone')?.value || '').trim();
    const email = (document.getElementById('custEmail')?.value || '').trim();
    const address = (document.getElementById('custAddress')?.value || '').trim();
    const courier = (document.getElementById('custCourier')?.value || '').trim();
    const payment = document.getElementById('paymentMethod')?.value || 'Transfer Bank (BCA / Mandiri)';
    const errEl = document.getElementById('checkoutError');

    // JS Validation Guard: Jika salah satu field kosong atau nomor WhatsApp kurang dari 10 digit, blokir checkout
    if (!name || !phone || !courier || !address) {
      const errMsg = "⚠️ MOHON LENGKAPI NAMA, NO. WHATSAPP, KURIR, DAN ALAMAT PENGIRIMAN SEBELUM CHECKOUT!";
      if (errEl) {
        errEl.textContent = errMsg;
        errEl.style.display = 'block';
      }
      alert(errMsg);
      return;
    }

    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      const errMsg = "⚠️ NOMOR WHATSAPP TIDAK VALID! Minimal 10 digit angka (contoh: 081234567890).";
      if (errEl) {
        errEl.textContent = errMsg;
        errEl.style.display = 'block';
      }
      alert(errMsg);
      return;
    }

    if (!email || !email.includes('@')) {
      const errMsg = "⚠️ MASUKKAN EMAIL VALID UNTUK PENGIRIMAN INVOICE RESMI.";
      if (errEl) {
        errEl.textContent = errMsg;
        errEl.style.display = 'block';
      }
      alert(errMsg);
      return;
    }

    if (errEl) errEl.style.display = 'none';

    // Format nomor pembeli ke format standar Indonesia 62...
    let cleanPhone = cleanDigits;
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('8')) {
      cleanPhone = '62' + cleanPhone;
    }

    const cartItems = getCart();
    if (!cartItems || cartItems.length === 0) {
      alert("⚠️ Keranjang belanja Anda kosong!");
      return;
    }

    const total = getCartTotal();
    const orderId = 'MSTZ-' + Math.floor(1000 + Math.random() * 9000);

    const submitBtn = document.getElementById('checkoutSubmitBtn');
    const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'CONFIRM ORDER VIA WHATSAPP →';

    try {
      // 1. Kunci Idempotency: Disable tombol dan pasang status loading
      isSubmittingOrder = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">⏳ MEMPROSES ORDER AMAN...</span>';
      }

      // 2. Submit order ke Supabase RPC (Re-kalkulasi harga server & pemotongan stok atomik)
      const rpcResult = await submitOrderSecure({
        customerName: name,
        phone: cleanPhone,
        email: email,
        address: address,
        courier: courier,
        notes: `Email: ${email} | Pembayaran: ${payment}`,
        paymentMethod: payment,
        cartItems: cartItems,
        orderId: orderId
      });

      const finalOrderId = rpcResult?.orderId || orderId;
      const finalTotal = (typeof rpcResult?.totalAmount === 'number') ? rpcResult.totalAmount : total;

      const orderRecord = {
        id: finalOrderId,
        orderId: finalOrderId,
        customerName: name,
        phone: cleanPhone,
        customer_phone: cleanPhone,
        email: email,
        address: address,
        courier: courier,
        paymentMethod: payment,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'PENDING_PAYMENT',
        tracking: `VERIFIKASI ADMIN [${courier}]`,
        items: cartItems.map(i => ({
          name: i.name,
          spec: i.sub || 'Custom Visor',
          qty: i.quantity,
          price: i.price,
          image: i.image || i.image_url || 'assets/images/pet_visor_yellow_flame.png'
        })),
        total: finalTotal
      };

      // 3. Send Order Confirmation / Invoice Email to Buyer & Show In-App Success
      try {
        sendOrderSuccessEmail(orderRecord).catch(() => {});
        showOrderSuccessModal(orderRecord);
      } catch {}

      // Update localized admin orders cache
      try {
        const adminOrders = JSON.parse(localStorage.getItem('mustaz_admin_orders') || '[]');
        adminOrders.unshift({
          id: finalOrderId,
          customer: name + (email ? ` (${email})` : ''),
          items: cartItems.map(i => `${i.name} x${i.quantity}`).join(', '),
          total: finalTotal,
          date: new Date().toISOString().split('T')[0],
          status: 'PENDING_PAYMENT',
          city: `${address} (${courier})`,
          phone: cleanPhone,
          customer_phone: cleanPhone,
          courier: courier,
          receiptImage: ''
        });
        localStorage.setItem('mustaz_admin_orders', JSON.stringify(adminOrders));
      } catch {}

      // 4. Save to user's localized order history
      try {
        saveUserOrder(email, orderRecord);
      } catch {}

      // 5. Generate and launch WhatsApp conversation
      const url = generateWhatsAppUrl({ 
        name, 
        phone: cleanPhone, 
        address, 
        courier, 
        payment, 
        notes: `Email: ${email}`, 
        orderId: finalOrderId 
      }, cartItems, finalTotal, finalOrderId);

      const waWin = window.open(url, '_blank');
      if (!waWin || waWin.closed || typeof waWin.closed === 'undefined') {
        window.location.href = url;
      }

      clearCart();
      closeCheckout();
      renderCartItems();
      document.getElementById('checkoutForm')?.reset();
    } catch (err) {
      console.error('[Checkout Error]', err);
      const userErrMsg = err.message && err.message.includes('Stok') 
        ? err.message 
        : `⚠️ Gagal memproses pesanan: ${err.message || 'Silakan coba beberapa saat lagi.'}`;
      if (errEl) {
        errEl.textContent = userErrMsg;
        errEl.style.display = 'block';
      } else {
        alert(userErrMsg);
      }
    } finally {
      isSubmittingOrder = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        submitBtn.innerHTML = originalBtnContent;
      }
    }
  });

  // Listen to cart updates, auth changes, currency changes, and logout events from any page
  window.addEventListener('cart:updated', () => renderCartItems());
  window.addEventListener('mustaz:auth_synced', () => renderCartItems());
  window.addEventListener('mustaz:currency_changed', () => {
    renderCartItems();
    renderCheckoutSummary();
  });
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
