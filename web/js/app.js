// HFHPE Explained — Web app logic
/* global SLIDES, TOTAL_DURATION, CAPTION_EN, CAPTION_JP, SPEAKER_TIMELINE, Diag, zundamonSVG, metanSVG */
'use strict';

const TOTAL = TOTAL_DURATION || 569.51;
const $ = id => document.getElementById(id);
const audioEn = $('audioEn'), audioJp = $('audioJp');
const state = { dubLang: 'en', subLang: 'en', lastSubLang: 'en', speed: 1, playing: false, time: 0, slideIdx: -1, footageSlide: null, endFired: false, speaker: null };

// ---------- audio / webaudio ----------
let mouthLevel = 0;
const audioNodes = { en: null, jp: null };
// file:// + WebAudio = silence (CORS). Only use the analyser when served over http(s).
const HAS_CORS = location.protocol === 'http:' || location.protocol === 'https:';
function activeNodes() {
  const lang = state.dubLang;
  if (audioNodes[lang]) return audioNodes[lang];
  if (!HAS_CORS) return null;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    const src = ctx.createMediaElementSource(lang === 'en' ? audioEn : audioJp);
    src.connect(analyser); analyser.connect(ctx.destination);
    ctx.resume().catch(() => {});
    audioNodes[lang] = { ctx, analyser };
    return audioNodes[lang];
  } catch (e) { return null; }
}
function ensureAudioContext() {
  const n = activeNodes();
  if (n && n.ctx.state === 'suspended') n.ctx.resume().catch(() => {});
  return !!n;
}
function setMouthLevelAnalyser() {
  const n = activeNodes();
  if (!n || !state.playing) { mouthLevel = Math.max(0, mouthLevel - 0.14); return; }
  // idle breathing when AudioContext unavailable (file://) but still playing
  if (!n && state.playing) {
    mouthLevel = 0.28 + 0.06 * Math.sin(performance.now() / 240);
    return;
  }
  const data = new Uint8Array(n.analyser.frequencyBinCount);
  n.analyser.getByteFrequencyData(data);
  let sum = 0; let peak = 0;
  for (let i = 0; i < data.length; i++) { sum += data[i]; if (data[i] > peak) peak = data[i]; }
  const avg = sum / data.length / 255;
  const target = Math.min(1, avg * 1.6 + (peak / 255) * 0.9);
  mouthLevel += (target - mouthLevel) * 0.35;
}
function activeAudio() { return state.dubLang === 'en' ? audioEn : audioJp; }
function otherAudio() { return state.dubLang === 'en' ? audioJp : audioEn; }

function setMouthFromAudio() { setMouthLevelAnalyser(); }
function applyMouth() {
  const s = 0.22 + Math.min(1, Math.max(0, mouthLevel)) * 1.15;
  const z = document.getElementById('zMouth'), m = document.getElementById('mMouth');
  if (z) z.setAttribute('transform', `scale(1 ${s})`);
  if (m) m.setAttribute('transform', `scale(1 ${s})`);
}

function setSpeed(v) {
  state.speed = v;
  audioEn.playbackRate = v; audioJp.playbackRate = v;
  syncAvatars(state.time, state.playing, v);
  document.querySelectorAll('.speed-group .seg-btn').forEach(b => b.classList.toggle('active', parseFloat(b.dataset.speed) === v));
}

function setDub(lang) {
  if (lang === state.dubLang) return;
  const t = state.time;
  const wasPlaying = state.playing;
  const old = activeAudio();
  old.pause();
  old.currentTime = t;                                  // preload-position the other track
  state.dubLang = lang;
  const a = activeAudio();
  a.playbackRate = state.speed;
  a.currentTime = t;
  avatarSetLang(state.dubLang, t, wasPlaying, state.speed);
  document.body.dataset.activeAudio = state.dubLang;
  document.querySelectorAll('#dubGroup .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  applyLangChrome();
  renderHeader(slideOf(currentSlideAt(t)));
  applySubs(t);
  if (wasPlaying) { play(); }
}

function applyLangChrome() {
  document.body.dataset.activeAudio = state.dubLang;
  const other = document.getElementById('headerSub');
  const voices = document.getElementById('footerVoices');
  const models = document.getElementById('footerModels');
  if (state.dubLang === 'en') {
    other.textContent = 'Zundamon & Shiko Metan explain';
    voices.textContent = 'English voices: Kokoro af_bella (+4 st) / bf_emma (native pitch)';
    models.textContent = 'Live2D avatars extracted from the reference video';
  } else {
    other.textContent = 'ずんだもんと四国めたんの技術解説';
    voices.textContent = 'VOICEVOX:ずんだもん / VOICEVOX:四国めたん';
    models.textContent = '参考映像から抽出したLive2Dアバター';
  }
}

// ---------- slides ----------
function currentSlideAt(t) {
  for (let i = 0; i < SLIDES.length; i++) {
    if (t >= SLIDES[i].start && t < SLIDES[i].end) return i;
  }
  return SLIDES.length - 1;
}
function slideOf(i) { return SLIDES[i]; }

function sectionLabel(slide) {
  // EN section name, possibly mapped to JP in JP mode
  if (state.dubLang === 'jp' && SECTION_JP[slide.section]) return SECTION_JP[slide.section];
  return slide.section;
}
const SECTION_JP = {
  '01 What can it do?': '01 何ができる？', '02 Inputs and angles': '02 入力と三つの角度',
  '03 Building the data': '03 データをどう作る？', '04 Angles and confidence': '04 角度と確信度の表現',
  '05 Correcting tilt first': '05 傾きを先に補正する', '06 Avoiding shortcuts': '06 学習の近道を防ぐ',
  '07 Learning from a teacher': '07 教師から軽量モデルへ', '08 Deploying with ONNX': '08 オンバリでデプロイ',
  '09 Reading the results': '09 結果の読み方', '10 Limits and practical checks': '10 限界と実践チェック',
  'HFHPE Explained': 'HFHPE Explained'
};

// ---------- footage ----------
function setupFootage(slide, idx) {
  teardownFootage();
  if (slide.type !== 'footage') return;
  const video = document.createElement('video');
  video.src = slide.src;
  video.poster = slide.poster || '';
  video.loop = false;
  video.muted = true; // video tracks stay silent; all narration is the main audio track
  video.playsInline = true;
  video.setAttribute('playsinline','');
  const container = document.getElementById('footageVideo');
  if (container) { container.innerHTML = ''; container.appendChild(video); }
  state.footageSlide = video;
  const span = slide.end - slide.start;
  const applyRate = () => {
    try {
      if (video.duration && isFinite(video.duration)) {
        video.playbackRate = Math.max(0.5, Math.min(3, span / video.duration));
        syncFootage(state.time);
      }
    } catch(e) {}
  };
  video.addEventListener('loadedmetadata', applyRate, { once: true });
  video.addEventListener('loadeddata', applyRate, { once: true });
  applyRate();
}
function teardownFootage() {
  if (state.footageSlide) { try { state.footageSlide.pause(); state.footageSlide.src = ''; state.footageSlide.load(); } catch(e) {} state.footageSlide = null; }
}
function syncFootage(t) {
  const v = state.footageSlide; if (!v || !v.duration) return;
  const s = slideOf(state.slideIdx); if (!s) return;
  const frac = (t - s.start) / (s.end - s.start);
  const vTime = Math.max(0, Math.min(0.999, frac)) * v.duration;
  if (Math.abs(v.currentTime - vTime) > 0.15) { try { v.currentTime = vTime; } catch(e) {} }
  if (state.playing && v.paused) v.play().catch(() => {});
  if (!state.playing && !v.paused) v.pause();
}

// ---------- rendering ----------
function renderHeader(slide) {
  $('headerSection').textContent = sectionLabel(slide);
}
function layoutHtml(slide) {
  const L = slide.layout;
  if (L === 'footage') return footageHtml(slide);
  if (L === 'steps') return stepsHtml(slide);
  if (L === 'poses') return posesHtml(slide);
  if (L === 'wide-range') return wideRangeHtml(slide);
  if (L === 'crop-flow') return cropFlowHtml(slide);
  if (L === 'stats') return statsHtml(slide);
  if (L === 'checks') return checksHtml(slide);
  if (L === 'circle359') return circle359Html(slide);
  if (L === 'circle') return circleHtml(slide);
  if (L === 'kappa') return kappaHtml(slide);
  if (L === 'roll-sep') return rollSepHtml(slide);
  if (L === 'gate') return gateHtml(slide);
  if (L === 'corners') return cornersHtml(slide, false);
  if (L === 'context') return cornersHtml(slide, true);
  if (L === 'teacher') return teacherHtml(slide);
  if (L === 'same-content') return sameContentHtml(slide);
  if (L === 'imbalance') return stepsHtml(slide);
  if (L === 'export') return exportHtml(slide);
  if (L === 'contract') return contractHtml(slide);
  if (L === 'demo') return demoHtml(slide);
  if (L === 'latency') return latencyHtml(slide);
  if (L === 'venn') return vennHtml(slide);
  if (L === 'resolution') return resolutionHtml(slide);
  if (L === 'repeat') return stepsHtml(slide);
  if (L === 'four-ideas') return fourIdeasHtml(slide);
  if (L === 'credits') return creditsHtml(slide);
  return `<div class="body"></div>`;
}

// ---------- layout HTML builders ----------
function baseHtml(slide, body) {
  return `<div class="body"><div class="slide-head"><div class="slide-title">${slide.title}</div>${slide.subtitle ? `<div class="slide-subtitle">${slide.subtitle}</div>` : ''}</div>${body}<div class="slide-source">Source: ${slide.source || ''}</div></div>`;
}
function footageHtml(s) {
  return `<div class="footage-layout"><div class="slide-head"><div class="slide-title">${s.title}</div><div class="slide-subtitle">${s.subtitle}</div></div>
    <div class="footage-main">
      <div class="footage-frame" id="footageVideo"></div>
      <div class="footage-side">
        <div class="h">${s.overlay}</div>
        ${s.overlay2 ? `<div class="h2">${s.overlay2}</div>` : ''}
        ${s.note2 ? `<div class="n2">${s.note2}</div>` : ''}
        <div class="n">${s.note || ''}</div>
      </div>
    </div>
    <div class="slide-source">Source: README.md introduction${s.source ? ' · ' + s.source : ''}</div>
  </div>`;
}
function stepsHtml(s) {
  return baseHtml(s, `<div class="steps">${s.steps.map((t, i) => `<div class="step"><div class="step-num">${String(i + 1).padStart(2, '0')}</div><div class="step-txt">${t}</div></div>`).join('')}</div>`);
}
function posesHtml(s) {
  return baseHtml(s, `${Diag.poses(s.poseVariant)}<div class="pose-caption">${s.caption}</div><div class="pose-note">${s.note}</div>`);
}
function wideRangeHtml(s) { return baseHtml(s, Diag.widerRange()); }
function cropFlowHtml(s) { return baseHtml(s, `${Diag.cropFlow()}<div class="pose-caption">${s.caption}</div>`); }
function statsHtml(s) {
  return baseHtml(s, `<div class="stats-row">
      <div class="stat"><div class="big" style="color:#4cc9f0">51,194</div><div class="lbl">synthetic images</div></div>
      <div class="stat-sep"></div>
      <div class="stat"><div class="big" style="color:#b8f45c">+ 618</div><div class="lbl">self-portraits</div></div>
    </div>${Diag.occlusions()}<div class="tests">${s.note}</div>`);
}
function checksHtml(s) {
  return baseHtml(s, `<div class="checks-row">${s.steps.map((t, i) => `<div class="check-box"><div class="num">${String(i + 1).padStart(2, '0')}</div><div class="txt">${t}</div></div>`).join('')}</div>
    <div class="checks-accent">${s.accent}</div><div class="checks-note">${s.note}</div>`);
}
function circle359Html(s) { return baseHtml(s, Diag.circle359()); }
function circleHtml(s) { return baseHtml(s, Diag.circle()); }
function kappaHtml(s) {
  return baseHtml(s, `<div class="kappa-layout"><div class="left">${Diag.kappa()}</div><div class="right"><ul class="kappa-list">${['Small κ → broad distribution','Large κ → narrow distribution','Is the probability of being correct'].map(t => `<li>${t}</li>`).join('')}</ul></div></div>`);
}
function rollSepHtml(s) {
  return baseHtml(s, `<div class="roll-sep-layout">
    <div class="panel">${Diag.rollSep('left')}<div class="lbl">${s.leftLabel}</div><div class="note">${s.leftNote}</div></div>
    <div class="arrow" style="font-size:2rem">→</div>
    <div class="panel">${Diag.rollSep('right')}<div class="lbl">${s.rightLabel}</div><div class="note">${s.rightNote}</div></div>
  </div><div class="roll-sep-note">${s.note}</div>`);
}
function gateHtml(s) {
  return baseHtml(s, `<div class="gate-row">
    <div class="gate-line"><div class="gate-pill hi">κ_roll high</div><div class="gate-arrow up">→  apply estimated rotation</div><div class="gate-arrow">(keep the estimated roll)</div></div>
    <div class="gate-line"><div class="gate-pill lo">κ_roll low</div><div class="gate-arrow down">→  weaken the correction</div><div class="gate-arrow">(toward no rotation)</div></div>
  </div><div class="gate-note">${s.leftNote}</div><div class="gate-note" style="margin-top:4px">${s.rightNote}</div>`);
}
function cornersHtml(s, wide) {
  return baseHtml(s, `<div class="corners-layout">
    <div class="panel">${Diag.cornersPanel('crop')}<div class="lbl">${s.leftLabel}</div></div>
    <div class="corners-arrow">← corner patterns →</div>
    <div class="panel">${Diag.cornersPanel('context')}<div class="lbl">${s.rightLabel}</div></div>
  </div><ul class="corners-points">${s.points.map(p => `<li>${p}</li>`).join('')}</ul>`);
}
function teacherHtml(s) {
  return baseHtml(s, `<div class="teacher-layout"><div class="left" style="text-align:center">${Diag.teacher()}<div class="pose-caption">Teacher</div></div>
    <div class="flow"><div class="icon">→ learn outputs</div></div>
    <div class="left" style="text-align:center">${Diag.teacherDots ? '' : ''}<div class="pose-caption" style="color:#b8f45c;font-size:clamp(16px,2.2vw,26px);font-weight:800">● ● ● ●</div><div class="pose-caption">Small student</div></div>
  </div><div class="teacher-note">${s.teacherNote}<br/>${s.studentNote}<br/>${s.sizeNote}</div>`);
}
function sameContentHtml(s) {
  return baseHtml(s, `<div class="same-content" style="flex-direction:column;gap:clamp(6px,1.2vh,12px)">
    <div style="width:100%;max-width:430px;margin:0 auto;text-align:center">${Diag.sameContent()}</div>
    <ul class="corners-points" style="text-align:left">${s.points.map(p => `<li>${p}</li>`).join('')}</ul>
  </div>`);
}
function exportHtml(s) {
  const cols = s.pipeline.map((p, i) => `<div class="check-box" style="flex:1"><div class="txt" style="font-weight:800;color:${['#e06fd3','#4cc9f0','#b8f45c'][i]}">${p}</div></div>`);
  const arrow = '<div class="arrow" style="align-self:center">→</div>';
  return baseHtml(s, `<div class="checks-row" style="gap:clamp(6px,1.2vw,14px);align-items:center;width:100%">${cols[0]}${arrow}${cols[1]}${arrow}${cols[2]}</div><div class="pose-caption" style="margin-top:clamp(12px,2vh,20px)">${s.caption}</div>`);
}
function contractHtml(s) {
  return baseHtml(s, `<div class="contract-grid">
    <div class="contract-box"><h3>Input: images</h3><div class="mono">float32 (N, 3, S, S)<br/>RGB images<br/><span class="c">x / 127.5 − 1</span></div></div>
    <div class="contract-box"><h3>Outputs</h3><div class="mono"><span class="c">cos_sin (N, 6)</span><br/>kappa (N, 3)<br/>Angles via atan2</div></div>
  </div><div class="contract-arrow">→</div><div class="pose-caption" style="text-align:center">All integrated HFHPE variants take center/6W input, including the teacher</div>`);
}
function demoHtml(s) {
  return baseHtml(s, `<div class="demo-code">uv run python demo/demo_hfphe_onnx.py <span class="str">\\</span>
  <span class="comment">-v</span> <span class="str">input.mp4</span> <span class="comment">-o</span> <span class="str">output_dir</span></div>
  <div class="pose-caption" style="text-align:center;margin-top:clamp(8px,1.2vh,14px)">Download and place both detection and pose models first</div>
  <div class="demo-caption" style="text-align:center">-v / camera / 0 · choose a pose model<br/>Fixed batch 1: one head at a time · dynamic N: multiple heads together</div>`);
}
function latencyHtml(s) {
  return baseHtml(s, Diag.latencyBars() + `<div class="latency-note">${s.note}</div>`);
}
function vennHtml(s) {
  return baseHtml(s, `<div class="venn-layout"><div class="left">${Diag.venn()}</div><div class="right"><b>Deliberately merged</b> for training<br/><br/>Not a held-out test<br/>of unseen data<br/><br/><span style="color:var(--muted)">Unified</span></div></div><div class="venn-accent">${s.accent}</div><div class="pose-caption" style="text-align:center;margin-top:clamp(4px,1vh,10px)">${s.caption}</div>`);
}
function resolutionHtml(s) {
  return baseHtml(s, Diag.resolution() + `<div class="resolution-caption">${s.caption}<br/><span style="color:var(--muted)">Choose using speed, pose-specific accuracy, and your use case</span></div>`);
}
function fourIdeasHtml(s) {
  return baseHtml(s, `<div class="four-ideas">${s.steps.map((t, i) => `<div class="step"><div class="step-num">${String(i + 1).padStart(2, '0')}</div><div class="step-txt">${t}</div></div>`).join('')}</div>`);
}
function creditsHtml(s) {
  return `<div class="credits-card"><h1>HFHPE Explained</h1>
    <div class="credit-rows">
      <div class="row"><span class="k">English voices</span><span>Kokoro af_bella (+4 st) / bf_emma (native pitch)</span></div>
      <div class="row"><span class="k">Live2D</span><span>Zundamon &amp; Shiko Metan / Sakamoto Ahiru-style</span></div>
      <div class="row"><span class="k">Characters</span><span>Tohoku Zunko / Zundamon Project / ©SSS</span></div>
      <div class="row"><span class="k">Tech &amp; demos</span><span>HFHPE repository / Katsuya Hyodo</span></div>
      <div class="row"><span class="k">Content</span><span>Based on the README and code; reported measurements reused</span></div>
    </div>
    <div class="thanks">Thanks for watching!</div>
  </div>`;
}

// ---------- subs / captions ----------
function captionsFor(lang) { return lang === 'en' ? CAPTION_EN : CAPTION_JP; }
function captionAt(t, lang) {
  const list = captionsFor(lang);
  for (const c of list) if (t >= c.start && t < c.end) return c;
  return null;
}
function speakerForTime(t) {
  const tables = (typeof SPEAKER_TIMELINE !== 'undefined' ? SPEAKER_TIMELINE : {});
  const tl = tables[state.dubLang] || tables.en || [];
  for (const e of tl) { if (t >= e[0] && t < e[1]) return e[2]; }
  return tl.length ? tl[tl.length - 1][2] : null;
}
function setSpeaker(speaker) {
  if (speaker === state.speaker) return;
  state.speaker = speaker;
  renderSpeaker(speaker);
}
function renderSpeaker(speaker) {
  const subsOn = state.subLang !== 'off';
  const bar = $('captionBar');
  bar.dataset.speaker = (subsOn && speaker) ? speaker : '';
  const z = document.getElementById('avatarLeft'), m = document.getElementById('avatarRight');
  if (z) z.classList.toggle('speaking', speaker === 'zundamon');
  if (m) m.classList.toggle('speaking', speaker === 'metan');
}
function applySubs(t) {
  const cap = $('captionText'), bar = $('captionBar');
  const subsOn = state.subLang !== 'off';
  const speaker = speakerForTime(t);
  setSpeaker(speaker);
  if (!subsOn) { bar.classList.add('off'); cap.textContent = ''; return; }
  bar.classList.remove('off');
  const c = captionAt(t, state.subLang);
  cap.textContent = c ? c.text : '';
}
function toggleSubs() {
  if (state.subLang === 'off') { setSub(state.lastSubLang === 'off' ? 'en' : state.lastSubLang); }
  else { setSub('off'); }
}
function setSub(lang) {
  state.subLang = lang;
  if (lang !== 'off') state.lastSubLang = lang;
  document.querySelectorAll('#subGroup .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.sub === lang));
  $('btnSubs').classList.toggle('on', lang !== 'off');
  renderSpeaker(state.speaker);
  applySubs(state.time);
}

// ---------- slide render orchestration ----------
function showSlide(idx, force) {
  if (!force && idx === state.slideIdx) return;
  state.slideIdx = idx;
  const slide = slideOf(idx);
  renderHeader(slide);
  $('content').innerHTML = layoutHtml(slide);
  teardownFootage();
  setupFootage(slide, idx);
}
function tick() {
  if (state.playing) {
    state.time = activeAudio().currentTime || 0;
    updateProgress();
    const idx = currentSlideAt(state.time);
    showSlide(idx);
    applySubs(state.time);
    syncFootage(state.time);
    syncAvatars(state.time, state.playing, state.speed);
    setMouthFromAudio(); applyMouth();
    if (state.time >= TOTAL - 0.12) { pause(); }
  }
  requestAnimationFrame(tick);
}

// ---------- controls ----------
function play() {
  ensureAudioContext();
  const a = activeAudio();
  if (state.endFired) { state.time = 0; a.currentTime = 0; state.endFired = false; }
  if (Math.abs(a.currentTime - state.time) > 0.5) a.currentTime = state.time;
  a.playbackRate = state.speed;
  a.play().then(() => {
    state.playing = true;
    $('btnPlay').textContent = '⏸';
    $('btnPlay').classList.add('on');
    if (state.footageSlide) state.footageSlide.play().catch(() => {});
  }).catch(e => { console.warn('play failed', e); });
}
function pause() {
  const a = activeAudio();
  state.playing = false;
  state.time = a.currentTime || state.time;
  a.pause();
  $('btnPlay').textContent = '▶';
  $('btnPlay').classList.remove('on');
  if (state.footageSlide) state.footageSlide.pause();
  syncAvatars(state.time, false, state.speed);
}
function seekTo(t) {
  t = Math.max(0, Math.min(TOTAL - 0.05, t));
  state.time = t;
  activeAudio().currentTime = t;
  otherAudio().currentTime = t;
  const idx = currentSlideAt(t);
  showSlide(idx, true);
  const s = slideOf(idx);
  if (state.playing) { if (state.footageSlide) { state.footageSlide.play().catch(() => {}); } }
  syncFootage(t);
  syncAvatars(t, state.playing, state.speed);
  updateProgress();
  applySubs(t);
  applyMouth();
}
function gotoSlide(i) {
  if (i < 0) return;
  if (i >= SLIDES.length) { seekTo(TOTAL - 0.05); pause(); return; }
  const target = Math.min(SLIDES[i].start + 0.02, TOTAL - 0.05);
  seekTo(target);
}
function updateProgress() {
  const t = state.time;
  const pct = Math.max(0, Math.min(1, t / TOTAL)) * 100;
  $('timelineFill').style.width = pct + '%';
  $('timeLabel').textContent = fmt(t) + ' / ' + fmt(TOTAL);
}
function fmt(s) {
  const total = Math.max(0, Math.floor(s));
  const m = Math.floor(total / 60), sec = total % 60;
  return m + ':' + String(sec).padStart(2, '0');
}
function togglePlay() { state.playing ? pause() : play(); }

// ---------- wiring ----------
document.addEventListener('DOMContentLoaded', () => {
  initAvatars();
  applyLangChrome();
  setSpeed(1);
  $('btnPlay').addEventListener('click', togglePlay);
  $('btnSubs').addEventListener('click', toggleSubs);
  $('btnPrev').addEventListener('click', () => { const i = currentSlideAt(state.time); gotoSlide(Math.max(0, (state.time - SLIDES[i].start > 1 ? i : i - 1))); });
  $('btnNext').addEventListener('click', () => { const i = currentSlideAt(state.time); gotoSlide(Math.min(SLIDES.length - 1, i + 1)); });
  document.querySelectorAll('.speed-group .seg-btn').forEach(b => b.addEventListener('click', () => { setSpeed(parseFloat(b.dataset.speed)); }));
  document.querySelectorAll('#dubGroup .seg-btn').forEach(b => b.addEventListener('click', () => setDub(b.dataset.lang)));
  document.querySelectorAll('#subGroup .seg-btn').forEach(b => b.addEventListener('click', () => setSub(b.dataset.sub)));
  $('timeline').addEventListener('click', e => {
    const r = $('timeline').getBoundingClientRect();
    const frac = (e.clientX - r.left) / r.width;
    seekTo(frac * TOTAL);
  });
  // ended/pause tracking
  for (const a of [audioEn, audioJp]) {
    a.addEventListener('ended', () => { state.playing = false; state.endFired = true; $('btnPlay').textContent = '▶'; $('btnPlay').classList.remove('on'); if (state.footageSlide) state.footageSlide.pause(); });
    a.addEventListener('play', () => ensureAudioContext());
  }
  $('btnSubs').classList.add('on');
  applySubs(0);
  if (location.hash.match(/^#smoke-subs=(en|jp|off)$/)) setTimeout(() => setSub(location.hash.match(/^#smoke-subs=(en|jp|off)$/)[1]), 250);
  if (location.hash.match(/^#smoke-mid-subs-(en|jp|off)$/)) setTimeout(() => { seekTo(150); setSub(location.hash.match(/^#smoke-mid-subs-(en|jp|off)$/)[1]); }, 250);
  updateProgress();
  showSlide(0, true);
  requestAnimationFrame(tick);
  if (location.hash === '#smoke-jp') setTimeout(() => setDub('jp'), 250);
  if (location.hash === '#smoke-speed') setTimeout(() => { setSpeed(2); }, 250);
  if (location.hash === '#smoke-reverse') setTimeout(() => { setDub('jp'); setTimeout(() => setDub('en'), 400); }, 250);
  if (location.hash === '#smoke-play') setTimeout(() => { play(); }, 250);
  if (location.hash === '#smoke-jp-play') setTimeout(() => { setDub('jp'); play(); }, 250);
  if (location.hash === '#smoke-mid') setTimeout(() => { seekTo(150); }, 250);
  if (location.hash === '#smoke-mid-jp') setTimeout(() => { seekTo(150); setDub('jp'); }, 250);
  if (location.hash === '#smoke-off') setTimeout(() => { if (state.subLang !== 'off') toggleSubs(); }, 250);
  if (location.hash === '#smoke-mid-off') setTimeout(() => { seekTo(150); if (state.subLang !== 'off') toggleSubs(); }, 250);
  if (location.hash === '#smoke-mid-jp-off') setTimeout(() => { seekTo(150); setDub('jp'); if (state.subLang !== 'off') toggleSubs(); }, 250);
  if (location.hash === '#smoke-end') setTimeout(() => { seekTo(566); }, 250);
  if (location.hash === '#smoke-darkness') setTimeout(() => { seekTo(532); }, 250);
  if (location.hash === '#smoke-jpd-subs-jp') setTimeout(() => { seekTo(150); setDub('jp'); setSub('jp'); }, 250);
  if (location.hash === '#smoke-kappa') setTimeout(() => { seekTo(200); }, 250);
  const m = location.hash.match(/^#smoke-seek=([0-9.]+)$/);
  if (m) setTimeout(() => { seekTo(parseFloat(m[1])); }, 250);
});
