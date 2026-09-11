/**
 * MUSTAZ Garage Zine - Brutalist Modal Dialog Engine
 * Replaces native browser alert(), confirm(), and prompt() with branded brutalist dialogs.
 */

function getOrCreateModalContainer() {
  let container = document.getElementById('brutalModalContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'brutalModalContainer';
    container.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 16px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
    `;
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a Brutalist Confirmation Modal (Replaces confirm())
 * @param {Object} options
 * @param {string} options.title - Headline
 * @param {string} options.message - Body text / explanation
 * @param {string} [options.badge] - Category / security badge text
 * @param {string} [options.confirmText] - Label for affirmative button
 * @param {string} [options.cancelText] - Label for dismiss button
 * @param {string} [options.confirmColor] - Custom background for confirm (e.g. red for logout/delete)
 * @param {boolean} [options.isDanger] - If true, styles as critical alert
 * @returns {Promise<boolean>}
 */
export function showBrutalConfirm({
  title = 'KONFIRMASI TINDAKAN',
  message = 'Apakah Anda yakin ingin melanjutkan?',
  badge = 'GARAGE PROTOCOL // CONFIRM',
  confirmText = 'YA, LANJUTKAN',
  cancelText = 'BATAL',
  confirmColor = 'var(--accent-pink)',
  isDanger = false
} = {}) {
  return new Promise((resolve) => {
    const container = getOrCreateModalContainer();

    const activeColor = isDanger ? '#dc2626' : confirmColor;
    const activeBorder = isDanger ? '#ef4444' : 'var(--accent-pink)';

    container.innerHTML = `
      <div class="brutal-dialog-card" style="
        background: #0f0f0f;
        border: 3px solid ${activeBorder};
        box-shadow: 8px 8px 0px #000000;
        width: 100%;
        max-width: 440px;
        padding: 24px;
        position: relative;
        transform: scale(0.95) translateY(8px);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        color: #FFFFFF;
      ">
        <div style="
          display: inline-block;
          background: #000000;
          color: ${isDanger ? '#ef4444' : 'var(--accent-yellow)'};
          border: 1px solid ${isDanger ? '#ef4444' : 'var(--accent-yellow)'};
          padding: 3px 8px;
          font-family: var(--font-mono-sub);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 12px;
        ">
          ${badge}
        </div>

        <h3 style="
          font-family: var(--font-headline);
          font-size: clamp(1.25rem, 5vw, 1.55rem);
          color: #FFFFFF;
          margin: 0 0 10px;
          line-height: 1.05;
          text-transform: uppercase;
          letter-spacing: -0.01em;
        ">
          ${title}
        </h3>

        <p style="
          font-family: var(--font-body);
          font-size: 0.88rem;
          color: #CCCCCC;
          line-height: 1.55;
          margin: 0 0 22px;
          white-space: pre-line;
        ">
          ${message}
        </p>

        <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
          <button id="brutalCancelBtn" type="button" style="
            background: #181818;
            color: #FFFFFF;
            border: 2px solid #333333;
            padding: 10px 18px;
            font-family: var(--font-headline);
            font-size: 0.88rem;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 2px 2px 0px #000;
          ">
            ${cancelText}
          </button>
          <button id="brutalConfirmBtn" type="button" style="
            background: ${activeColor};
            color: #FFFFFF;
            border: 2px solid #000000;
            padding: 10px 20px;
            font-family: var(--font-headline);
            font-size: 0.88rem;
            font-weight: 900;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 3px 3px 0px #000000;
          ">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    // Show modal
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    const card = container.querySelector('.brutal-dialog-card');
    requestAnimationFrame(() => {
      if (card) card.style.transform = 'scale(1) translateY(0)';
    });

    const cleanup = (result) => {
      container.style.opacity = '0';
      if (card) card.style.transform = 'scale(0.95) translateY(8px)';
      setTimeout(() => {
        container.style.visibility = 'hidden';
        container.innerHTML = '';
      }, 200);
      document.removeEventListener('keydown', handleKey);
      resolve(result);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') cleanup(false);
      if (e.key === 'Enter') cleanup(true);
    };

    document.addEventListener('keydown', handleKey);

    const cancelBtn = container.querySelector('#brutalCancelBtn');
    const confirmBtn = container.querySelector('#brutalConfirmBtn');

    if (cancelBtn) cancelBtn.addEventListener('click', () => cleanup(false));
    if (confirmBtn) confirmBtn.addEventListener('click', () => cleanup(true));

    container.addEventListener('click', (e) => {
      if (e.target === container) cleanup(false);
    });
  });
}

/**
 * Show a Brutalist Alert Modal (Replaces alert())
 * @param {Object} options
 * @returns {Promise<void>}
 */
export function showBrutalAlert({
  title = 'PEMBERITAHUAN',
  message = '',
  badge = 'DISPATCH NOTICE',
  okText = 'MENGERTI',
  onOk = null,
  isDanger = false
} = {}) {
  return new Promise((resolve) => {
    const container = getOrCreateModalContainer();

    container.innerHTML = `
      <div class="brutal-dialog-card" style="
        background: #0f0f0f;
        border: 3px solid ${isDanger ? '#ef4444' : 'var(--accent-pink)'};
        box-shadow: 8px 8px 0px #000000;
        width: 100%;
        max-width: 440px;
        padding: 24px;
        position: relative;
        transform: scale(0.95) translateY(8px);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        color: #FFFFFF;
      ">
        <div style="
          display: inline-block;
          background: #000000;
          color: var(--accent-yellow);
          border: 1px solid var(--accent-yellow);
          padding: 3px 8px;
          font-family: var(--font-mono-sub);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 12px;
        ">
          ${badge}
        </div>

        <h3 style="
          font-family: var(--font-headline);
          font-size: clamp(1.25rem, 5vw, 1.55rem);
          color: #FFFFFF;
          margin: 0 0 10px;
          line-height: 1.05;
          text-transform: uppercase;
        ">
          ${title}
        </h3>

        <p style="
          font-family: var(--font-body);
          font-size: 0.88rem;
          color: #CCCCCC;
          line-height: 1.55;
          margin: 0 0 22px;
          white-space: pre-line;
        ">
          ${message}
        </p>

        <div style="display: flex; justify-content: flex-end;">
          <button id="brutalOkBtn" type="button" style="
            background: var(--accent-pink);
            color: #FFFFFF;
            border: 2px solid #000000;
            padding: 10px 24px;
            font-family: var(--font-headline);
            font-size: 0.9rem;
            font-weight: 900;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 3px 3px 0px #000000;
          ">
            ${okText}
          </button>
        </div>
      </div>
    `;

    container.style.visibility = 'visible';
    container.style.opacity = '1';
    const card = container.querySelector('.brutal-dialog-card');
    requestAnimationFrame(() => {
      if (card) card.style.transform = 'scale(1) translateY(0)';
    });

    const cleanup = () => {
      container.style.opacity = '0';
      if (card) card.style.transform = 'scale(0.95) translateY(8px)';
      setTimeout(() => {
        container.style.visibility = 'hidden';
        container.innerHTML = '';
      }, 200);
      document.removeEventListener('keydown', handleKey);
      if (typeof onOk === 'function') onOk();
      resolve();
    };

    const handleKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') cleanup();
    };

    document.addEventListener('keydown', handleKey);

    const okBtn = container.querySelector('#brutalOkBtn');
    if (okBtn) {
      okBtn.focus();
      okBtn.addEventListener('click', cleanup);
    }

    container.addEventListener('click', (e) => {
      if (e.target === container) cleanup();
    });
  });
}

/**
 * Show a Multi-Field Brutalist Form Modal (e.g. for Add Address)
 * @param {Object} options
 * @returns {Promise<Object|null>} Form values or null if cancelled
 */
export function showBrutalFormModal({
  title = 'INPUT DATA',
  badge = 'GARAGE FORM',
  fields = [],
  submitText = 'SIMPAN',
  cancelText = 'BATAL'
} = {}) {
  return new Promise((resolve) => {
    const container = getOrCreateModalContainer();

    const fieldsHtml = fields.map((f, i) => `
      <div style="margin-bottom: 14px;">
        <label style="
          display: block;
          font-family: var(--font-mono-sub);
          font-size: 0.72rem;
          color: var(--accent-yellow);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 800;
          margin-bottom: 6px;
        ">
          ${f.label} ${f.required ? '<span style="color:var(--accent-pink);">*</span>' : ''}
        </label>
        ${f.type === 'textarea' ? `
          <textarea id="bfield_${f.name}" name="${f.name}" rows="3" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''} style="
            width: 100%;
            background: #141414;
            color: #FFFFFF;
            border: 2px solid #2A2A2A;
            padding: 10px 12px;
            font-family: inherit;
            font-size: 0.85rem;
            box-sizing: border-box;
            outline: none;
            resize: vertical;
          ">${f.value || ''}</textarea>
        ` : `
          <input id="bfield_${f.name}" type="${f.type || 'text'}" name="${f.name}" placeholder="${f.placeholder || ''}" value="${f.value || ''}" ${f.required ? 'required' : ''} style="
            width: 100%;
            background: #141414;
            color: #FFFFFF;
            border: 2px solid #2A2A2A;
            padding: 10px 12px;
            font-family: inherit;
            font-size: 0.85rem;
            box-sizing: border-box;
            outline: none;
          ">
        `}
      </div>
    `).join('');

    container.innerHTML = `
      <div class="brutal-dialog-card" style="
        background: #0f0f0f;
        border: 3px solid var(--accent-pink);
        box-shadow: 8px 8px 0px #000000;
        width: 100%;
        max-width: 480px;
        padding: 24px;
        position: relative;
        transform: scale(0.95) translateY(8px);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        color: #FFFFFF;
        max-height: 90vh;
        overflow-y: auto;
      ">
        <div style="
          display: inline-block;
          background: #000000;
          color: var(--accent-yellow);
          border: 1px solid var(--accent-yellow);
          padding: 3px 8px;
          font-family: var(--font-mono-sub);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 12px;
        ">
          ${badge}
        </div>

        <h3 style="
          font-family: var(--font-headline);
          font-size: clamp(1.25rem, 5vw, 1.55rem);
          color: #FFFFFF;
          margin: 0 0 16px;
          line-height: 1.05;
          text-transform: uppercase;
        ">
          ${title}
        </h3>

        <form id="brutalCustomForm">
          ${fieldsHtml}
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button id="brutalFormCancel" type="button" style="
              background: #181818;
              color: #FFFFFF;
              border: 2px solid #333333;
              padding: 10px 18px;
              font-family: var(--font-headline);
              font-size: 0.88rem;
              font-weight: 800;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              cursor: pointer;
            ">
              ${cancelText}
            </button>
            <button type="submit" style="
              background: var(--accent-pink);
              color: #FFFFFF;
              border: 2px solid #000000;
              padding: 10px 22px;
              font-family: var(--font-headline);
              font-size: 0.88rem;
              font-weight: 900;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              cursor: pointer;
              box-shadow: 3px 3px 0px #000000;
            ">
              ${submitText}
            </button>
          </div>
        </form>
      </div>
    `;

    container.style.visibility = 'visible';
    container.style.opacity = '1';
    const card = container.querySelector('.brutal-dialog-card');
    requestAnimationFrame(() => {
      if (card) card.style.transform = 'scale(1) translateY(0)';
      const firstInput = container.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
    });

    const cleanup = (data) => {
      container.style.opacity = '0';
      if (card) card.style.transform = 'scale(0.95) translateY(8px)';
      setTimeout(() => {
        container.style.visibility = 'hidden';
        container.innerHTML = '';
      }, 200);
      resolve(data);
    };

    const form = container.querySelector('#brutalCustomForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = {};
      fields.forEach(f => {
        const el = container.querySelector(`#bfield_${f.name}`);
        result[f.name] = el ? el.value.trim() : '';
      });
      cleanup(result);
    });

    const cancelBtn = container.querySelector('#brutalFormCancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => cleanup(null));

    container.addEventListener('click', (e) => {
      if (e.target === container) cleanup(null);
    });
  });
}

/**
 * Show a Verified Buyer Review Modal (Scheme 1)
 * @param {Object} options
 * @param {string} options.orderId - e.g. "MSTZ-9942"
 * @param {string} options.productName - Product name
 * @param {string} [options.productImage] - Product image
 * @param {string} [options.productSpec] - Product spec
 * @param {string} [options.riderName] - Pre-filled rider name
 * @param {string} [options.bikeModel] - Pre-filled bike model
 * @param {string} [options.city] - Pre-filled city
 * @param {number} [options.existingRating] - Pre-existing rating
 * @param {string} [options.existingComment] - Pre-existing comment
 * @returns {Promise<Object|null>}
 */
export function showBrutalReviewModal({
  orderId = '',
  productName = 'MUSTAZ PET HELM',
  productImage = 'assets/images/pet_visor_yellow_flame.png',
  productSpec = 'OFFICIAL MUSTAZ SPEC',
  riderName = '',
  bikeModel = '',
  city = '',
  existingRating = 5,
  existingComment = ''
} = {}) {
  return new Promise((resolve) => {
    const container = getOrCreateModalContainer();

    let currentRating = existingRating || 5;
    const ratingLabels = {
      1: '1/5 ★ KECEWA // PERLU EVALUASI',
      2: '2/5 ★★ KURANG MEMUASKAN',
      3: '3/5 ★★★ CUKUP BAIK // STANDAR',
      4: '4/5 ★★★★ PUAS // MATERIAL SOLID',
      5: '5/5 ★★★★★ SANGAT PUAS // SANGAT REKOMENDED!'
    };

    container.innerHTML = `
      <div class="brutal-dialog-card" style="
        background: #0d0d0d;
        border: 3px solid var(--accent-yellow);
        box-shadow: 10px 10px 0px #000000;
        width: 100%;
        max-width: 520px;
        padding: 24px;
        position: relative;
        transform: scale(0.95) translateY(8px);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        color: #FFFFFF;
        max-height: 92vh;
        overflow-y: auto;
      ">
        <!-- Top Verified Badge -->
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #ff2d78;
            color: #FFFFFF;
            border: 1px solid #000;
            padding: 4px 10px;
            font-family: var(--font-mono-sub);
            font-size: 0.72rem;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          ">
            <span>✓</span> VERIFIED BUYER ONLY
          </div>
          <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:var(--accent-yellow);font-weight:800;">
            ORDER #${orderId || 'AUTHENTIC'}
          </span>
        </div>

        <h3 style="
          font-family: var(--font-headline);
          font-size: clamp(1.35rem, 5vw, 1.7rem);
          color: #FFFFFF;
          margin: 0 0 6px;
          line-height: 1.05;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        ">
          ULASAN & RATING RIDER
        </h3>
        <p style="font-family:var(--font-mono-sub);font-size:0.78rem;color:#888;margin:0 0 16px;line-height:1.4;">
          Ulasan Anda akan dipublikasikan ke halaman Kulture & Komunitas dengan lencana resmi <strong style="color:#FFF;">[✓ VERIFIED RIDER]</strong>.
        </p>

        <!-- Product Preview Strip -->
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          background: #161616;
          border: 2px solid #2a2a2a;
          padding: 10px 12px;
          margin-bottom: 20px;
        ">
          <img src="${productImage}" alt="${productName}" style="
            width: 48px;
            height: 48px;
            object-fit: cover;
            border: 1px solid #444;
            background: #000;
            flex-shrink: 0;
          ">
          <div style="flex:1;min-width:0;">
            <div style="font-family:var(--font-headline);font-size:1.05rem;color:#FFF;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${productName}
            </div>
            <div style="font-family:var(--font-mono-sub);font-size:0.72rem;color:#888;">
              ${productSpec}
            </div>
          </div>
        </div>

        <form id="brutalReviewForm">
          <!-- Star Rating Selector -->
          <div style="margin-bottom: 20px; text-align: center; background:#141414; border:2px dashed #333; padding:16px 12px;">
            <label style="
              display: block;
              font-family: var(--font-mono-sub);
              font-size: 0.72rem;
              color: var(--accent-yellow);
              letter-spacing: 0.14em;
              text-transform: uppercase;
              font-weight: 800;
              margin-bottom: 8px;
            ">
              SKOR KEPUASAN (RATING BINTANG) <span style="color:var(--accent-pink);">*</span>
            </label>
            
            <div id="starContainer" style="display:inline-flex;gap:8px;font-size:2.2rem;cursor:pointer;user-select:none;line-height:1;">
              <span class="star-btn" data-val="1" style="color:var(--accent-yellow);transition:transform 0.1s;">★</span>
              <span class="star-btn" data-val="2" style="color:var(--accent-yellow);transition:transform 0.1s;">★</span>
              <span class="star-btn" data-val="3" style="color:var(--accent-yellow);transition:transform 0.1s;">★</span>
              <span class="star-btn" data-val="4" style="color:var(--accent-yellow);transition:transform 0.1s;">★</span>
              <span class="star-btn" data-val="5" style="color:var(--accent-yellow);transition:transform 0.1s;">★</span>
            </div>

            <div id="starFeedbackText" style="
              font-family: var(--font-mono-sub);
              font-size: 0.75rem;
              color: #FFF;
              font-weight: 800;
              letter-spacing: 0.06em;
              margin-top: 8px;
              color: var(--accent-yellow);
            ">
              ${ratingLabels[currentRating]}
            </div>
          </div>

          <!-- Two-col: Bike Model & City -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
            <div>
              <label style="
                display: block;
                font-family: var(--font-mono-sub);
                font-size: 0.7rem;
                color: #AAA;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                font-weight: 800;
                margin-bottom: 6px;
              ">
                MOTOR / BUILD <span style="color:var(--accent-pink);">*</span>
              </label>
              <input id="revBikeModel" type="text" placeholder="Contoh: RE 350 / W175 / CB100" value="${bikeModel}" required style="
                width: 100%;
                background: #141414;
                color: #FFFFFF;
                border: 2px solid #2A2A2A;
                padding: 10px;
                font-family: inherit;
                font-size: 0.85rem;
                box-sizing: border-box;
                outline: none;
              ">
            </div>

            <div>
              <label style="
                display: block;
                font-family: var(--font-mono-sub);
                font-size: 0.7rem;
                color: #AAA;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                font-weight: 800;
                margin-bottom: 6px;
              ">
                KOTA / ASAL RIDER <span style="color:var(--accent-pink);">*</span>
              </label>
              <input id="revCity" type="text" placeholder="Contoh: Bandung / Jaksel" value="${city}" required style="
                width: 100%;
                background: #141414;
                color: #FFFFFF;
                border: 2px solid #2A2A2A;
                padding: 10px;
                font-family: inherit;
                font-size: 0.85rem;
                box-sizing: border-box;
                outline: none;
              ">
            </div>
          </div>

          <!-- Review Textarea -->
          <div style="margin-bottom: 20px;">
            <label style="
              display: block;
              font-family: var(--font-mono-sub);
              font-size: 0.7rem;
              color: #AAA;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              font-weight: 800;
              margin-bottom: 6px;
            ">
              ULASAN & PENGALAMAN RIDING <span style="color:var(--accent-pink);">*</span>
            </label>
            <textarea id="revComment" rows="4" placeholder="Ceritakan kepresisian fitting ke helm, kualitas bahan akrilik/leather, dan ketahanan di jalanan..." required style="
              width: 100%;
              background: #141414;
              color: #FFFFFF;
              border: 2px solid #2A2A2A;
              padding: 12px;
              font-family: inherit;
              font-size: 0.88rem;
              box-sizing: border-box;
              outline: none;
              resize: vertical;
              line-height: 1.45;
            ">${existingComment}</textarea>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
            <button id="revCancelBtn" type="button" style="
              background: #181818;
              color: #FFFFFF;
              border: 2px solid #333333;
              padding: 10px 18px;
              font-family: var(--font-headline);
              font-size: 0.88rem;
              font-weight: 800;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              cursor: pointer;
            ">
              BATAL
            </button>
            <button type="submit" style="
              background: var(--accent-pink);
              color: #FFFFFF;
              border: 2px solid #000000;
              padding: 10px 22px;
              font-family: var(--font-headline);
              font-size: 0.88rem;
              font-weight: 900;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              cursor: pointer;
              box-shadow: 4px 4px 0px #000000;
            ">
              KIRIM ULASAN RESMI [VERIFIED RIDER] →
            </button>
          </div>
        </form>
      </div>
    `;

    container.style.visibility = 'visible';
    container.style.opacity = '1';
    const card = container.querySelector('.brutal-dialog-card');
    requestAnimationFrame(() => {
      if (card) card.style.transform = 'scale(1) translateY(0)';
    });

    // Star selector interaction
    const starBtns = container.querySelectorAll('.star-btn');
    const feedbackText = container.querySelector('#starFeedbackText');

    const updateStars = (val) => {
      currentRating = val;
      starBtns.forEach(btn => {
        const btnVal = Number(btn.getAttribute('data-val'));
        if (btnVal <= val) {
          btn.style.color = 'var(--accent-yellow)';
          btn.style.textShadow = '0 0 10px rgba(250, 204, 21, 0.4)';
        } else {
          btn.style.color = '#383838';
          btn.style.textShadow = 'none';
        }
      });
      if (feedbackText) {
        feedbackText.textContent = ratingLabels[val] || `${val}/5 BINTANG`;
      }
    };

    updateStars(currentRating);

    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = Number(btn.getAttribute('data-val'));
        updateStars(val);
      });
      btn.addEventListener('mouseenter', () => {
        const val = Number(btn.getAttribute('data-val'));
        btn.style.transform = 'scale(1.2)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
      });
    });

    const cleanup = (data) => {
      container.style.opacity = '0';
      if (card) card.style.transform = 'scale(0.95) translateY(8px)';
      setTimeout(() => {
        container.style.visibility = 'hidden';
        container.innerHTML = '';
      }, 200);
      resolve(data);
    };

    const form = container.querySelector('#brutalReviewForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bikeModelVal = container.querySelector('#revBikeModel').value.trim();
      const cityVal = container.querySelector('#revCity').value.trim();
      const commentVal = container.querySelector('#revComment').value.trim();

      if (!bikeModelVal || !cityVal || !commentVal) return;

      cleanup({
        rating: currentRating,
        bikeModel: bikeModelVal,
        city: cityVal,
        comment: commentVal
      });
    });

    const cancelBtn = container.querySelector('#revCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => cleanup(null));

    container.addEventListener('click', (e) => {
      if (e.target === container) cleanup(null);
    });
  });
}

