'use strict';
/* ============================================================
   Masvelle Skin AI Analyzer - JavaScript
   Features: Gemini AI, Charts, History (localStorage), Products, Bilingual
   ============================================================ */

// ── Config ────────────────────────────────────────────────────
const CONFIG = {
  GEMINI_API_KEY: 'AQ.Ab8RN6KswKQ5vasvXQF8ht' + 'xiOtLx810wjKi6Gig8Ni9dNJpu7Q',
  // Primary model + fallbacks tried in order if 503/429
  GEMINI_MODELS: [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite-preview'
  ],
  GEMINI_MODEL: 'gemini-2.5-flash',
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/',
  STORAGE_KEY: 'masvelle_skin_history',
  MAX_HISTORY: 20,
};

// ── State ─────────────────────────────────────────────────────
const State = {
  lang: 'ar',
  userName: '',
  imageDataURL: null,
  stream: null,
  results: null,
  charts: { radar: null, bar: null, history: null },
};

// ── Premium SVG Icons for Skin Metrics ─────────────────────────
// ── Premium SVG Icons for Skin Metrics ─────────────────────────
const SVG_ICONS = {
  acne: `<svg viewBox="0 0 24 24" class="msv-icon"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="7" cy="8" r="1.5" fill="currentColor"/><circle cx="17" cy="16" r="1.5" fill="currentColor"/></svg>`,
  moisture: `<svg viewBox="0 0 24 24" class="msv-icon"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
  wrinkles: `<svg viewBox="0 0 24 24" class="msv-icon"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  radiance: `<svg viewBox="0 0 24 24" class="msv-icon"><path d="M12 2v4m0 12v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M2 12h4m12 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  spots: `<svg viewBox="0 0 24 24" class="msv-icon"><circle cx="6" cy="6" r="2" fill="currentColor"/><circle cx="14" cy="7" r="1" fill="currentColor"/><circle cx="9" cy="13" r="2.5" fill="currentColor"/><circle cx="17" cy="15" r="1.5" fill="currentColor"/><circle cx="8" cy="19" r="1" fill="currentColor"/></svg>`,
  texture: `<svg viewBox="0 0 24 24" class="msv-icon"><path d="M2 17c5-3 8-3 13 0s6 2 7 1M2 11c5-3 8-3 13 0s6 2 7 1M2 5c5-3 8-3 13 0s6 2 7 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  pores: `<svg viewBox="0 0 24 24" class="msv-icon"><circle cx="6" cy="6" r="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="6" r="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="18" cy="6" r="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="6" cy="12" r="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="18" cy="12" r="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="6" cy="18" r="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="18" r="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="18" cy="18" r="2" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
  firmness: `<svg viewBox="0 0 24 24" class="msv-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 8l-4 4h8z" fill="currentColor"/></svg>`,
  oiliness: `<svg viewBox="0 0 24 24" class="msv-icon"><path d="M12 2L4 10a9 9 0 0 0 16 0z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 7l-2 3h4z" fill="currentColor"/></svg>`,
  darkCircles: `<svg viewBox="0 0 24 24" class="msv-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M8 15.5c2 1.5 6 1.5 8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  redness: `<svg viewBox="0 0 24 24" class="msv-icon"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M10 8h4m-2-2v4" stroke="currentColor" stroke-width="2"/></svg>`,
  eyeBags: `<svg viewBox="0 0 24 24" class="msv-icon"><path d="M2 10s4-5 10-5 10 5 10 5" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 14s4 5 10 5 10-5 10-5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>`,
  history_thumb: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:20px; height:20px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
  ai_indicator: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:14px; height:14px; color:var(--msv-gold-dark);"><rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2v4M8 5h8M12 11v4M9 17v-2M15 15v2M8 21h8" stroke="currentColor" stroke-width="1.5"/></svg>`,
  demo_indicator: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:14px; height:14px; color:var(--msv-text-muted);"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`,
  trend_up: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:14px; height:14px; color:#5a8a5a;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 6 23 6 23 12" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  trend_down: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:14px; height:14px; color:#c47a5a;"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 18 23 18 23 12" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  trend_stable: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:14px; height:14px; color:#efce7d;"><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polyline points="12 5 19 12 12 19" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  clinical_eval: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:18px; height:18px; color:var(--msv-gold-dark);"><path d="M6 18h12M12 18v-4M9 10h6M12 6a3 3 0 1 0-3-3m3 3a3 3 0 1 1 3-3m-3 7v3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  status_need: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:18px; height:18px; color:var(--msv-gold-dark);"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  status_ingredients: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:18px; height:18px; color:var(--msv-gold-dark);"><path d="M10 2h4M19 17V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5zM8.5 10h7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  status_ref: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:14px; height:14px; color:var(--msv-text-muted);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  empty_search: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:36px; height:36px; margin-bottom:8px; color:var(--msv-text-muted);"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" fill="none"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2"/></svg>`,
  ai_badge: `<svg viewBox="0 0 24 24" class="msv-icon" style="width:16px; height:16px; color:var(--msv-gold-dark); margin-left:3px;"><polygon points="12 2 22 8.5 12 22 2 8.5 12 2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  prod_moisturizer: `<svg viewBox="0 0 64 64" width="60%" height="60%" style="fill: none; stroke: var(--msv-gold-dark); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;"><rect x="16" y="14" width="32" height="6" rx="2" fill="var(--msv-gold)" opacity="0.3" /><rect x="16" y="14" width="32" height="6" rx="2" /><path d="M12 24v20c0 4.4 3.6 8 8 8h24c4.4 0 8-3.6 8-8V24H12z" fill="var(--msv-gold)" opacity="0.15" /><path d="M12 24v20c0 4.4 3.6 8 8 8h24c4.4 0 8-3.6 8-8V24H12z" /><path d="M32 32h-8m8-6v12" stroke-width="2" /><circle cx="42" cy="40" r="1.5" fill="var(--msv-gold-dark)" /></svg>`,
  prod_serum: `<svg viewBox="0 0 64 64" width="60%" height="60%" style="fill: none; stroke: var(--msv-gold-dark); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;"><path d="M26 6h12v6H26z" fill="var(--msv-gold)" opacity="0.3" /><path d="M26 6h12v6H26z" /><rect x="30" y="12" width="4" height="4" /><path d="M18 20v26c0 5 4 9 9 9h14c5 0 9-4 9-9V20H18z" fill="var(--msv-gold)" opacity="0.15" /><path d="M18 20v26c0 5 4 9 9 9h14c5 0 9-4 9-9V20H18z" /><line x1="32" y1="16" x2="32" y2="40" stroke-width="2" stroke-dasharray="4 2" /><path d="M31 43v2h2v-2z" fill="var(--msv-gold-dark)" /><path d="M18 36c4-1 6 1 10 0s6-1 10 0 6 1 8 0" opacity="0.5" /></svg>`,
  prod_cleanser: `<svg viewBox="0 0 64 64" width="60%" height="60%" style="fill: none; stroke: var(--msv-gold-dark); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;"><path d="M32 16V8h-8" /><path d="M30 6h4v2h-4z" fill="var(--msv-gold-dark)" /><path d="M22 8l2-2 2 2" /><rect x="24" y="16" width="16" height="6" rx="1" fill="var(--msv-gold)" opacity="0.3" /><rect x="24" y="16" width="16" height="6" rx="1" /><path d="M16 26v22c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8V26c0-2.2-1.8-4-4-4H20c-2.2 0-4 1.8-4 4z" fill="var(--msv-gold)" opacity="0.15" /><path d="M16 26v22c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8V26c0-2.2-1.8-4-4-4H20c-2.2 0-4 1.8-4 4z" /><circle cx="28" cy="34" r="3" /><circle cx="36" cy="38" r="2" /><circle cx="32" cy="44" r="1.5" /></svg>`,
  prod_sunscreen: `<svg viewBox="0 0 64 64" width="60%" height="60%" style="fill: none; stroke: var(--msv-gold-dark); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;"><path d="M20 6h24v4L40 46H24L20 10V6z" fill="var(--msv-gold)" opacity="0.15" /><path d="M20 6h24v4L40 46H24L20 10V6z" /><rect x="26" y="46" width="12" height="8" rx="2" fill="var(--msv-gold)" opacity="0.3" /><rect x="26" y="46" width="12" height="8" rx="2" /><circle cx="32" cy="24" r="5" fill="var(--msv-gold)" opacity="0.5" /><circle cx="32" cy="24" r="5" /><path d="M32 15v3m0 12v3m-9-9h3m12 0h3m-10.6-4.6l2.1 2.1m6.4 6.4l2.1 2.1m-8.5 0l2.1-2.1m6.4-6.4l2.1-2.1" stroke-width="1.5" /></svg>`,
  prod_eye: `<svg viewBox="0 0 64 64" width="60%" height="60%" style="fill: none; stroke: var(--msv-gold-dark); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;"><path d="M12 32s10-15 20-15 20 15 20 15-10 15-20 15-20-15-20-15z" fill="var(--msv-gold)" opacity="0.1" /><path d="M12 32s10-15 20-15 20 15 20 15-10 15-20 15-20-15-20-15z" /><circle cx="32" cy="32" r="6" fill="var(--msv-gold)" opacity="0.3" /><circle cx="32" cy="32" r="6" /><circle cx="35" cy="29" r="1.5" fill="var(--msv-cream)" style="stroke: none;" /><path d="M18 42c6 4 14 4 20 0" stroke-dasharray="3 3" /></svg>`,
  prod_toner: `<svg viewBox="0 0 64 64" width="60%" height="60%" style="fill: none; stroke: var(--msv-gold-dark); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;"><rect x="25" y="6" width="14" height="8" rx="1" fill="var(--msv-gold)" opacity="0.3" /><rect x="25" y="6" width="14" height="8" rx="1" /><path d="M20 18v30c0 4 3 7 7 7h10c4 0 7-3 7-7V18c0-2-1.5-4-3.5-4h-17c-2 0-3.5 2-3.5 4z" fill="var(--msv-gold)" opacity="0.15" /><path d="M20 18v30c0 4 3 7 7 7h10c4 0 7-3 7-7V18c0-2-1.5-4-3.5-4h-17c-2 0-3.5 2-3.5 4z" /><path d="M32 24v6" stroke-width="1.5" /><path d="M32 34l1-1v2" /><circle cx="32" cy="38" r="2.5" fill="var(--msv-gold-dark)" /><circle cx="27" cy="29" r="1" fill="var(--msv-gold-dark)" /><circle cx="37" cy="31" r="1.5" fill="var(--msv-gold-dark)" /></svg>`,
  prod_nightCream: `<svg viewBox="0 0 64 64" width="60%" height="60%" style="fill: none; stroke: var(--msv-gold-dark); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;"><path d="M14 26v18c0 5 4 9 9 9h18c5 0 9-4 9-9V26H14z" fill="var(--msv-gold)" opacity="0.15" /><path d="M14 26v18c0 5 4 9 9 9h18c5 0 9-4 9-9V26H14z" /><rect x="18" y="16" width="28" height="10" rx="3" fill="var(--msv-gold)" opacity="0.3" /><rect x="18" y="16" width="28" height="10" rx="3" /><path d="M35 32a6 6 0 0 0-5 5.8 6 6 0 0 0 4.2 5.7 6 6 0 1 1 .8-11.5z" fill="var(--msv-gold)" opacity="0.4" /><path d="M35 32a6 6 0 0 0-5 5.8 6 6 0 0 0 4.2 5.7 6 6 0 1 1 .8-11.5z" /></svg>`,
  prod_soothing: `<svg viewBox="0 0 64 64" width="60%" height="60%" style="fill: none; stroke: var(--msv-gold-dark); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;"><path d="M48 16C36 16 26 26 22 38c-2 6-2 12-2 12s6 0 12-2c12-4 22-14 22-26v-6z" fill="var(--msv-gold)" opacity="0.15" /><path d="M48 16C36 16 26 26 22 38c-2 6-2 12-2 12s6 0 12-2c12-4 22-14 22-26v-6z" /><path d="M22 50c4-8 12-16 26-24" stroke-width="1.5" /><path d="M14 24a4 4 0 0 0-4 4c0 3 4 7 4 7s4-4 4-7a4 4 0 0 0-4-4z" fill="var(--msv-gold)" opacity="0.3" /><path d="M14 24a4 4 0 0 0-4 4c0 3 4 7 4 7s4-4 4-7a4 4 0 0 0-4-4z" /></svg>`,

};

// ── DOM ───────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ── Widget Open/Close ─────────────────────────────────────────
function openWidget() {
  document.getElementById('msv-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  // Send message to parent to expand iframe
  window.parent.postMessage('open_masvelle_widget', '*');
}
function closeWidget() {
  document.getElementById('msv-overlay').classList.remove('open');
  document.body.style.overflow = '';
  if (State.stream) stopCamera();
  // Send message to parent to collapse iframe
  window.parent.postMessage('close_masvelle_widget', '*');
}
function closeWidgetOutside(e) {
  if (e.target === document.getElementById('msv-overlay')) closeWidget();
}

// ── Language Toggle ───────────────────────────────────────────
function toggleLang() {
  State.lang = State.lang === 'ar' ? 'en' : 'ar';
  const isEn = State.lang === 'en';

  // Update all data-ar / data-en elements
  $$('[data-ar]').forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = el.getAttribute(`data-${State.lang}`);
    } else {
      el.textContent = el.getAttribute(`data-${State.lang}`);
    }
  });

  document.documentElement.dir = isEn ? 'ltr' : 'rtl';
  $('msv-lang-btn').textContent = isEn ? 'AR' : 'EN';

  const banner = $('msv-lang-banner');
  if (isEn) {
    banner.style.display = 'flex';
    banner.querySelector('span').textContent = '🌍 Switched to English';
  } else {
    banner.style.display = 'none';
  }
}

// ── Screen Navigation ─────────────────────────────────────────
function goToScreen(id) {
  $$('.msv-screen').forEach(s => s.classList.remove('active'));
  const target = $(id);
  if (target) target.classList.add('active');
  if (id === 'screen-history') renderHistoryStandalone();
}

// ── Capture Tab Switch ────────────────────────────────────────
function switchCaptureTab(tab) {
  $$('.msv-tab').forEach(t => t.classList.remove('active'));
  $(`tab-${tab}`).classList.add('active');

  if (State.stream) stopCamera();
  $('msv-preview').style.display = 'none';
  State.imageDataURL = null;

  if (tab === 'cam') {
    $('cam-area').style.display = 'block';
    $('upload-area').style.display = 'none';
  } else {
    $('cam-area').style.display = 'none';
    $('upload-area').style.display = 'flex';
  }
}

// ── Camera ────────────────────────────────────────────────────
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }
    });
    State.stream = stream;
    const video = $('msv-video');
    video.srcObject = stream;
    video.style.display = 'block';
    $('cam-placeholder').style.display = 'none';
    $('msv-cam-overlay').style.display = 'flex';
    toast(State.lang === 'en' ? 'Camera initialized' : 'تم تشغيل الكاميرا بنجاح');
  } catch (err) {
    let msg = State.lang === 'en' ? 'Unable to access camera' : 'تعذّر الوصول إلى الكاميرا';
    if (err.name === 'NotAllowedError') msg = State.lang === 'en' ? 'Please grant camera access' : 'يرجى السماح بالوصول للكاميرا في المتصفح';
    toast(msg, 'error');
  }
}

function stopCamera() {
  if (State.stream) {
    State.stream.getTracks().forEach(t => t.stop());
    State.stream = null;
  }
  const video = $('msv-video');
  video.style.display = 'none';
  video.srcObject = null;
  $('msv-cam-overlay').style.display = 'none';
  $('cam-placeholder').style.display = 'flex';
}

function capturePhoto() {
  const video = $('msv-video');
  const canvas = $('msv-canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.scale(-1, 1);
  ctx.drawImage(video, -canvas.width, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  State.imageDataURL = canvas.toDataURL('image/jpeg', 0.92);
  stopCamera();
  showPreview();
  toast(State.lang === 'en' ? 'Photo captured!' : 'تم التقاط الصورة بنجاح!');
}

function showPreview() {
  $('cam-area').style.display = 'none';
  $('upload-area').style.display = 'none';
  const preview = $('msv-preview');
  preview.style.display = 'flex';
  $('msv-preview-img').src = State.imageDataURL;
}

function resetCapture() {
  State.imageDataURL = null;
  $('msv-preview').style.display = 'none';
  $('msv-file').value = '';
  const activeTab = $('tab-cam').classList.contains('active') ? 'cam' : 'upload';
  if (activeTab === 'cam') {
    $('cam-area').style.display = 'block';
  } else {
    $('upload-area').style.display = 'flex';
  }
}

// ── File Upload ───────────────────────────────────────────────
function handleFile(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}
function handleDrop(e) {
  e.preventDefault();
  $('upload-area').classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) processFile(file);
  else toast(State.lang === 'en' ? 'Please upload a valid image file' : 'يرجى رفع ملف صورة صالح', 'error');
}
function processFile(file) {
  if (file.size > 10 * 1024 * 1024) { toast(State.lang === 'en' ? 'Image size must be under 10MB' : 'حجم الصورة يجب أن يكون أقل من 10 ميجابايت', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    State.imageDataURL = e.target.result;
    showPreview();
    toast(State.lang === 'en' ? 'Photo uploaded!' : 'تم رفع الصورة بنجاح!');
  };
  reader.readAsDataURL(file);
}

// ============================================================
// ANALYSIS ENGINE
// ============================================================
// Skin-color segmentation based face detector for positioning the neon scan lines
function detectFaceBoundingBox(imgElement) {
  const tempCanvas = document.createElement('canvas');
  const w = 120;
  const h = 90;
  tempCanvas.width = w;
  tempCanvas.height = h;
  const ctx = tempCanvas.getContext('2d');
  
  try {
    ctx.drawImage(imgElement, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    
    let skinPixels = [];
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        
        // Skin color heuristic in RGB space
        const isSkin = r > 60 && g > 35 && b > 25 && 
                       r > g && r > b && 
                       (r - g) > 8 && 
                       (Math.max(r, g, b) - Math.min(r, g, b) > 10);
        
        if (isSkin) {
          skinPixels.push({ x, y });
        }
      }
    }
    
    if (skinPixels.length < 80) {
      return { x: 20, y: 15, width: 60, height: 70 };
    }
    
    // Outliers removal using mean and variance
    let sumX = 0, sumY = 0;
    skinPixels.forEach(p => { sumX += p.x; sumY += p.y; });
    const avgX = sumX / skinPixels.length;
    const avgY = sumY / skinPixels.length;
    
    let varX = 0, varY = 0;
    skinPixels.forEach(p => {
      varX += Math.pow(p.x - avgX, 2);
      varY += Math.pow(p.y - avgY, 2);
    });
    const stdX = Math.sqrt(varX / skinPixels.length) || 1;
    const stdY = Math.sqrt(varY / skinPixels.length) || 1;
    
    const filtered = skinPixels.filter(p => 
      Math.abs(p.x - avgX) <= 1.5 * stdX && 
      Math.abs(p.y - avgY) <= 1.5 * stdY
    );
    
    if (filtered.length < 40) {
      return { x: 20, y: 15, width: 60, height: 70 };
    }
    
    let minX = w, maxX = 0, minY = h, maxY = 0;
    filtered.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    
    const boxW = maxX - minX;
    const boxH = maxY - minY;
    
    const padX = boxW * 0.08;
    const padY = boxH * 0.12;
    
    minX = Math.max(0, minX - padX);
    maxX = Math.min(w - 1, maxX + padX);
    minY = Math.max(0, minY - padY * 1.5);
    maxY = Math.min(h - 1, maxY + padY);
    
    return {
      x: Math.max(5, Math.min(45, (minX / w) * 100)),
      y: Math.max(5, Math.min(35, (minY / h) * 100)),
      width: Math.max(40, Math.min(80, ((maxX - minX) / w) * 100)),
      height: Math.max(45, Math.min(85, ((maxY - minY) / h) * 100))
    };
  } catch (e) {
    console.warn("Face detection canvas processing failed, using default box.", e);
    return { x: 20, y: 15, width: 60, height: 70 };
  }
}

async function startAnalysis() {
  if (!State.imageDataURL) { toast(State.lang === 'en' ? 'Please select a photo first' : 'يرجى اختيار أو التقاط صورة أولاً', 'error'); return; }

  // Read Name Input
  const nameInput = $('msv-user-name-input');
  State.userName = nameInput ? nameInput.value.trim() : '';

  // Go to analyzing screen
  goToScreen('screen-analyzing');
  
  // Setup face detection onload trigger
  const img = $('msv-analyze-img');
  img.onload = () => {
    try {
      const box = detectFaceBoundingBox(img);
      const neonMesh = document.querySelector('.msv-neon-mesh');
      const laserSvg = $('msv-laser-svg');

      if (neonMesh) {
        neonMesh.style.inset = 'auto';
        neonMesh.style.left = `${box.x}%`;
        neonMesh.style.top = `${box.y}%`;
        neonMesh.style.width = `${box.width}%`;
        neonMesh.style.height = `${box.height}%`;
      }

      // Position laser circle to wrap the face tightly
      if (laserSvg) {
        const padX = box.width * 0.08;
        const padY = box.height * 0.08;
        laserSvg.style.position = 'absolute';
        laserSvg.style.left   = `${Math.max(0, box.x - padX)}%`;
        laserSvg.style.top    = `${Math.max(0, box.y - padY)}%`;
        laserSvg.style.width  = `${Math.min(100, box.width  + padX * 2)}%`;
        laserSvg.style.height = `${Math.min(100, box.height + padY * 2)}%`;
        laserSvg.style.inset  = 'auto';
        // Activate with a slight delay for smooth fade-in
        setTimeout(() => laserSvg.classList.add('active'), 300);
      }

      // Reposition scanning dots
      const dots = document.querySelectorAll('.msv-scan-dot');
      if (dots.length >= 7) {
        dots[0].style.left = `${box.x + box.width * 0.28}%`;
        dots[0].style.top  = `${box.y + box.height * 0.22}%`;
        dots[1].style.left = `${box.x + box.width * 0.68}%`;
        dots[1].style.top  = `${box.y + box.height * 0.22}%`;
        dots[2].style.left = `${box.x + box.width * 0.18}%`;
        dots[2].style.top  = `${box.y + box.height * 0.42}%`;
        dots[3].style.left = `${box.x + box.width * 0.78}%`;
        dots[3].style.top  = `${box.y + box.height * 0.42}%`;
        dots[4].style.left = `${box.x + box.width * 0.48}%`;
        dots[4].style.top  = `${box.y + box.height * 0.57}%`;
        dots[5].style.left = `${box.x + box.width * 0.35}%`;
        dots[5].style.top  = `${box.y + box.height * 0.68}%`;
        dots[6].style.left = `${box.x + box.width * 0.62}%`;
        dots[6].style.top  = `${box.y + box.height * 0.68}%`;
      }
    } catch (e) {
      console.error("Skin face detector error:", e);
      // Activate laser circle at default full-frame position
      const laserSvg = $('msv-laser-svg');
      if (laserSvg) setTimeout(() => laserSvg.classList.add('active'), 300);
    }
  };
  img.src = State.imageDataURL;

  $('msv-progress-fill').style.width = '0%';
  $('msv-progress-pct').textContent = '0%';

  // Reset steps and neon mesh
  ['astep-1','astep-2','astep-3','astep-4'].forEach(id => {
    const el = $(id);
    el.classList.remove('active','done');
    el.querySelector('.msv-astep-dot').innerHTML = '';
  });
  
  const neonMesh = document.querySelector('.msv-neon-mesh');
  if (neonMesh) {
    neonMesh.classList.remove('step1-active', 'step2-active', 'step3-active', 'step4-active');
    neonMesh.style.inset = '';
    neonMesh.style.left = '';
    neonMesh.style.top = '';
    neonMesh.style.width = '';
    neonMesh.style.height = '';
  }
  // Reset laser circle
  const laserSvg = $('msv-laser-svg');
  if (laserSvg) {
    laserSvg.classList.remove('active', 'laser-step1', 'laser-step2', 'laser-step3', 'laser-step4');
    laserSvg.style.cssText = '';
  }

  try {
    // Check if real API key is set
    const hasRealKey = CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';

    if (hasRealKey) {
      State.results = await analyzeWithGemini();
    } else {
      State.results = await analyzeSimulated();
    }

    // Save to history
    saveToHistory(State.results);

    // Show results
    goToScreen('screen-results');
    renderResults(State.results);
    switchResultTab('overview');
    if (State.results.isAI) {
      toast(State.lang === 'en' ? '✅ AI Analysis completed (Gemini)!' : '✅ اكتمل تحليل البشرة بالذكاء الاصطناعي (Gemini) بنجاح!', 'success');
    } else {
      toast(State.lang === 'en' ? '⚠️ Analysis completed (Demo/Simulated mode)' : '⚠️ اكتمل التحليل بالوضع التجريبي (محاكاة محلية)', 'info', 5000);
    }

  } catch (err) {
    console.error('❌ Gemini Analysis error:', err);
    const errMsg = err.message || 'Unknown error';
    toast(State.lang === 'en'
      ? `⚠️ AI Analysis error: ${errMsg}`
      : `⚠️ خطأ في التحليل: ${errMsg} — جاري تحميل النتائج التجريبية`, 'error', 8000);
    State.results = await analyzeSimulated();
    saveToHistory(State.results);
    goToScreen('screen-results');
    renderResults(State.results);
    switchResultTab('overview');
  }
}


// ── JSON Repair Helper ────────────────────────────────────────
function repairJSON(str) {
  try {
    // Remove trailing commas before } or ]
    str = str.replace(/,\s*([}\]])/g, '$1');
    // Count unclosed braces/brackets and close them
    const opens = [];
    for (const ch of str) {
      if (ch === '{') opens.push('}');
      else if (ch === '[') opens.push(']');
      else if (ch === '}' || ch === ']') opens.pop();
    }
    // Close any open structures
    str = str + opens.reverse().join('');
    return str;
  } catch (e) {
    return str;
  }
}

// ── Gemini AI Analysis ────────────────────────────────────────
async function analyzeWithGemini() {
  await setAnalysisStep(1, 600);

  // Prepare image for Gemini
  const base64Data = State.imageDataURL.split(',')[1];
  const mimeType = State.imageDataURL.split(';')[0].split(':')[1];

  const prompt = `أنت محلل جلدي طبي دقيق. افحص الصورة المرفقة وأعطِ تحليلاً علمياً دقيقاً وموضوعياً لبشرة الوجه.

قواعد صارمة:
- لا تبالغ في النتائج أو تخترع حالات غير موجودة
- اعتمد فقط على ما تراه بوضوح في الصورة
- اذكر "ثقة منخفضة" إذا كانت الثقة أقل من 70%
- ميّز بين حب الشباب والنمش والظلال والمسام

النقاط من 0-100 (acne/pore/wrinkle/redness/oiliness/pigmentation/dark_circle = عدد أكبر يعني مشكلة أكبر. hydration/texture/overall = عدد أكبر يعني أفضل):

أعد JSON فقط بالهيكل التالي بدون أي نص قبله أو بعده:
{"image_quality_score":85,"overall_skin_health_score":75,"skin_type":"مختلطة","skinType":"مختلطة","skinTypeSub":"تصنيف بومان: OSNT · فيتزباتريك: Type III","skin_type_confidence":88,"visual_skin_age":27,"skinAge":27,"acne_score":20,"pigmentation_score":25,"pore_score":35,"wrinkle_score":10,"redness_score":15,"hydration_score":72,"oiliness_score":45,"texture_score":78,"dark_circle_score":28,"detected_issues":["رؤوس سوداء خفيفة في منطقة الأنف"],"recommendations":["Niacinamide: لتضييق المسام وتلطيف الاحمرار"],"positives":["مستوى ترطيب ممتاز","بشرة متجانسة اللون"],"routine":{"morning":["منظف لطيف","سيروم نياسيناميد 5%","واقي شمس SPF50+"],"night":["منظف برغوة خفيف","كريم مرطب بالسيراميد"]},"geminiInsight":"بشرة صحية بشكل عام مع اتساع طفيف للمسام في منطقة الأنف.","medicalUrgency":"no","medicalUrgencyText":"البشرة في حالة جيدة. الروتين التجميلي كافٍ.","recommendedMedications":["لا حاجة لعلاجات طبية"],"clinicalReferences":"بناءً على المعايير الدولية لتصنيف صحة الجلد (AAD)."}

افحص صورة الوجه المرفقة والصق قيم حقيقية مكان القيم المثال أعلاه.`;


  await setAnalysisStep(2, 500);

  // ── Try each model in order until one succeeds ────────────────
  const models = CONFIG.GEMINI_MODELS || [CONFIG.GEMINI_MODEL];
  let response = null;
  let usedModel = '';

  for (const model of models) {
    console.log(`🔄 Trying model: ${model}`);
    try {
      const r = await fetch(
        `${CONFIG.GEMINI_API_URL}${model}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64Data } }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json'
            }
          })
        }
      );
      if (r.status === 503 || r.status === 429) {
        const errBody = await r.text().catch(() => '');
        console.warn(`⚠️ Model ${model} returned ${r.status}, trying next...`);
        continue; // try next model
      }
      response = r;
      usedModel = model;
      break;
    } catch (fetchErr) {
      console.warn(`⚠️ Model ${model} fetch error: ${fetchErr.message}, trying next...`);
    }
  }

  if (!response) {
    throw new Error('جميع موديلات Gemini غير متاحة حالياً بسبب الضغط العالي. حاول مرة أخرى بعد دقيقة.');
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => 'No body');
    console.error('❌ Gemini API Response Error:', response.status, errBody);
    throw new Error(`Gemini API ${response.status}: ${errBody.substring(0, 120)}`);
  }

  console.log(`✅ Success with model: ${usedModel}`);
  const data = await response.json();
  await setAnalysisStep(3, 400);

  let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  console.log('📄 Gemini text (first 500 chars):', rawText.substring(0, 500));

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) rawText = jsonMatch[0];
  rawText = repairJSON(rawText);

  let parsed;
  try { parsed = JSON.parse(rawText); }
  catch (parseErr) {
    console.error('❌ JSON parse failed:', rawText.substring(0, 500));
    throw new Error('Invalid JSON from Gemini: ' + (parseErr.message || ''));
  }

  await setAnalysisStep(4, 300);
  return buildResults(parsed, true);
}

// ── Simulated Analysis (fallback/demo) ────────────────────────
async function analyzeSimulated() {
  const steps = [700, 900, 800, 600];
  for (let i = 0; i < steps.length; i++) {
    await setAnalysisStep(i + 1, steps[i]);
  }

  const r = n => Math.floor(Math.random() * (n[1] - n[0] + 1)) + n[0];
  const score = r([45, 92]);
  
  // Decide Baumann and Fitzpatrick
  const baumanns = ['OSPW (دهنية حساسة صبغية مجعدة)', 'DSNT (جافة حساسة غير صبغية مشدودة)', 'OSNT (دهنية حساسة غير صبغية مشدودة)', 'DRNW (جافة مقاومة صبغية مجعدة)'];
  const baumann = baumanns[Math.floor(Math.random() * baumanns.length)];
  const fitz = ['Type I', 'Type II', 'Type III', 'Type IV'][Math.floor(Math.random() * 4)];
  const glogau = score >= 80 ? 'Type I (لا توجد تجاعيد)' : score >= 65 ? 'Type II (تجاعيد خفيفة أثناء الحركة)' : 'Type III (تجاعيد واضحة أثناء الراحة)';
  const gagsVal = r([5, 26]);
  let gagsLabel = 'ممتازة (شبه معدومة)';
  let urgency = 'no';
  let urgencyText = 'البشرة في حالة جيدة وصحية بالكامل. لا توجد بثور نشطة أو التهابات تتطلب علاجات طبية أو صيدلانية. يُنصح بالالتزام بروتين العناية التجميلي اليومي والوقاية من الشمس.';
  let recommendedMeds = ['لا توجد حاجة لعلاجات كيميائية طبية'];
  
  if (gagsVal >= 20) {
    gagsLabel = `شديدة (درجة GAGS: ${gagsVal})`;
    urgency = 'severe';
    urgencyText = 'رصد بثور عقابية ملتهبة عميقة ومسام مسدودة بشدة (GAGS: Severe Acne). تستدعي الحالة مراجعة عيادة الأمراض الجلدية لوصف علاجات طبية فموية أو موضعية قوية لمنع تشكل الندبات.';
    recommendedMeds = ['كريم تريتينوين 0.05% (Tretinoin Cream - بموجب وصفة)', 'محلول كليندامايسين الموضعي (Clindamycin)', 'غسول بنزوئيل بيروكسايد 5% (Benzoyl Peroxide)'];
  } else if (gagsVal >= 10) {
    gagsLabel = `متوسطة (درجة GAGS: ${gagsVal})`;
    urgency = 'mild';
    urgencyText = 'يوجد حب شباب خفيف إلى متوسط وبثور سطحية نشطة (GAGS: Mild/Moderate Acne). تستجيب البشرة جيداً للمستحضرات الموضعية النشطة (OTC) التي تنظم الزهم وتقشر الخلايا الميتة.';
    recommendedMeds = ['حمض الساليسيليك 2% (Salicylic Acid) لتنظيف المسام', 'سيروم ريتينول 0.5% (Retinol) لتجديد البشرة', 'حمض الأزيليك 10% (Azelaic Acid) لمكافحة البكتيريا والاحمرار'];
  }

  const data = {
    score: score,
    skinType: ['دهنية', 'جافة', 'مختلطة', 'عادية', 'حساسة'][Math.floor(Math.random() * 5)],
    skinTypeSub: `تصنيف بومان: ${baumann} · مقياس فيتزباتريك: ${fitz}`,
    skinAge: r([22, 38]),
    metrics: {
      acne: gagsVal * 3, 
      wrinkles: score >= 80 ? r([5, 20]) : score >= 65 ? r([21, 45]) : r([46, 70]), 
      spots: r([10, 70]), 
      pores: r([15, 80]),
      moisture: r([35, 95]), 
      oiliness: r([15, 80]), 
      redness: r([5, 65]),
      texture: r([45, 95]), 
      darkCircles: r([10, 75]), 
      radiance: r([40, 90]),
      firmness: r([40, 95]), 
      eyeBags: r([5, 65])
    },
    topConcerns: [`حب شباب بمقياس GAGS: ${gagsLabel}`, 'اتساع مسام منطقة T-Zone', 'هالات سوداء خفيفة تحت العين'],
    positives: ['بشرة متجانسة اللون في منطقة الخدين', `مرونة الجلد ممتازة بمقياس جلوجو (${glogau})`],
    routine: {
      morning: ['منظف رغوي لطيف معادل للدهون', 'تونر مرطب خالي من الكحول', 'واقي شمس فيزيائي واسع المدى SPF 50+'],
      night: ['غسول عميق للمسام بحمض الساليسيليك', 'سيروم ترطيب مكثف بحمض الهيالورونيك', 'كريم ليلي مغذي بحاجز السيراميد']
    },
    geminiInsight: `تحليل رقمي محاكي يرصد نسيجاً متوازناً للجلد مع لمعان دهني خفيف في الجبهة. حالة التجاعيد تقع ضمن مقياس جلوجو: ${glogau}. تصنيف البشرة التقريبي: ${baumann.split(' ')[0]}.`,
    medicalUrgency: urgency,
    medicalUrgencyText: urgencyText,
    recommendedMedications: recommendedMeds,
    clinicalReferences: 'بناءً على تصنيف Baumann السريري للبشرة، وكتيب الجمعية الأمريكية للأمراض الجلدية (AAD)، ومقياس جلوجو للتجاعيد.'
  };

  return buildResults(data, false);
}

// ── Build Final Results Object ────────────────────────────────
function buildResults(data, isAI) {
  // Support both old and new schema fields seamlessly
  const score = data.overall_skin_health_score !== undefined ? data.overall_skin_health_score : (data.score || 65);
  const skinType = data.skin_type || data.skinType || 'مختلطة';
  const skinAge = data.visual_skin_age !== undefined ? data.visual_skin_age : (data.skinAge || 28);
  
  let acne = 30, wrinkles = 25, spots = 35, pores = 40, moisture = 60, oiliness = 45, redness = 20, texture = 70, darkCircles = 30;
  let radiance = 65, firmness = 70, eyeBags = 20;

  if (data.acne_score !== undefined || data.metrics) {
    const m = data.metrics || {};
    acne = data.acne_score !== undefined ? data.acne_score : (m.acne ?? 30);
    wrinkles = data.wrinkle_score !== undefined ? data.wrinkle_score : (m.wrinkles ?? 25);
    spots = data.pigmentation_score !== undefined ? data.pigmentation_score : (m.spots ?? 35);
    pores = data.pore_score !== undefined ? data.pore_score : (m.pores ?? 40);
    moisture = data.hydration_score !== undefined ? data.hydration_score : (m.moisture ?? 60);
    oiliness = data.oiliness_score !== undefined ? data.oiliness_score : (m.oiliness ?? 45);
    redness = data.redness_score !== undefined ? data.redness_score : (m.redness ?? 20);
    texture = data.texture_score !== undefined ? data.texture_score : (m.texture ?? 70);
    darkCircles = data.dark_circle_score !== undefined ? data.dark_circle_score : (m.darkCircles ?? 30);
    
    radiance = m.radiance ?? Math.max(10, 100 - spots);
    firmness = m.firmness ?? Math.max(10, 100 - wrinkles);
    eyeBags = m.eyeBags ?? Math.round(darkCircles * 0.6);
  }

  let skinTypeSub = data.skinTypeSub || '';
  if (!skinTypeSub && data.skin_type_confidence) {
    skinTypeSub = State.lang === 'en'
      ? `Confidence: ${data.skin_type_confidence}% · Image Quality: ${data.image_quality_score || 0}%`
      : `درجة الثقة: ${data.skin_type_confidence}% · جودة الصورة: ${data.image_quality_score || 0}%`;
  }

  const topConcerns = data.detected_issues || data.topConcerns || [];
  const positives = data.positives || [];
  const routine = data.routine || {};
  const geminiInsight = data.geminiInsight || data.gemini_insight || '';
  const medicalUrgency = data.medicalUrgency || data.medical_urgency || 'no';
  const medicalUrgencyText = data.medicalUrgencyText || data.medical_urgency_text || 'لا تتطلب البشرة علاجات طبية صيدلانية، روتين العناية التجميلي كافٍ.';
  const recommendedMedications = data.recommendations || data.recommendedMedications || [];

  return {
    score: clamp(score, 0, 100),
    skinType: skinType,
    skinTypeSub: skinTypeSub,
    userName: State.userName || '',
    metrics: {
      acne: clamp(acne, 0, 100),
      wrinkles: clamp(wrinkles, 0, 100),
      spots: clamp(spots, 0, 100),
      pores: clamp(pores, 0, 100),
      moisture: clamp(moisture, 0, 100),
      oiliness: clamp(oiliness, 0, 100),
      redness: clamp(redness, 0, 100),
      texture: clamp(texture, 0, 100),
      darkCircles: clamp(darkCircles, 0, 100),
      radiance: clamp(radiance, 0, 100),
      firmness: clamp(firmness, 0, 100),
      eyeBags: clamp(eyeBags, 0, 100),
    },
    topConcerns: topConcerns,
    positives: positives,
    routine: routine,
    geminiInsight: geminiInsight,
    medicalUrgency: medicalUrgency,
    medicalUrgencyText: medicalUrgencyText,
    recommendedMedications: recommendedMedications,
    clinicalReferences: data.clinicalReferences || 'مقياس تصنيف صحة الجلد العالمي.',
    isAI,
    imageDataURL: State.imageDataURL,
    date: new Date().toISOString(),
    id: Date.now().toString(),
  };
}

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, Number(v) || 0)); }

// ── Analysis Step Animator ────────────────────────────────────
async function setAnalysisStep(stepNum, duration) {
  ['astep-1','astep-2','astep-3','astep-4'].forEach((id, i) => {
    const el = $(id);
    const dot = el.querySelector('.msv-astep-dot');
    if (i + 1 < stepNum) {
      el.classList.remove('active'); el.classList.add('done');
      dot.innerHTML = '✓';
    } else if (i + 1 === stepNum) {
      el.classList.add('active'); el.classList.remove('done');
      dot.innerHTML = '';
    }
  });

  const pct = ((stepNum - 1) / 4) * 100;
  $('msv-progress-fill').style.width = `${pct}%`;
  $('msv-progress-pct').textContent = `${Math.round(pct)}%`;

  // Apply step class to neon mesh SVG
  const neonMesh = document.querySelector('.msv-neon-mesh');
  if (neonMesh) {
    neonMesh.classList.remove('step1-active', 'step2-active', 'step3-active', 'step4-active');
    neonMesh.classList.add(`step${stepNum}-active`);
  }

  // Change laser circle color per step
  const laserSvg = $('msv-laser-svg');
  if (laserSvg) {
    laserSvg.classList.remove('laser-step1', 'laser-step2', 'laser-step3', 'laser-step4');
    laserSvg.classList.add(`laser-step${stepNum}`);
    const colors = ['#00ffe0', '#d000ff', '#0088ff', '#efce7d'];
    const glows  = ['#00ddff', '#aa00ff', '#0044ff', '#c9a55a'];
    const c = colors[stepNum - 1] || '#00ffe0';
    const g = glows[stepNum - 1]  || '#00ddff';
    const main = laserSvg.querySelector('.laser-ring-main');
    const scan = laserSvg.querySelector('.laser-ring-scan');
    const brackets = laserSvg.querySelectorAll('.laser-bracket');
    const crosshairs = laserSvg.querySelectorAll('.laser-crosshair');
    const labels = laserSvg.querySelectorAll('.laser-label');
    if (main) { main.style.stroke = c; main.style.filter = `drop-shadow(0 0 8px ${c}) drop-shadow(0 0 20px ${g})`; }
    if (scan) { scan.style.stroke = c; scan.style.filter = `drop-shadow(0 0 8px ${c}) drop-shadow(0 0 20px ${g})`; }
    brackets.forEach(b => { b.style.stroke = c; b.style.filter = `drop-shadow(0 0 5px ${c})`; });
    crosshairs.forEach(x => { x.style.stroke = c; x.style.filter = `drop-shadow(0 0 3px ${c})`; });
    labels.forEach(l => { l.style.fill = c; l.style.filter = `drop-shadow(0 0 4px ${c})`; });
  }

  return new Promise(r => setTimeout(r, duration));
}

// ============================================================
// RENDER RESULTS
// ============================================================
function renderResults(r) {
  renderOverview(r);
  renderCharts(r);
  renderProducts(r);
  renderHistoryTab();
}

// ── Overview ──────────────────────────────────────────────────
function renderOverview(r) {
  // Score ring
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (r.score / 100) * circumference;
  setTimeout(() => { $('msv-ring-fill').style.strokeDashoffset = offset; }, 150);

  // Animated score number
  const el = $('msv-score-num');
  let curr = 0;
  const interval = setInterval(() => {
    curr = Math.min(curr + Math.ceil(r.score / 35), r.score);
    el.textContent = curr;
    if (curr >= r.score) clearInterval(interval);
  }, 35);

  // Grade
  const grade = getGrade(r.score);
  $('msv-score-grade').textContent = grade.label;
  $('msv-score-grade').style.color = grade.color;
  $('msv-score-desc').textContent = grade.desc;

  // Skin types
  const row = $('msv-skin-type-row');
  row.innerHTML = '';
  
  if (r.userName) {
    const nameBadge = document.createElement('div');
    nameBadge.className = 'msv-skin-badge primary msv-user-name-badge';
    nameBadge.textContent = State.lang === 'en' ? `Client: ${r.userName}` : `الاسم: ${r.userName}`;
    row.appendChild(nameBadge);
  }

  [{ label: r.skinType, primary: true }, { label: r.skinTypeSub, primary: false }]
    .filter(t => t.label)
    .forEach(t => {
      const b = document.createElement('div');
      b.className = `msv-skin-badge ${t.primary ? 'primary' : 'secondary'}`;
      b.textContent = t.label;
      row.appendChild(b);
    });

  // Apparent skin age
  $('msv-skin-age-num').textContent = r.skinAge || '—';

  // Metrics
  const metricsConfig = [
    { key: 'acne', emoji: '🔴', label: 'حب الشباب', inverse: true },
    { key: 'moisture', emoji: '💧', label: 'الترطيب', inverse: false },
    { key: 'wrinkles', emoji: '📏', label: 'التجاعيد', inverse: true },
    { key: 'radiance', emoji: '✨', label: 'الإشراق', inverse: false },
    { key: 'spots', emoji: '🌑', label: 'البقع', inverse: true },
    { key: 'texture', emoji: '🎨', label: 'النسيج', inverse: false },
    { key: 'pores', emoji: '⭕', label: 'المسام', inverse: true },
    { key: 'firmness', emoji: '🛡️', label: 'الشدة', inverse: false },
    { key: 'oiliness', emoji: '🔥', label: 'الدهنية', inverse: true },
    { key: 'darkCircles', emoji: '🌙', label: 'الهالات', inverse: true },
    { key: 'redness', emoji: '❤️', label: 'الاحمرار', inverse: true },
    { key: 'eyeBags', emoji: '👁️', label: 'انتفاخ العين', inverse: true },
  ];

  const metricsEl = $('msv-metrics');
  metricsEl.innerHTML = '';
  metricsConfig.forEach((cfg, i) => {
    const raw = r.metrics[cfg.key] ?? 50;
    let displayVal, color, label;
    
    if (cfg.inverse) {
      // Negative symptoms (acne, wrinkles, spots, pores...)
      // High raw value is BAD. So display raw severity.
      displayVal = raw; 
      color = getMetricColor(100 - raw); // Red if severity is high (health is low)
      label = getNegativeMetricLabel(raw);
    } else {
      // Positive health metrics (moisture, radiance, firmness, texture)
      // High raw value is GOOD. So display raw level.
      displayVal = raw; 
      color = getMetricColor(raw); // Green if level is high (health is high)
      label = getPositiveMetricLabel(raw);
    }
    
    const svgIcon = SVG_ICONS[cfg.key] || `<span class="msv-metric-emoji">${cfg.emoji}</span>`;
    
    const card = document.createElement('div');
    card.className = 'msv-metric';
    card.style.animationDelay = `${i * 0.04}s`;
    card.innerHTML = `
      <div class="msv-metric-top">
        ${svgIcon}
        <span class="msv-metric-name">${cfg.label}</span>
      </div>
      <div class="msv-metric-val" style="color:${color}">${displayVal}% · ${label}</div>
      <div class="msv-metric-bar">
        <div class="msv-metric-fill" style="background:${color}" data-w="${displayVal}%"></div>
      </div>`;
    metricsEl.appendChild(card);
  });

  setTimeout(() => {
    $$('.msv-metric-fill').forEach(f => f.style.width = f.dataset.w);
  }, 300);

  // Clinical / Medical Recommendations Card
  const existingMedCard = document.querySelector('.msv-medical-card');
  if (existingMedCard) existingMedCard.remove();

  const medCard = document.createElement('div');
  medCard.className = 'msv-medical-card';

  let badgeClass = 'no';
  let badgeText = State.lang === 'en' ? 'Routine Cosmetic Care' : 'عناية تجميلية روتينية';
  if (r.medicalUrgency === 'mild') {
    badgeClass = 'mild';
    badgeText = State.lang === 'en' ? 'Mild Treatment (OTC)' : 'علاج خفيف (OTC)';
  } else if (r.medicalUrgency === 'severe') {
    badgeClass = 'severe';
    badgeText = State.lang === 'en' ? 'Dermatologist Consult Required' : 'استشارة طبيب جلدية ⚠️';
  }

  const medTags = r.recommendedMedications && r.recommendedMedications.length > 0
    ? r.recommendedMedications.map(m => `<span class="msv-med-tag">${m}</span>`).join('')
    : `<span class="msv-med-tag">${State.lang === 'en' ? 'No medical medications needed' : 'لا حاجة لعلاجات كيميائية طبية'}</span>`;

  medCard.innerHTML = `
    <div class="msv-med-header">
      <div class="msv-med-title-wrap">
        ${SVG_ICONS.clinical_eval}
        <span>${State.lang === 'en' ? 'Clinical Assessment & Medical Need' : 'التقييم السريري والاحتياج الطبي'}</span>
      </div>
      <span class="msv-med-status ${badgeClass}">${badgeText}</span>
    </div>
    
    <div class="msv-med-insight">${r.medicalUrgencyText}</div>

    <div class="msv-med-section">
      <span class="msv-med-section-title">${SVG_ICONS.status_ingredients} ${State.lang === 'en' ? 'Suggested Treatments & Ingredients:' : 'العلاجات والمكونات الطبية المقترحة:'}</span>
      <div class="msv-med-list">${medTags}</div>
    </div>

    <div class="msv-med-insight" style="margin-top: 4px; padding: 10px; background: rgba(239,206,125,0.06); border-radius: 8px; border-right: 3px solid var(--msv-gold-dark);">
      <strong style="color:var(--msv-gold-dark)">${SVG_ICONS.ai_badge} ${State.lang === 'en' ? 'AI Diagnostic Insight:' : 'تحليل الذكاء الاصطناعي:'}</strong> ${r.geminiInsight}
    </div>

    <div class="msv-med-ref">${SVG_ICONS.status_ref} ${State.lang === 'en' ? 'Clinical Reference:' : 'المرجع السريري:'} ${r.clinicalReferences}</div>
  `;

  const actionsRow = document.querySelector('.msv-result-actions');
  if (actionsRow) actionsRow.before(medCard);
}

// ── Charts ────────────────────────────────────────────────────
function renderCharts(r) {
  // Destroy previous charts
  if (State.charts.radar) { State.charts.radar.destroy(); State.charts.radar = null; }
  if (State.charts.bar) { State.charts.bar.destroy(); State.charts.bar = null; }

  const m = r.metrics;
  const goldColor = '#efce7d';
  const gold2 = '#DCA67A';

  // Radar Chart
  const radarCtx = $('msv-radar-chart');
  if (radarCtx) {
    State.charts.radar = new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: ['الترطيب', 'الإشراق', 'الشدة', 'النسيج', 'مكافحة البقع', 'مكافحة التجاعيد'],
        datasets: [{
          label: 'حالة بشرتك',
          data: [
            m.moisture, m.radiance, m.firmness, m.texture,
            100 - m.spots, 100 - m.wrinkles
          ],
          backgroundColor: 'rgba(239,206,125,0.18)',
          borderColor: goldColor,
          borderWidth: 2,
          pointBackgroundColor: gold2,
          pointBorderColor: goldColor,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true, max: 100,
            grid: { color: 'rgba(0,0,0,0.08)' },
            pointLabels: { font: { family: 'Almarai', size: 10 }, color: '#5a4a30' },
            ticks: { display: false, stepSize: 25 },
          }
        },
        plugins: { legend: { display: false } },
      }
    });
  }

  // Bar Chart
  const barCtx = $('msv-bar-chart');
  if (barCtx) {
    const labels = ['حب\nالشباب', 'التجاعيد', 'البقع', 'المسام', 'الترطيب', 'الإشراق', 'الشدة', 'النسيج', 'الهالات', 'الدهنية'];
    const values = [
      100 - m.acne, 100 - m.wrinkles, 100 - m.spots, 100 - m.pores,
      m.moisture, m.radiance, m.firmness, m.texture,
      100 - m.darkCircles, 100 - m.oiliness
    ];
    const colors = values.map(v => v >= 70 ? '#5a8a5a' : v >= 45 ? goldColor : '#c47a5a');

    State.charts.bar = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 10 } } },
          y: { grid: { display: false }, ticks: { font: { family: 'Almarai', size: 9 } } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.x}/100`
            }
          }
        }
      }
    });
  }
}

// ── Products ──────────────────────────────────────────────────
const MASVELLE_PRODUCTS = [
  {
    id: 'p1', name: 'غسول رغوي منظف للبشرة العادية إلى الدهنية (سيرافي)', nameEn: 'CeraVe Foaming Cleanser for Normal to Oily Skin',
    benefit: 'ينظف ويزيل الزيوت دون الإضرار بالحاجز الواقي للبشرة', benefitEn: 'Cleanses & removes oil without stripping skin barrier',
    icon: 'prod_cleanser', tag: 'غسول', concerns: ['acne', 'pores', 'oiliness'],
    price: '390 ج.م', link: 'https://masvelle.myeasyorders.com/'
  },
  {
    id: 'p2', name: 'سيروم حمض الهيالورونيك 2% + B5 (ذا أورديناري)', nameEn: 'The Ordinary Hyaluronic Acid 2% + B5 Serum',
    benefit: 'تركيبة ترطيب متطورة مع حمض الهيالورونيك عالي النقاء', benefitEn: 'Advanced hydration with high-purity hyaluronic acid',
    icon: 'prod_serum', tag: 'سيروم', concerns: ['moisture', 'texture'],
    price: '250 ج.م', link: 'https://masvelle.myeasyorders.com/'
  },
  {
    id: 'p3', name: 'سيروم فيتامين سي 15% المضاد للأكسدة (لاروش بوزيه)', nameEn: 'La Roche-Posay Vitamin C 15% Antioxidant Serum',
    benefit: 'يمنح البشرة إشراقة فورية ويحارب علامات التقدم في السن', benefitEn: 'Provides instant radiance and fights aging signs',
    icon: 'prod_serum', tag: 'سيروم', concerns: ['spots', 'radiance'],
    price: '580 ج.م', link: 'https://masvelle.myeasyorders.com/'
  },
  {
    id: 'p4', name: 'كريم واقي من الشمس خفيف SPF 50+ (بيوتي أوف جوسون)', nameEn: 'Beauty of Joseon Relief Sun Rice + Probiotics SPF 50+',
    benefit: 'واقي شمس عضوي خفيف للغاية غني بمستخلص الأرز والبروبيوتيك', benefitEn: 'Ultra-light organic sunscreen with rice & probiotics',
    icon: 'prod_sunscreen', tag: 'واقي شمس', concerns: ['spots', 'radiance', 'redness'],
    price: '320 ج.م', link: 'https://masvelle.myeasyorders.com/'
  },
  {
    id: 'p5', name: 'كريم عيون مضاد للانتفاخ والهالات (لاروش بوزيه)', nameEn: 'La Roche-Posay Eye Cream for Puffiness & Dark Circles',
    benefit: 'كريم عيون بالكافيين ونياسيناميد يقلل الهالات والانتفاخ في أسبوعين', benefitEn: 'Reduces dark circles & puffiness in 2 weeks',
    icon: 'prod_eye', tag: 'عناية العين', concerns: ['darkCircles', 'eyeBags'],
    price: '490 ج.م', link: 'https://masvelle.myeasyorders.com/'
  },
  {
    id: 'p6', name: 'تونر للوجه مرطب وخالي من الكحول والروائح (فيشي)', nameEn: 'Vichy Hydrating Alcohol-Free & Fragrance-Free Face Toner',
    benefit: 'تونر لطيف لتهدئة البشرة وإعدادها لاستقبال السيروم والمرطب', benefitEn: 'Gentle toner to soothe skin and prepare it for skincare',
    icon: 'prod_toner', tag: 'تونر', concerns: ['pores', 'oiliness', 'redness'],
    price: '340 ج.م', link: 'https://masvelle.myeasyorders.com/'
  },
  {
    id: 'p7', name: 'كريم اليدين المكثف Atoderm (بيودرما)', nameEn: 'Bioderma Atoderm Intense Hand Cream',
    benefit: 'كريم يدين مغذٍ للغاية للبشرة الجافة جداً يرمم الحاجز الجلدي', benefitEn: 'Ultra-nourishing hand cream for dry skin, repairs barrier',
    icon: 'prod_moisturizer', tag: 'كريم مرطب', concerns: ['moisture', 'texture'],
    price: '215 ج.م', link: 'https://masvelle.myeasyorders.com/'
  },
  {
    id: 'p8', name: 'كريم مرطب شفاه Rose Berry (لانيج)', nameEn: 'Laneige Rose Berry Lip Moisturizing Cream',
    benefit: 'كريم مرطب للشفاه بعصير التوت والمعادن يرطب ليلاً ونهاراً', benefitEn: 'Lip moisturizing cream with berry juice & minerals',
    icon: 'prod_soothing', tag: 'عناية بالشفاه', concerns: ['moisture'],
    price: '225 ج.م', link: 'https://masvelle.myeasyorders.com/'
  },
];

function renderProducts(r) {
  const m = r.metrics;

  // Score each product
  const scored = MASVELLE_PRODUCTS.map(p => {
    let score = 0;
    p.concerns.forEach(c => {
      const val = m[c] ?? 50;
      // Higher concern (bad metric) = higher product relevance
      const needLevel = ['moisture', 'radiance', 'firmness', 'texture'].includes(c)
        ? 100 - val : val;
      score += needLevel;
    });
    return { ...p, relevanceScore: score / p.concerns.length };
  });

  // Sort by relevance, take top 6
  const topProducts = scored.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 6);

  const grid = $('msv-products-grid');
  grid.innerHTML = '';
  topProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'msv-product-card';
    const isEn = State.lang === 'en';
    const svgIcon = SVG_ICONS[p.icon] || SVG_ICONS.moisture;
    card.innerHTML = `
      <div class="msv-product-badge">${p.tag}</div>
      <div class="msv-product-img">${svgIcon}</div>
      <div class="msv-product-body">
        <div class="msv-product-name">${isEn ? p.nameEn : p.name}</div>
        <div class="msv-product-benefit">${isEn ? p.benefitEn : p.benefit}</div>
        <div class="msv-product-footer">
          <span class="msv-product-price">${p.price}</span>
          <a href="${p.link}" target="_blank" class="msv-product-btn">${isEn ? 'Shop' : 'تسوقي'}</a>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── Result Tab Switching ──────────────────────────────────────
function switchResultTab(tab) {
  $$('.msv-rtab').forEach(t => t.classList.remove('active'));
  $$('.msv-rtab-panel').forEach(p => p.classList.remove('active'));
  $(`rtab-${tab}`).classList.add('active');
  $(`panel-${tab}`).classList.add('active');

  if (tab === 'history') renderHistoryTab();
}

// ============================================================
// HISTORY
// ============================================================
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveToHistory(results) {
  const history = loadHistory();
  const entry = {
    id: results.id,
    date: results.date,
    score: results.score,
    skinType: results.skinType,
    userName: results.userName || '',
    metrics: results.metrics,
    isAI: results.isAI,
    thumbDataURL: results.imageDataURL ? results.imageDataURL.substring(0, 500) : null,
  };
  history.unshift(entry);
  if (history.length > CONFIG.MAX_HISTORY) history.splice(CONFIG.MAX_HISTORY);
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(history));
}

function saveSession() {
  if (State.results) { saveToHistory(State.results); toast(State.lang === 'en' ? 'Analysis saved!' : 'تم حفظ التحليل بنجاح!', 'success'); }
}

function renderHistoryTab() {
  const history = loadHistory();
  const container = $('panel-history');
  if (!container) return;
  const list = container.querySelector('#msv-history-list') || container;

  const existingList = container.querySelector('.msv-history-items');
  if (existingList) existingList.remove();

  // Handle History Line Chart
  const chartContainer = $('msv-history-chart-container');
  if (history.length >= 2) {
    chartContainer.style.display = 'block';
    
    // Destroy old chart
    if (State.charts.history) {
      State.charts.history.destroy();
      State.charts.history = null;
    }
    
    // Reverse to display oldest to newest
    const chartData = [...history].reverse();
    const labels = chartData.map(h => {
      const d = new Date(h.date);
      return `${d.getDate()}/${d.getMonth()+1}`;
    });
    const scores = chartData.map(h => h.score);
    
    const ctx = $('msv-history-line-chart');
    if (ctx) {
      State.charts.history = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: State.lang === 'en' ? 'Skin Health Score' : 'مؤشر صحة البشرة',
            data: scores,
            borderColor: '#DCA67A',
            backgroundColor: 'rgba(239,206,125,0.08)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#0a0806',
            pointBorderColor: '#efce7d',
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 } } },
            y: { min: 0, max: 100, ticks: { stepSize: 20, font: { size: 9 } } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  } else {
    chartContainer.style.display = 'none';
  }

  const wrap = document.createElement('div');
  wrap.className = 'msv-history-items';

  if (!history.length) {
    wrap.innerHTML = `<div class="msv-history-empty">${SVG_ICONS.empty_search}<br/>${State.lang === 'en' ? 'No analysis history yet' : 'لا توجد تحليلات سابقة بعد'}</div>`;
  } else {
    history.forEach(h => {
      const d = new Date(h.date);
      const dateStr = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} - ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
      const item = document.createElement('div');
      item.className = 'msv-history-item';
      const indicator = h.isAI ? SVG_ICONS.ai_indicator : SVG_ICONS.demo_indicator;
      const patientNameText = h.userName ? ` · ${h.userName}` : '';
      item.innerHTML = `
        <div class="msv-history-thumb">${SVG_ICONS.history_thumb}</div>
        <div class="msv-history-info">
          <div class="msv-history-date">${dateStr}</div>
          <div class="msv-history-score" style="display:flex; align-items:center; gap:5px;">${h.score}/100 ${indicator}${patientNameText}</div>
          <div class="msv-history-type">${h.skinType}</div>
        </div>
        <div class="msv-history-grade" style="color:${getGrade(h.score).color};font-weight:800;font-size:0.75rem">${getGrade(h.score).label}</div>`;
      wrap.appendChild(item);
    });
  }
  list.appendChild(wrap);
}

function renderHistoryStandalone() {
  const history = loadHistory();
  const container = $('msv-history-standalone-list');
  if (!container) return;
  container.innerHTML = '';

  if (!history.length) {
    container.innerHTML = `<div class="msv-history-empty">${SVG_ICONS.empty_search}<br/>${State.lang === 'en' ? 'No analysis history yet.<br/>Start your first analysis!' : 'لا توجد تحليلات سابقة بعد.<br/>ابدئي التحليل الآن!'}</div>`;
    return;
  }
  history.forEach(h => {
    const d = new Date(h.date);
    const dateStr = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
    const item = document.createElement('div');
    item.className = 'msv-history-item';
    const trend = history.indexOf(h) > 0 ? getTrend(h, history[history.indexOf(h)+1]) : '';
    const patientNameText = h.userName ? ` · ${h.userName}` : '';
    item.innerHTML = `
      <div class="msv-history-thumb">${SVG_ICONS.history_thumb}</div>
      <div class="msv-history-info">
        <div class="msv-history-date">${dateStr}</div>
        <div class="msv-history-score" style="display:flex; align-items:center; gap:5px;">${h.score}/100 ${trend}${patientNameText}</div>
        <div class="msv-history-type">${h.skinType} ${h.isAI ? '· AI' : '· Demo'}</div>
      </div>
      <div style="color:${getGrade(h.score).color};font-weight:800;font-size:0.75rem">${getGrade(h.score).label}</div>`;
    container.appendChild(item);
  });
}

function getTrend(current, previous) {
  if (!previous) return '';
  const diff = current.score - previous.score;
  if (diff > 3) return SVG_ICONS.trend_up;
  if (diff < -3) return SVG_ICONS.trend_down;
  return SVG_ICONS.trend_stable;
}

function clearHistory() {
  if (confirm(State.lang === 'en' ? 'Are you sure you want to clear all history?' : 'هل أنتِ متأكدة من مسح كل السجل؟')) {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    renderHistoryTab();
    toast(State.lang === 'en' ? 'History cleared' : 'تم مسح السجل بنجاح', 'success');
  }
}

// ── Share ─────────────────────────────────────────────────────
async function shareResults() {
  if (!State.results) return;
  const r = State.results;
  const isEn = State.lang === 'en';
  const nameText = r.userName ? (isEn ? `Client: ${r.userName}\n` : `الاسم: ${r.userName}\n`) : '';
  const text = isEn 
    ? `My Skin Analysis with Masvelle AI\n${nameText}Score: ${r.score}/100\nSkin Type: ${r.skinType}\nMoisture: ${getPositiveMetricLabel(r.metrics.moisture)}\nRadiance: ${getPositiveMetricLabel(r.metrics.radiance)}\n\nShop your matching products:\nhttps://masvelle.myeasyorders.com/`
    : `نتائج تحليل بشرتي مع Masvelle AI\n${nameText}نقاط البشرة: ${r.score}/100\nنوع البشرة: ${r.skinType}\nالترطيب: ${getPositiveMetricLabel(r.metrics.moisture)}\nالإشراق: ${getPositiveMetricLabel(r.metrics.radiance)}\n\nاحصلي على منتجاتك المناسبة:\nhttps://masvelle.myeasyorders.com/`;
  try {
    if (navigator.share) await navigator.share({ title: 'Masvelle Skin Analysis', text });
    else { await navigator.clipboard.writeText(text); toast(isEn ? 'Results copied!' : 'تم نسخ تقرير النتائج بنجاح!', 'success'); }
  } catch { toast(isEn ? 'Share failed' : 'تعذّرت المشاركة', 'error'); }
}

// ── Reset ─────────────────────────────────────────────────────
function resetAll() {
  State.imageDataURL = null;
  State.results = null;
  State.userName = '';
  if (State.stream) stopCamera();
  const nameInput = $('msv-user-name-input');
  if (nameInput) nameInput.value = '';
  $('msv-file').value = '';
  $('msv-preview').style.display = 'none';
  $('cam-area').style.display = 'block';
  $('upload-area').style.display = 'none';
  $$('.msv-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  const insight = document.querySelector('.msv-insight');
  if (insight) insight.remove();
  const medCard = document.querySelector('.msv-medical-card');
  if (medCard) medCard.remove();
  goToScreen('screen-welcome');
}

// ============================================================
// HELPERS
// ============================================================
function getGrade(score) {
  if (score >= 85) return { label: 'ممتازة 🌟', color: '#5a8a5a', desc: 'بشرتك في حالة رائعة! استمري في روتينك الممتاز.' };
  if (score >= 72) return { label: 'جيدة جداً ✨', color: '#DCA67A', desc: 'بشرتك تبدو رائعة مع بعض النقاط القابلة للتحسين.' };
  if (score >= 58) return { label: 'جيدة 👍', color: '#efce7d', desc: 'بشرتك بحالة جيدة وتحتاج بعض العناية الإضافية.' };
  if (score >= 42) return { label: 'تحتاج عناية 🌱', color: '#c47a5a', desc: 'اتبعي روتين منتظم للحصول على نتائج ملحوظة.' };
  return { label: 'تحتاج اهتماماً ⚠️', color: '#a05540', desc: 'يُنصح باستشارة متخصصة ووضع روتين مناسب.' };
}

function getMetricColor(v) {
  if (v >= 72) return '#5a8a5a';
  if (v >= 52) return '#DCA67A';
  if (v >= 35) return '#c47a5a';
  return '#a05540';
}

function getPositiveMetricLabel(v) {
  if (v >= 80) return 'ممتاز';
  if (v >= 65) return 'جيد';
  if (v >= 48) return 'متوسط';
  if (v >= 28) return 'ضعيف';
  return 'يحتاج عناية';
}

function getNegativeMetricLabel(v) {
  if (v >= 80) return 'كثيرة جداً / شديدة';
  if (v >= 60) return 'كثيرة / ملحوظة';
  if (v >= 40) return 'متوسطة';
  if (v >= 20) return 'خفيفة / قليلة';
  return 'ممتازة (شبه معدومة)';
}

function toast(msg, type = 'info', ms = 3000) {
  const el = $('msv-toast');
  el.textContent = msg;
  el.className = `msv-toast show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = 'msv-toast', ms);
}

// ============================================================
// PDF REPORT GENERATION
// ============================================================
function downloadPDFReport() {
  if (!State.results) { toast(State.lang === 'en' ? 'No results available to print' : 'لا توجد نتائج فحص جاهزة للطباعة', 'error'); return; }
  const r = State.results;
  const isEn = State.lang === 'en';

  // Export current active charts as Base64 images
  let radarBase64 = '', barBase64 = '';
  if (State.charts.radar) radarBase64 = State.charts.radar.toBase64Image();
  if (State.charts.bar) barBase64 = State.charts.bar.toBase64Image();

  // Create printable report window
  const printWindow = window.open('', '_blank');
  if (!printWindow) { toast(State.lang === 'en' ? 'Please allow popups to download report' : 'يرجى السماح بالنوافذ المنبثقة لتنزيل التقرير', 'error'); return; }

  const dateStr = new Date(r.date).toLocaleString(isEn ? 'en-US' : 'ar-EG');
  
  // Build metrics table rows
  const metricsConfig = [
    { key: 'acne', label: 'حب الشباب', labelEn: 'Acne', inverse: true },
    { key: 'moisture', label: 'الترطيب', labelEn: 'Moisture', inverse: false },
    { key: 'wrinkles', label: 'التجاعيد', labelEn: 'Wrinkles', inverse: true },
    { key: 'radiance', label: 'الإشراق', labelEn: 'Radiance', inverse: false },
    { key: 'spots', label: 'البقع', labelEn: 'Spots', inverse: true },
    { key: 'texture', label: 'النسيج', labelEn: 'Texture', inverse: false },
    { key: 'pores', label: 'المسام', labelEn: 'Pores', inverse: true },
    { key: 'firmness', label: 'الشدة', labelEn: 'Firmness', inverse: false },
    { key: 'oiliness', label: 'الدهنية', labelEn: 'Oiliness', inverse: true },
    { key: 'darkCircles', label: 'الهالات', labelEn: 'Dark Circles', inverse: true },
    { key: 'redness', label: 'الاحمرار', labelEn: 'Redness', inverse: true },
    { key: 'eyeBags', label: 'انتفاخ العين', labelEn: 'Eye Bags', inverse: true },
  ];

  let tableRows = '';
  metricsConfig.forEach(m => {
    const rawVal = r.metrics[m.key] ?? 50;
    const val = m.inverse ? rawVal : rawVal; // Show raw severity/level
    const status = m.inverse ? getNegativeMetricLabel(rawVal) : getPositiveMetricLabel(rawVal);
    const labelText = isEn ? m.labelEn : m.label;
    tableRows += `
      <tr>
        <td>${labelText}</td>
        <td><strong>${val}%</strong></td>
        <td>${status}</td>
      </tr>`;
  });

  const concernsHTML = r.topConcerns.map(c => `<li>${c}</li>`).join('');
  const positivesHTML = r.positives.map(p => `<li>${p}</li>`).join('');
  const morningHTML = r.routine.morning.map(step => `<li>${step}</li>`).join('');
  const nightHTML = r.routine.night.map(step => `<li>${step}</li>`).join('');
  
  const medTagsHTML = r.recommendedMedications && r.recommendedMedications.length > 0
    ? r.recommendedMedications.map(m => `<span class="badge-tag">${m}</span>`).join('')
    : (isEn ? 'No pharmaceutical treatment needed' : 'لا حاجة لعلاجات كيميائية طبية');

  let docHTML = `
<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'ar'}" dir="${isEn ? 'ltr' : 'rtl'}">
<head>
  <meta charset="UTF-8">
  <title>Masvelle AI Skincare Report</title>
  <style>
    body { font-family: 'Almarai', Arial, sans-serif; background: #fff; color: #1a1208; margin: 0; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E4D7BC; padding-bottom: 20px; }
    .logo { height: 45px; }
    .title { font-size: 20px; font-weight: 800; color: #0a0806; margin-top: 5px; }
    .meta { font-size: 12px; color: #5a4a30; text-align: left; }
    .summary-section { display: flex; gap: 40px; margin: 30px 0; background: #FBEEDA; padding: 20px; border-radius: 16px; border: 1px solid #E4D7BC; }
    .score-circle { width: 120px; height: 120px; border-radius: 50%; background: #0a0806; color: #efce7d; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 3px solid #DCA67A; }
    .score-num { font-size: 36px; font-weight: 900; }
    .score-label { font-size: 11px; color: rgba(239,206,125,0.7); }
    .summary-text { flex: 1; display: flex; flex-direction: column; justify-content: center; }
    .summary-grade { font-size: 22px; font-weight: 800; color: #DCA67A; margin-bottom: 5px; }
    .summary-desc { font-size: 14px; color: #5a4a30; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #E4D7BC; padding: 8px 12px; text-align: right; font-size: 13px; }
    th { background: #0a0806; color: #efce7d; }
    body.en th, body.en td { text-align: left; }
    .section-title { font-size: 16px; font-weight: 800; color: #0a0806; border-right: 4px solid #DCA67A; padding-right: 10px; margin-bottom: 15px; }
    body.en .section-title { border-right: none; border-left: 4px solid #DCA67A; padding-right: 0; padding-left: 10px; }
    .medical-card { border: 1.5px dashed #DCA67A; padding: 15px; border-radius: 12px; background: #fafafa; margin-bottom: 30px; }
    .med-header { display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #E4D7BC; padding-bottom: 8px; }
    .badge-status { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; background: #efce7d; color: #0a0806; }
    .badge-tag { background: #E4D7BC; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: bold; margin-left: 6px; display: inline-block; }
    .routine-box { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .routine-col { background: #faf8f5; border: 1px solid #E4D7BC; padding: 15px; border-radius: 12px; }
    .routine-col h4 { margin: 0 0 10px; font-size: 14px; color: #DCA67A; }
    .chart-container { display: flex; justify-content: space-around; margin: 30px 0; }
    .chart-img { max-width: 45%; border: 1px solid #E4D7BC; padding: 10px; border-radius: 12px; }
    .footer { text-align: center; font-size: 11px; color: #8a7060; border-top: 1px solid #E4D7BC; margin-top: 40px; padding-top: 20px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body class="${isEn ? 'en' : ''}">
  <div class="header">
    <div>
      <img class="logo" src="https://files.easy-orders.net/1780222680514852987.png" alt="Masvelle">
      <div class="title">${isEn ? 'AI Skin Analysis Report' : 'تقرير فحص صحة البشرة بالذكاء الاصطناعي'}</div>
    </div>
    <div class="meta">
      ${r.userName ? `<div style="font-weight:bold; font-size:14px; margin-bottom:5px; color:#0a0806;">${isEn ? 'Name' : 'الاسم'}: ${r.userName}</div>` : ''}
      <div>${isEn ? 'Date' : 'التاريخ'}: ${dateStr}</div>
      <div>${isEn ? 'Report ID' : 'رقم التقرير'}: MSV-${r.id}</div>
    </div>
  </div>

  <div class="summary-section">
    <div class="score-circle">
      <div class="score-num">${r.score}</div>
      <div class="score-label">/ 100</div>
    </div>
    <div class="summary-text">
      <div class="summary-grade">${getGrade(r.score).label}</div>
      <div class="summary-desc">${getGrade(r.score).desc}</div>
      <div style="margin-top:8px; font-weight:bold; font-size:13px; color:#5a4a30">
        ${isEn ? 'Estimated Skin Apparent Age' : 'العمر الافتراضي للبشرة التقديري'}: <span style="font-size:16px; color:#0a0806">${r.skinAge} ${isEn ? 'years' : 'سنة'}</span>
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div>
      <div class="section-title">${isEn ? 'Dermatological Factors Status' : 'حالة مؤشرات البشرة السريرية'}</div>
      <table>
        <thead>
          <tr>
            <th>${isEn ? 'Factor' : 'المؤشر'}</th>
            <th>${isEn ? 'Value' : 'النسبة'}</th>
            <th>${isEn ? 'Status' : 'التقييم'}</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    <div>
      <div class="section-title">${isEn ? 'Clinical & Medical Evaluation' : 'التقييم الطبي والسريري'}</div>
      <div class="medical-card">
        <div class="med-header">
          <span>${isEn ? 'Clinical Assessment' : 'حالة الاحتياج للعلاج'}</span>
          <span class="badge-status">${r.medicalUrgency === 'severe' ? (isEn ? 'Requires Dermatologist' : 'استشارة طبيب جلدية') : r.medicalUrgency === 'mild' ? (isEn ? 'Mild / OTC Treatments' : 'علاجات موضعية خفيفة') : (isEn ? 'Cosmetic Routine Only' : 'عناية تجميلية فقط')}</span>
        </div>
        <p style="font-size:13px; line-height:1.5; margin:0 0 15px;">${r.medicalUrgencyText}</p>
        <div style="font-size:13px; font-weight:bold; margin-bottom:5px;">${isEn ? 'Suggested Active Ingredients / Medications:' : 'المواد الفعالة والعلاجات المقترحة:'}</div>
        <div style="margin-bottom:15px;">${medTagsHTML}</div>
        <div style="font-size:11px; color:#8a7060; border-top:1px solid #E4D7BC; padding-top:8px; margin-top:10px;">
          ${isEn ? 'Reference' : 'المرجع السريري'}: ${r.clinicalReferences}
        </div>
      </div>

      <div class="section-title">${isEn ? 'Concerns & Strengths' : 'النقاط الإيجابية والسلبية المرصودة'}</div>
      <div style="font-size:13px; line-height:1.6">
        <strong>${isEn ? 'Key Skin Concerns' : 'مخاوف الجلد الرئيسية التي تتطلب رعاية:'}</strong>
        <ul>${concernsHTML}</ul>
        <strong>${isEn ? 'Skin Strengths' : 'النقاط الإيجابية الحالية للبشرة:'}</strong>
        <ul>${positivesHTML}</ul>
      </div>
    </div>
  </div>

  <div class="section-title">${isEn ? 'Diagnostic Insight' : 'رأي الخبير السريري'}</div>
  <p style="font-size:13px; line-height:1.6; margin-bottom:30px; background:#faf8f5; padding:15px; border-radius:12px; border-right:3px solid #DCA67A;">
    ${r.geminiInsight}
  </p>

  <div class="section-title">${isEn ? 'Recommended Daily Skincare Routine' : 'روتين العناية بالبشرة اليومي المقترح'}</div>
  <div class="routine-box">
    <div class="routine-col">
      <h4>${isEn ? 'Morning Routine' : 'الروتين الصباحي (صباحاً)'}</h4>
      <ol style="font-size:12px; padding-right:20px; line-height:1.6; margin:0;">${morningHTML}</ol>
    </div>
    <div class="routine-col">
      <h4>${isEn ? 'Evening Routine' : 'الروتين المسائي (مساءً)'}</h4>
      <ol style="font-size:12px; padding-right:20px; line-height:1.6; margin:0;">${nightHTML}</ol>
    </div>
  </div>

  ${radarBase64 || barBase64 ? `
  <div style="page-break-before: always; margin-top:40px;">
    <div class="section-title">${isEn ? 'Visual Skin Mapping Charts' : 'الخرائط والرسوم البيانية البصرية للبشرة'}</div>
    <div class="chart-container">
      ${radarBase64 ? `<img class="chart-img" src="${radarBase64}" alt="Radar Chart">` : ''}
      ${barBase64 ? `<img class="chart-img" src="${barBase64}" alt="Bar Chart">` : ''}
    </div>
  </div>` : ''}

  <div class="footer">
    <div>Powered by <strong>Masvelle AI Skin Analyzer</strong> × Google Gemini 1.5 Flash</div>
    <div style="font-size:9px; margin-top:5px; color:#8a7060;">⚠️ ${isEn ? 'This report is for educational purposes only and does not replace medical advice.' : 'هذا التقرير لأغراض تثقيفية وتعليمية فقط ولا يغني عن استشارة الطبيب المختص.'}</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 500);
    }
  </script>
</body>
</html>`;

  printWindow.document.write(docHTML);
  printWindow.document.close();
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('%c🌟 Masvelle Skin AI v2.0', 'color:#efce7d;font-size:16px;font-weight:bold;background:#0a0806;padding:4px 8px;border-radius:4px;');
  console.log('%cTo enable real AI: Set CONFIG.GEMINI_API_KEY with your Gemini API key', 'color:#DCA67A');
});
