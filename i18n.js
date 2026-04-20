// Lightweight i18n: dictionary + data-i18n attributes + runtime switch.
// Language resolution: ?lang= query > localStorage > navigator.language > zh.
(() => {
  const DICT = {
    en: {
      tagline_loading: 'loading strudel…',
      tagline_ready: 'ready — pick a track',
      tagline_ready_short: 'ready',
      tagline_cued: 'cued',
      tagline_live: 'live · on air',
      tagline_pick_first: 'pick a track first',
      tagline_fail_prefix: 'pattern failed',
      cps_label: 'CYCLES / SEC',
      source_eyebrow: 'Source',
      source_head: 'pick a track · or paste code',
      source_preset: 'Preset',
      source_custom: 'Custom',
      cta_tap: 'TAP THE RECORD',
      editor_placeholder: '// pick a track',
      editor_space_play: 'SPACE · play',
      palette_eyebrow: 'Palette',
      mix_eyebrow: 'Mix',
      mix_tempo: 'Tempo',
      mix_filter: 'Filter',
      mix_volume: 'Volume',
      filter_open: 'open',
      spectrum_eyebrow: 'Spectrum',
      footer_text: 'fake DJ deck · powered by strudel · press ZEN to drift',
      zen_eyebrow: 'Zen Mix',
      zen_aurora: 'Aurora',
      zen_aurora_sub: 'ambient gradient field',
      zen_ripples: 'Ripples',
      zen_ripples_sub: 'pulse on beats',
      zen_particles: 'Particles',
      zen_particles_sub: 'drifting bokeh',
      zen_amount: 'Amount',
      zen_drift: 'Drift',
      zen_size: 'Size',
      zen_life: 'Life',
      zen_sens: 'Beat sens',
      zen_count: 'Count',
      zen_mood: 'Mood',
      zen_layers: 'Layers',
      zen_layers_hint: 'toggle each visual · tune its feel',
      zen_quick_vibe: 'Quick Vibe',
      zen_quick_vibe_hint: 'one-tap presets · snap every layer at once',
      mood_calm: 'calm',
      mood_dreamy: 'dreamy',
      mood_pulse: 'pulse',
      mood_calm_desc: 'slow · soft',
      mood_dreamy_desc: 'wide · hazy',
      mood_pulse_desc: 'fast · reactive',
      zen_btn: 'ZEN',
      lang_switch_label: 'EN / 中',
      lang_switch_to: 'switch to 中文'
    },
    zh: {
      tagline_loading: '正在加载 strudel…',
      tagline_ready: '就绪 — 选一首',
      tagline_ready_short: '就绪',
      tagline_cued: '待机',
      tagline_live: '直播中',
      tagline_pick_first: '请先选一首',
      tagline_fail_prefix: '运行失败',
      cps_label: '每秒循环',
      source_eyebrow: '音源',
      source_head: '选一首 · 或粘贴代码',
      source_preset: '预设',
      source_custom: '自定义',
      cta_tap: '点击唱片',
      editor_placeholder: '// 选一首',
      editor_space_play: '空格 · 播放',
      palette_eyebrow: '色板',
      mix_eyebrow: '混音',
      mix_tempo: '速度',
      mix_filter: '滤波',
      mix_volume: '音量',
      filter_open: '全开',
      spectrum_eyebrow: '频谱',
      footer_text: '纸上 DJ 台 · 由 strudel 驱动 · 按下 ZEN 沉浸',
      zen_eyebrow: '禅模式',
      zen_aurora: '极光',
      zen_aurora_sub: '环境渐变场',
      zen_ripples: '涟漪',
      zen_ripples_sub: '随节拍脉动',
      zen_particles: '粒子',
      zen_particles_sub: '漂浮光斑',
      zen_amount: '强度',
      zen_drift: '漂移',
      zen_size: '大小',
      zen_life: '寿命',
      zen_sens: '节拍灵敏',
      zen_count: '数量',
      zen_mood: '氛围',
      zen_layers: '图层',
      zen_layers_hint: '逐层开关 · 单独调味',
      zen_quick_vibe: '一键氛围',
      zen_quick_vibe_hint: '三个预设 · 一键全调好',
      mood_calm: '静谧',
      mood_dreamy: '迷离',
      mood_pulse: '脉冲',
      mood_calm_desc: '慢 · 柔',
      mood_dreamy_desc: '阔 · 朦',
      mood_pulse_desc: '快 · 应激',
      zen_btn: 'ZEN',
      lang_switch_label: 'EN / 中',
      lang_switch_to: '切换到 English'
    }
  };

  function detectLang() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'zh') return q;
    const saved = localStorage.getItem('dj.lang');
    if (saved === 'en' || saved === 'zh') return saved;
    // Default to zh — primary deployment targets CN users.
    return (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'zh';
  }

  const state = { lang: detectLang() };

  function t(key) {
    return (DICT[state.lang] && DICT[state.lang][key]) ?? DICT.en[key] ?? key;
  }

  function applyDom() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    document.body && document.body.setAttribute('data-lang', state.lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.setAttribute('title', t(el.dataset.i18nTitle));
      el.setAttribute('aria-label', t(el.dataset.i18nTitle));
    });
  }

  function setLang(next) {
    if (next !== 'en' && next !== 'zh') return;
    if (next === state.lang) return;
    state.lang = next;
    try { localStorage.setItem('dj.lang', next); } catch {}
    applyDom();
    window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: next } }));
  }

  window.I18N = {
    t,
    get lang() { return state.lang; },
    set: setLang,
    toggle: () => setLang(state.lang === 'zh' ? 'en' : 'zh'),
    apply: applyDom
  };

  if (document.readyState !== 'loading') applyDom();
  else document.addEventListener('DOMContentLoaded', applyDom);
})();
