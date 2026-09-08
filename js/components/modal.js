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
