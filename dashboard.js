// ============================================================================
// HOOKOS — dashboard
// ============================================================================

(function initDashboard() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;

  let historyItems = [];

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function getValue(item, key, fallback = '') {
    const blueprint = item?.blueprint || item?.result || item?.output || {};
    return item?.[key] ?? blueprint?.[key] ?? fallback;
  }

  function formatContent(value) {
    if (Array.isArray(value)) return value.join('\n');
    if (value && typeof value === 'object') return Object.values(value).join('\n');
    return value == null ? '' : String(value);
  }

  function ensureHistoryDetailModal() {
    if (document.getElementById('hookos-history-detail')) return;
    const style = document.createElement('style');
    style.id = 'hookos-history-detail-styles';
    style.textContent = `
      .history-item{cursor:pointer}
      .history-item:focus-visible{outline:3px solid #FBFC09;outline-offset:3px}
      .hookos-history-detail-backdrop{position:fixed;inset:0;z-index:1600;background:rgba(49,56,65,.30);backdrop-filter:blur(3px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .2s ease,visibility .2s ease}
      .hookos-history-detail-backdrop.is-open{opacity:1;visibility:visible;pointer-events:auto}
      .hookos-history-detail{position:fixed;left:50%;top:50%;z-index:1601;width:min(92vw,720px);max-height:86vh;overflow:auto;transform:translate(-50%,-46%);opacity:0;visibility:hidden;pointer-events:none;background:#EEEEEE;color:#313841;border:1px solid #313841;border-radius:24px;box-shadow:0 28px 80px rgba(49,56,65,.18);padding:24px;transition:opacity .2s ease,transform .22s ease,visibility .2s ease}
      .hookos-history-detail.is-open{opacity:1;visibility:visible;pointer-events:auto;transform:translate(-50%,-50%)}
      .history-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px}
      .history-detail-kicker{font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(49,56,65,.72);margin-bottom:6px}
      .history-detail-title{font-size:clamp(24px,5vw,34px);line-height:1.08;letter-spacing:-.04em;font-weight:800;margin:0}
      .history-detail-close{width:42px;height:42px;flex:0 0 42px;border:1px solid #313841;border-radius:50%;background:transparent;color:#313841;font-size:26px;line-height:1;display:inline-flex;align-items:center;justify-content:center}
      .history-detail-section{border-top:1px solid rgba(49,56,65,.18);padding:18px 0}
      .history-detail-section:last-child{padding-bottom:0}
      .history-detail-label{font-size:11px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;margin-bottom:8px}
      .history-detail-content{font-size:16px;line-height:1.6;white-space:pre-wrap;color:rgba(49,56,65,.82)}
      @media(max-width:600px){.hookos-history-detail{width:calc(100vw - 24px);max-height:88vh;padding:20px;border-radius:20px}.history-detail-content{font-size:15px}}
    `;
    document.head.appendChild(style);

    document.body.insertAdjacentHTML('beforeend', `
      <div class="hookos-history-detail-backdrop" id="hookos-history-detail-backdrop"></div>
      <section class="hookos-history-detail" id="hookos-history-detail" role="dialog" aria-modal="true" aria-labelledby="history-detail-title">
        <div class="history-detail-head">
          <div><div class="history-detail-kicker">Saved blueprint</div><h2 class="history-detail-title" id="history-detail-title"></h2></div>
          <button type="button" class="history-detail-close" id="history-detail-close" aria-label="Close">×</button>
        </div>
        <div id="history-detail-body"></div>
      </section>
    `);

    const modal = document.getElementById('hookos-history-detail');
    const backdrop = document.getElementById('hookos-history-detail-backdrop');
    const close = () => {
      modal.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    document.getElementById('history-detail-close').addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  function openHistoryDetail(item, trigger) {
    ensureHistoryDetailModal();
    const modal = document.getElementById('hookos-history-detail');
    const backdrop = document.getElementById('hookos-history-detail-backdrop');
    const title = formatContent(getValue(item, 'title') || getValue(item, 'topic') || 'Untitled idea');
    const hook = formatContent(getValue(item, 'hook', 'No hook saved.'));
    const script = formatContent(getValue(item, 'script', 'No script saved.'));
    const cta = formatContent(getValue(item, 'cta', 'No CTA saved.'));

    document.getElementById('history-detail-title').textContent = title;
    document.getElementById('history-detail-body').innerHTML = [
      ['Hook', hook],
      ['Script', script],
      ['CTA', cta]
    ].map(([label, content]) => `
      <div class="history-detail-section">
        <div class="history-detail-label">${escapeHtml(label)}</div>
        <div class="history-detail-content">${escapeHtml(content)}</div>
      </div>
    `).join('');

    modal.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('history-detail-close').focus();
  }

  async function loadDashboard() {
    const authenticated = await HookosAuth.refresh();
    if (!authenticated) {
      window.location.replace('index.html');
      return;
    }
    await Promise.all([loadProfile(), loadUsage(), loadHistory()]);
  }

  async function loadProfile() {
    try {
      const response = await HookosAPI.getProfile();
      const profile = response?.data || {};
      document.getElementById('account-email').textContent = profile.email || '—';
      document.getElementById('account-name').textContent = profile.name || '';
      document.getElementById('account-plan').textContent = `${profile.plan || 'free'} plan`;
    } catch (err) {
      document.getElementById('account-email').textContent = err.message || 'Could not load account.';
    }
  }

  async function loadUsage() {
    try {
      const response = await HookosAPI.getUsage();
      const usage = response?.data || { used: 0, limit: 3, remaining: 3 };
      const limit = Number(usage.limit || 3);
      const remaining = Math.max(0, Number(usage.remaining ?? limit - Number(usage.used || 0)));
      document.getElementById('usage-number').textContent = remaining;
      document.getElementById('usage-copy').textContent = remaining === 0
        ? 'Daily limit reached. Come back tomorrow.'
        : `${remaining} generation${remaining === 1 ? '' : 's'} remaining today.`;
      document.getElementById('usage-bar').style.width = `${Math.min(100, (remaining / limit) * 100)}%`;
    } catch (err) {
      document.getElementById('usage-copy').textContent = err.message || 'Could not load usage.';
    }
  }

  async function loadHistory() {
    try {
      const response = await HookosAPI.getHistory();
      const items = Array.isArray(response?.data?.items)
        ? response.data.items
        : Array.isArray(response?.data)
          ? response.data
          : [];
      historyItems = items;
      const count = document.getElementById('history-count');
      if (count) count.textContent = items.length ? `${items.length} saved` : '';

      if (!items.length) {
        historyList.innerHTML = '<div class="dashboard-empty">No blueprints yet. Create your first one.</div>';
        return;
      }

      historyList.innerHTML = items.map((item, index) => `
        <article class="history-item" tabindex="0" role="button" aria-label="Open saved blueprint ${escapeHtml(getValue(item, 'title') || item.topic || 'Untitled idea')}" data-history-index="${index}" data-history-id="${escapeHtml(item.id)}">
          <div class="history-item-head">
            <div>
              <h3>${escapeHtml(item.topic || getValue(item, 'title') || 'Untitled idea')}</h3>
              <div class="history-meta">${escapeHtml(item.framework || 'Framework')} · ${escapeHtml(item.savedAt ? new Date(item.savedAt).toLocaleString() : '')}</div>
            </div>
            <button type="button" class="mini-btn" data-delete-history="${escapeHtml(item.id)}">Delete</button>
          </div>
          <div class="history-preview">${escapeHtml(item.hook || getValue(item, 'hook') || 'Saved blueprint')}</div>
        </article>
      `).join('');
    } catch (err) {
      historyList.innerHTML = `<div class="dashboard-empty">${escapeHtml(err.message || 'Could not load history.')}</div>`;
    }
  }

  historyList.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-history]');
    if (button) {
      const id = button.dataset.deleteHistory;
      if (!window.hookosOpenDeleteModal) return;
      window.hookosOpenDeleteModal(button, async () => {
        button.disabled = true;
        try {
          await HookosAPI.deleteHistoryItem(id);
          await loadHistory();
        } catch (err) {
          button.disabled = false;
          window.alert(err.message || 'Could not delete this blueprint.');
        }
      });
      return;
    }

    const card = event.target.closest('[data-history-index]');
    if (card) openHistoryDetail(historyItems[Number(card.dataset.historyIndex)], card);
  });

  historyList.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[data-history-index]');
    if (!card || event.target.closest('[data-delete-history]')) return;
    event.preventDefault();
    openHistoryDetail(historyItems[Number(card.dataset.historyIndex)], card);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadDashboard);
  else loadDashboard();
})();
