// ============================================================================
// HOOKOS — referral UI
// UI-only integration. Backend referral verification/rewarding is intentionally
// not faked here. When backend support exists, set the adapter methods below.
// ============================================================================

(function initReferralUI() {
  const REWARD_PER_REFERRAL = 2;

  function getCurrentUrlRef() {
    try {
      return new URL(window.location.href).searchParams.get('ref') || '';
    } catch (_) {
      return '';
    }
  }

  function ensureToastStyles() {
    if (document.getElementById('hookos-referral-styles')) return;
    const style = document.createElement('style');
    style.id = 'hookos-referral-styles';
    style.textContent = `
      .referral-card{position:relative;overflow:hidden;margin-top:18px;padding:24px;border:1px solid var(--border);border-radius:24px;background:#fff;box-shadow:0 10px 34px rgba(0,0,0,.035)}
      .referral-card::after{content:"";position:absolute;inset:auto -50px -50px auto;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,#dcfce7 0%,rgba(220,252,231,0) 70%);pointer-events:none}
      .referral-eyebrow{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#6b7280}
      .referral-dot{width:8px;height:8px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 4px #dcfce7}
      .referral-card h2{margin:10px 0 8px;font-size:28px;letter-spacing:-.04em;line-height:1.05}
      .referral-copy{margin:0;max-width:54ch;color:#6b7280;font-size:15px;line-height:1.55}
      .referral-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px;align-items:center}
      .referral-copy-btn{border:0;background:#16a34a;color:#fff;border-radius:12px;padding:12px 16px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;transition:transform .18s var(--ease),background .18s var(--ease)}
      .referral-copy-btn:hover{background:#15803d;transform:translateY(-1px)}
      .referral-copy-btn:focus-visible{outline:3px solid #bbf7d0;outline-offset:2px}
      .referral-meta{display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;font-size:13px;color:#6b7280}
      .referral-meta strong{color:#111}
      .referral-toast{position:fixed;left:50%;bottom:22px;z-index:1000;transform:translate(-50%,16px);opacity:0;pointer-events:none;padding:12px 16px;border-radius:14px;background:#111312;color:#fff;box-shadow:0 16px 40px rgba(0,0,0,.2);font-size:14px;font-weight:700;transition:opacity .2s var(--ease),transform .2s var(--ease)}
      .referral-toast.is-visible{opacity:1;transform:translate(-50%,0)}
      .referral-invite{margin:16px 0 0;padding:12px 14px;border:1px solid #bbf7d0;border-radius:14px;background:#f0fdf4;color:#15803d;font-size:13px;font-weight:700}
      @media(max-width:640px){.referral-card{padding:20px;border-radius:20px}.referral-card h2{font-size:24px}.referral-copy-btn{width:100%;min-height:46px}.referral-meta{gap:10px;flex-direction:column}.referral-toast{left:16px;right:16px;bottom:16px;transform:translateY(16px)}.referral-toast.is-visible{transform:translateY(0)}}
    `;
    document.head.appendChild(style);
  }

  function getReferralApi() {
    return window.HookosReferralAPI || null;
  }

  async function getReferralData() {
    const api = getReferralApi();
    if (!api?.getSummary) return null;
    try { return await api.getSummary(); } catch (_) { return null; }
  }

  async function getReferralLink() {
    const api = getReferralApi();
    if (api?.getLink) {
      try {
        const result = await api.getLink();
        if (result?.link) return result.link;
      } catch (_) {}
    }

    // UI-only fallback: use the authenticated account's opaque referral token
    // if the backend exposes one through the auth object. Never use email/name.
    const opaqueCode = window.HookosAuth?.getReferralCode?.() || '';
    if (!opaqueCode) return '';
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/[^/]*$/, '');
    url.search = '';
    url.hash = '';
    url.searchParams.set('ref', opaqueCode);
    return url.toString();
  }

  function ensureToast() {
    if (document.getElementById('hookos-referral-toast')) return;
    const toast = document.createElement('div');
    toast.id = 'hookos-referral-toast';
    toast.className = 'referral-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  function showToast(message) {
    ensureToast();
    const toast = document.getElementById('hookos-referral-toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
  }

  async function copyInviteLink(button) {
    const link = await getReferralLink();
    if (!link) {
      showToast('Referral link is not available yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      const original = button.textContent;
      button.textContent = 'Copied ✓';
      showToast('Invite link copied.');
      window.setTimeout(() => { button.textContent = original; }, 1500);
    } catch (_) {
      const input = document.createElement('input');
      input.value = link;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try { document.execCommand('copy'); } catch (_) {}
      input.remove();
      showToast('Invite link copied.');
    }
  }

  function mountInviteBanner() {
    const ref = getCurrentUrlRef();
    if (!ref) return;
    if (document.getElementById('hookos-referral-invite')) return;
    const main = document.querySelector('#main');
    if (!main) return;
    const banner = document.createElement('div');
    banner.id = 'hookos-referral-invite';
    banner.className = 'container';
    banner.innerHTML = '<div class="referral-invite">✦ You\'ve been invited to HookOS. Create your first reel blueprint.</div>';
    main.insertBefore(banner, main.firstElementChild);
  }

  async function mountReferralCard() {
    const host = document.querySelector('.dashboard-stats');
    if (!host || document.getElementById('hookos-referral-card')) return;
    const card = document.createElement('section');
    card.id = 'hookos-referral-card';
    card.className = 'referral-card';
    card.innerHTML = `
      <div class="referral-eyebrow"><span class="referral-dot" aria-hidden="true"></span> Refer & Earn</div>
      <h2>Need more generations?</h2>
      <p class="referral-copy">Invite a friend to HookOS. When they successfully join, you get <strong>+2 generations.</strong></p>
      <div class="referral-actions">
        <button type="button" class="referral-copy-btn" id="hookos-copy-referral">Copy Invite Link ↗</button>
      </div>
      <div class="referral-meta" id="hookos-referral-meta"><span>Referral data unavailable</span></div>
    `;
    host.insertAdjacentElement('afterend', card);

    document.getElementById('hookos-copy-referral')?.addEventListener('click', (event) => copyInviteLink(event.currentTarget));

    const data = await getReferralData();
    const meta = document.getElementById('hookos-referral-meta');
    if (!meta) return;
    if (data && typeof data.successful === 'number' && typeof data.earned === 'number') {
      meta.innerHTML = `<span><strong>${data.successful}</strong> successful</span><span><strong>+${data.earned}</strong> generations earned</span>`;
    } else {
      meta.innerHTML = `<span>+${REWARD_PER_REFERRAL} generations per successful referral</span>`;
    }
  }

  function mountFooterReferralCta() {
    const footer = document.querySelector('footer .footer-top');
    if (!footer || document.getElementById('hookos-footer-referral')) return;
    const el = document.createElement('div');
    el.id = 'hookos-footer-referral';
    el.className = 'footer-referral';
    el.innerHTML = '<h3>Invite Friends</h3><p>Get +2 generations for every successful referral.</p><a href="dashboard.html#referral">Invite Friends →</a>';
    footer.insertBefore(el, footer.lastElementChild);
  }

  function init() {
    ensureToastStyles();
    mountInviteBanner();
    mountFooterReferralCta();
    mountReferralCard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
