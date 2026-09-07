// ============================================================================
// HOOKOS — shared navbar + footer
// ============================================================================

function hookosCurrentPageKey() {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  if (file === '' || file === 'index.html') return window.location.hash === '#generator' ? 'generator' : 'home';
  if (file === 'tutorial.html') return 'tutorial';
  if (file === 'support.html') return 'support';
  if (file === 'dashboard.html') return 'dashboard';
  if (file === 'pricing.html') return 'pricing';
  return null;
}

function renderNavbar() {
  const root = document.getElementById('navbar-root');
  if (!root) return;
  const active = hookosCurrentPageKey();
  const navItem = (key, href, label) => `<li><a href="${href}" data-nav="${key}"${active === key ? ' aria-current="page" class="is-active"' : ''}>${label}</a></li>`;
  root.innerHTML = `
    <header class="navbar">
      <div class="container">
        <a href="index.html" class="logo-link" aria-label="HOOKOS home"><span class="logo-wordmark">HOOKOS</span></a>
        <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-right" aria-label="Open menu"><span class="nav-toggle-bars"><span></span><span></span><span></span></span></button>
        <div class="nav-backdrop" id="nav-backdrop" aria-hidden="true"></div>
        <nav class="nav-right" id="nav-right" aria-label="Primary">
          <div class="mobile-nav-header"><span class="mobile-nav-title">HOOKOS</span><button type="button" class="mobile-nav-close" id="mobile-nav-close" aria-label="Close menu">×</button></div>
          <ul class="nav-links nav-links-core">
            ${navItem('home', 'index.html', 'Product')}
            ${navItem('generator', 'index.html#generator', 'Generator')}
            ${navItem('how-it-works', 'index.html#how-it-works', 'How It Works')}
            ${navItem('pricing', 'pricing.html', 'Pricing')}
          </ul>
          <div class="mobile-account-links" aria-label="Account">
            <div data-auth-state="signed-out"><a class="mobile-nav-link" href="index.html" data-action="google-login"><span>Sign In</span><span aria-hidden="true">→</span></a></div>
            <div data-auth-state="signed-in">
              <a class="mobile-nav-link" href="dashboard.html#history"><span>History</span><span aria-hidden="true">→</span></a>
              <button type="button" class="mobile-nav-link mobile-nav-logout" data-action="logout"><span>Logout</span><span aria-hidden="true">→</span></button>
            </div>
          </div>
          <div class="auth-area">
            <div data-auth-state="signed-out" class="is-active"><button type="button" class="btn btn-google" data-action="google-login"><span>Sign In</span></button></div>
            <div data-auth-state="signed-in" class="profile-menu" id="profile-menu">
              <button type="button" class="profile-trigger" id="profile-trigger" aria-haspopup="true" aria-expanded="false"><span class="avatar" data-user-initial aria-hidden="true">?</span><img class="avatar avatar-img" data-user-avatar alt="" hidden><span data-user-name>Account</span></button>
              <div class="profile-dropdown" role="menu"><button type="button" role="menuitem" data-action="logout">Log Out</button></div>
            </div>
          </div>
          <a href="index.html#generator" class="btn btn-primary">Generate My Reel →</a>
        </nav>
      </div>
    </header>`;
  initNavInteractions();
  installMobileNavStyles();
}

function installMobileNavStyles() {
  if (document.getElementById('hookos-mobile-nav-styles')) return;
  const style = document.createElement('style');
  style.id = 'hookos-mobile-nav-styles';
  style.textContent = `
    @media (max-width: 860px) {
      body.nav-open{overflow:hidden}
      .nav-backdrop{position:fixed;inset:0;z-index:109;background:rgba(17,19,18,.34);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .2s ease,visibility .2s ease}
      .nav-open .nav-backdrop{opacity:1;visibility:visible;pointer-events:auto}
      .nav-right{z-index:110;position:fixed;inset:0 0 0 auto;width:min(360px,88vw);height:100dvh;display:flex;flex-direction:column;align-items:stretch;gap:0;padding:0;background:#fff;border-left:1px solid #E5E7EB;border-radius:24px 0 0 24px;box-shadow:-18px 0 56px rgba(0,0,0,.14);transform:translateX(104%);visibility:hidden;pointer-events:none;overflow-y:auto;overscroll-behavior:contain;transition:transform .28s cubic-bezier(.16,1,.3,1),visibility .28s ease}
      .nav-open .nav-right{transform:translateX(0);visibility:visible;pointer-events:auto}
      .mobile-nav-header{display:flex;align-items:center;justify-content:space-between;min-height:72px;padding:0 18px 0 22px;border-bottom:1px solid #E5E7EB;flex-shrink:0}
      .mobile-nav-title{font-size:20px;font-weight:800;letter-spacing:-.04em}
      .mobile-nav-close{width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #E5E7EB;border-radius:50%;font-size:28px;font-weight:300;line-height:1;color:#111;background:#fff}
      .nav-right .nav-links-core{display:flex;flex-direction:column;gap:4px;padding:14px 12px 8px}
      .nav-right .nav-links-core a{display:flex;align-items:center;min-height:50px;padding:0 14px;border-radius:12px;font-size:16px;font-weight:600;color:#111}
      .nav-right .nav-links-core a.is-active{background:#F0FDF4;color:#15803D}
      .mobile-account-links{display:flex;flex-direction:column;gap:4px;padding:4px 12px 0}
      .mobile-account-links>div{display:none}
      .mobile-account-links>div.is-active{display:block}
      .mobile-nav-link{width:100%;min-height:50px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;border:0;border-radius:12px;background:transparent;color:#111;font:inherit;font-size:16px;font-weight:650;text-align:left;text-decoration:none;cursor:pointer}
      .mobile-nav-link:hover{background:#F7F7F7}
      .mobile-nav-logout{color:#B91C1C}
      .nav-right .auth-area,.nav-right>.btn-primary{display:none}
      .nav-right .profile-dropdown{position:static;display:none}
      .nav-toggle{position:relative;z-index:111}
      .nav-open .nav-toggle{opacity:0;pointer-events:none}
    }
    @media (min-width:861px){.mobile-nav-header,.nav-backdrop,.mobile-account-links{display:none}}
  `;
  document.head.appendChild(style);
}

function renderFooter() {
  const root = document.getElementById('footer-root');
  if (!root) return;
  root.innerHTML = `
    <footer class="hookos-footer">
      <div class="container">
        <div class="footer-intro">
          <div><span class="logo-wordmark footer-wordmark">HOOKOS</span><p class="footer-tag">From Idea To Reel.</p></div>
          <div class="footer-community-copy"><span class="footer-kicker">CREATE & GROW</span><p>Create better reels. Grow together.</p></div>
        </div>
        <div class="footer-referral-strip"><div><span class="footer-kicker">INVITE FRIENDS</span><p>Get +2 generations for every successful referral.</p></div><a href="dashboard.html#referral" class="footer-referral-link">Invite Friends →</a></div>
        <div class="footer-top">
          <div class="footer-column"><h3>Product</h3><ul class="footer-legal-links"><li><a href="index.html#generator">Generator</a></li><li><a href="index.html#how-it-works">How It Works</a></li><li><a href="pricing.html">Pricing</a></li><li><a href="tutorial.html">Tutorial</a></li><li><a href="support.html">Support</a></li><li><a href="dashboard.html#referral">Invite Friends</a></li></ul></div>
          <div class="footer-column"><h3>Community</h3><div class="social-links">
            <a class="social-link" href="https://www.instagram.com/hookos.v3?igsh=NDJkYzNvdnVrazlj" target="_blank" rel="noopener noreferrer" aria-label="HOOKOS on Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1"/></svg></a>
            <a class="social-link" href="https://youtube.com/@hookos-v3?si=Vhg6vVhdCLvX921b" target="_blank" rel="noopener noreferrer" aria-label="HOOKOS on YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.3 15 12l-4.5 2.7z" fill="currentColor" stroke="none"/></svg></a>
            <a class="social-link" href="https://discord.gg/hookos" target="_blank" rel="noopener noreferrer" aria-label="HOOKOS on Discord"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.5 8.5C9 7 15 7 17.5 8.5c1 3 1.3 6 1 9-1.5 1.2-3 1.8-4.4 2l-.7-1.4c.8-.2 1.5-.5 2.2-1-1.9.9-4 1.3-6.1.9-.9-.2-1.8-.5-2.6-.9.7.5 1.4.8 2.2 1L8.4 19.5c-1.4-.2-2.9-.8-4.4-2-.3-3.5.2-6.5 1-9z"/><circle cx="9.2" cy="14" r="1.15" fill="currentColor" stroke="none"/><circle cx="14.8" cy="14" r="1.15" fill="currentColor" stroke="none"/></svg></a>
          </div></div>
          <div class="footer-column"><h3>Legal</h3><ul class="footer-legal-links"><li><a href="privacy.html">Privacy Policy</a></li><li><a href="terms.html">Terms of Service</a></li><li><a href="cookies.html">Cookie Policy</a></li><li><a href="data-deletion.html">Data Deletion</a></li></ul></div>
        </div>
        <div class="footer-bottom"><span>© 2026 HookOS. All rights reserved.</span><span>v4.1 · Built by NOTX4.EXE</span></div>
      </div>
    </footer>`;
}

function initNavInteractions() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav-right');
  const backdrop = document.getElementById('nav-backdrop');
  const closeButton = document.getElementById('mobile-nav-close');
  if (toggle && nav) {
    const closeNav = () => { document.body.classList.remove('nav-open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open menu'); };
    toggle.addEventListener('click', () => { const isOpen = document.body.classList.toggle('nav-open'); toggle.setAttribute('aria-expanded',String(isOpen)); toggle.setAttribute('aria-label',isOpen?'Close menu':'Open menu'); });
    if (closeButton) closeButton.addEventListener('click', closeNav);
    if (backdrop) backdrop.addEventListener('click', closeNav);
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
    nav.querySelectorAll('button[data-action="logout"]').forEach(button => button.addEventListener('click', closeNav));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
  }
  document.addEventListener('click', e => {
    const trigger = e.target.closest('#profile-trigger');
    const menu = document.getElementById('profile-menu');
    if (trigger && menu) { const isOpen = menu.classList.toggle('is-open'); trigger.setAttribute('aria-expanded',String(isOpen)); }
    else if (menu && !e.target.closest('#profile-menu')) menu.classList.remove('is-open');
  });
}

function ensureDeleteModal() {
  if (document.getElementById('hookos-delete-modal')) return;
  document.body.insertAdjacentHTML('beforeend', '<div class="hookos-modal-backdrop" id="hookos-delete-backdrop"></div><div class="hookos-modal" id="hookos-delete-modal" role="dialog" aria-modal="true" aria-labelledby="hookos-delete-title" aria-describedby="hookos-delete-desc"><h2 id="hookos-delete-title">Delete blueprint?</h2><p id="hookos-delete-desc">This will permanently remove this blueprint from your history.</p><div class="hookos-modal-actions"><button type="button" class="hookos-modal-cancel" id="hookos-delete-cancel">Cancel</button><button type="button" class="hookos-modal-delete" id="hookos-delete-confirm">Delete</button></div></div>');
  const backdrop = document.getElementById('hookos-delete-backdrop'); const modal = document.getElementById('hookos-delete-modal'); const cancel = document.getElementById('hookos-delete-cancel'); const confirm = document.getElementById('hookos-delete-confirm'); let lastTrigger = null;
  const close = () => { modal.classList.remove('is-open'); backdrop.classList.remove('is-open'); document.body.style.overflow=''; if(lastTrigger) lastTrigger.focus(); };
  window.hookosOpenDeleteModal = (trigger, onConfirm) => { lastTrigger=trigger||document.activeElement; modal.classList.add('is-open'); backdrop.classList.add('is-open'); document.body.style.overflow='hidden'; cancel.focus(); confirm.onclick=()=>{ close(); if(typeof onConfirm==='function') onConfirm(); }; };
  cancel.addEventListener('click',close); backdrop.addEventListener('click',close); document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&modal.classList.contains('is-open')) close(); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { renderNavbar(); renderFooter(); ensureDeleteModal(); });
else { renderNavbar(); renderFooter(); ensureDeleteModal(); }