// ============================================================================
// HOOKOS — referral sharing
// ============================================================================

(function initReferral() {
  function getOrCreateReferralCode() {
    const key = 'hookos_referral_code';
    try {
      const existing = localStorage.getItem(key);
      if (existing) return existing;
      const code = `h${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
      localStorage.setItem(key, code);
      return code;
    } catch (_) {
      return `h${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
    }
  }

  function getInviteUrl() {
    const url = new URL('index.html', window.location.href);
    url.searchParams.set('ref', getOrCreateReferralCode());
    return url.href;
  }

  function showToast(message) {
    const toast = document.getElementById('referral-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  async function shareInvite() {
    const url = getInviteUrl();
    const shareData = {
      title: 'HookOS',
      text: 'Create better reels with HookOS.',
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast('Invite link copied');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      try {
        const input = document.createElement('input');
        input.value = url;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
        showToast('Invite link copied');
      } catch (_) {
        showToast('Copy failed. Please try again.');
      }
    }
  }

  function install() {
    const button = document.getElementById('referral-share-btn');
    const urlField = document.getElementById('referral-url');
    if (!button || !urlField) return;

    urlField.textContent = getInviteUrl();
    button.addEventListener('click', shareInvite);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
