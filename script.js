// ===========================================================================
// HOOKOS — generator (homepage)
// UI + API calls only. All generation happens on the backend.
// ===========================================================================

(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
})();

(function initGenerator() {
  const form = document.getElementById('blueprint-form');
  if (!form) return;

  const FRAMEWORKS = [
    { id:'curiosity-gap', name:'Curiosity Gap', desc:'Opens a gap the viewer wants to close.' },
    { id:'story', name:'Story', desc:'A personal narrative with a turning point.' },
    { id:'open-loop', name:'Open Loop', desc:'Delays the payoff to hold attention.' },
  ];
  const SURPRISE_ID = 'surprise-me';

  const BAD_WORDS = ['fuck','fucking','shit','bitch','bastard','asshole','dick','piss','cunt','slut','whore'];
  const MAX_LENGTH = 500;
  const MIN_LENGTH = 10;

  const frameworkGrid = document.getElementById('hook-choice-options');
  const hookChoiceTrigger = document.getElementById('hook-choice-trigger');
  const hookChoiceExpand = document.getElementById('hook-choice-expand');
  const hookChoiceOptions = document.getElementById('hook-choice-options');
  const hookChoiceSurprise = document.getElementById('hook-choice-surprise');
  const ideaInput = document.getElementById('idea-input');
  const formHint = document.getElementById('form-hint');
  const apiError = document.getElementById('api-error');
  const generateBtn = document.getElementById('generate-btn');
  const generateBtnText = document.getElementById('generate-btn-text');
  const loadingPanel = document.getElementById('loading-panel');
  const loadingStatus = document.getElementById('loading-status');
  const loadingBar = document.getElementById('loading-bar');
  const loadingStepsEl = document.getElementById('loading-steps');
  const resultsSection = document.getElementById('results');
  const charCount = document.getElementById('char-count');
  const LOADING_STAGES = ['Understanding your idea','Applying the selected framework','Writing the blueprint','Evaluating the result'];
  let selectedFramework = FRAMEWORKS[0].id;
  let loadingTimer = null;
  let surpriseMode = false;

  function setSelectedFramework(id) {
    selectedFramework = id;
    surpriseMode = false;
    const framework = FRAMEWORKS.find((fw) => fw.id === id) || FRAMEWORKS[0];
    if (hookChoiceTrigger) {
      hookChoiceTrigger.classList.add('is-selected');
      hookChoiceTrigger.querySelector('.hook-choice-name').textContent = framework.name;
      hookChoiceTrigger.querySelector('.hook-choice-desc').textContent = framework.desc;
      hookChoiceTrigger.querySelector('.hook-choice-radio').textContent = '✓';
    }
    frameworkGrid?.querySelectorAll('.hook-choice-option').forEach((option) => {
      const active = option.dataset.framework === id;
      option.classList.toggle('is-selected', active);
      option.setAttribute('aria-checked', String(active));
      const radio = option.querySelector('.hook-choice-radio');
      if (radio) radio.textContent = active ? '✓' : '';
    });
    hookChoiceSurprise?.classList.remove('is-selected');
  }

  function setSurpriseMode() {
    surpriseMode = true;
    selectedFramework = SURPRISE_ID;
    hookChoiceTrigger?.classList.remove('is-selected');
    if (hookChoiceTrigger) {
      hookChoiceTrigger.querySelector('.hook-choice-name').textContent = 'Surprise me';
      hookChoiceTrigger.querySelector('.hook-choice-desc').textContent = 'HookOS will choose the best approach for your idea.';
      hookChoiceTrigger.querySelector('.hook-choice-radio').textContent = '✦';
    }
    frameworkGrid?.querySelectorAll('.hook-choice-option').forEach((option) => {
      option.classList.remove('is-selected');
      option.setAttribute('aria-checked', 'false');
      const radio = option.querySelector('.hook-choice-radio');
      if (radio) radio.textContent = '';
    });
    hookChoiceSurprise?.classList.add('is-selected');
  }

  function toggleHookOptions() {
    if (!hookChoiceOptions) return;
    const open = hookChoiceOptions.hidden;
    hookChoiceOptions.hidden = !open;
    hookChoiceExpand?.setAttribute('aria-expanded', String(open));
    hookChoiceTrigger?.setAttribute('aria-expanded', String(open));
  }

  hookChoiceTrigger?.addEventListener('click', toggleHookOptions);
  hookChoiceExpand?.addEventListener('click', toggleHookOptions);
  hookChoiceSurprise?.addEventListener('click', setSurpriseMode);
  frameworkGrid?.addEventListener('click', (e) => {
    const option = e.target.closest('.hook-choice-option');
    if (!option) return;
    setSelectedFramework(option.dataset.framework);
  });

  function updateCharCount() {
    if (!charCount) return;
    const count = ideaInput.value.length;
    charCount.textContent = `${count}/${MAX_LENGTH}`;
    charCount.style.color = count > MAX_LENGTH ? '#b42318' : '';
  }
  ideaInput.addEventListener('input', updateCharCount);
  updateCharCount();

  function normalizedWords(value) {
    return value.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(Boolean);
  }

  function looksMeaningless(value) {
    const compact = value.replace(/\s+/g, '').toLowerCase();
    if (!compact) return true;
    if (/^(.)\1{2,}$/i.test(compact)) return true;
    if (/^(abc|abcd|abcde|abcdef|qwerty|asdf|asdfgh|zxcv|123|1234|12345|123456|qazwsx)+$/i.test(compact)) return true;
    const letters = (compact.match(/[a-z]/gi) || []).length;
    const digits = (compact.match(/\d/g) || []).length;
    const symbols = (compact.match(/[^a-z0-9]/gi) || []).length;
    if (letters === 0) return true;
    if (digits > letters * 2 && letters < 4) return true;
    if (symbols > Math.max(2, letters)) return true;
    const words = normalizedWords(value);
    if (words.length === 1 && words[0].length < 4) return true;
    if (words.length === 1 && /^(?:asdf|qwer|qwerty|zxcv|poiuy|lkjh)$/i.test(words[0])) return true;
    return false;
  }

  function containsBadWord(value) {
    return BAD_WORDS.some((bad) => normalizedWords(value).includes(bad));
  }

  function validateIdea(value) {
    const idea = value.trim();
    if (!idea) return 'Tell me what you want to create before generating.';
    if (idea.length < MIN_LENGTH) return 'Give me a little more context — write at least 10 characters.';
    if (idea.length > MAX_LENGTH) return 'That idea is too long. Keep it under 500 characters.';
    if (containsBadWord(idea)) return 'Please enter a clean topic, niche or content idea.';
    if (looksMeaningless(idea)) return 'Please enter a real topic, niche or content idea — not random characters.';
    return '';
  }

  function setInlineValidation(message) {
    formHint.textContent = message || '';
    formHint.classList.toggle('error', Boolean(message));
    ideaInput.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    setInlineValidation('');
    const idea = ideaInput.value.trim();

    const validationMessage = validateIdea(idea);
    if (validationMessage) {
      setInlineValidation(validationMessage);
      ideaInput.focus();
      return;
    }

    if (!HookosAPI.getAccessToken()) {
      document.dispatchEvent(new CustomEvent('hookos:auth-required'));
      return;
    }

    resultsSection.hidden = true;
    startLoadingUI();
    try {
      const response = await HookosAPI.generate({ idea, framework: selectedFramework });
      const result = response?.data;
      if (!response?.success || !result) throw new Error(response?.message || 'The server returned an invalid response.');
      renderLoadingComplete();
      renderResults(result);
      resultsSection.hidden = false;
      stopLoadingUI();
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      stopLoadingUI();
      showError(err.message || 'Something went wrong generating your blueprint. Please try again.');
    }
  });

  document.addEventListener('hookos:auth-required', () => {
    const message = document.getElementById('hookos-inline-auth');
    if (message && typeof window.HookosQuotaUI?.showAuthRequired === 'function') window.HookosQuotaUI.showAuthRequired();
  });

  function startLoadingUI() {
    clearInterval(loadingTimer);
    generateBtn.disabled = true;
    generateBtnText.innerHTML = 'Generating<span class="loading-dots"><span></span><span></span><span></span></span>';
    loadingPanel.classList.add('is-active');
    loadingPanel.classList.remove('is-complete');
    loadingBar.style.width = '42%';
    let stageIndex = 0;
    renderLoadingStage(stageIndex);
    loadingTimer = window.setInterval(() => { stageIndex = (stageIndex + 1) % LOADING_STAGES.length; renderLoadingStage(stageIndex); }, 1100);
  }

  function renderLoadingStage(index) {
    loadingStatus.textContent = LOADING_STAGES[index];
    loadingStepsEl.innerHTML = LOADING_STAGES.map((stage, i) => `<li class="loading-step ${i===index?'is-active':i<index?'is-done':''}" data-step="${i}"><span class="loading-step-dot" aria-hidden="true">${i<index?'✓':''}</span><span>${stage}</span></li>`).join('');
  }

  function renderLoadingComplete() {
    clearInterval(loadingTimer);
    loadingTimer = null;
    loadingPanel.classList.add('is-complete');
    loadingStatus.textContent = 'Blueprint ready';
    loadingBar.style.width = '100%';
    loadingStepsEl.innerHTML = '<li class="loading-step is-done"><span class="loading-step-dot" aria-hidden="true">✓</span><span>Your blueprint is ready</span></li>';
  }

  function stopLoadingUI() {
    clearInterval(loadingTimer);
    loadingTimer = null;
    generateBtn.disabled = false;
    generateBtnText.textContent = 'Generate Blueprint';
    window.setTimeout(() => loadingPanel.classList.remove('is-active'), 500);
  }

  function showError(message) { apiError.textContent = message; apiError.classList.add('is-active'); }
  function hideError() { apiError.textContent = ''; apiError.classList.remove('is-active'); }
  function renderResults(bp) {
    setText('result-title', bp.title);
    setText('result-topic', bp.topicRefinement);
    setText('result-hook', bp.hook);
    setText('result-script', bp.script);
    setText('result-cta', bp.cta);
    const sceneEl = document.getElementById('result-scene');
    sceneEl.innerHTML = '';
    String(bp.scenePlan || '').split('\n').map(line => line.trim()).filter(Boolean).forEach((line, idx) => {
      const row = document.createElement('div');
      row.className = 'scene';
      row.innerHTML = `<span class="scene-num">${idx+1}.</span><span>${escapeHtml(line.replace(/^\d+[.)]\s*/,''))}</span>`;
      sceneEl.appendChild(row);
    });
    renderMetrics(bp.metrics || {});
    document.querySelectorAll('.result-card').forEach((card, i) => { card.classList.remove('fade-slide-in'); void card.offsetWidth; card.style.animationDelay = `${i*.06}s`; card.classList.add('fade-slide-in'); });
  }
  function renderMetrics(metrics) {
    setText('metric-virality', metrics.viralityScore != null ? `${metrics.viralityScore}` : '—');
    setText('metric-retention', metrics.retentionScore != null ? `${metrics.retentionScore}` : '—');
    setText('metric-watchtime', metrics.predictedWatchTime != null ? `${metrics.predictedWatchTime}` : '—');
    setText('metric-emotion', metrics.emotionTrigger || '—');
    setText('metric-framework', metrics.framework || '—');
    setText('metric-confidence', metrics.confidence || '—');
    setBar('metric-virality-bar', metrics.viralityScore);
    setBar('metric-retention-bar', metrics.retentionScore);
    setBar('metric-watchtime-bar', metrics.predictedWatchTime);
  }
  function setBar(id, value) { const el = document.getElementById(id); if (el) el.style.width = value != null ? `${Math.max(0, Math.min(100, value))}%` : '0%'; }
  function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value || ''; }
  function escapeHtml(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const targetEl = document.getElementById(btn.dataset.target);
    if (!targetEl) return;
    navigator.clipboard.writeText(targetEl.innerText).then(() => {
      const original = btn.textContent;
      btn.textContent = '✓ Copied';
      btn.classList.add('copied','success-pop');
      window.setTimeout(() => { btn.textContent = original; btn.classList.remove('copied','success-pop'); }, 2000);
    }).catch(() => {
      btn.textContent = 'Copy failed';
      window.setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });
})();

(function initEarlyAccess(){
  const form = document.getElementById('early-access-form');
  if (!form) return;
  const emailInput = document.getElementById('ea-email');
  const feedbackInput = document.getElementById('ea-feedback');
  const hint = document.getElementById('ea-hint');
  const submitBtn = document.getElementById('ea-submit-btn');
  const submitText = document.getElementById('ea-submit-text');
  let timeoutId = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    hint.classList.remove('error');
    if (!email) { hint.textContent='Enter your email to join the list.'; hint.classList.add('error'); emailInput.focus(); return; }
    submitBtn.disabled=true; submitText.textContent='Joining...'; hint.textContent=''; clearTimeout(timeoutId);
    const controller = new AbortController();
    timeoutId = window.setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${HOOKOS_CONFIG.API_BASE_URL}/early-access`, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,feedback:feedbackInput.value.trim()}), signal:controller.signal });
      let body=null; try { body=await response.json(); } catch (_) {}
      if(!response.ok || !body?.success) throw new Error(body?.message || `Request failed (${response.status})`);
      submitText.textContent="✓ You're on the list";
      form.reset();
      hint.textContent='We’ll use your email for early-access updates. Your feedback has been saved.';
      window.setTimeout(()=>{submitText.textContent='Join Early Access';submitBtn.disabled=false;},2500);
    } catch(err) {
      submitBtn.disabled=false; submitText.textContent='Join Early Access';
      hint.textContent=err.name==='AbortError'?'The request took too long. Please try again.':(err.message||'Something went wrong. Please try again.');
      hint.classList.add('error');
    } finally { clearTimeout(timeoutId); }
  });
})();
