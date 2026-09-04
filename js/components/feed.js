/**
 * Live Data Feed & Supabase Form Interactivity
 */

import { getFeedbacks, createFeedback, subscribeToFeedbacks } from '../services/apiService.js';
import { isSupabaseConfigured } from '../services/supabaseClient.js';

export function initFeedComponent() {
  const form = document.getElementById('feedbackForm');
  const feedContainer = document.getElementById('feedList');
  const statusBadge = document.getElementById('dbStatusBadge');

  if (!form || !feedContainer) return;

  // Render DB Connection Status
  if (statusBadge) {
    if (isSupabaseConfigured()) {
      statusBadge.innerHTML = `<span class="badge badge-success">🟢 Connected: Supabase DB</span>`;
    } else {
      statusBadge.innerHTML = `<span class="badge badge-figma">🟡 Fallback: Local Storage Mode</span>`;
    }
  }

  // Load and render existing items
  async function loadFeed() {
    feedContainer.innerHTML = `<div class="skeleton" style="height: 60px; margin-bottom: 0.5rem;"></div>`;
    try {
      const items = await getFeedbacks();
      renderItems(items);
    } catch (err) {
      feedContainer.innerHTML = `<p style="color: #ef4444;">Gagal memuat data feed.</p>`;
    }
  }

  function renderItems(items) {
    if (!items || items.length === 0) {
      feedContainer.innerHTML = `<p class="card-desc">Belum ada data. Tambahkan pesan pertama!</p>`;
      return;
    }

    feedContainer.innerHTML = items.map(item => `
      <div style="background: rgba(15, 23, 42, 0.5); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <strong style="color: var(--primary-500); font-size: 0.95rem;">${escapeHtml(item.name)}</strong>
          <small style="color: var(--text-muted); font-size: 0.75rem;">${new Date(item.created_at).toLocaleTimeString()}</small>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">${escapeHtml(item.message)}</p>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('feedName');
    const msgInput = document.getElementById('feedMessage');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!nameInput.value.trim() || !msgInput.value.trim()) return;

    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Menyimpan...';
    submitBtn.disabled = true;

    try {
      await createFeedback(nameInput.value.trim(), msgInput.value.trim());
      nameInput.value = '';
      msgInput.value = '';
      await loadFeed();
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan data: ' + err.message);
    } finally {
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    }
  });

  // Initial Load
  loadFeed();

  // Realtime update listener
  subscribeToFeedbacks(() => {
    loadFeed();
  });
}
