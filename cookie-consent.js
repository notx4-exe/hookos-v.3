// ===========================================================================
// HOOKOS — cookie consent banner
// Stores the choice in localStorage; no cookies are set for tracking, and
// none of HOOKOS's own cookies (session, CSRF) are optional/marketing —
// they're strictly necessary for login and security, so the banner is
// informational rather than gating functionality.
// ===========================================================================

(function () {
  const STORAGE_KEY = 'hookos-cookie-consent';

  function hasConsented() {
    try {
      return Boolean(window.localStorage.getItem(STORAGE_KEY));
    } catch (_) {
      return true;
    }
  }

  function setConsent(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      /* ignore */
    }
  }

  function installCookieStyles() {
    if (document.getElementById('hookos-cookie-styles')) return;
    const style = document.createElement('style');
    style.id = 'hookos-cookie-styles';
    style.textContent = `
      .cookie-banner {
        position:fixed !important;
        left:50% !important;
        bottom:20px !important;
        z-index:2000 !important;
        width:min(680px,calc(100vw - 32px)) !important;
        margin:0 !important;
        padding:18px 20px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:20px !important;
        background:#EEEEEE !important;
        color:#313841 !important;
        border:1px solid #313841 !important;
        border-radius:20px !important;
        box-shadow:0 18px 55px rgba(49,56,65,.16) !important;
        transform:translate(-50%,calc(100% + 28px)) !important;
        opacity:0 !important;
        transition:transform .25s cubic-bezier(.16,1,.3,1),opacity .2s ease !important;
      }
      .cookie-banner.is-visible { transform:translate(-50%,0) !important; opacity:1 !important; }
      .cookie-banner p { margin:0 !important; max-width:48ch; color:#313841 !important; font-size:14px !important; line-height:1.5 !important; }
      .cookie-banner p a { color:#313841 !important; font-weight:700 !important; text-decoration:underline !important; text-underline-offset:3px !important; }
      .cookie-banner-actions { display:flex !important; align-items:center !important; gap:8px !important; flex:0 0 auto !important; }
      .cookie-banner-actions .btn { min-height:42px !important; border-radius:999px !important; font-weight:800 !important; }
      .cookie-banner-actions .btn-secondary { background:transparent !important; color:#313841 !important; border:1px solid #313841 !important; box-shadow:none !important; }
      .cookie-banner-actions .btn-secondary:hover { background:rgba(49,56,65,.06) !important; border-color:#313841 !important; }
      .cookie-banner-actions .btn-primary { background:#FBFC09 !important; color:#313841 !important; border:1px solid #FBFC09 !important; box-shadow:none !important; }
      .cookie-banner-actions .btn-primary:hover { background:#FBFC09 !important; color:#313841 !important; }
      @media(max-width:600px){
        .cookie-banner { width:calc(100vw - 20px) !important; bottom:10px !important; padding:16px !important; flex-direction:column !important; align-items:stretch !important; gap:14px !important; border-radius:18px !important; }
        .cookie-banner-actions { width:100% !important; }
        .cookie-banner-actions .btn { flex:1 1 0 !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function renderBanner() {
    if (hasConsented()) return;
    installCookieStyles();

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie notice');
    banner.innerHTML = `
      <p>
        HookOS uses strictly necessary cookies for sign-in and security.
        See our <a href="cookies.html">Cookie Policy</a>.
      </p>
      <div class="cookie-banner-actions">
        <button type="button" class="btn btn-secondary btn-sm" data-cookie-action="decline">Decline</button>
        <button type="button" class="btn btn-primary btn-sm" data-cookie-action="accept">Accept</button>
      </div>`;

    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('is-visible'));

    banner.addEventListener('click', (e) => {
      const action = e.target.closest('[data-cookie-action]')?.dataset.cookieAction;
      if (!action) return;
      setConsent(action);
      banner.classList.remove('is-visible');
      window.setTimeout(() => banner.remove(), 250);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBanner);
  } else {
    renderBanner();
  }
})();