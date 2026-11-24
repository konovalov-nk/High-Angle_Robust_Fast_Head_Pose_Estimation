// Zundamon — stylized SVG avatar (Live2D-style chibi, flat design)
// Animated mouth driven by WebAudio analyser via #zMouth, blinking, idle sway (CSS).
function zundamonSVG() {
  return `<svg viewBox="0 0 220 388" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zundamon">
  <g id="zBody">
    <path d="M148 196 C210 206 214 320 158 338 C186 298 182 238 144 226 Z" fill="#a5e8b2" opacity=".95"/>
    <path d="M150 200 C200 210 204 296 162 318 C184 282 178 236 146 226 Z" fill="#c9f0cb" opacity=".8"/>
    <ellipse cx="70" cy="90" rx="26" ry="36" transform="rotate(-28 70 90)" fill="#7ee58a"/>
    <ellipse cx="70" cy="90" rx="10" ry="18" transform="rotate(-28 70 90)" fill="#b8f45c"/>
    <ellipse cx="150" cy="90" rx="26" ry="36" transform="rotate(28 150 90)" fill="#7ee58a"/>
    <ellipse cx="150" cy="90" rx="10" ry="18" transform="rotate(28 150 90)" fill="#b8f45c"/>
    <circle cx="34" cy="80" r="9" fill="#b8f45c" opacity=".55"/>
    <circle cx="186" cy="80" r="9" fill="#b8f45c" opacity=".55"/>
    <path d="M110 8 C70 8 46 42 48 84 L172 84 C174 42 150 8 110 8 Z" fill="#5ee075"/>
    <path d="M110 8 C82 8 60 22 54 42 L100 44 C96 28 102 16 110 16 Z" fill="#8ef598" opacity=".8"/>
    <path d="M52 74 C48 118 56 138 78 150 L142 150 C164 138 172 118 168 74 C150 96 74 96 52 74 Z" fill="#ffe9d8"/>
    <g class="eyes"><circle cx="88" cy="106" r="15" fill="#fff"/><circle cx="132" cy="106" r="15" fill="#fff"/>
    <circle cx="90" cy="108" r="9" fill="#ffb13d"/><circle cx="134" cy="108" r="9" fill="#ffb13d"/>
    <circle cx="90" cy="108" r="4" fill="#7a3c00"/><circle cx="134" cy="108" r="4" fill="#7a3c00"/>
    <circle cx="84" cy="112" r="3" fill="#fff" opacity=".95"/><circle cx="130" cy="112" r="3" fill="#fff" opacity=".95"/></g>
    <circle cx="120" cy="104" r="2" fill="#e8998a"/>
    <ellipse cx="70" cy="126" rx="8" ry="5" fill="#ffb9b9" opacity=".75"/>
    <ellipse cx="150" cy="126" rx="8" ry="5" fill="#ffb9b9" opacity=".75"/>
    <path d="M104 128 Q110 132 116 128" stroke="#d98a7a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse id="zMouth" cx="110" cy="140" rx="11" ry="4" fill="#b14a3a" transform="scale(1 0.4)"/>
    <path d="M86 156 L134 156 L136 168 L84 168 Z" fill="#e8f0e4"/>
    <path d="M84 172 Q110 164 136 172 L138 200 L82 200 Z" fill="#3ac74e"/>
    <path d="M100 168 L100 210" stroke="#2c9b3a" stroke-width="7"/>
    <path d="M120 168 L120 210" stroke="#2c9b3a" stroke-width="7"/>
    <circle cx="92" cy="184" r="4" fill="#ffd166"/><circle cx="128" cy="184" r="4" fill="#ffd166"/>
    <path d="M84 172 Q70 188 66 232" stroke="#8ef598" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M136 172 Q150 188 154 232" stroke="#8ef598" stroke-width="10" fill="none" stroke-linecap="round"/>
    <ellipse cx="64" cy="248" rx="15" ry="22" fill="#ffb9b9"/>
    <ellipse cx="156" cy="248" rx="15" ry="22" fill="#ffb9b9"/>
    <ellipse cx="56" cy="278" rx="13" ry="18" fill="#ffe9d8"/>
    <ellipse cx="164" cy="278" rx="13" ry="18" fill="#ffe9d8"/>
    <path d="M84 200 L66 296" stroke="#3ac74e" stroke-width="18" stroke-linecap="round"/>
    <path d="M136 200 L154 296" stroke="#3ac74e" stroke-width="18" stroke-linecap="round"/>
    <path d="M84 200 L66 296" stroke="#63e072" stroke-width="8" stroke-linecap="round" opacity=".55"/>
    <path d="M136 200 L154 296" stroke="#63e072" stroke-width="8" stroke-linecap="round" opacity=".55"/>
    <ellipse cx="62" cy="318" rx="27" ry="14" fill="#ffe9d8"/>
    <ellipse cx="158" cy="318" rx="27" ry="14" fill="#ffe9d8"/>
    <ellipse cx="62" cy="318" rx="27" ry="14" fill="none" stroke="#3ac74e" stroke-width="2" opacity=".5"/>
    <ellipse cx="158" cy="318" rx="27" ry="14" fill="none" stroke="#3ac74e" stroke-width="2" opacity=".5"/>
  </g>
</svg>`;
}
