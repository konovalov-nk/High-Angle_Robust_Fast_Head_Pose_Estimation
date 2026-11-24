// Avatars: real Live2D avatar strips extracted from the reference videos.
// The mouth animation is baked into the reference video, so it stays in sync
// with the audio clock by construction (per dub language).
// Fallback: stylized SVG stand-ins if a video fails to load.
'use strict';

const AVATAR_VIDEOS = { zundamon: null, metan: null };

function avatarVideoSrc(who, lang) {
  return `clips/avatar-${who}-${lang === 'jp' ? 'jp' : 'en'}.mp4`;
}

function avatarFallbackSvg(who) {
  const el = document.getElementById(who === 'zundamon' ? 'avatarLeft' : 'avatarRight');
  if (!el) return;
  el.innerHTML = (who === 'zundamon' ? zundamonSVG() : metanSVG()) +
    `<div class="avatar-plate">${who === 'zundamon' ? 'Zundamon' : 'Shiko Metan'}</div>`;
  AVATAR_VIDEOS[who] = null;
}

function initAvatars() {
  const left = document.getElementById('avatarLeft');
  const right = document.getElementById('avatarRight');
  left.innerHTML = '<video class="avatar-video" id="avZundamon" muted playsinline preload="auto"></video><div class="avatar-plate">Zundamon</div>';
  right.innerHTML = '<video class="avatar-video" id="avMetan" muted playsinline preload="auto"></video><div class="avatar-plate">Shiko Metan</div>';
  AVATAR_VIDEOS.zundamon = document.getElementById('avZundamon');
  AVATAR_VIDEOS.metan = document.getElementById('avMetan');
  for (const who of Object.keys(AVATAR_VIDEOS)) {
    const v = AVATAR_VIDEOS[who];
    v.src = avatarVideoSrc(who, 'en');
    v.addEventListener('error', () => avatarFallbackSvg(who), { once: true });
  }
}

// switch the avatar strips to the dub language and pin them to the audio clock
function avatarSetLang(lang, t, playing, rate) {
  for (const who of Object.keys(AVATAR_VIDEOS)) {
    const v = AVATAR_VIDEOS[who];
    if (!v) continue;
    const src = avatarVideoSrc(who, lang);
    if (!v.getAttribute('src') || !v.getAttribute('src').endsWith(src)) v.src = src;
    v.playbackRate = rate;
    try { v.currentTime = t; } catch (e) {}
    if (playing) v.play().catch(() => {}); else v.pause();
  }
}

// called from the main tick: the audio clock is authoritative
function syncAvatars(t, playing, rate) {
  for (const who of Object.keys(AVATAR_VIDEOS)) {
    const v = AVATAR_VIDEOS[who];
    if (!v) continue;
    if (!v.duration) {
      // metadata not ready yet: pin the time as soon as it is
      if (!v.dataset.pendingSeek) {
        v.dataset.pendingSeek = String(t);
        v.addEventListener('loadedmetadata', () => {
          try { v.currentTime = parseFloat(v.dataset.pendingSeek) || 0; } catch (e) {}
          delete v.dataset.pendingSeek;
        }, { once: true });
      } else {
        v.dataset.pendingSeek = String(t);
      }
      continue;
    }
    if (Math.abs(v.currentTime - t) > 0.15) { try { v.currentTime = t; } catch (e) {} }
    if (v.playbackRate !== rate) v.playbackRate = rate;
    if (playing && v.paused) v.play().catch(() => {});
    if (!playing && !v.paused) v.pause();
  }
}
