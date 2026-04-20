(() => {
  const state = {
    template: null,
    playing: false,
    tempo: 1.0,
    filter: 20000,
    volume: 0.9,
    skin: 'amber',
    mood: 'calm',
    zen: false,
    source: 'preset', // preset | custom
    effects: { aurora: true, ripples: true, particles: true },
    fx: {
      sensitivity: 1.35,
      rippleSize: 1.0,
      rippleLife: 6000,
      rippleWidth: 1.3,
      rippleAlpha: 0.55,
      particleCount: 60,
      particleSize: 1.0,
      particleDrift: 0.6,
      auroraAmount: 0.4,
      auroraSpeed: 1.0
    }
  };

  const MOODS = {
    calm:   { cooldown: 1500, burst: 1, fx: { sensitivity: 1.35, rippleSize: 1.0,  rippleLife: 6000, rippleWidth: 1.3, rippleAlpha: 0.55, particleCount: 60,  particleSize: 1.0, particleDrift: 0.5, auroraAmount: 0.4,  auroraSpeed: 0.6 } },
    dreamy: { cooldown: 900,  burst: 1, fx: { sensitivity: 1.22, rippleSize: 1.25, rippleLife: 4800, rippleWidth: 1.8, rippleAlpha: 0.7,  particleCount: 110, particleSize: 1.2, particleDrift: 0.8, auroraAmount: 0.55, auroraSpeed: 1.0 } },
    pulse:  { cooldown: 400,  burst: 1, fx: { sensitivity: 1.1,  rippleSize: 0.85, rippleLife: 3000, rippleWidth: 2.2, rippleAlpha: 0.8,  particleCount: 150, particleSize: 0.9, particleDrift: 1.4, auroraAmount: 0.35, auroraSpeed: 1.6 } }
  };

  // Palette definitions — name + 3 tones. Keys match body.theme-* classes.
  const PALETTES = [
    { id: 'amber',   name: 'Dawn',   tones: ['#ffd7a1', '#ff8fab', '#8ec5ff'] },
    { id: 'emerald', name: 'Garden', tones: ['#9ef0ff', '#72e7c7', '#b0b7ff'] },
    { id: 'rose',    name: 'Bloom',  tones: ['#ffbfd8', '#ff7fa6', '#c79bff'] },
    { id: 'sky',     name: 'Mist',   tones: ['#a5d8ff', '#6fbfe0', '#89a8e6'] },
    { id: 'crimson', name: 'Ember',  tones: ['#ffb6a0', '#ff7280', '#d06a8a'] },
    { id: 'ivory',   name: 'Paper',  tones: ['#f0ead8', '#cbc2ae', '#a8b0c0'] }
  ];

  const el = {
    templates: document.getElementById('templates'),
    sourcePills: document.querySelectorAll('.source-pill'),
    vinyl: document.getElementById('vinyl'),
    vinylTitle: document.getElementById('vinylTitle'),
    labelNumber: document.getElementById('labelNumber'),
    tonearm: document.getElementById('tonearm'),
    deck: document.getElementById('deck'),
    strudelEl: document.getElementById('strudelEditor'),
    editorTitle: document.getElementById('editorTitle'),
    liveDot: document.getElementById('liveDot'),
    tagText: document.getElementById('tagText'),
    cpsReadout: document.getElementById('cpsReadout'),
    cta: document.getElementById('cta'),
    palettePicker: document.getElementById('palettePicker'),
    zenBtn: document.getElementById('zenBtn'),
    zenCaption: document.getElementById('zenCaption'),
    zenTitle: document.getElementById('zenTitle'),
    zenMoodTag: document.getElementById('zenMoodTag'),
    zenMix: document.getElementById('zenMix'),
    zenMixClose: document.getElementById('zenMixClose'),
    rippleCanvas: document.getElementById('ripple-canvas'),
    tempo: document.getElementById('tempo'),
    tempoVal: document.getElementById('tempoVal'),
    filter: document.getElementById('filter'),
    filterVal: document.getElementById('filterVal'),
    volume: document.getElementById('volume'),
    volumeVal: document.getElementById('volumeVal'),
    // zen mix sliders (moved from fx-lab)
    fx: {
      sens: document.getElementById('fxSens'),
      sensV: document.getElementById('fxSensVal'),
      rsize: document.getElementById('fxRippleSize'),
      rsizeV: document.getElementById('fxRippleSizeVal'),
      rlife: document.getElementById('fxRippleLife'),
      rlifeV: document.getElementById('fxRippleLifeVal'),
      pcount: document.getElementById('fxPcount'),
      pcountV: document.getElementById('fxPcountVal'),
      psize: document.getElementById('fxPsize'),
      psizeV: document.getElementById('fxPsizeVal'),
      aurora: document.getElementById('fxAurora'),
      auroraV: document.getElementById('fxAuroraVal'),
      auroraSp: document.getElementById('fxAuroraSpeed'),
      auroraSpV: document.getElementById('fxAuroraSpeedVal')
    }
  };

  const i18n = () => window.I18N;
  const tr = (k) => (i18n() ? i18n().t(k) : k);
  const curLang = () => (i18n() ? i18n().lang : 'en');
  const trackName = (t) => (curLang() === 'zh' && t.nameZh) ? t.nameZh : t.name;
  const trackSub = (t) => (curLang() === 'zh') ? t.name : (t.nameZh || '');

  function setTag(msg) {
    el.tagText.removeAttribute('data-i18n');
    el.tagText.textContent = msg;
  }
  function setTagKey(key) {
    el.tagText.setAttribute('data-i18n', key);
    el.tagText.textContent = tr(key);
  }
  function getEditor() { return el.strudelEl?.editor || null; }

  async function waitForEditor(timeoutMs = 25000) {
    const start = Date.now();
    while (!getEditor()) {
      if (Date.now() - start > timeoutMs) throw new Error('editor never initialized');
      await new Promise(r => setTimeout(r, 100));
    }
    return getEditor();
  }

  function renderTemplates() {
    el.templates.innerHTML = '';
    window.DJ_TEMPLATES.forEach((t, i) => {
      const b = document.createElement('button');
      b.className = 'tpl';
      b.dataset.id = t.id;
      const num = String(i + 1).padStart(2, '0');
      const primary = trackName(t);
      const sub = trackSub(t);
      b.innerHTML = `
        <span class="tpl-no">№ ${num}</span>
        <span class="tpl-name">${primary}</span>
        ${sub ? `<span class="tpl-alt">${sub}</span>` : ''}
        <span class="tpl-meta">
          <span class="tpl-by">@${t.author}</span>
          <span class="tpl-cps">${t.defaultCps.toFixed(2)} CPS</span>
        </span>`;
      b.addEventListener('click', () => {
        if (state.source !== 'preset') setSource('preset');
        selectTemplate(t.id);
      });
      el.templates.appendChild(b);
    });
    if (state.template && state.source === 'preset') {
      const active = el.templates.querySelector(`.tpl[data-id="${state.template.id}"]`);
      if (active) active.classList.add('active');
    }
  }

  function renderPalettes() {
    el.palettePicker.innerHTML = '';
    PALETTES.forEach(p => {
      const b = document.createElement('button');
      b.className = 'palette' + (p.id === state.skin ? ' active' : '');
      b.dataset.theme = p.id;
      b.style.setProperty('--p-a', p.tones[0]);
      b.style.setProperty('--p-b', p.tones[1]);
      b.style.setProperty('--p-c', p.tones[2]);
      b.innerHTML = `<span class="palette-chip"></span><span class="palette-name">${p.name}</span>`;
      b.addEventListener('click', () => applySkin(p.id));
      el.palettePicker.appendChild(b);
    });
  }

  function applySkin(theme) {
    state.skin = theme;
    document.body.className = document.body.className
      .split(/\s+/).filter(c => !c.startsWith('theme-')).join(' ').trim();
    if (theme !== 'amber') document.body.classList.add(`theme-${theme}`);
    for (const btn of el.palettePicker.querySelectorAll('.palette')) {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    }
  }

  function refreshTemplateTitles() {
    const t = state.template;
    if (!t) return;
    if (t.id === 'custom') {
      el.vinylTitle.textContent = tr('source_custom').toLowerCase();
      el.editorTitle.removeAttribute('data-i18n');
      el.editorTitle.textContent = '// custom.strudel';
      el.zenTitle.textContent = tr('source_custom').toLowerCase();
      return;
    }
    el.vinylTitle.textContent = trackName(t);
    el.editorTitle.removeAttribute('data-i18n');
    el.editorTitle.textContent = `// ${t.name}.strudel · @${t.author}`;
    el.zenTitle.textContent = trackName(t);
  }

  async function selectTemplate(id) {
    const t = window.DJ_TEMPLATES.find(x => x.id === id);
    if (!t) return;
    state.template = t;
    refreshTemplateTitles();
    const idx = window.DJ_TEMPLATES.indexOf(t) + 1;
    el.labelNumber.textContent = String(idx).padStart(2, '0');
    for (const btn of el.templates.querySelectorAll('.tpl')) {
      btn.classList.toggle('active', btn.dataset.id === id);
    }
    el.strudelEl.setAttribute('code', t.code);
    const editor = getEditor();
    if (editor && state.playing) {
      try { await editor.evaluate(true); } catch (e) { console.error(e); }
    }
    refreshCpsReadout();
    updateCta();
  }

  // ── source toggle (Preset / Custom) ────────────
  function setSource(src) {
    state.source = src;
    document.body.classList.toggle('source-custom', src === 'custom');
    for (const pill of el.sourcePills) {
      const on = pill.dataset.source === src;
      pill.classList.toggle('active', on);
      pill.setAttribute('aria-selected', on ? 'true' : 'false');
    }
    if (src === 'custom') {
      el.strudelEl.setAttribute('code', '// paste or write your own strudel code\n// then tap the record\n\ns("bd*4, ~ cp").bank("RolandTR909")');
      state.template = {
        id: 'custom',
        name: 'custom',
        author: 'you',
        defaultCps: 0.8,
        code: ''
      };
      refreshTemplateTitles();
      for (const btn of el.templates.querySelectorAll('.tpl')) btn.classList.remove('active');
    }
  }

  async function togglePlay() {
    let editor;
    try { editor = await waitForEditor(); }
    catch (err) { setTag(err.message); return; }
    if (!state.template) { setTagKey('tagline_pick_first'); return; }
    try { await editor.toggle(); }
    catch (err) {
      console.error(err);
      setTag(`${tr('tagline_fail_prefix')}: ${err.message || 'syntax error'}`);
    }
  }

  function reflectPlayState(isPlaying) {
    state.playing = isPlaying;
    el.vinyl.classList.toggle('paused', !isPlaying);
    el.vinyl.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    el.tonearm.classList.toggle('on', isPlaying);
    el.liveDot.classList.toggle('on', isPlaying);
    el.deck.classList.toggle('playing', isPlaying);
    setTagKey(isPlaying ? 'tagline_live' : (state.template ? 'tagline_cued' : 'tagline_ready_short'));
    updateCta();
  }

  function updateCta() {
    const hide = state.playing || !state.template;
    el.cta.classList.toggle('hidden', hide);
  }

  function refreshCpsReadout() {
    if (!state.template) { el.cpsReadout.textContent = '—'; return; }
    const cps = state.template.defaultCps * state.tempo;
    el.cpsReadout.textContent = cps.toFixed(2);
    document.documentElement.style.setProperty('--cps', cps.toFixed(3));
  }

  // ── mood ───────────────────────────────────────
  function applyMood(mood) {
    if (!MOODS[mood]) return;
    state.mood = mood;
    document.body.className = document.body.className
      .split(/\s+/).filter(c => !c.startsWith('mood-')).join(' ').trim();
    document.body.classList.add(`mood-${mood}`);
    el.zenMoodTag.setAttribute('data-mood-key', mood);
    el.zenMoodTag.textContent = tr('mood_' + mood);
    Object.assign(state.fx, MOODS[mood].fx);
    refreshFxSliderUI();
    applyFxToStyles();
    syncMoodUI();
    seedParticles(particleCount());
  }
  function syncMoodUI() {
    for (const btn of el.zenMix.querySelectorAll('[data-zen-mood]')) {
      btn.classList.toggle('active', btn.dataset.zenMood === state.mood);
    }
  }

  function applyFxToStyles() {
    document.documentElement.style.setProperty('--aurora-opacity', state.fx.auroraAmount);
    document.documentElement.style.setProperty('--aurora-speed', state.fx.auroraSpeed);
  }
  function refreshFxSliderUI() {
    const f = state.fx, g = el.fx;
    if (g.sens)   { g.sens.value = f.sensitivity;   g.sensV.textContent = f.sensitivity.toFixed(2); }
    if (g.rsize)  { g.rsize.value = f.rippleSize;   g.rsizeV.textContent = f.rippleSize.toFixed(2) + '×'; }
    if (g.rlife)  { g.rlife.value = f.rippleLife;   g.rlifeV.textContent = (f.rippleLife/1000).toFixed(1) + 's'; }
    if (g.pcount) { g.pcount.value = f.particleCount; g.pcountV.textContent = Math.round(f.particleCount); }
    if (g.psize)  { g.psize.value = f.particleSize; g.psizeV.textContent = f.particleSize.toFixed(1) + '×'; }
    if (g.aurora) { g.aurora.value = f.auroraAmount; g.auroraV.textContent = f.auroraAmount.toFixed(2); }
    if (g.auroraSp) { g.auroraSp.value = f.auroraSpeed; g.auroraSpV.textContent = f.auroraSpeed.toFixed(1) + '×'; }
  }
  function wireFxSliders() {
    const wire = (input, val, key, fmt) => {
      if (!input) return;
      input.addEventListener('input', (e) => {
        const v = parseFloat(e.target.value);
        state.fx[key] = (key === 'particleCount') ? Math.round(v) : v;
        val.textContent = fmt(state.fx[key]);
        if (key === 'particleCount') seedParticles(particleCount());
        if (key === 'auroraAmount' || key === 'auroraSpeed') applyFxToStyles();
      });
    };
    const g = el.fx;
    wire(g.sens, g.sensV, 'sensitivity', v => v.toFixed(2));
    wire(g.rsize, g.rsizeV, 'rippleSize', v => v.toFixed(2) + '×');
    wire(g.rlife, g.rlifeV, 'rippleLife', v => (v/1000).toFixed(1) + 's');
    wire(g.pcount, g.pcountV, 'particleCount', v => v);
    wire(g.psize, g.psizeV, 'particleSize', v => v.toFixed(1) + '×');
    wire(g.aurora, g.auroraV, 'auroraAmount', v => v.toFixed(2));
    wire(g.auroraSp, g.auroraSpV, 'auroraSpeed', v => v.toFixed(1) + '×');
  }

  // ── effect toggles (Zen Mix) ──────────────────
  function toggleEffect(name, on) {
    state.effects[name] = on;
    document.body.classList.toggle(`fx-off-${name}`, !on);
  }
  function wireEffectChecks() {
    for (const chk of el.zenMix.querySelectorAll('.zm-check')) {
      chk.addEventListener('change', (e) => {
        toggleEffect(e.target.dataset.effect, e.target.checked);
      });
    }
  }

  // ── zen mode ──────────────────────────────────
  function setZen(on) {
    state.zen = on;
    document.body.classList.toggle('zen-mode', on);
    el.zenBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    seedParticles(particleCount());
  }

  // ── particles ─────────────────────────────────
  const particles = [];
  function makeParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: 1 + Math.random() * 3,
      bin: 2 + Math.floor(Math.random() * 96),
      base: 0.08 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2
    };
  }
  function seedParticles(n) {
    particles.length = 0;
    for (let i = 0; i < n; i++) particles.push(makeParticle());
  }
  function particleCount() {
    const base = state.fx.particleCount;
    return state.zen ? base : Math.floor(base * 0.55);
  }
  function drawParticles(ctx, bins, rgb, dt) {
    if (!state.effects.particles) return;
    const W = window.innerWidth, H = window.innerHeight;
    const zenBoost = state.zen ? 1.0 : 0.55;
    const drift = state.fx.particleDrift;
    const sizeMul = state.fx.particleSize;
    for (const p of particles) {
      p.x += p.vx * drift * (dt / 16);
      p.y += p.vy * drift * (dt / 16);
      p.phase += 0.001 * dt;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
      const freqV = bins ? (bins[p.bin] || 0) / 255 : 0;
      const twinkle = 0.6 + 0.4 * Math.sin(p.phase);
      // gentler beat-reactivity so particles don't feel like a strobe
      const alpha = (p.base * twinkle + freqV * 0.28) * zenBoost;
      const size = (p.size + freqV * 1.4) * sizeMul;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.shadowColor = `rgba(${rgb}, ${alpha * 0.5})`;
      ctx.shadowBlur = 4 + freqV * 7;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // ── ripples ───────────────────────────────────
  const ripples = [];
  let lastBeat = 0;
  let bassHist = [];
  function centerXY() {
    const r = el.vinyl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function spawnRipple(strength = 1) {
    const { x, y } = centerXY();
    const dx = Math.max(x, window.innerWidth - x);
    const dy = Math.max(y, window.innerHeight - y);
    const maxR = Math.hypot(dx, dy);
    ripples.push({
      x, y,
      t: 0,
      life: state.fx.rippleLife,
      maxR: maxR * state.fx.rippleSize * (0.65 + strength * 0.35),
      lineWidth: state.fx.rippleWidth * (0.85 + strength * 0.35),
      fade: state.fx.rippleAlpha
    });
  }
  function maybeSpawnFromBeat(bins) {
    if (!state.playing || !state.effects.ripples) return;
    let bass = 0;
    const n = Math.min(10, bins.length);
    for (let i = 0; i < n; i++) bass += bins[i];
    bass /= n;
    bassHist.push(bass);
    if (bassHist.length > 90) bassHist.shift();
    let avg = 0, mn = 255;
    for (const b of bassHist) { avg += b; if (b < mn) mn = b; }
    avg /= bassHist.length;
    const threshold = mn + (avg - mn) * state.fx.sensitivity;
    const now = performance.now();
    const m = MOODS[state.mood];
    if (bass > threshold && bass > 25 && now - lastBeat > m.cooldown) {
      lastBeat = now;
      for (let i = 0; i < m.burst; i++) {
        setTimeout(() => spawnRipple(Math.min(bass / 180, 1.5)), i * 80);
      }
    }
  }

  function sizeRippleCanvas() {
    const c = el.rippleCanvas;
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.floor(window.innerWidth * dpr);
    c.height = Math.floor(window.innerHeight * dpr);
    c.style.width = window.innerWidth + 'px';
    c.style.height = window.innerHeight + 'px';
    c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function drawBackgroundLayer(dt, bins) {
    const ctx = el.rippleCanvas.getContext('2d');
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const rgb = accentRgb();
    drawParticles(ctx, bins, rgb, dt);
    if (state.effects.ripples) drawRipplesOnly(ctx, dt, rgb);
  }
  function drawRipplesOnly(ctx, dt, rgb) {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.t += dt;
      const p = r.t / r.life;
      if (p >= 1) { ripples.splice(i, 1); continue; }
      const ease = 1 - Math.pow(1 - p, 2);
      const radius = ease * r.maxR;
      const alpha = (1 - p) * r.fade;
      ctx.beginPath();
      ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
      ctx.lineWidth = r.lineWidth;
      ctx.shadowColor = `rgba(${rgb}, ${alpha * 0.5})`;
      ctx.shadowBlur = 8;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // ── audio chain: filter → gain → analyser → dest ──
  let analyser = null;
  let masterGain = null;
  let masterFilter = null;
  function setupMasterChain() {
    if (analyser) return;
    if (typeof window.getAudioContext !== 'function') return;
    const ac = window.getAudioContext();
    masterFilter = ac.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.value = state.filter;
    masterFilter.Q.value = 0.3;
    masterGain = ac.createGain();
    masterGain.gain.value = state.volume;
    analyser = ac.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.45;
    masterFilter.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(ac.destination);
    const origConnect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (dest, ...rest) {
      if (dest === ac.destination) return origConnect.call(this, masterFilter, ...rest);
      return origConnect.call(this, dest, ...rest);
    };
  }

  function sizeSpectrumCanvas() {
    const c = document.getElementById('test-canvas');
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.max(1, Math.floor(rect.width * dpr));
    c.height = Math.max(1, Math.floor(rect.height * dpr));
  }
  function accentRgb() {
    const raw = getComputedStyle(document.body).getPropertyValue('--accent-rgb').trim();
    return raw || '255, 179, 71';
  }

  function drawLoop() {
    const canvas = document.getElementById('test-canvas');
    const ctx = canvas.getContext('2d');
    let bins = null;
    const NUM_BARS = 56;
    let lastT = performance.now();
    function frame(now) {
      const dt = now - lastT;
      lastT = now;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (analyser) {
        if (!bins || bins.length !== analyser.frequencyBinCount) {
          bins = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(bins);
        const step = Math.max(1, Math.floor(bins.length / NUM_BARS));
        const gap = Math.max(2, Math.floor(w / NUM_BARS * 0.16));
        const barW = (w - gap * (NUM_BARS - 1)) / NUM_BARS;
        const rgb = accentRgb();
        for (let i = 0; i < NUM_BARS; i++) {
          let v = 0;
          for (let j = 0; j < step; j++) v = Math.max(v, bins[i * step + j] || 0);
          const amp = v / 255;
          const bh = Math.max(2, amp * h * 0.82);
          const x = i * (barW + gap);
          const y = (h - bh) / 2;
          const a = 0.55 + amp * 0.4;
          const aDim = 0.25 + amp * 0.4;
          const grad = ctx.createLinearGradient(x, y, x, y + bh);
          grad.addColorStop(0, `rgba(${rgb}, ${a})`);
          grad.addColorStop(1, `rgba(${rgb}, ${aDim})`);
          ctx.fillStyle = grad;
          ctx.shadowColor = `rgba(${rgb}, ${amp * 0.5})`;
          ctx.shadowBlur = amp * 14;
          ctx.fillRect(x, y, barW, bh);
        }
        ctx.shadowBlur = 0;
        maybeSpawnFromBeat(bins);
      }
      drawBackgroundLayer(dt, bins);
      requestAnimationFrame(frame);
    }
    frame(performance.now());
  }

  // ── init ───────────────────────────────────────
  sizeSpectrumCanvas();
  sizeRippleCanvas();
  window.addEventListener('resize', () => { sizeSpectrumCanvas(); sizeRippleCanvas(); });
  drawLoop();
  renderTemplates();
  renderPalettes();
  wireFxSliders();
  wireEffectChecks();
  applyMood('calm');
  // Default to the first curated track so the home page isn't empty
  waitForEditor().then(() => {
    selectTemplate(window.DJ_TEMPLATES[0].id);
    setTagKey('tagline_ready');
  }).catch(err => setTag(err.message));
  updateCta();

  el.strudelEl.addEventListener('update', (ev) => {
    const s = ev.detail || {};
    if (typeof s.started === 'boolean') reflectPlayState(s.started);
    if (s.started && state.tempo !== 1.0) setTimeout(applyTempo, 60);
  });

  el.vinyl.addEventListener('click', async () => {
    await togglePlay();
    if (!analyser) setupMasterChain();
  });

  document.addEventListener('keydown', e => {
    const isCm = e.target?.closest && e.target.closest('.cm-editor');
    if (e.code === 'Space' && !(e.target instanceof HTMLInputElement) && !isCm) {
      e.preventDefault();
      togglePlay().then(() => { if (!analyser) setupMasterChain(); });
    }
    if (e.key === 'Escape' && state.zen) setZen(false);
  });

  // Source toggle handlers
  for (const pill of el.sourcePills) {
    pill.addEventListener('click', () => {
      setSource(pill.dataset.source);
      if (pill.dataset.source === 'preset') selectTemplate(state.template?.id || window.DJ_TEMPLATES[0].id);
    });
  }

  // Zen mode handlers
  el.zenBtn.addEventListener('click', () => setZen(!state.zen));
  el.zenMixClose.addEventListener('click', () => setZen(false));
  el.zenMix.addEventListener('click', (e) => {
    const mood = e.target.closest('[data-zen-mood]');
    if (mood) applyMood(mood.dataset.zenMood);
  });

  // Language toggle — swaps EN ↔ ZH, persists in localStorage
  const langBtn = document.getElementById('langBtn');
  if (langBtn) langBtn.addEventListener('click', () => window.I18N && window.I18N.toggle());

  // Re-render language-dependent surfaces when the user flips languages
  window.addEventListener('i18n:change', () => {
    renderTemplates();
    refreshTemplateTitles();
    el.filterVal.textContent = fmtFilter(state.filter);
    const moodKey = el.zenMoodTag.getAttribute('data-mood-key') || state.mood;
    el.zenMoodTag.textContent = tr('mood_' + moodKey);
  });

  // ── mix faders ─────────────────────────────────
  function fmtFilter(hz) {
    if (hz >= 19000) return tr('filter_open');
    if (hz >= 1000) return `${(hz / 1000).toFixed(1)}k`;
    return `${hz}Hz`;
  }
  function applyTempo() {
    const t = state.template;
    if (!t || typeof window.cps !== 'function') return;
    try { window.cps(t.defaultCps * state.tempo); } catch (e) { console.warn(e); }
    refreshCpsReadout();
  }
  // tempo: apply cps() live AND debounce-re-evaluate so the user hears
  // the change immediately instead of only on the next cycle boundary
  let tempoReEvalTimer = null;
  el.tempo.addEventListener('input', (e) => {
    state.tempo = parseFloat(e.target.value);
    el.tempoVal.textContent = `${state.tempo.toFixed(2)}×`;
    applyTempo();
    clearTimeout(tempoReEvalTimer);
    tempoReEvalTimer = setTimeout(() => {
      if (!state.playing) return;
      const editor = getEditor();
      if (editor && editor.evaluate) editor.evaluate(true).catch(() => {});
    }, 180);
  });
  el.filter.addEventListener('input', (e) => {
    state.filter = parseFloat(e.target.value);
    el.filterVal.textContent = fmtFilter(state.filter);
    if (masterFilter) {
      const now = masterFilter.context.currentTime;
      masterFilter.frequency.cancelScheduledValues(now);
      masterFilter.frequency.setTargetAtTime(state.filter, now, 0.02);
    }
  });
  el.volume.addEventListener('input', (e) => {
    state.volume = parseFloat(e.target.value);
    el.volumeVal.textContent = state.volume.toFixed(2);
    if (masterGain) {
      const now = masterGain.context.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(state.volume, now, 0.02);
    }
  });
})();
